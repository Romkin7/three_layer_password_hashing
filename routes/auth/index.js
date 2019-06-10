"use strict";
const express = require('express');
const router = express.Router();
const db = require('../../models');
router.post("/signup", async(req, res, next) => {
    try{
        let user = new db.User();
        user.username = req.body.username;
        user.password = req.body.password;
        let newUser = await user.save();
        let foundUser = await db.User.findById(newUser._id);
        res.status(201).json(foundUser);
    }
    catch(err) {
        if(err.code === 11000) {
            err.message = "This username, company name, phone number or email are alredy in use.";
        }
        return next({
            status: 400,
            message: err.message
        });
    }
});
/**Siggn in route */
router.post("/signin", async(req, res, next) => {
    try {
        //Find a user from database 
        let user = await db.User.findOne({"username": req.body.username});
        if(!user) {
            let error = new Error();
            error.status = 400;
            error.message = "user not found!";
            return next(error);
        }
        //Compare password from login form to one stored in database
        let isMatch = await user.comparePassword(req.body.password);
        //Send back user with all information
        if(isMatch) {
            res.status(200).json({
                message: "Logged in user: "+user.username
            });
        } else {
            let error = new Error();
            error.status = 400;
            error.message = "user not found, incorrect credentials!";
            return next(error);
        }
    } 
    catch(err) {
        return next({
            status: 400,
            message: err.message
        });
    }
});
module.exports = router;