const Userrouter = require('express').Router()
const User = require('../models/User_model')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { tokenverify } = require('../utils/middleware')
const {sendverifyemail,sendpassresetemail} = require('../utils/emailservice')

//?dev feature
// Userrouter.get('/all',async(request,response)=>{
//   const users = await User.find({})
//   response.send(users)
// })

//*for login of user
Userrouter.post('/login',async(request,response)=>{
  try{
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
      await sendverifyemail(user,emailtoken)
      return response.status(200).json({status:"success",message:"A verification link sent to email your email address expires in 15min",command:"SHOW_VERIFYPANEL"})
      
    }
    //?if the email is verified generates the imagine api authentication token
    const payload = {
      sub:user._id
    }
    const token = jwt.sign(payload,process.env.SECRET)
    return response.status(200).json({ status: "success",message:"Successfully logged in", token, user: {username: user.username ,credits:user.credits} })
  }
  catch(err){
    next(err)
  }
})
  //* for creating new user
Userrouter.post('/create',async(request,response,next)=>{
  try{
  const {email,username,password} = request.body
  if(!email || !username || !password){
    return response.status(400).json({status:"fail",message:"Invalid inputs"})
  }
  if(password.length < 8){
    return response.status(400).json({status:"fail",message:"Password must be minimum 8 charecters long"})
  }
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
    // await sendverificationemail(user,emailtoken)
    await sendverifyemail(user,emailtoken)
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
  try{
    const {email} = request.body
    if(!email){
      return response.status(400).json({status:"fail",message:"Invalid email or email missing"})
    }
    const user = await User.findOne({email:email})
    if(!user){
      return response.status(404).json({status:"fail",message:"user not found"})
    }
    const resettoken = jwt.sign({userid:user._id},process.env.PASS_RESET_SECRET,{expiresIn:"15m"})
    await sendpassresetemail(user,resettoken)
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