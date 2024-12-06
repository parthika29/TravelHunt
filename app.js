if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

//console.log(process.env.SECRET);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
//const MONGO_URL = "mongodb://127.0.0.1:27017/travelHunt";
//const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
//const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
//const {listingSchema,reviewSchema} = require("./schema.js");
//const Review = require("./models/review.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");  // for passport
const LocalStrategy = require("passport-local"); //for passport-local
const User = require("./models/user.js"); // for require user model
const userRouter = require("./routes/user.js");
const{isLoggedIn} = require("./middleware.js");

const dbUrl = process.env.ATLASDB_URL;
main()
.then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"public")));


//FOr Mongo-connect
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24* 3600,
});

//For error in Mongo session
store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});

const sessionOptions ={
    store,
    secret: process.env.SECRET,
    resave:false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 *24 *60 *60 *1000, // for 7days
        maxAge: 7 *24 *60 *60 *1000,
        httpOnly : true
    }
};

//app.get("/",(req,res)=>{
//   res.send("Hi, I am root");
//});

app.use(session(sessionOptions));
app.use(flash());

//for passport middlewares
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// to store the info of log in / sign up user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware for flash
app.use((req,res,next)=>{
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/listings",listingRouter); //for routes listings.js
app.use("/listings/:id/reviews", reviewRouter); // for routes review.js
app.use("/", userRouter);
 
 app.all("*",(req,res,next)=>{
  next(new ExpressError(404,"Page Not Found!"));
 });

 //Express Middleware
app.use((err,req,res,next)=>{
  let{statusCode=500,message="something went wrong"}=err;
  res.status(statusCode).render("error.ejs",{message});
  //res.status(statusCode).send(message);
});

app.listen(8080,()=>{
 console.log("server is listening to port 8080");
});