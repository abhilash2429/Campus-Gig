const mongoose = require("mongoose");

const connectDb = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Add it to server/.env before starting the API.");
  }

  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  await mongoose.connect(process.env.MONGO_URI, {
    autoIndex: true,
  });

  return mongoose.connection;
};

module.exports = connectDb;

