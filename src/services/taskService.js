const { Task, GroupMember, DailyCompletion, Group } = require('../models');
const { updateStreak } = require('./streakService');
const AppError = require('../utils/errors');

const today = () => new Date().toISOString().split('T')[0];

async function getTodaysTasks(userId) {
  const memberships = await GroupMember.findAll({ where: { user_id: userId } });
  const groupIds = memberships.map((m) => m.group_id);

  if (groupIds.length === 0) return { tasks: [] };

  const tasks = await Task.findAll({
    where: { group_id: groupIds },
    include: [{ model: Group, as: 'group', attributes: ['id', 'name'] }],
  });

  const completions = await DailyCompletion.findAll({
    where: { user_id: userId, date: today() },
  });
  const completionMap = {};
  for (const c of completions) {
    completionMap[c.task_id] = c;
  }

  return {
    tasks: tasks.map((t) => {
      const completion = completionMap[t.id];
      return {
        id: t.id,
        group_id: t.group_id,
        group_name: t.group.name,
        name: t.name,
        type: t.type,
        status: completion ? completion.status : 'pending',
        completed_at: completion ? completion.completed_at : null,
      };
    }),
  };
}

async function createTask(userId, { group_id, name, type = 'manual', config = {}, is_required = true }) {
  const member = await GroupMember.findOne({ where: { user_id: userId, group_id } });
  if (!member || member.role !== 'admin') throw new AppError('Only group admins can create tasks', 403);

  const task = await Task.create({ group_id, name, type, config, is_required });
  return task;
}

async function deleteTask(taskId, userId) {
  const task = await Task.findByPk(taskId);
  if (!task) throw new AppError('Task not found', 404);

  const member = await GroupMember.findOne({ where: { user_id: userId, group_id: task.group_id } });
  if (!member || member.role !== 'admin') throw new AppError('Only group admins can delete tasks', 403);

  await task.destroy();
  return { message: 'Task deleted' };
}

async function completeTask(taskId, userId) {
  const task = await Task.findByPk(taskId);
  if (!task) throw new AppError('Task not found', 404);

  const member = await GroupMember.findOne({ where: { user_id: userId, group_id: task.group_id } });
  if (!member) throw new AppError('You are not a member of this group', 403);

  const existing = await DailyCompletion.findOne({
    where: { user_id: userId, task_id: taskId, date: today() },
  });
  if (existing && existing.status === 'completed') {
    throw new AppError('Task already completed today', 400);
  }

  const now = new Date();
  let completion;
  if (existing) {
    await existing.update({ status: 'completed', completed_at: now });
    completion = existing;
  } else {
    completion = await DailyCompletion.create({
      user_id: userId,
      task_id: taskId,
      date: today(),
      status: 'completed',
      completed_at: now,
    });
  }

  const streak = await updateStreak(userId, task.group_id);

  return {
    task_id: taskId,
    user_id: userId,
    date: today(),
    status: 'completed',
    streak_updated: true,
    new_streak: streak.current_streak,
    completed_at: now,
  };
}

module.exports = { getTodaysTasks, createTask, deleteTask, completeTask };
