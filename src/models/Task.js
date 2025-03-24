const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Task = sequelize.define('Task', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('todo', 'in_progress', 'done'),
        defaultValue: 'todo',
    }, 
    due_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    assignee_id: {
        type: DataTypes.UUID,
        allowNull: true
    },
    project_id: {
        type: DataTypes.UUID,
        allowNull: true
    }
},{
    timestamps: true,
    underscored: true,
});

module.exports = Task;
