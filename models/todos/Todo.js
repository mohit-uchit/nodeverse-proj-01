// Schema -> Model -> Query Methods -> Hooks
const { trim } = require('lodash');
const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: false,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

todoSchema.pre('/^find/', function () { 
  this.where({ deletedAt: null });
});

const Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;

// Hooks => Hooks are functions that run before or after certain actions
// deletedAt : null => not deleted => vahi record jo not deleted hai
