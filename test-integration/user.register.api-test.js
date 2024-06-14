const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const { describe, it, beforeAll, afterAll, beforeEach, expect } = require('@jest/globals');

if (process.env.NODE_ENV === 'test') {
    console.error = jest.fn();
}

describe('POST /users/register', () => {
    let userMock;

    beforeAll(() => {
        userMock = jest.spyOn(User, 'create');
    });

    afterAll(() => {
        userMock.mockRestore();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should register a new user successfully', async () => {
        const newUser = {
            name: 'New User',
            email: 'newuser@example.com',
            password: 'password123',
            address: 'Yogyakarta',
            is_admin: false
        };

        userMock.mockResolvedValue(newUser);

        const response = await request(app)
            .post('/users/register')
            .send(newUser);

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('message', 'Pengguna berhasil didaftarkan. Silakan verifikasi email Anda.');
    });

    it('should return a 400 error if required fields are missing', async () => {
        const response = await request(app)
            .post('/users/register')
            .send({ email: 'testuser@example.com' });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.messages).toContain('Nama lengkap diperlukan');
        expect(response.body.messages).toContain('Password setidaknya harus 6 karakter');
    });

    it('should return a 400 error if email already exists', async () => {
        const existingUser = {
            name: 'Existing User',
            email: 'existinguser@example.com',
            password: 'password123',
            address: '123 Existing St.'
        };

        userMock.mockRejectedValueOnce({ name: 'SequelizeUniqueConstraintError', message: 'Email telah digunakan' });

        const response = await request(app)
            .post('/users/register')
            .send(existingUser);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Email telah digunakan');
    });

    it('should return a 400 error if email format is invalid', async () => {
        const newUser = {
            name: 'Invalid Email User',
            email: 'invalid-email',
            password: 'password123',
            address: 'Yogyakarta'
        };

        const response = await request(app)
            .post('/users/register')
            .send(newUser);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.messages).toContain('Email tidak valid');
    });

    it('should return a 500 error if there is a server error', async () => {
        userMock.mockRejectedValueOnce(new Error('Server error'));

        const newUser = {
            name: 'New User',
            email: 'newuser@example.com',
            password: 'password123',
            address: 'Yogyakarta'
        };

        const response = await request(app)
            .post('/users/register')
            .send(newUser);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message', 'Terjadi kesalahan saat mendaftarkan pengguna');
    });
});
