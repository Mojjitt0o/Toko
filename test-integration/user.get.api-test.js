const request = require('supertest');
const app = require('../app');
const { User } = require('../models');
const { sequelize } = require('../models');
const jwt = require('jsonwebtoken');

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

beforeAll(async () => {
    await sequelize.sync({ force: true });

    // Create an admin user and a non-admin user
    await User.create({ 
        username: 'admin', 
        email: 'admin@example.com', 
        password: 'password', 
        is_admin: true 
    });
    await User.create({ 
        username: 'user', 
        email: 'user@example.com', 
        password: 'password', 
        is_admin: false 
    });
});

afterAll(async () => {
    await sequelize.close();
});

describe('GET /users', () => {
    it('should return 200 and list of users for admin', async () => {
        const admin = await User.findOne({ where: { email: 'admin@example.com' } });
        const adminToken = jwt.sign({ id: admin.id }, JWT_SECRET_KEY, { expiresIn: '1h' });

        const response = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${adminToken}`);
        
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveLength(2);
    });

    it('should return 403 for non-admin users', async () => {
        const user = await User.findOne({ where: { email: 'user@example.com' } });
        const userToken = jwt.sign({ id: user.id }, JWT_SECRET_KEY, { expiresIn: '1h' });

        const response = await request(app)
            .get('/users')
            .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
    });

    it('should return 401 if no token is provided', async () => {
        const response = await request(app)
            .get('/users');

        expect(response.status).toBe(401);
    });

    it('should return 401 if token format is invalid', async () => {
        const response = await request(app)
            .get('/users')
            .set('Authorization', `InvalidTokenFormat`);

        expect(response.status).toBe(401);
    });
});
