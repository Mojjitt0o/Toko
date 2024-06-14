const request = require('supertest');
const app = require('../app');
const { User, sequelize } = require('../models');
const jwt = require('jsonwebtoken');
const { describe, it, beforeAll, afterAll, beforeEach, expect } = require('@jest/globals');

describe('GET /users/whoami', () => {
    let token;

    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        await sequelize.sync({ force: true });
        const user = await User.create({
            name: 'Test User',
            email: 'testuser@example.com',
            password: 'password123',
            is_admin: false,
            address: 'Yogyakarta'
        });

        token = jwt.sign({ id: user.id, name: user.name, email: user.email, is_admin: user.is_admin }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
    });

    it('should return user data if token is valid', async () => {
        const response = await request(app)
            .get('/users/whoami')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('name', 'Test User');
        expect(response.body).toHaveProperty('email', 'testuser@example.com');
        expect(response.body).toHaveProperty('is_admin', false);
    });

    it('should return 401 if no token is provided', async () => {
        const response = await request(app)
            .get('/users/whoami');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized - No token provided.');
    });

    it('should return 401 if token is invalid', async () => {
        const response = await request(app)
            .get('/users/whoami')
            .set('Authorization', 'Bearer invalidtoken');

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Unauthorized - Invalid token.');
    });
});
