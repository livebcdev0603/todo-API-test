const request = require('supertest');
const app = require('../src/app');
const { Project, User, Task } = require('../src/models');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

describe('Project API', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Clear projects, tasks and users before each test
    await Project.destroy({ where: {} });
    await Task.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Create a test user for authentication
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password_hash: 'password123'
    });

    // Generate auth token for the test user
    authToken = jwt.sign(
      { id: testUser.id, email: testUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
  });

  describe('POST /api/projects', () => {
    it('should create a new project', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'This is a test project'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(projectData.name);
      expect(response.body.description).toBe(projectData.description);
    });

    it('should return 400 if name is missing', async () => {
      const projectData = {
        description: 'This is a test project'
      };

      const response = await request(app)
        .post('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 401 if not authenticated', async () => {
      const projectData = {
        name: 'Test Project',
        description: 'This is a test project'
      };

      await request(app)
        .post('/api/projects')
        .send(projectData)
        .expect(401);
    });
  });

  describe('GET /api/projects', () => {
    it('should return all projects', async () => {
      // Create test project
      await Project.create({
        name: 'Test Project',
        description: 'This is a test project'
      });

      const response = await request(app)
        .get('/api/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Test Project');
    });

    it('should return 401 if not authenticated', async () => {
      await request(app)
        .get('/api/projects')
        .expect(401);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a project by ID', async () => {
      // Create test project
      const project = await Project.create({
        name: 'Test Project',
        description: 'This is a test project'
      });

      const response = await request(app)
        .get(`/api/projects/${project.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(project.id);
      expect(response.body.name).toBe('Test Project');
    });

    it('should return 404 if project not found', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app)
        .get(`/api/projects/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Project not found');
    });

    it('should return 401 if not authenticated', async () => {
      const project = await Project.create({
        name: 'Test Project',
        description: 'This is a test project'
      });

      await request(app)
        .get(`/api/projects/${project.id}`)
        .expect(401);
    });
  });

  describe('PUT /api/projects/:id/tasks', () => {
    it('should add a task to a project', async () => {
      // Create test project
      const project = await Project.create({
        name: 'Test Project',
        description: 'This is a test project'
      });

      // Create test task
      const task = await Task.create({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo',
        assignee_id: testUser.id
      });

      const response = await request(app)
        .put(`/api/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ task_id: task.id })
        .expect(200);

      expect(response.body.id).toBe(task.id);
      expect(response.body.project_id).toBe(project.id);
    });

    it('should return 404 if project not found', async () => {
      // Create test task
      const task = await Task.create({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo',
        assignee_id: testUser.id
      });

      const nonExistentId = uuidv4();
      const response = await request(app)
        .put(`/api/projects/${nonExistentId}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ task_id: task.id })
        .expect(404);

      expect(response.body.message).toBe('Project not found');
    });

    it('should return 404 if task not found', async () => {
      // Create test project
      const project = await Project.create({
        name: 'Test Project',
        description: 'This is a test project'
      });

      const nonExistentId = uuidv4();
      const response = await request(app)
        .put(`/api/projects/${project.id}/tasks`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ task_id: nonExistentId })
        .expect(404);

      expect(response.body.message).toBe('Task not found');
    });

    it('should return 401 if not authenticated', async () => {
      const project = await Project.create({
        name: 'Test Project',
        description: 'This is a test project'
      });

      const task = await Task.create({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo',
        assignee_id: testUser.id
      });

      await request(app)
        .put(`/api/projects/${project.id}/tasks`)
        .send({ task_id: task.id })
        .expect(401);
    });
  });
});