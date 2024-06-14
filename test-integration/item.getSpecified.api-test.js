require("dotenv").config();
const app = require('../app')
const httpRequest = require('supertest')
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals')
const { sequelize, Item, User } = require('../models');
const { faker } = require('@faker-js/faker')
const jwt = require('jsonwebtoken')

describe('Get Detail Item Test', () => {
    let token;

    beforeAll(async () => {
        await sequelize.sync({force:true})
        token = await userLogin(false)
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('Should return unauthorized without token', async () => {
        const res = await httpRequest(app)
            .get(`/items/1`)

        expect(res.status).toBe(401);
    });

    it('Should return item detail', async () => {
        const item = await createItem()
        const res = await httpRequest(app)
            .get(`/items/${item.id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id', item.id);
        expect(res.body.data).toHaveProperty('description', item.description);
        expect(res.body.data).toHaveProperty('price', item.price);
        expect(res.body.data).toHaveProperty('stock', item.stock);
        expect(res.body.data).toHaveProperty('image', item.image);
    });

    it('Should return 400 if item not found', async () => {
        const res = await httpRequest(app)
            .get('/items/999999')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Item not found');
    });
});

async function userLogin(isAdmin) {
    const user = await User.create({ email: 'testuser@mail', password: 'testpass', is_admin: isAdmin });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY);
    return token
}

async function createItem() {
    const item = await Item.create({
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: parseFloat(faker.commerce.price()),
        stock: faker.number.int({ min: 10, max: 100 }),
        image: faker.image.avatar()
    });

    return item
}
