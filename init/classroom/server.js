const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("connect-flash");
const path = require("path");
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));

app.use(session({secret : "mysupersecret",
                 resave:false,
                 saveUninitialized:true,
}));
app.use(flash());

app.use((req,res,next)=>{
    res.locals.msg =req.flash("success");
    next();
});

app.get("/register",(req,res)=>{
    let{name="anonymous"} = req.query;
    req.session.name = name;
    req.flash("success","user registered successfully !");
    res.redirect("/hello");
});

app.get("/hello",(req,res)=>{
   res.render("page.ejs",{name: req.session.name});
});

app.listen(3000,()=>{
    console.log("server listening to port 3000");
});