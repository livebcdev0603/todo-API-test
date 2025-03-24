const User = require('./User');
const Task = require('./Task');
const Project = require('./Project');

// User-Task relationship
User.hasMany(Task, {
    foreignKey: 'assignee_id',
    as: 'tasks'
});

Task.belongsTo(User, {
    foreignKey: 'assignee_id',
    as: 'assignee'
});

// Project-Task relationship
Project.hasMany(Task, {
    foreignKey: 'project_id',
    as: 'tasks'
});

module.exports = {
    User,
    Task,
    Project
};