const router = require('express').Router();

const controller = require('../controllers/order.controller');
const { isAdmin } = require('../middlewares');

router.get('/', isAdmin(false), controller.getOrders);
router.post('/', isAdmin(false), controller.createOrder);
router.patch('/:id/update-status', isAdmin(false), controller.updateStatusOrder);

module.exports = router;
