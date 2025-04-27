const mongoose = require("mongoose");

const database = () => {
  mongoose
    .connect(process.env.DB_URI)
    .then((conn) => {
      console.log(`Database connected : ${conn.connection.host}`);
    })
    .catch((err) => {
      console.log(`Database error : ${err.message}`);
      process.exit(1);
    });
};

module.exports = database;
