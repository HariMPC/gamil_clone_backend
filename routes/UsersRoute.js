const express = require("express");
const router = express.Router();
const Nodemailer =  require("nodemailer");
const bcrypt = require("bcrypt");
const crypto = require('crypto');
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
require('dotenv').config(); 
const Tokens = require('../dbconnect/token')
const { User } = require("../dbconnect/schema");
const mongoose = require("mongoose");

router.get("/",async(req,res)=>{
    try {
      res.status(200).send({message:'Hai user! your welcome to continue after register or login'})
    } catch (error) {
      res.status(202).send({message:'internal server error'})
    }
  })

//register the user account
router.post("/register", async (req, res) => {
  try {
    const payload = req.body;

    if (!payload.password) {
      return res.status(400).send({ message: "Password is required!" });
    }

    //Hashing
    const hashedValue = await bcrypt.hash(payload.password, 10);

    payload.hashedPassword = hashedValue;

    delete payload.password;
    // {
    //     name: 'John',
    //     email: 'john@gmail.com',
    //     hashedPassword: 'afswginergpfscomsdvlkn'
    //     mobileNumber: '11111111',
    //     role: 1
    // }

    const newUser = new User(payload);

    newUser
      .save()
      .then((data) => {
        res.status(201).send({
          message: "User has been registered successfully",
          userId: data._id,
        });
      })
      .catch((error) => {
        return res.status(400).send({
          message: "Error while registering a new user.",
          error: error,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
  
  })

  //login to your account
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      // IsValidUser or not
      //   existingUser.hashedPassword
      const isValidUser = await bcrypt.compare(
        password,
        existingUser.hashedPassword
      ); // true or false

      if (isValidUser) {
        //Encryption
        const token = await jwt.sign(
          { _id: existingUser._id },
          process.env.SECRET_KEY
        );

        // res.cookie("accessToken", token, { expire: new Date() + 86400000 });
        res.cookie("accessToken", token, {
          expires: new Date(Date.now() + 86400000),
        });

        return res.status(200).send({
          message: "User logged-in successfully",
        });
      }

      return res.status(400).send({
        message: "Invalid credentials",
      });
    }

    res.status(400).send({
      message: "User doesnt exist with the given email",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
  
  })

// log out your account
router.get("/logout", async (req, res) => {
  try {
    await res.clearCookie("accessToken");

    return res.status(200).send({
      message: "User logged-out successfully.",
    });
  } catch (error) {
    res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
});
// submiting the email to get the rest link
router.post('/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email });

    if (!user) {
      return res
        .status(400)
        .send({ message: "User with the given email doesnt exist" });
    }

    let token = await Tokens.findOne({ userId: user._id });

    if (token) {
      await token.deleteOne();
      // await Tokens.deleteOne({ userId: user._id });
    }

    //CREATION OF NEW TOKEN
    const newToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = await bcrypt.hash(newToken, 10);

    const tokenPayload = new Tokens({ userId: user._id, token: hashedToken });

    await tokenPayload.save();

    const link =`http://localhost:3000/Newpass/?token=${newToken}&userId=${user._id}`;

    const sendmail = async  ()=> {
        try {
          let transporter = Nodemailer.createTransport({
            service: "gmail",
            auth: {
              user: process.env.GMAIL,
              pass: process.env.GMAIL_PASSWORD,
            },
          });
      console.log(user)
          let mailOptions = {
            from: process.env.GMAIL,
            to: user.email,
            subject: "reset password",
            text: JSON.stringify(link),
          };
      
          await transporter.sendMail(mailOptions);
          return res
        .status(200)
        .send({ message: "Reset password link has been sent to your email.",newToken })
  
        } catch (error) {
            console.log(error)
          res
          .status(400)
          .send({ message: "Error while sending email: Internal Server Error:  ", error })
        }
      }
        sendmail();
    }
    catch (error) {
       console.log("Error: ", error);
      res.status(500).send({
        message: "Internal Server Error",error
      });
    }
  });

// Reseting the password in the DataBase
router.post('/reset-password/:Token/:userId', async (req, res) => {
  try {

    const {token , userId,newPassword } = req.body;

    const resetToken = await Tokens.findOne({ userId: userId });

    if (!resetToken) {
      return res.status(401).send({ message: "Token doesnt exist" });
    }
    const isValidToken = await bcrypt.compare(token, resetToken.token);

    if (!isValidToken) {
      return res.status(400).send({ message: "Invalid Token" });
    }

    // Hash the new password

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    User.findByIdAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { hashedPassword: hashedPassword } }
    )
      .then((data) => {
        res.status(200).send({
          message: "Password has been reset successfully.",
        });
      })
      .catch((error) => {
        return res.status(400).send({
          message: "Error while resetting user's password.",
          error: error,
        });
      });
    //
    //
  } catch (error) {
    console.log("Error while resetting: ", error);
    return res.status(500).send({
      message: "Internal Server Error",
      error: error,
    });
  }
  });
  
module.exports = router;