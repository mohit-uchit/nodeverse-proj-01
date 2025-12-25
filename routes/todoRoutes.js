const router = require('express').Router()
const todoControler = require('../src/controllers/todoController');

router.post('/', todoControler.createTodo);

router.get('/', todoControler.getAllTodos);

router.get('/:id', todoControler.getTodoById);

router.patch('/:id', todoControler.updateTodo);

router.delete('/:id', todoControler.deleteTodoById);

module.exports = router