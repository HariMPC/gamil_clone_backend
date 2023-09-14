const express = require("express");
// const bodyParser = require('body-parser');
var cors = require('cors');
const cookieParser = require("cookie-parser");
const dotenv  = require("dotenv");
dotenv.config();

const emailRouter = require("./routes/routes");
const UserRouter = require('./routes/UsersRoute')

const dbconnect = require("./dbconnect/dbconnect");

dbconnect()

const app = express();
app.use(express.json());
app.use(cors());
const port = process.env.PORT;

app.use(cookieParser());
app.use("/gmail",emailRouter);
app.use("/U1",UserRouter);
app.listen(port, async(req,res)=>{
    console.log("server is running in",port)
})