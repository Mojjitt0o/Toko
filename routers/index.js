const { isAuthenticated } = require('../middlewares');
const routers = require("express").Router();
const userRouter = require("./user.router");
const itemRouter = require("./item.router");
const orderRouter = require("./order.router");

routers.get('/healthcheck', (req, res) => setTimeout(() => res.sendStatus(200), 10000));

routers.use("/items", isAuthenticated, itemRouter);
routers.use("/orders",isAuthenticated, orderRouter);
routers.use("/users", userRouter);

module.exports = routers;
