const mongoose = require("mongoose");

const database = () => {
  mongoose
    .connect("mongodb://0.0.0.0:27017/udemy_ecommerce", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("connected");
    });
  //   .catch((err)=>{
  //  console.log(err)
  //   })
};

module.exports = database;
