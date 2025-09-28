const imaginerouter = require('express').Router()
const User = require('../models/User_model')
const Generator = require('../utils/generator')
const fs = require('fs')
const file = fs.readFileSync('./utils/prompts.json')
const prompts = JSON.parse(file)


const creditcharge = async(request,deductamt)=>{
  const user = await User.findById(request.user.userid)
  user.credits = user.credits - deductamt
  await user.save()
}

imaginerouter.post('/',async(req,res,next)=>{
  let {style,changes,imagebuffer} = req.body
  if(!style || !imagebuffer){
    return res.status(400).json({
      success:false,
      message:"Bad request Invalid Inputs"
    })
  }
  let prompt = null;
  if(changes.length == 0){
    prompt = [prompts[style].join(' '),prompts["RULE_NC"].join(' ')].join(' ')
    // console.log(prompt);
    
  }
  else{
    prompt = changes.map(change=>prompts[change].join(" "))
    prompt = [prompts[style].join(' '),prompt.join(' '),prompts["RULE_WC"].join(' ')].join(' ')
    // console.log(prompt);
    
  }
  if (imagebuffer.startsWith("data:image")) {
    imagebuffer = imagebuffer.replace(/^data:image\/\w+;base64,/, "");
  }

  try{
    const finalimgbuffer = await Generator(imagebuffer,prompt)
    await creditcharge(req,1)
    // fs.writeFileSync('./output.png',finalimgbuffer)
    res.setHeader("Content-Type", "image/jpeg");
    res.setHeader("Content-Length", finalimgbuffer.length);
    res.status(200).send(`data:image/jpeg;base64,${finalimgbuffer.toString("base64")}`)
  }
  catch(error){
    next(error)
  }

})

module.exports = imaginerouter
