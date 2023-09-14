const express = require("express");
const router = express.Router();
const Nodemailer =  require("nodemailer");
const dotenv = require("dotenv");
const { usermails } = require("../dbconnect/schema");
dotenv.config();


// get the Homepage.
router.get("/home",async(req,res)=>{
    try {
        res.status(200).send("WELCOME tO GMAIL")
    } catch (error) {
        res.status(400).send(error,"*Page Is Not Found*");
    }
});
//Send mail
router.post("/sendmail",async(req,res)=>{
    try {
        const {toEmail,subject,fromEmail,text} = req.body;
        // const to = req.body.to;
        // const subject = req.body.subject;
        // const from = req.body.from;
        // const text = req.body.text;

        const data = await usermails.create({
            toEmail : fromEmail,
            subject:subject,
            fromEmail:toEmail,
            text:text
          })
        const newEmail = await data.save();
        const transpoter = Nodemailer.createTransport({
            service: "gmail",
          auth: {
            user: process.env.GMAIL,
            pass: process.env.GMAIL_PASSWORD,
          },
        })
    function sentmail(){
            try {
                let mailOptions = {
                    to: toEmail,
                    subject: subject,
                    from:fromEmail,
                    text: text,
                  };
    transpoter.sendMail(mailOptions);
            } catch (error) {
             res.send(404).send("Error while Sending The Mail",error);
            }
          res
          .status(200)
          .send({ message: "email is sent.",newEmail})
        } 
        sentmail();
        console.log(data);
    } catch (error) {
        console.log(error)
        res
        .status(400)
        .send({ message: "Internal Server Error:  ", error })
    }
    
});

//get all mail
router.get("/allmail",async(req,res)=>{
    try {
        const mails = await usermails.find();
        if(!mails){
            res.status(404).send("No Mail Information is Found!!");
        }
        res.status(200).send("Mails");
    } catch (error) {
        res.status(400).send("Internal Server Error!!!",error);
    }
});

// geting the mail by id
router.get("/allmail/:id",async(req,res)=>{

    try {
        const mailId = req.params.id
        const mails = await usermails.findOne({_id : mailId});
        if(!mails){
            res.send("No Mail Information is Found");
        }
        res.send(mails)
    } catch (error) {
        res.send("Internal Server Error",error)
    }
});

// deleting the mail by id
router.delete("/deletemail/:id",async(req,res)=>{

    try {
        const mailId = req.params.id
        const Bin = usermails.findOneAndUpdate({ bin: mailId})
        const mails = await usermails.findByIdAndDelete({_id : mailId});

        if(!mails){
            res.send("No Mail Information is Found");
        }
        res.send("Mail is deleted Sucessfully!!", Bin)
    } catch (error) {
        res.send("Internal Server Error",error)
    }
});

module.exports = router;