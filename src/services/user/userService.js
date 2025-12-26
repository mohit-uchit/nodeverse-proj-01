const User = require('../../../models/user/user');
const Address = require('../../../models/user/address');

const createUser = async data => {
  const { name, email, age, userAddresses } = data;
  const user = await User.create({ name, email, age, adresses: userAddresses });

  /* const addressData = userAddresses.map(a => {
    return { street: a.streetAdress, city: a.city, userId :  user._id};
  });

  await Address.insertMany(addressData); */

  return {
     id : user._id
  }
};

const getUserById = async id => {
   const user = await User.findById(id, {name : 1, age: 1, email: 1}).populate('addresses')
   return {
     id : user._id,
     name : user.name,
     age : user.age,
     email: user.email,
     addresses : user.addresses.map(a =>  {
       return {
         id : a._id,
         streeAddress : a.street,
         city : a.city
     }
     })
   }
};

const getUsers = async query => {};

const updateUser = async data => {};

const deleteUser = async id => {};

module.exports = {
  createUser,
  getUserById,
  getUsers,
  updateUser,
  deleteUser,
};
