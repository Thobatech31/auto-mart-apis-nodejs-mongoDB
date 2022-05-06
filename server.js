const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
var cors = require('cors');

//import Routes
const userRoute = require('./Routes/userRoute');
const carRoute = require('./Routes/carRoute');


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


// //Routes Middleware
app.use('/api/users', userRoute);
app.use('/api/cars', carRoute);


const PORT = process.env.PORT || 5000
app.listen(
  PORT,
  console.log(`The app is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)

