const { Project, Task } = require('../models');

// Get all projects
exports.getAllProjects = async (req, res) => {
  try {
    const projects = await Project.findAll();
    return res.status(200).json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get project by ID with tasks
exports.getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id, {
      include: [{ model: Task, as: 'tasks' }]
    });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    return res.status(200).json(project);
  } catch (error) {
    console.error('Error fetching project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new project
exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;
    
    const project = await Project.create({
      name,
      description
    });
    
    return res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add a task to a project
exports.addTaskToProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { task_id } = req.body;
    
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const task = await Task.findByPk(task_id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    task.project_id = id;
    await task.save();
    
    return res.status(200).json(task);
  } catch (error) {
    console.error('Error adding task to project:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};