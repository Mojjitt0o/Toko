require('assert').strictEqual(process.env.NODE_ENV, 'test')
const { describe, it } = require('@jest/globals')
const app = require('../app')
const httpRequest = require('supertest')
const jwt = require('jsonwebtoken')
const { sequelize, User, OrderItem, Order, Item } = require('../models')
// const Order = sequelize.model('Order')
// const Order = require('../../models').sequelize.model('Order')

describe('Order test', () => {
    beforeAll(async () => { await sequelize.sync({force:true})})
    afterAll(async () => { await sequelize.close()});
    
    it('GET /orders - failure - unauthorized', async () => {
        const res = await httpRequest(app).get('/orders')
        expect(res.status).toBe(401)
    })
    
    it('GET /orders - success - get all orders', async () => {
        token = await userLogin(false)
        const res = await httpRequest(app).get('/orders')
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200)
        expect(res.body).toHaveProperty('success')
        expect(res.body.success).toEqual(true)
        expect(res.body).toHaveProperty('data')
        expect(Array.isArray(res.body.data)).toBe(true);
    })

    it('PATCH /orders - failure - wrong status', async () => {
        token = await userLogin(false)
        const res = await httpRequest(app)
            .patch('/orders/999999/update-status')
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'neither success nor pending'
            })
        expect(res.status).toBe(422)
    })

    it('PATCH /orders - failure - order not found', async () => {
        token = await userLogin(false)
        const res = await httpRequest(app)
            .patch('/orders/999999/update-status')
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'success'
            })
        expect(res.status).toBe(404)
    })

    it('PATCH /orders - success - successfully updated order', async () => {
        token = await userLogin(false)
        const order_test = await Order.create({
            user_id: 1,
            total_price: 1000,
            status: "pending"
        })
        const res = await httpRequest(app)
            .patch('/orders/1/update-status')
            .set('Authorization', `Bearer ${token}`)
            .send({
                status: 'pending'
            })
        expect(res.status).toBe(200)
    })

    it('POST /orders - failure - unauthorized', async () => {
        const res = await httpRequest(app).post('/orders')
        expect(res.status).toBe(401)
    })

    it('POST /orders - failure - body is empty', async () => {
        token = await userLogin(false)
        const res = await httpRequest(app)
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send({})
        expect(res.status).toBe(400)

    })

    it('POST /orders - failure - item is not found', async () => {
        token = await userLogin(false)
        mockItem = await Item.create({
            id: 1,
            name: "sabun",
            price: 1000
        },)

        payload = {
            items: [{"id": 1, "name": "item1"}, {"id": 2, "name": "item2"} ], 
        }
        const res = await httpRequest(app)
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send(payload)
        expect(res.status).toBe(404)
    })

    it('POST /orders - failure - item and order doesn\'t match', async () => {
        token = await userLogin(false)
        mockItem = await Item.create({
            id: 2,
            name: "sabun",
            price: 1000
        },)

        payload = {
            items: [{"id": 1, "name": "item1"}], 
            order: [{"id": 2, "quantity": 5}] 
        }
        const res = await httpRequest(app)
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send(payload)
        expect(res.status).toBe(400)
    })

    it('POST /orders - success - successfully created order', async () => {
        const token = await userLogin(false);

        const payload = {
            items: [
                { id: 1, quantity: 1 },
                { id: 2, quantity: 1 }
            ]
        };
        const res = await httpRequest(app)
            .post('/orders')
            .set('Authorization', `Bearer ${token}`)
            .send(payload);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
        expect(res.body.data.length).toBe(2);
        res.body.data.forEach(orderItem => {
            expect(orderItem.quantity).toBe(1);
            expect([1, 2]).toContain(orderItem.item_id);
        });
    });
})

async function userLogin(isAdmin) {
    const user = await User.create({ email: 'testuser@mail', password: 'testpass', is_admin: isAdmin });
    token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY);
    return token
}


