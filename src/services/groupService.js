const crypto = require('crypto');
const { Op } = require('sequelize');
const { sequelize, Group, GroupMember, Task, User, Streak, DailyCompletion } = require('../models');
const AppError = require('../utils/errors');

const newInviteToken = () => crypto.randomBytes(16).toString('hex');

async function createGroup(ownerId, { name, description, visibility = 'public', tasks = [] }) {
  return sequelize.transaction(async (t) => {
    const group = await Group.create(
      { name, description, owner_id: ownerId, visibility, invite_token: newInviteToken() },
      { transaction: t }
    );

    await GroupMember.create(
      { user_id: ownerId, group_id: group.id, role: 'admin' },
      { transaction: t }
    );

    if (tasks.length > 0) {
      await Task.bulkCreate(
        tasks.map((task) => ({ ...task, group_id: group.id })),
        { transaction: t }
      );
    }

    return group;
  });
}

async function searchGroups({ query = '', page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const { rows: groups, count } = await Group.findAndCountAll({
    where: {
      visibility: 'public',
      ...(query && { name: { [Op.iLike]: `%${query}%` } }),
    },
    include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }],
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  return {
    groups: groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      visibility: g.visibility,
      owner: g.owner,
      created_at: g.created_at,
    })),
    pagination: { total: count, page, limit, pages: Math.ceil(count / limit) },
  };
}

async function getGroupById(groupId, requestingUserId) {
  const group = await Group.findByPk(groupId, {
    include: [
      { model: Task, as: 'tasks' },
      { model: GroupMember, as: 'groupMembers' },
    ],
  });
  if (!group) throw new AppError('Group not found', 404);

  const memberCount = group.groupMembers.length;

  // Leaderboard: rank by current_streak desc, then total_completions
  const streaks = await Streak.findAll({
    where: { group_id: groupId },
    order: [['current_streak', 'DESC']],
    include: [{ model: User, attributes: ['id', 'username'] }],
  });

  const leaderboard = await Promise.all(
    streaks.map(async (s, idx) => {
      const total = await DailyCompletion.count({
        where: { user_id: s.user_id, status: 'completed' },
      });
      return {
        rank: idx + 1,
        user_id: s.user_id,
        username: s.User.username,
        current_streak: s.current_streak,
        total_completions: total,
      };
    })
  );

  return {
    id: group.id,
    name: group.name,
    description: group.description,
    owner_id: group.owner_id,
    visibility: group.visibility,
    member_count: memberCount,
    tasks: group.tasks,
    leaderboard,
    created_at: group.created_at,
  };
}

async function joinGroup(groupId, userId, inviteToken) {
  const group = await Group.findByPk(groupId);
  if (!group) throw new AppError('Group not found', 404);

  if (group.invite_token !== inviteToken) throw new AppError('Invalid invite token', 400);
  if (group.invite_expires_at && group.invite_expires_at < new Date()) {
    throw new AppError('Invite token has expired', 400);
  }

  const existing = await GroupMember.findOne({ where: { user_id: userId, group_id: groupId } });
  if (existing) throw new AppError('Already a member of this group', 409);

  await GroupMember.create({ user_id: userId, group_id: groupId, role: 'member' });
  await Streak.findOrCreate({
    where: { user_id: userId, group_id: groupId },
    defaults: { current_streak: 0, longest_streak: 0 },
  });

  return { message: 'Successfully joined group', group_id: groupId, user_id: userId };
}

async function generateInvite(groupId, requestingUserId) {
  const member = await GroupMember.findOne({ where: { user_id: requestingUserId, group_id: groupId } });
  if (!member || member.role !== 'admin') throw new AppError('Only group admins can generate invite links', 403);

  const token = newInviteToken();
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await Group.update(
    { invite_token: token, invite_expires_at: expires },
    { where: { id: groupId } }
  );

  return {
    invite_token: token,
    invite_link: `${process.env.APP_URL || 'http://localhost:3000'}/api/v1/groups/${groupId}/join`,
    expires_at: expires,
  };
}

module.exports = { createGroup, searchGroups, getGroupById, joinGroup, generateInvite };
