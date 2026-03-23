const { Streak, Task, DailyCompletion } = require('../models');

const today = () => new Date().toISOString().split('T')[0];

async function getOrCreateStreak(userId, groupId) {
  const [streak] = await Streak.findOrCreate({
    where: { user_id: userId, group_id: groupId },
    defaults: { current_streak: 0, longest_streak: 0 },
  });
  return streak;
}

async function updateStreak(userId, groupId) {
  const requiredTasks = await Task.findAll({
    where: { group_id: groupId, is_required: true },
  });

  const completedToday = await DailyCompletion.findAll({
    where: {
      user_id: userId,
      date: today(),
      status: 'completed',
    },
    include: [{ model: Task, as: 'task', where: { group_id: groupId, is_required: true }, attributes: [] }],
  });

  const streak = await getOrCreateStreak(userId, groupId);

  if (requiredTasks.length > 0 && completedToday.length >= requiredTasks.length) {
    const newCurrent = streak.current_streak + 1;
    const newLongest = Math.max(streak.longest_streak, newCurrent);
    await streak.update({
      current_streak: newCurrent,
      longest_streak: newLongest,
      last_active_date: today(),
      updated_at: new Date(),
    });
  }

  return streak.reload();
}

module.exports = { getOrCreateStreak, updateStreak };
