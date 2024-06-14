require("dotenv").config()
const app = require('../app')
const jwt = require('jsonwebtoken')
const httpRequest = require('supertest')
const { faker } = require('@faker-js/faker')
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals')
const { sequelize, User, Item } = require('../models')
const path = require('path')
const fs = require('fs').promises;

describe('Update Item Test', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true })
    })

    const userLogin = async (isAdmin) => {
        const user = await User.create({ email: 'testuser@mail.com', password: 'testpass', is_admin: isAdmin })
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY)
        return token
    }

    const getImageBuffer = async () => {
        const imagePath = path.resolve(__dirname, '../uploads/dummy.jpg');
        const imageBuffer = await fs.readFile(imagePath);
        return imageBuffer
    }

    const createItem = async () => {
        const item = await Item.create({
            name: faker.commerce.productName(),
            description: faker.commerce.productDescription(),
            price: parseFloat(faker.commerce.price()),
            stock: faker.number.int({ min: 10, max: 100 }),
            image: faker.image.avatar()
        });
        return item
    }

    it('should return unauthorized if not logged in', async () => {
        const res = await httpRequest(app)
            .put('/items/1')
            .field('name', 'Tes')
            .field('description', 'Test Description')
            .field('stock', 10)
            .field('price', 999)

        expect(res.status).toBe(401)
    })

    it('should return forbidden if not admin', async () => {
        const token = await userLogin(false)
        const item = await createItem()

        const res = await httpRequest(app)
            .put(`/items/${item.id}`)
            .set('Authorization', `Bearer ${token}`)
            .field('name', 'Test Item')
            .field('description', 'Test Description')
            .field('stock', 10)
            .field('price', 9999)

        expect(res.status).toBe(403)
    })

    it('should not found item id', async () => {
        const token = await userLogin(true)

        const res = await httpRequest(app)
            .put('/items/99999')
            .set('Authorization', `Bearer ${token}`)
            .field('name', 'Test Item')
            .field('description', 'Test Description')
            .field('stock', 10)
            .field('price', 1000)

        expect(res.status).toBe(400)
    })

    it('should update item if admin', async () => {
        const token = await userLogin(true)
        const imageBuffer = await getImageBuffer()
        const item = await createItem()

        const res = await httpRequest(app)
            .put(`/items/${item.id}`)
            .set('Authorization', `Bearer ${token}`)
            .field('name', 'Test Item')
            .field('description', 'Test Description')
            .field('stock', 10)
            .field('price', 1000)
            .attach('image', imageBuffer, 'dummy.jpg');

        expect(res.status).toBe(200)
        expect(res.body.success).toBe(true)
        expect(res.body.data).toHaveProperty('id')
        expect(res.body.data.name).toBe('Test Item')
        expect(res.body.data.description).toBe('Test Description')
        expect(res.body.data.stock).toBe("10")
        expect(res.body.data.price).toBe("1000")
        expect(res.body.data.image).toMatch(/^https:\/\/res\.cloudinary\.img\//);
    })
})
