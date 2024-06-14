require('assert').strictEqual(process.env.NODE_ENV, 'test');
const { describe, it, beforeAll, afterAll, beforeEach, expect } = require('@jest/globals');
const app = require('../app');
const httpRequest = require('supertest');
const jwt = require('jsonwebtoken');
const { sequelize, User } = require('../models');
const bcrypt = require('bcrypt');

if (process.env.NODE_ENV === 'test') {
    console.error = jest.fn();
}

describe('PUT /users/user-update', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true });
    });

    beforeEach(async () => {
        await sequelize.sync({ force: true });
        const hashedPassword = await bcrypt.hash('testpass', 10);
        await User.create({
            name: 'Test User',
            email: 'testuser@mail.com',
            password: hashedPassword,
            is_admin: false,
            is_verified: true,
            address: '123 Test St.'
        });
    });

    async function userLogin(isAdmin) {
        const user = await User.create({
            email: 'testuser@mail.com',
            password: await bcrypt.hash('testpass', 10),
            is_admin: isAdmin
        });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY);
        return token;
    }

    it('should update the user information', async () => {
        const token = await userLogin(false);

        const response = await httpRequest(app)
            .put('/users/user-update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Name',
                email: 'updated@example.com',
                oldPassword: 'testpass',
                newPassword: 'newpassword123'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');

        const updatedUser = await User.findOne({ where: { email: 'updated@example.com' } });
        expect(updatedUser.name).toBe('Updated Name');
        expect(updatedUser.email).toBe('updated@example.com');
    });

    it('should return an error if old password is incorrect', async () => {
        const token = await userLogin(false);

        const response = await httpRequest(app)
            .put('/users/user-update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Updated Name',
                email: 'updated@example.com',
                oldPassword: 'wrongpassword',
                newPassword: 'newpassword123'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Old Password salah!');
    });
});
