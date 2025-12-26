const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    age: Number,
    adresses : [
       {
         street: String,
         city : String
       }
    ],
    deleteAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

/*  userSchema.virtual('addresses', {
    ref : 'Address',
    localField: '_id',
    foreignField: 'userId'
 })

 userSchema.set("toJSON", { virtuals : true}) */

module.exports = mongoose.model('User', userSchema);
