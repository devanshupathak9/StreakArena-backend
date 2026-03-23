const { Op } = require('sequelize');
const { User, Group, GroupMember, Task, DailyCompletion, Streak } = require('../models');
const AppError = require('../utils/errors');

const today = () => new Date().toISOString().split('T')[0];

async function getProfile(userId) {
  const user = await User.findByPk(userId, {
    attributes: ['id', 'username', 'email', 'created_at'],
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
}

async function getDashboard(userId) {
  const user = await User.findByPk(userId, { attributes: ['id', 'username'] });

  // Groups user belongs to
  const memberships = await GroupMember.findAll({
    where: { user_id: userId },
    include: [{ model: Group, as: 'group', include: [{ model: Task, as: 'tasks' }] }],
  });

  // Global streak: max current_streak across all groups
  const streaks = await Streak.findAll({ where: { user_id: userId } });
  const globalCurrent = streaks.reduce((max, s) => Math.max(max, s.current_streak), 0);
  const globalLongest = streaks.reduce((max, s) => Math.max(max, s.longest_streak), 0);

  // Today's completions for this user
  const todayCompletions = await DailyCompletion.findAll({
    where: { user_id: userId, date: today(), status: 'completed' },
  });
  const completedTaskIds = new Set(todayCompletions.map((c) => c.task_id));

  // Build groups array
  const groups = await Promise.all(
    memberships.map(async (m) => {
      const group = m.group;
      const streak = streaks.find((s) => s.group_id === group.id);

      // Leaderboard position
      const allStreaks = await Streak.findAll({
        where: { group_id: group.id },
        order: [['current_streak', 'DESC']],
      });
      const position = allStreaks.findIndex((s) => s.user_id === userId) + 1;

      return {
        id: group.id,
        name: group.name,
        current_streak: streak ? streak.current_streak : 0,
        leaderboard_position: position || null,
        tasks_today: group.tasks.map((t) => ({
          id: t.id,
          name: t.name,
          type: t.type,
          status: completedTaskIds.has(t.id) ? 'completed' : 'pending',
        })),
      };
    })
  );

  // Streak calendar: last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentCompletions = await DailyCompletion.findAll({
    where: {
      user_id: userId,
      date: { [Op.gte]: thirtyDaysAgo.toISOString().split('T')[0] },
    },
  });

  // Group by date — day is 'completed' only if all required tasks done
  const byDate = {};
  for (const c of recentCompletions) {
    if (!byDate[c.date]) byDate[c.date] = [];
    byDate[c.date].push(c);
  }
  const streak_calendar = {};
  for (const [date, comps] of Object.entries(byDate)) {
    const allCompleted = comps.every((c) => c.status === 'completed');
    streak_calendar[date] = allCompleted ? 'completed' : 'missed';
  }

  return {
    user: { id: user.id, username: user.username },
    global_streak: { current: globalCurrent, longest: globalLongest },
    groups,
    streak_calendar,
  };
}

module.exports = { getProfile, getDashboard };
