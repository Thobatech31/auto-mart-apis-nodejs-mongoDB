const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CarSchema = new mongoose.Schema(
  {
    car_name: {
      type: String,
      required: true,
      unique: true,
    },
    desc: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    model_name: {
      type: String,
      required: true,
    },
    model_year: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

  },
  { timestamps: true }
);

const Car = mongoose.model("Car", CarSchema)

module.exports = Car