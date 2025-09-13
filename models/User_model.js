const mongoose  = require('mongoose')

const userschema = new mongoose.Schema({
  email:{
    type:String,
    required:[true,"email is required"],
    unique:[true,"This email is already registered with another account"]
  },
  username:{
    type:String,
    required:[true,"username is required"],
  },
  passwordhash:String,
  credits:Number,
  Emailverified:Boolean,
})

const User =  mongoose.model("user",userschema)

module.exports = User