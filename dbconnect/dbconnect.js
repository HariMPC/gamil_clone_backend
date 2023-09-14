var mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const dbconnect = async()=>{
    try {
        await mongoose.connect(process.env.Mongodb_url,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
            autoIndex: true,
        })
        console.log("DB is Connected.")
    } catch (error) {
        console.log(error,"Internal Server Error!!!!!");
    }
}

module.exports = dbconnect;
