require("dotenv").config();
const app = require('../app')
const jwt = require('jsonwebtoken')
const httpRequest = require('supertest')
const { faker } = require('@faker-js/faker')
const { describe, it, expect } = require('@jest/globals')
const { sequelize, User, Item } = require('../models');

describe('Get All Item Test', () => {
    beforeAll(async () => {
        await sequelize.sync({force:true})
    })

    afterAll(async () => {
        await sequelize.close();
    });

    it('should return unauthorize', async () => {
        const res = await httpRequest(app)
            .get('/items')

        expect(res.status).toBe(401)
    })

    it('should show item / product list', async () => {
        token = await userLogin(false)
        await seedItems(10)

        const res = await httpRequest(app)
            .get('/items')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
    })
})

async function userLogin(isAdmin) {
    const user = await User.create({ email: 'testuser@mail', password: 'testpass', is_admin: isAdmin });
    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY);
    return token
}

async function seedItems(total) {
    const items = []
    for (let i=0; i<total; i++) {
        items.push({
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price()),
            stock: faker.number.int({ min: 10, max: 100 }),
            image: faker.image.avatar()
        })
    }

    await Item.bulkCreate(items);
}