const mongoose = require('mongoose');

const connectDb = async mongoUri => {
  mongoose.connect(mongoUri);
  mongoose.connection.on('connected', () =>
    console.log('Connected to MongoDB'),
  );
  mongoose.connection.on('error', err =>
    console.error('MongoDB connection error:', err),
  );
};

module.exports = {
  connectDb,
};
