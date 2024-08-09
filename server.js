const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require('cors');

//import Routes
const userRoute = require('./Routes/userRoute');
const carRoute = require('./Routes/carRoute');
const enrolleeRoute = require('./Routes/userRoute')

dotenv.config();

//Middlewares
app.use(cors());

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended:true, limit: '50mb'}))

//Connect to Database
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(console.log("connected To Mondo DB"))
  .catch((err) => console.log(err));


 //Routes Middleware
app.use('/api/users', userRoute);
app.use('/api/cars', carRoute);
app.use('/api/v1/enrollee', enrolleeRoute);



const PORT = process.env.PORT || 5000
app.listen(
  PORT,
  console.log(`The app is running in ${process.env.NODE_ENV} mode on port ${PORT}`)
)

