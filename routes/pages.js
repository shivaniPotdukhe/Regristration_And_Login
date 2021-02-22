const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.get("/", (req,res) => {
    res.render("home");
});

router.get("/register", (req,res) => {
    res.render("register");
});

router.get("/login", (req,res) => {
    res.render("login");
});

router.get("/logout", authController.logout);

module.exports = router;