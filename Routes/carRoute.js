const router = require('express').Router();
const Car = require("../Models/carModel");
const { verifyTokenUser, verifyTokenAndAuthorization } = require("../Authentication/verifyToken");
const multer = require('multer');
const path = require('path');
const cloudinary = require("../utils/cloudinary")

//Defining Storage for the images

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/images')
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
})

//upload parameter for multer
const upload = multer({
  storage: storage
  // limits: {
  //   fileSize: 1000000
  // }
});
//Create
router.post("/", upload.single('image'), verifyTokenAndAuthorization, async (req, res) => {

  const { car_name, desc, image, model_name, model_year, color, price } = req.body;
  if (!car_name)
    return res.status(401).json({ msg: "Car Name Field is Empty" });

  if (!desc) return res.status(401).json({ msg: "Desc Field is Empty" })

  if (!model_name) return res.status(401).json({ msg: "Model Name Field is Empty" })

  if (!model_year) return res.status(401).json({ msg: "Model Year Field is Empty" })

  if (!color) return res.status(401).json({ msg: "Color Field is Empty" })

  if (!price) return res.status(401).json({ msg: "Price Field is Empty" })

  const user = req.user;
  try {
    const savedCar = await Car.create({
      userId: user.id,
      car_name,
      desc,
      model_name,
      model_year,
      color,
      price,
      image: req.file.filename
    })
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Car Posted Created Successfully"
      },
      data: savedCar,
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }

})


//Create With Cloudinary
router.post("/cloudinary", verifyTokenAndAuthorization, async (req, res) => {

  const { car_name, desc, image, model_name, model_year, color, price } = req.body;
  if (!car_name)
    return res.status(401).json({ msg: "Car Name Field is Empty" });

  if (!desc) return res.status(401).json({ msg: "Desc Field is Empty" })

  if (!model_name) return res.status(401).json({ msg: "Model Name Field is Empty" })

  if (!model_year) return res.status(401).json({ msg: "Model Year Field is Empty" })

  if (!color) return res.status(401).json({ msg: "Color Field is Empty" })

  if (!price) return res.status(401).json({ msg: "Price Field is Empty" })


  const user = req.user;

     cloudinary.uploader.upload(image, {
        upload_preset: "car_mart",
        allowed_formats : ['png', 'jpg', 'svg', 'ico', 'jfif', 'web']
      }).then((result) =>{
        const savedCar = Car.create({
          userId: user.id,
          car_name,
          desc,
          model_name,
          model_year,
          color,
          price,
          image: result.url
        })

        return res.status(200).json({
          status: {
            code: 100,
            msg: "Car Posted Created Successfully"
          },
          // data: result.url,
        })

      }).catch((error) => {
        res.status(500).send({
          message:"failed",
          error
        })
      })


})


//UPDATE Car Post
router.put("/:id", verifyTokenUser, async (req, res) => {
  try {
    const updatedCar = await Car.findByIdAndUpdate(req.params.id, {
      $set: req.body
    }, { new: true });

    return res.status(200).json({
      status: {
        code: 100,
        msg: 'Car Post Updated successfully'
      },
      data: updatedCar,
    })
  } catch (err) {
    return res.status(500).json({ msg: err });
  }
})


//Delete Car
router.delete("/:id", verifyTokenUser, async (req, res) => {
  try {
    await Car.findByIdAndDelete(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Car Post deleted Successfully"
      }
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

//Get Product
//since everybody can see product there's no need for verification
router.get("/:id", verifyTokenUser, async (req, res) => {
  if (!req.params.id)
    return res.status(400).json({ msg: "Please provide car ID" })
  try {
    const car = await Car.findById(req.params.id)
    return res.status(200).json({
      status: {
        code: 100,
        msg: "Car Fetched Successfully",
      },
      data: car
    })

  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})


//Get all Car
router.get("/", async (req, res) => {
  const qNew = req.query.new

  const pageSize = req.query.pageSize || 10;
  const currentPage = req.query.currentPage || 1;
  try {
    let cars;

    if (qNew) {
      cars = await Car.find().sort({ CreatedAt: -1 }).limit(10);
    } else {
      cars = await Car.find().sort({ CreatedAt: -1 }).limit(10)
    }
    // count the total number of records for that model
    const totalCars = await Car.countDocuments();

    return res.status(200).json({
      status: {
        code: 100,
        msg: "All Cars Post Fetched Successfully",
      },
      data: cars,
      totalPage: parseInt(pageSize),
      totalRecords: parseInt(totalCars),
      page: parseInt(currentPage),
    })
  } catch (err) {
    return res.status(500).json({ msg: err })
  }
})

module.exports = router
