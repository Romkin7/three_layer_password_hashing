three_layer_password_hashing
Three layer passwordhashing for nodejs and mongodb

this example app demonstrates you how you can perform multilayer protection password storing in database.

in order to test this app you should have mongodb installed on your machine and running.

you need to run npm install first, in order to get all the dependencies installed that this app depends on right after downloading source code from github on your machine.

Once node_modules are installed run in your terminal on mac or git bash on windows node index.js command and navigate in your browser to localhost:4000

that will show you simple html file with 2 forms one for signup and the other for signin.

now i will go to logic of app.

note that i made use of code of this file:

https://gist.github.com/vlucas/2bd40f62d20c1d49237a109d491974eb

i'm having all of this code in middleware folder under encryption.js file.

in this example password is taken from an input and turn into md5 hash using nodejs native crypto module. this hash is then taken and combine with pepper that is coming from .env file this pepperedMd5Hash is then run through bcryptjs npm package one way slow hash algorithm function with salt and cost of 10 ant this bcryptHash is is then taken and encrypted with nodejs core modules crypto.createCipheriv function. this encrypted string is then taken and stored inside mongoDB.

in order to compare passwords i made this function in userSchema:

```
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
    } 
    catch (err) { 
      return next(err); 
    } 
 };
```
All responses will be printed in json in browser.
so in order to make new post requests from forms you need to go back in browser using back arrow.
in future I will add ajax to html file to be able to display responses in nice flash messages.

Cheers, roman t
