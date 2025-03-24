const { Task, User } = require('../models');

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, due_date, assignee_id } = req.body;
    
    // If assignee_id is provided, check if user exists
    if (assignee_id) {
      const user = await User.findByPk(assignee_id);
      if (!user) {
        return res.status(404).json({ message: 'Assignee not found' });
      }
    }
    
    const task = await Task.create({
      title,
      description,
      due_date: due_date ? new Date(due_date) : null,
      assignee_id
    });
    
    return res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findByPk(id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    return res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    });
    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, due_date, assignee_id } = req.body;
    
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // If assignee_id is provided, check if user exists
    if (assignee_id) {
      const user = await User.findByPk(assignee_id);
      if (!user) {
        return res.status(404).json({ message: 'Assignee not found' });
      }
    }
    
    await task.update({
      title,
      description,
      status,
      due_date: due_date ? new Date(due_date) : task.due_date,
      assignee_id
    });
    
    // Get updated task with assignee info
    const updatedTask = await Task.findByPk(id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    await task.destroy();
    
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Assign task to user
exports.assignTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignee_id } = req.body;
    
    // Find the task
    const task = await Task.findByPk(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // If assignee_id is provided, check if user exists
    if (assignee_id) {
      const user = await User.findByPk(assignee_id);
      if (!user) {
        return res.status(404).json({ message: 'Assignee not found' });
      }
    }
    
    // Update the task
    task.assignee_id = assignee_id;
    await task.save();
    
    // Return updated task with assignee info
    const updatedTask = await Task.findByPk(id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ]
    });
    
    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error assigning task:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};