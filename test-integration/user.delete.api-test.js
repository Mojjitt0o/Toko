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

describe('DELETE /users/user-delete', () => {
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
            is_admin: true,  // Pastikan pengguna adalah admin
            is_verified: true,
            address: '123 Test St.'
        });
    });

    async function userLogin(isAdmin) {
        const user = await User.create({
            email: 'adminuser@mail.com',
            password: await bcrypt.hash('testpass', 10),
            is_admin: isAdmin
        });
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY);
        return token;
    }

    it('should delete the user', async () => {
        const token = await userLogin(true);

        const response = await httpRequest(app)
            .delete('/users/user-delete')
            .set('Authorization', `Bearer ${token}`)
            .send({
                password: 'testpass'
            });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User deleted');

        const deletedUser = await User.findOne({ where: { email: 'adminuser@mail.com' } });
        expect(deletedUser).toBeNull();
    });

    it('should return 401 if password is incorrect', async () => {
        const token = await userLogin(true);

        const response = await httpRequest(app)
            .delete('/users/user-delete')
            .set('Authorization', `Bearer ${token}`)
            .send({
                password: 'wrongpassword'
            });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Password yang Anda masukkan salah');
    });
});
