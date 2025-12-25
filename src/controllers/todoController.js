const todoService = require('../services/todo/todoService');
const responseHandle = require('../helpers/responseHandle');
const { todo } = require('node:test');

const createTodo = async (req, res) => {
  try {
    const data = await todoService.createTodo(req.body);
    return responseHandle.handleData(res, data);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

const updateTodo = async (req, res) => {
  try {
    await todoService.updateTodo(req.params.id, req.body);
    return responseHandle.handleOK(res);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

const getTodoById = async (req, res) => {
  try {
    const data = await todoService.getTodoById(req.params.id);
    return responseHandle.handleData(res, data);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

const getAllTodos = async (req, res) => {
  try {
    const data = await todoService.getAllTodos(req.query);
    return responseHandle.handleData(res, data);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

const deleteTodoById = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = {
  createTodo,
  updateTodo,
  getTodoById,
  getAllTodos,
  deleteTodoById,
};
