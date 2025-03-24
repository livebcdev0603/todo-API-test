const request = require('supertest');
const app = require('../src/app');
const { Task, User } = require('../src/models');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

describe('Task API', () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Clear tasks before each test
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

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo',
        due_date: '2023-12-31'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.title).toBe(taskData.title);
      expect(response.body.description).toBe(taskData.description);
      expect(response.body.status).toBe(taskData.status);
    });

    it('should return 400 if title is missing', async () => {
      const taskData = {
        description: 'This is a test task',
        status: 'todo'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/tasks', () => {
    it('should return all tasks', async () => {
      // Create test task
      await Task.create({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo'
      });

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('Test Task');
    });
  });

  describe('PUT /api/tasks/:id/assign', () => {
    it('should assign a task to a user', async () => {
      // Create test task
      const task = await Task.create({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo'
      });

      const response = await request(app)
        .put(`/api/tasks/${task.id}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ assignee_id: testUser.id })
        .expect(200);

      expect(response.body.assignee_id).toBe(testUser.id);
    });
  });

  // Add more tests for other endpoints
  describe('GET /api/tasks/:id', () => {
    it('should return a task by ID', async () => {
      // Create test task
      const task = await Task.create({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo'
      });

      const response = await request(app)
        .get(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(task.id);
      expect(response.body.title).toBe('Test Task');
    });

    it('should return 404 if task not found', async () => {
      const nonExistentId = uuidv4();
      
      const response = await request(app)
        .get(`/api/tasks/${nonExistentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.message).toBe('Task not found');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('should update a task', async () => {
      // Create test task
      const task = await Task.create({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo'
      });

      const updateData = {
        title: 'Updated Task',
        status: 'in_progress'
      };

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.title).toBe(updateData.title);
      expect(response.body.status).toBe(updateData.status);
      // Original fields should be preserved
      expect(response.body.description).toBe('This is a test task');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      // Create test task
      const task = await Task.create({
        title: 'Test Task',
        description: 'This is a test task',
        status: 'todo'
      });

      await request(app)
        .delete(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);

      // Verify task is deleted
      const deletedTask = await Task.findByPk(task.id);
      expect(deletedTask).toBeNull();
    });
  });
});