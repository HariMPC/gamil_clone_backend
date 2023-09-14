const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Users = Schema({
    name:{type:String,
        required:true},
    email:{type:String,
        required:true},
    hashedPassword:{type:String,
        required:true},
    mobileNumber:{type:String,
        required:true},
    resetToken: String,
    resetTokenExpiry: Date,

})
const User = mongoose.model("Users",Users);

const Usermail = Schema({

    fromEmail: {
        type:String,
        required:true
    },
    toEmail: {
        type:String,
        required:true
    },
    subject: {
        type:String,
        required:true
    },
    text: {
        type:String,
        required:true
    },
    createdAt: {
        type: Date, 
        default: Date.now
    },
    bin:{
        type:String
    }
})
const usermails = mongoose.model("usermails",Usermail);

module.exports = {usermails,User};