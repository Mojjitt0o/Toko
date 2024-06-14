const request = require('supertest');
const app = require('../app');
const { User, sequelize } = require('../models');
const bcrypt = require('bcrypt');
const { describe, it, beforeAll, afterAll, beforeEach, expect } = require('@jest/globals');

if (process.env.NODE_ENV === 'test') {
    console.error = jest.fn();
}

describe('POST /users/login', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        await sequelize.sync({ force: true });
        const hashedPassword = await bcrypt.hash('password123', 10);
        await User.create({
            name: 'Test User',
            email: 'testuser@example.com',
            password: hashedPassword,
            is_admin: false,
            is_verified: true,
            address: '123 Test St.'
        });
    });

    it('should login successfully with valid credentials', async () => {
        const credentials = {
            email: 'testuser@example.com',
            password: 'password123'
        };

        const response = await request(app)
            .post('/users/login')
            .send(credentials);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Login berhasil');
        expect(response.body).toHaveProperty('token');
    });

    it('should return a 400 error if email or password is missing', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({ email: 'testuser@example.com' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.messages).toContain('Password diperlukan');
    });

    it('should return a 401 error if email is not found', async () => {
        const credentials = {
            email: 'unknown@example.com',
            password: 'password123'
        };

        const response = await request(app)
            .post('/users/login')
            .send(credentials);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Email tidak ditemukan');
    });

    it('should return a 401 error if password is incorrect', async () => {
        const credentials = {
            email: 'testuser@example.com',
            password: 'wrongpassword'
        };

        const response = await request(app)
            .post('/users/login')
            .send(credentials);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Kombinasi Email dan Password salah!');
    });
});
