const router = require('express').Router();
const controller = require('../controllers/user.controller');
const { isAuthenticated, isAdmin, formValidators } = require('../middlewares');

router.get('/', isAuthenticated, isAdmin(true), controller.getUsers);
router.get('/whoami', isAuthenticated, controller.whoAmI);
router.post('/register', formValidators.validateRegister, controller.userRegister);
router.post('/login', formValidators.validateLogin, controller.userLogin);
router.put('/user-update', isAuthenticated, formValidators.validateUpdateUser, controller.userUpdate);
router.delete('/user-delete', isAuthenticated, isAdmin(true), controller.userDelete);

module.exports = router;