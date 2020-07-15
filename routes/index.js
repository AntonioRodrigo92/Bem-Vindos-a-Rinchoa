var express = require("express");
var router = express.Router(); 
var passport = require("passport");
var User = require("../models/user");

//root route
router.get("/", function(req, res){
  res.render("landing"); 
});

// show register form
router.get("/register", function(req, res){
    res.render("register");
});

//handle sign up logic
router.post("/register", function(req, res) {
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user){
      if(err){
          return res.render("register", {"error": err.message});
        //   req.flash("error", err.message);
        //   return res.render("register");
      }
      passport.authenticate("local")(req, res, function(){
          req.flash("success","Bem Vindo à Rinchoa," + user.username);
          res.redirect("/personalidades");
      });
  });
});

//Show login form
router.get("/login", function(req, res){
    res.render("login");
});

// handling logic login
router.post("/login", passport.authenticate("local",
    {
        successRedirect: "/",
        failureRedirect: "/login"
    }), function(req, res) {
}),

//logout route
router.get("/logout", function(req, res) {
    req.logout();
    req.flash("success", "LogOut com sucesso!");
    res.redirect("back");
});

module.exports = router;