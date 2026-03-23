const sequelize = require('../config/database');

const User           = require('./user')(sequelize);
const Group          = require('./group')(sequelize);
const GroupMember    = require('./groupMember')(sequelize);
const Task           = require('./task')(sequelize);
const DailyCompletion = require('./dailyCompletion')(sequelize);
const Streak         = require('./streak')(sequelize);

// User <-> Group (ownership)
User.hasMany(Group, { foreignKey: 'owner_id', as: 'ownedGroups' });
Group.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

// User <-> Group (membership)
User.belongsToMany(Group, { through: GroupMember, foreignKey: 'user_id', as: 'groups' });
Group.belongsToMany(User, { through: GroupMember, foreignKey: 'group_id', as: 'members' });
Group.hasMany(GroupMember, { foreignKey: 'group_id', as: 'groupMembers' });
GroupMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
GroupMember.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

// Group <-> Task
Group.hasMany(Task, { foreignKey: 'group_id', as: 'tasks' });
Task.belongsTo(Group, { foreignKey: 'group_id', as: 'group' });

// DailyCompletion
User.hasMany(DailyCompletion, { foreignKey: 'user_id' });
Task.hasMany(DailyCompletion, { foreignKey: 'task_id' });
DailyCompletion.belongsTo(User, { foreignKey: 'user_id' });
DailyCompletion.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });

// Streak
User.hasMany(Streak, { foreignKey: 'user_id' });
Group.hasMany(Streak, { foreignKey: 'group_id' });
Streak.belongsTo(User, { foreignKey: 'user_id' });
Streak.belongsTo(Group, { foreignKey: 'group_id' });

module.exports = { sequelize, User, Group, GroupMember, Task, DailyCompletion, Streak };
