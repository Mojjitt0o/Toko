const { Order, OrderItem, Item, sequelize  } = require('../models')

const statusOrder = ['pending', 'success']

const getOrders = async (req, res) => {
    try {
        const userId = req.user.id;

        const orderedByUser = await Order.findAll({
            where: {
                user_id: userId
            },
            attributes: ['id', 'total_price', 'total_quantity', 'status', 'createdAt'],
            include: [
                {
                    model: OrderItem,
                    as: 'OrderItems',
                    attributes: ['quantity'],
                    include: [
                        {
                            model: Item,
                            as: 'Item',
                            attributes: ['id', 'name', 'description', 'price']
                        }
                    ]
                }
            ],
            order: [['createdAt', 'DESC']] 
        });

        const formattedOrders = orderedByUser.map(order => ({
            id: order.id,
            total_price: order.total_price,
            total_quantity: order.total_quantity,
            status: order.status,
            createdAt: order.createdAt,
            items: order.OrderItems.map(orderItem => ({
                name: orderItem.Item.name,
                description: orderItem.Item.description,
                item_price: orderItem.Item.price,
                item_quantity: orderItem.quantity
            }))
        }));

        return res.status(200).json({
            success: true,
            data: formattedOrders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

const createOrder = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { items } = req.body;
        if (!items || items.length === 0 || items.some(item => !item.id || item.quantity <= 0)) {
            await transaction.rollback();
            return res.status(400).send(
                `Please fill items with id and quantity greater than 0. Example: { "items": [ {"id": 1, "quantity": 10}, {"id": 2, "quantity": 15} ] }`
            );
        }

        const itemIds = items.map((item) => item.id);

        const itemDB = await Item.findAll({
            where: { id: itemIds },
            raw: true,
            attributes: ['id', 'price']
        });

        if (itemDB.length !== items.length) {
            await transaction.rollback();
            return res.status(404).json({
                error: 'cannot find item(s) requested'
            });
        }

        const mergedItem = [];
        itemDB.forEach((itemDB) => {
            mergedItem.push({ ...itemDB, ...(items.find(item => itemDB.id == item.id)) });
        });

        const totalOrderPrice = mergedItem.reduce((a, b) => a + b.price * b.quantity, 0);
        const totalOrderQuantity = mergedItem.reduce((a, b) => a + b.quantity, 0);

        if (isNaN(totalOrderPrice) || isNaN(totalOrderQuantity)) {
            await transaction.rollback();
            return res.status(400).json(
                `Please fill items with id and quantity. Example: { "items": [ { "id": 1, "quantity": 10 }, { "id": 2, "quantity": 15 } ] }`
            );
        }

        const orderDB = await Order.create({
            user_id: req.user.id,
            total_quantity: totalOrderQuantity,
            total_price: Number(totalOrderPrice),
            status: "pending"
        }, { transaction });

        const orderDetails = mergedItem.map((item) => {
            return {
                order_id: orderDB.id,
                item_id: item.id,
                quantity: item.quantity,
            };
        });

        await OrderItem.bulkCreate(orderDetails, { transaction });

        await transaction.commit();

        return res.status(201).json({ success: true, data: orderDetails });
    } catch (error) {
        await transaction.rollback();
        console.error('Error creating order:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const updateStatusOrder = async (req, res) => {
    const id = req.params.id
    const { status } = req.body

    checkStatus = statusOrder.includes(status)

    if (! checkStatus) {
        return res.status(422).json({
            status: false,
            error: 'Status not matched'
        })
    }

    const order = await Order.findByPk(id)
    if (order != undefined) {
        order.status = status
        await order.save()

        return res.sendStatus(200)
    }

    return res.sendStatus(404)
}

module.exports = {
    getOrders,
    createOrder,
    updateStatusOrder
}