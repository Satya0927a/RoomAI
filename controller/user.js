const Userrouter = require('express').Router()
const User = require('../models/User_model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { tokenverify } = require('../utils/middleware')

const transporter = nodemailer.createTransport({
  service:"gmail",
  auth:{
    user:"roomai8769@gmail.com",
    pass:process.env.GMAIL_APPPASS
  }
})
async function sendverificationemail(user,token) {
  const url = `http://localhost:5173/api/user/verify/${token}`

  await transporter.sendMail({
    from:`"RoomAI" <roomai8769@gmail.com>`,
    to: user.email,
    subject:"Verify your email",
    html: `<p>Hey there ${user.username},</p>
           <p>Please verify your email by clicking below:</p>
           <a href="${url}">Verify Email</a>
           <p>Thank you for using our services</p>`
  })
}
async function sendpasswordresetemail(user, token) {
  const url = `http:///localhost:5173/reset-password?token=${token}`

  await transporter.sendMail({
    from:`"RoomAI" <roomai8769@gmail.com>`,
    to: user.email,
    subject:"Password Reset",
    html: `<p>Hey there ${user.username}, We received a request to reset your password. Click the button below to create a new one:</p>
            <a href="${url}">Click here</a>
           <p>For your security, this link will expire in [15 minutes].</p>
           <p>If you didn’t request a password reset, you can safely ignore this email.</p>
           <p>Thank you for using our services.</p>`
  })
}




//?dev feature
Userrouter.get('/all',async(request,response)=>{
  const users = await User.find({})
  response.send(users)
})

//*for login of user
Userrouter.post('/login',async(request,response)=>{
  const {email,password} = request.body
  if(!password || !email){
    return response.status(400).json({status:"fail",message:"Invalid Inputs"})
  }
  const user = await User.findOne({email:email})
  if(!user){
    return response.status(404).json({status:"fail",message:"Email or password is incorrect"})
  }
  const passwordverify =  await bcrypt.compare(password,user.passwordhash)
  if(!passwordverify){
    return response.status(401).json({ status: "fail", message: "Email or password is incorrect" })
  }
  //?checks if the users email is verified if not then send a veriification email to its account
  if(!user.Emailverified){
    const emailtoken = jwt.sign({userid:user._id},process.env.EMAIL_SECRET,{expiresIn:"15m"})
    await sendverificationemail(user,emailtoken)
    return response.status(200).json({status:"success",message:"A verification link sent to email your email address expires in 15min",command:"SHOW_VERIFYPANEL"})
    
  }
  //?if the email is verified generates the imagine api authentication token
  const payload = {
    sub:user._id
  }
  const token = jwt.sign(payload,process.env.SECRET)
  return response.status(200).json({ status: "success",message:"Successfully logged in", token, user: {username: user.username ,credits:user.credits} })
})
//* for creating new user
Userrouter.post('/create',async(request,response,next)=>{
  const {email,username,password} = request.body
  if(!email || !username || !password){
    return response.status(400).json({status:"fail",message:"Invalid inputs"})
  }
  if(password.length < 8){
    return response.status(400).json({status:"fail",message:"Password must be minimum 8 charecters long"})
  }
  try{
    const pass_hash = await bcrypt.hash(password,10)
    const newuser = new User({
      email:email,
      username:username,
      passwordhash:pass_hash,
      credits:5, //!free credits for a limited time
      Emailverified:false
    })
    const user = await newuser.save()
    //?sends verification email to the users account
    const emailtoken = jwt.sign({userid:user._id},process.env.EMAIL_SECRET,{expiresIn:"15m"})
    await sendverificationemail(user,emailtoken)
    return response.status(201).json({status:"success",message:"A verification link sent to email your email address expires in 15min",command:"SHOW_VERIFYPANEL"})
    
  }
  catch(error){
    next(error)
  }
})

//*endpoint to verify users emails
Userrouter.get('/verify/:token',async(request,response,next)=>{
  const emailtoken = request.params.token
  
  try{
    const verifytoken = jwt.verify(emailtoken,process.env.EMAIL_SECRET)
    
    if(!verifytoken){
      return response.send("verification failed, invalid or expired token")
    }
    const user = await User.findOneAndUpdate({_id:verifytoken.userid},{Emailverified:true})
    if(!user){
      return response.status(404).send("user not found")
    }
    response.send("Verification successfull you may go back and login into your app")
  }
  catch(error){
    next(error)
  }
})

//*for reseting passwords creates the resettoken and sends the email
Userrouter.post('/passwordreset',async(request,response,next)=>{
  const {email} = request.body
  if(!email){
    return response.status(400).json({status:"fail",message:"Invalid email or email missing"})
  }
  const user = await User.findOne({email:email})
  if(!user){
    return response.status(404).json({status:"fail",message:"user not found"})
  }
  try{
    const resettoken = jwt.sign({userid:user._id},process.env.PASS_RESET_SECRET,{expiresIn:"15m"})
    await sendpasswordresetemail(user,resettoken)
    response.status(200).json({status:"success",message:"sent a password resetting link to your email address",command:"SHOW_VERIFYPANEL"})
  }
  catch(error){
    next(error)
  }
})

//*the new password set with the token is verified and reset
Userrouter.put('/verifypasswordreset', async (request, response,next) => {
  const { newpassword, token } = request.body;
  if (!newpassword || !token) {
    return response.status(400).json({ status: "fail", message: "400 Invalid request" });
  }
  try {
    const tokenverify = jwt.verify(token, process.env.PASS_RESET_SECRET);
    if (!tokenverify) {
      return response.status(401).json({ status: "fail", message: "Verification link expired or invalid" });
    }
    //? Proceeds with password reset logic
    const newpasshash = await bcrypt.hash(newpassword,10)
    const user = await User.findByIdAndUpdate(tokenverify.userid,{passwordhash:newpasshash})
    response.status(200).json({ status: "success", message: "Password has been reset successfully" ,command:"RESET_TRUE"});
  } catch (error) {
    next(error)
  }
});

//*to check if a user is verified or not
Userrouter.post('/checkverification',async(request,response)=>{
  const {email} = request.body
  if(!email){
    return response.status(400).json({status:"fail",message:"invalid input"})
  }
  const user = await User.findOne({email:email})
  if(!user){
    return response.status(404).json({status:"fail",message:"user not found"})
  }
  if(user.Emailverified){
    return response.status(200).json({ status: "success", message: "Email is verified",command:"VERIFIED" })
  }
  return response.status(200).json({ status: "fail", message: "Email is not verified", command: "NOT_VERIFIED" })
})

//*for checking the no of credits in users account using token
Userrouter.get('/checkcredits',tokenverify,async(request,response)=>{
  const user = await User.findById(request.user.userid)
  if(!user){
    return response.status(404).json({status:'fail',message:"user not found"})
  }
  return response.status(200).json({status:"success", credits:user.credits})
})

module.exports = Userrouter