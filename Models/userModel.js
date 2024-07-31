const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
    {
        username:{
            type: String,
            required: true,
            unique: true,
        },
        email:{
            type: String,
            required: true,
            unique: true,
        },
        mobile: {
          type: String,
          required: true,
          unique: true,
        },
        first_name: {
          type: String,
          required: true,
        },
        last_name: {
          type: String,
          required: true,
        },
    
        address: {
          type: String,
          required: true,
        },
        password:{
            type: String,
            required: true,
        },
        status: {
          type: String,
          default: 0,
        },
        passwordChangeAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
    },
    {timestamps : true}
);

UserSchema.statics.checkEmailAlreadyExist = async (email) => {
    const emailExists = await User.findOne({ email })
    if (emailExists)
        return emailExists   
}

UserSchema.statics.checkUsernameAlreadyExist = async (username) => {
    const usernameExists = await User.findOne({ username })
    if (usernameExists)
        return usernameExists   
}

UserSchema.statics.checkMobileAlreadyExist = async (mobile) => {
  const mobileExists = await User.findOne({ mobile })
  if (mobileExists)
    return mobileExists
}

//Pssword reset token
UserSchema.statics.createPasswordResetToken = async function () {
  const resettoken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 10 times
  return resettoken;
};


// module.exports = mongoose.model("User", UserSchema);
const User =  mongoose.model("User", UserSchema)

module.exports = User



