require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors');
const knex = require('knex');
const bcrypt = require('bcrypt-nodejs');


const register = require('./controllers/register')
const signin = require('./controllers/signin')
const profile = require('./controllers/profile')
const image = require('./controllers/image')
const otpVerification = require('./controllers/otpVerification');

const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'regina1111',
    database: 'smart-brain',
  },
});


console.log(process.env.EMAIL_USER);


const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors())


app.get("/", (req, res) => {
  res.json('success')
});

app.post("/signin", signin.handleSignin(db, bcrypt));
//dependency injection
app.post("/register", (req,res) => {register.handleRegister(req, res, db, bcrypt)})
app.get("/profile/:id", (req, res) => {profile.handleProfileGet(req, res, db)});
app.put("/image", (req, res) => {image.handleImage(req, res, db)});
app.post("/verify-otp", (req, res) => { otpVerification.handleVerifyOTP(req, res, db) });

app.listen(3000, () => {
  console.log("app is running on port 3000");
});
