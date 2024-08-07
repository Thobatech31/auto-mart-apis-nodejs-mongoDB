const router = require("express").Router();
const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const request = require("request");
const _ = require("lodash");
const { result } = require("lodash");
const dotenv = require("dotenv");
const {
  verifyTokenAndAuthorization,
  verifyTokenUser,
  verifyTokenAndAdmin,
  verifyToken,
} = require("../Authentication/verifyToken");
const {
  fogotPasswordEmailMessage,
} = require("../email_templates/fogotPasswordEmail");
const sendMail = require("../controller/emailController");

dotenv.config();

//REGISTER WITH EMAIL VERIFICATION
router.post("/register", async (req, res) => {
  const { username, email, mobile, first_name, last_name, address } = req.body;
  //Check If Username Field Empty
  if (!username)
    return res.status(401).json({ msg: "Username Field is Empty" });
  //Check If Email address Field Empty
  if (!email) return res.status(401).json({ msg: "Email Field is Empty" });
  //Check If Mobile Field Empty
  if (!mobile) return res.status(401).json({ msg: "Mobile Field is Empty" });

  //Check If First name OR Last name Field Empty
  if (!first_name)
    return res.status(401).json({ msg: "First name Field is Empty" });

  //Check If First name OR Last name Field Empty
  if (!last_name)
    return res.status(401).json({ msg: "Last name Field is Empty" });

  //Check If church_address Field Empty
  if (!address)
    return res.status(401).json({ msg: "Address Field is Empty" });

  //Check If Password Field Empty
  if (!req.body.password)
    return res.status(401).json({ msg: "Password Field is Empty" });

  //Check if username already exists in the DB
  const usernameExists = await User.checkUsernameAlreadyExist(username);
  if (usernameExists)
    return res.status(401).json({ msg: "Username Already Exists" });

  //Check if email already exists in the DB
  const emailExists = await User.checkEmailAlreadyExist(email);
  if (emailExists) return res.status(401).json({ msg: "Email Already Exists" });

  //Check if Mobile already exists in the DB
  const mobileExists = await User.checkMobileAlreadyExist(mobile);
  if (mobileExists)
    return res.status(401).json({ msg: "Mobile Already Exists" });

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  try {
    const savedUser = await User.create({
      username,
      email,
      mobile,
      first_name,
      last_name,
      address,
      password: hashPassword,
    });

    return res.status(200).json({
      status: {
        code: 100,
        msg: "Registration Successfully",
      },
      data: savedUser,
    });
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

//LOGIN USER
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(req.body);
  //Check If Username Field Empty
  if (!username)
    return res.status(401).json({ msg: "Username Field is Empty" });

  //Check If Email address Field Empty
  if (!password)
    return res.status(401).json({ msg: "password Field is Empty" });

  try {
    //check if the user with the username exist
    const user = await User.findOne({ username: username });
    if (!user)
      return res.status(401).json({ msg: "Wrong Username or Password" });
    const validated = await bcrypt.compare(password, user.password);

    !validated && res.status(400).json({ msg: "Password is Wrong" });

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "3d" }
    );

    // const { password, ...others } = user._doc
    res.status(200).json({
      status: {
        code: 100,
        msg: "Login Succesfully",
      },
      data: {
        id: user?._id,
        firat_name: user?.first_name,
        last_name: user?.last_name,
        username: user?.username,
        email: user?.email,
        mobile: user?.mobile,
        token: token,
      },
    });
  } catch (err) {
    console.log("Error Occur");
    return res.status(500).send(err);
  }
});

//CHANGE PASSWORD
router.put("/change-password", verifyTokenUser, async (req, res) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  const username = req.user.username;
  const user = await User.findOne({ username: username });

  //Check If Old Password Field Empty
  if (!oldPassword)
    return res.status(401).json({ msg: "Old Password Field is Empty" });

  //Check If New Password address Field Empty
  if (!newPassword)
    return res.status(401).json({ msg: "New Password Field is Empty" });

  //Check If confirmPassword Password address Field Empty
  if (!confirmPassword)
    return res.status(401).json({ msg: "Confirm Password Field is Empty" });

  const originalPassword = await bcrypt.compare(oldPassword, user.password);
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(newPassword, salt);
  try {
    if (originalPassword) {
      if (newPassword == confirmPassword) {
        const UpdatePass = await User.findByIdAndUpdate(
          user._id,
          {
            password: hashPassword,
          },
          { new: true }
        );
        const { password, ...others } = UpdatePass._doc;
        return res.status(200).json({
          status: {
            code: 100,
            msg: "Password Updated Succesfully",
          },
          data: { ...others },
        });
      } else {
        return res.status(401).json({
          msg: "New Password and Confirm Password Does Not Match",
        });
      }
    } else {
      return res.status(401).json({
        msg: "Old Password Not Correct",
      });
    }
  } catch (err) {
    return res.status(500).json({
      msg: err,
    });
  }


  // if(user){
  //     bcrypt.compare(oldPassword, user.password, (err, isMatch) =>{
  //         if(err){
  //             return res.status(401).json({ msg: "server Error" });
  //         }else if(isMatch){
  //             if (newPassword == confirmPassword) {
  //                 bcrypt.hash(newPassword, 10, async (err, hash) => {
  //                     if (err) {
  //                         return res.status(401).json({
  //                             msg: "Error Cannot Encrypt Password",
  //                             error: err
  //                         })
  //                     }
  //                     user.password = hash;
  //                     const UpdatePass = await User.findByIdAndUpdate(user._id, {
  //                         password: hash
  //                     }, { new: true });
  //                     const { password, ...others } = UpdatePass._doc
  //                     return res.status(200).json({
  //                         status: {
  //                             code: 100,
  //                             msg: "Password Updated Succesfully"
  //                         },
  //                         data: { ...others }
  //                     })
  //                 })
  //             }else{
  //                 return res.status(500).json({ msg: "new Password and Confirm Password does not Match" });

  //             }
  //         }else{
  //             return res.status(401).json({
  //                 msg: "Old password not correct",
  //             })
  //         }
  //     })
  // }
});

//UPDATE Church  Logo(ONLY Admin CAN UPDATE Logo)
router.post("/uploadchurchlogo/:id", verifyTokenAndAdmin, async (req, res) => {
  const { id } = req.params;
  const uploadSingle = upload(process.env.BUCKETNAME).single("church-logo");

  uploadSingle(req, res, async (err) => {
    if (err)
      return res.status(401).json({
        success: false,
        message: err.message,
      });

    console.log(req.file);

    const availId = await User.findOne({ _id: id });
    if (!availId)
      return res
        .status(401)
        .json({ msg: "User(Church) with Id does not Exists" });

    const updatedChurchLogo = await User.findByIdAndUpdate(
      id,
      {
        church_logo: req.file.location,
      },
      { new: true }
    );

    return res.status(200).json({
      status: {
        code: 100,
        msg: "Logo upload successfully",
      },
      data: updatedChurchLogo,
    });
  });
});


//FORGOTEN PASSWORD
router.post("/forgoten-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found with this email.",
    });
  }

  try {
    // Call createPasswordResetToken on the User model
    const token = await User.createPasswordResetToken();
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const mailData = {
      to: email,
      text: "Hey User",
      subject: "Forgot Password Link",
      htm: fogotPasswordEmailMessage(process.env.STAGING_URL, token),
    };

    sendMail(mailData);

    res.status(200).json({
      success: true,
      message: "Forgot link has been sent to your Email successfully",
      token: token,
    });
  } catch (error) {
    throw new Error(error);
  }
});

  router.put("/complete-reset-password/:token", async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetExpires: { $gt: Date.now() },
  });
  // console.log("User:", user);
  if (!user) {
    // console.log("Token Expired or User not found");
    throw new Error("Token Expired, please try again later");
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.json(user);
});


module.exports = router;
