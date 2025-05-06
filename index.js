const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const path = require("path");
dotenv.config({ path: "config.env" });
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");
const database = require("./config/database");
const mountRoutes = require("./routes");
//connect with db
database();

// express app
const app = express();

// Enable other domains to access your application
app.use(cors());
app.options("*", cors());

// compress all responses
app.use(compression());

//Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));

if (process.env.NODE_ENV === "devolopment") {
  app.use(morgan("dev"));
  console.log(`mode : ${process.env.NODE_ENV}`);
}

//mount routes
mountRoutes(app);

app.all("*", (req, res, next) => {
  //create error and send it to error handling middleware
  //const err = new Error(`can’t find this route ${req.originalUrl}`);
  //next(err);
  next(new ApiError(`can’t find this route ${req.originalUrl}`, 400));
});

//Global error handling middleware for express
app.use(globalError);

const { PORT } = process.env;
const server = app.listen(PORT, () => {
  console.log(`app running on PORT ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.log(`unhandledRejection: ${err.name} | ${err.message}`);
  server.close(() => {
    console.log(`shut down ....`);
    process.exit(1);
  });
});
