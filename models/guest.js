const mongoose = require('mongoose')

const guestschema = new mongoose.Schema({
      guestid:String,
      uses:Number
})
    
const Guest = mongoose.model("guest", guestschema);
    
module.exports = Guest