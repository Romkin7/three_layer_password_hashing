"use strict";
require("dotenv/config");
require("./models");
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const errorHandler = require('./handlers/error');
/* API Routes */
const authApiRoutes = require('./routes/auth');
app.set("port", 4000);
app.set("ip", process.env.IP);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// You can set morgan to log differently depending on your environment
if (app.get('env') == 'Websiteion') {
  	app.use(morgan('common', { skip: function(req, res) {
    	return res.statusCode < 400 }, stream: __dirname + '/../morgan.log'}));
} else {
  	app.use(morgan('dev'));
}
app.use(express.static(path.join(__dirname + "/public")));
app.use("/api/auth", authApiRoutes);
// 404 not found handler
app.use(function(req, res, next) {
	let err = new Error("Not found");
	err.status = 404;
	next(err);
})
//user errorhadler to send out errors that are coming from our webserver
app.use(errorHandler);
app.listen(app.get("port"), function() {
	console.log("server started on port 4000!");
});