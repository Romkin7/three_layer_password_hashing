"use strict";
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const encryption = require("../middleware/encryption");
var crypto = require('crypto');
const bcrypt = require('bcryptjs');
const userSchema = new Schema({
	username: {type: String, unique: true, lowercase: true, required: true},
	password: {type: String, required: true}
},{
	timestamps: true
});
// Hash the password before saving it to the database
userSchema.pre("save", async function(next) {
 try {
   if (!this.isModified("password")) {
     return next();
	 }
	 //Hash passwords from password input with simple md5 hash algoritm
	 const md5Hash = await crypto.createHash('md5').update(this.password).digest("hex");
	 //Add pepper to new md5Hash
	 let pepperedMd5Hash = md5Hash+process.env.PEPPER;
	 //hash pepperedMd5Hash with bcrypt using salt and cost of 10.
	 let bcryptHash = await bcrypt.hash(pepperedMd5Hash, 10);
	 //Finally encrypt bcrypthash with crypto nodejs own core module using "aes-256-cbc"  
	 const encodedBcryptHash = await encryption.encrypt(bcryptHash); 
	 //And store this encrypted data in mongoDB
   this.password = encodedBcryptHash;
   return next();
 } catch (err) {
   return next(err);
 }
});
userSchema.methods.comparePassword = async function(candidatePassword, next) {
    try {
       /** First we need to deciper password stored in database so we can reveal 
        * bcrypt hash we decrypt it with key stored on process.env.SECRET_KEY */
        let decipheredBcryptHash = await encryption.decrypt(this.password);
        //Here we hash password coming from form input
        //Hash passwords from password input with simple md5 hash algorihtm
        const md5Hash = await crypto.createHash('md5').update(candidatePassword).digest("hex");
        //Add pepper to new md5Hash
        let pepperedMd5Hash = md5Hash+process.env.PEPPER;
        //Compare pepperedMd5Hash then to password that is stored in db and that is deciphered using process.env.SECRET_KEY 
        let isMatch = await bcrypt.compare(pepperedMd5Hash, decipheredBcryptHash);
          return isMatch;
    } catch (err) {
      return next(err);
    }
   };
module.exports = mongoose.model("User", userSchema);