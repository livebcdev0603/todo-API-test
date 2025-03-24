const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/models');
const jwt = require('jsonwebtoken');

describe('Auth API', () => {
  beforeEach(async () => {
    // Clear users before each test
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return a token', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'password123'  // This will be hashed by the User model hooks
      });

      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(user.id);
      expect(response.body.user.email).toBe(user.email);
      // Password should not be returned
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    it('should return 401 if email is incorrect', async () => {
      // Create a test user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'password123'
      });

      const loginData = {
        email: 'wrong@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 if password is incorrect', async () => {
      // Create a test user
      await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'password123'
      });

      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 if email is missing', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should return 400 if password is missing', async () => {
      const loginData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return the current user', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'password123'
      });

      // First, login to get a valid token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
    
      // Use the token from the login response
      const token = loginResponse.body.token;
      
      // Verify token is a string and not undefined
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.id).toBe(user.id);
      expect(response.body.name).toBe(user.name);
      expect(response.body.email).toBe(user.email);
      // Password should not be returned
      expect(response.body).not.toHaveProperty('password_hash');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.message).toBe('No token provided');
    });

    it('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.message).toBe('Invalid token');
    });

    // For the user not found test, let's try a different approach
    it('should return 404 if user not found', async () => {
      // Create a test user
      const user = await User.create({
        name: 'Test User For Deletion',
        email: 'delete-test@example.com',
        password_hash: 'password123'
      });
      
      // Generate a token manually with the correct format
      const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      // Delete the user
      await User.destroy({ where: { id: user.id } });
      
      // Now try to access /me endpoint with the token of the deleted user
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
      
      expect(response.body.message).toBe('User not found');
    });
  }); // This closing bracket was missing
}); // This is the closing bracket for the main describe block