const userService = require('../services/user/userService');
const responseHandle = require('../helpers/responseHandle');

const createUser = async (req, res) => {
  try {
    const data = await userService.createUser(req.body);
    return responseHandle.handleData(res, data);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    await userService.updateUser(req.params.id, req.body);
    return responseHandle.handleOK(res);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

const getUserById = async (req, res) => {
  try {
    const data = await userService.getUserById(req.params.id);
    return responseHandle.handleData(res, data);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

const getUsers = async (req, res) => {
  try {
    const data = await userService.getUsers(req.query);
    return responseHandle.handleData(res, data);
  } catch (error) {
    return responseHandle.handleError(res, error);
  }
};

const deleteUser = async (req, res) => {
  try {
  } catch (error) {}
};

module.exports = {
  createUser,
  updateUser,
  getUserById,
  getUsers,
  deleteUser,
};
