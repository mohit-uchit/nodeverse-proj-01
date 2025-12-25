const { filter } = require('lodash');
const Todo = require('../../../models/todos/Todo');

const createTodo = async body => {
  const { title, description, completed } = body;
  const todo = await Todo.create({ title, description, completed });
  return { id: todo._id };
};

const updateTodo = async (id, body) => {
  const { title, description, completed } = body;
  const todo = await Todo.findById(id, { id: 1 });
  if (!todo) {
    throw new Error('Todo not found');
  }
  todo.title = title;
  todo.description = description;
  todo.completed = completed;
  return await todo.save();
  // return await Todo.findByIdAndUpdate(id, { title, description, completed }, { new: true });
};

const getTodoById = async id => {
  const todo = await Todo.findById(id, {
    id: 1,
    title: 1,
    description: 1,
    completed: 1,
    createdAt: 1,
  });
  return {
    id: todo._id,
    title: todo.title,
    description: todo.description,
    completed: todo.completed,
    createdAt: todo.createdAt,
  };
};

const getAllTodos = async query => {
  const { title, completed, fromDate, toDate, page, limit } = query;
  const filters = {};
  // return { fromDate : new Date(fromDate), toDate : new Date(toDate)}
  if (title) {
    filters.title = { $regex: title, $options: 'i' };
  }

  if (completed != undefined) {
    filters.completed = completed;
  }

  if (fromDate || toDate) {
    filters.createdAt = {};

    // 12- 15
    // gte 12 , lte 15
    if (fromDate) {
      filters.createdAt.$gte =fromDate;
    }

    if (toDate) {
      filters.createdAt.$lte = toDate;
    }
  }

  const skipResults = (Number(page) - 1) * Number(limit);

  const todos = await Todo.find(filters)
    .skip(skipResults)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  const total = await Todo.countDocuments(filters);

  return {
    todos: todos,
    meta: {
      total,
      page: Number(page),
      limit: Number(limit),
      totaPage: Math.ceil(total / limit),
    },
  };
};

const deleteTodoById = async id => {
  await Todo.findByIdAndDelete(id);
};

module.exports = {
  createTodo,
  updateTodo,
  getTodoById,
  getAllTodos,
  deleteTodoById,
};
