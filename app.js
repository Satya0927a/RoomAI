const express = require('express')
const mongoose = require('mongoose')
const compression = require('compression')
const path = require("path");
const imaginerouter = require('./controller/imagine');
const Userrouter = require('./controller/user');
const {tokenverify,creditcheck} = require('./utils/middleware');


const app = express()

app.use(express.json({ limit: "10mb" }));  // allow JSON up to 10MB
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(express.json())
app.use(compression())
async function connectdb(params) {
  try{
    await mongoose.connect(process.env.PROD_MONGO_URI)
    console.log('connected to the database');
    
  }
  catch(err){
    console.log('couldnt connect to the database',err);
    
  }
}
connectdb()


app.use('/api/user',Userrouter)
app.use('/api/imagine',tokenverify,creditcheck,imaginerouter)
app.use(express.static('./dist'))

//to catch all other endpoints that will be handled by the frontend
app.get(/.*/,(req,res)=>{
  res.sendFile(path.join(__dirname,'dist','index.html'))
})

//middleware to handle error
const errorhandler = (error,req,res,next)=>{
  
  if(error.name === "ValidationError"){
    return res.status(400).json({status:"fail",message:error.message})
  }
  else if(error.name === "MongooseError"){
    return res.status(409).json({status:"fail",message:error.message})
  }
  else if(error.name === "TokenExpiredError"){
    return res.send("Verification link expired")
  }
  else{
    console.log(error);
    return res.status(500).json({status:"fail",message:"server side error"})
  }
}
app.use(errorhandler)
module.exports = app