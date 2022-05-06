const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var cors = require('cors');




dotenv.config();


//Middlewares
app.use(cors());
app.use(express.json());

//Connect to Database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(console.log("connected To Mondo DB"))
  .catch((err) => console.log(err));




const PORT = process.env.PORT || 5000
app.listen(
  PORT,
  console.log(`The app is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)

