const router = require('express').Router();
const userController = require('../src/controllers/userController');

router.post('/', userController.createUser)
router.get('/:id', userController.getUserById)
router.get('/', userController.getUsers)
router.patch('/:id', userController.updateUser)
router.delete('/:id', userController.deleteUser)

module.exports = router