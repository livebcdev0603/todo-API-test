const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');
const { v4: uuidv4 } = require('uuid');

describe('User API', () => {
  beforeEach(async () => {
    // Clear users before each test
    await User.destroy({ where: {} });
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const timestamp = Date.now();
      const userData = {
        name: `Test User ${timestamp}`,
        email: `test${timestamp}@example.com`, // Use unique email with timestamp
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(userData.name);
      expect(response.body.email).toBe(userData.email);
      // Password should not be returned
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('should return 400 if email is invalid', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 if email is already in use', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'test@example.com',
        password_hash: 'password123'
      });

      // Try to create another user with the same email
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/users')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Email already in use');
    });
  });

  describe('GET /api/users', () => {
    it('should return all users', async () => {
      // Create test user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'password123'
      });

      const response = await request(app)
        .get('/api/users')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Test User');
      // Password should not be returned
      expect(response.body[0]).not.toHaveProperty('password_hash');
    });
  });

  describe('GET /api/users/:id', () => {
    it('should return a user by ID', async () => {
      // Create test user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'password123'
      });

      const response = await request(app)
        .get(`/api/users/${user.id}`)
        .expect(200);

      expect(response.body.id).toBe(user.id);
      expect(response.body.name).toBe('Test User');
      // Password should not be returned
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('should return 404 if user not found', async () => {
      const nonExistentId = uuidv4();
      const response = await request(app)
        .get(`/api/users/${nonExistentId}`)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update a user', async () => {
      // Create test user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'password123'
      });

      const updateData = {
        name: 'Updated User',
        email: 'updated@example.com'
      };

      const response = await request(app)
        .put(`/api/users/${user.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.email).toBe(updateData.email);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete a user', async () => {
      // Create test user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'password123'
      });

      await request(app)
        .delete(`/api/users/${user.id}`)
        .expect(204);

      // Verify user is deleted
      const deletedUser = await User.findByPk(user.id);
      expect(deletedUser).toBeNull();
    });
  });
});