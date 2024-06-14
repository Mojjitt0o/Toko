require("dotenv").config()
const app = require('../app')
const jwt = require('jsonwebtoken')
const httpRequest = require('supertest')
const { describe, it, expect, beforeAll, afterAll } = require('@jest/globals')
const { sequelize, User, Item } = require('../models')
const { faker } = require('@faker-js/faker')

describe('Delete Item Test', () => {
    beforeAll(async () => {
        await sequelize.sync({ force: true })
    })

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

    const userLogin = async (isAdmin) => {
        const user = await User.create({ email: 'testuser@mail.com', password: 'testpass', is_admin: isAdmin })
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY)
        return token
    }

    it('should return unauthorized if not logged in', async () => {
        const item = await createItem()
        const res = await httpRequest(app)
            .delete(`/items/${item.id}`)
        expect(res.status).toBe(401)
    })

    it('should return forbidden if not admin', async () => {
        const token = await userLogin(false)
        const item = await createItem()

        const res = await httpRequest(app)
            .delete(`/items/${item.id}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(403)
    })

    it('should not found item id', async () => {
        const token = await userLogin(true)
        const item = await createItem()

        const res = await httpRequest(app)
            .delete(`/items/99999`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(400)
    })

    it('should delete item if admin', async () => {
        const token = await userLogin(true)
        const item = await createItem()

        const res = await httpRequest(app)
            .delete(`/items/${item.id}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
    })
})
