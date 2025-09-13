const jwt = require('jsonwebtoken');
const User = require('../models/User_model');

//*token verification middlware that verifies the token and adds it to req.user
const tokenverify = (request,response,next)=>{
  const authHeader = request.headers['authorization'] || request.headers.authorization;
  if(!authHeader){
    return response.status(401).json({ status: "fail", message: "Authorization token missing" ,command:"OPEN_LOGIN"})
  }
  const token = authHeader.replace('Bearer ',"")
  const payload = jwt.verify(token,process.env.SECRET)
  if (!payload) {
    return response.status(401).json({ status: "fail", message: "Invalid or expired token" ,command:"OPEN_LOGIN"});
  }
  const user = {
    userid:payload.sub
  }
  request.user = user
  next()
}

const creditcheck = async(request,response,next)=>{
  const userdata= await User.findById(request.user.userid)
  if(userdata.credits == 0){
    return response.status(403).json({ status: "fail", message: "Insufficient credits", command: "PURCHASE_CREDITS"});
  }
  next()
}

module.exports = {tokenverify,creditcheck}

