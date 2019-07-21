//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

// 1. set passport
app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

// 1. set passport
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true
});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

// 2. set passport-local-mongoose
// use to hash & salt password then save user to DB
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

// 2. set passport-local-mongoose
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res) {
  res.render("home");
});

app.get("/login", function(req, res) {
  res.render("login");
});

app.get("/register", function(req, res) {
  res.render("register");
});

app.get("/secrets", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", function(req, res) {
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req, res) {
  // https://www.npmjs.com/package/passport-local-mongoose
  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      // send cookie to browser 說這個人已認證過
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });

});

app.post("/login", function(req, res) {

  const user = new User({
    username: req.body.username,
    passport: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      // send cookie to browser 說這個人已認證過
      passport.authenticate("local")(req, res, function() {
        res.redirect("/secrets");
      });
    }
  });

});








app.listen(3000, function() {
  console.log("Server started on port 3000");
});
