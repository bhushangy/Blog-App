var express = require("express"),
    app     = express(),
    mongoose = require("mongoose"),
    bodyParser = require("body-parser"),
    expressSanitizer = require("express-sanitizer"),
    methodOverride = require('method-override');
    
mongoose.connect("mongodb://localhost:27017/blog_app",{ useNewUrlParser:
true});
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.set("view engine", "ejs");
app.use(express.static("public"));//telling it to look inside public direc where custom stylesheet
app.use(methodOverride('_method'));


//DB SCHEMA

var blogSchema = new mongoose.Schema({
    title: String,
    body: String, //this is content of that blog
    image: String,//if no image then do this {type:String,default:"default_img.jpg"}
    created:  {type: Date, default: Date.now}
});

//COMPILE IT INTO A MODEL - CREATING AN OBJECT
var Blog = mongoose.model("Blog", blogSchema);


//RESTFUL ROUTES




app.get("/", function(req, res){
    res.redirect("/blogs");
});



app.get("/blogs", function(req, res){
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        } else {
            res.render("index", {blogs: blogs}); 
        }
    })
});


//NEW ROUTE

app.get("/blogs/new", function(req, res){
   res.render("new"); 
});

// CREATE ROUTE


app.post("/blogs", function(req, res){
    req.body.blog.body = req.sanitize(req.body.blog.body);//sanitise to remove script tags with blog body
   var formData = req.body.blog;
   //cathin the object inside req thrown by the form
   Blog.create(formData, function(err, newBlog){ 
      // console.log(newBlog);
      if(err){
          res.render("new");
      } else {
          res.redirect("/blogs");
      }
   });
});


// SHOW ROUTE

app.get("/blogs/:id", function(req, res){
   Blog.findById(req.params.id, function(err, blog){
      if(err){
          res.redirect("/");
      } else {
          res.render("show", {blog: blog});
      }
   });
});


// EDIT ROUTE

app.get("/blogs/:id/edit", function(req, res){
    // first find the post u want to edit
    
   Blog.findById(req.params.id, function(err, blog){
       if(err){
           console.log(err);
           res.redirect("/")
       } else {
           res.render("edit", {blog: blog});
       }
   });
});

//UPDATE ROUTE


app.put("/blogs/:id", function(req, res){

    req.body.blog.body = req.sanitize(req.body.blog.body);//sanitise to remove script tags with blog body

    // So here u shud update the post as per what was entered in form
    //So there is this method which finds and updates the particular object
    //params are ofcourse the id and the data to update

   Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, blog){
       if(err){
           console.log(err);
       } else {
         var showUrl = "/blogs/" + req.params.id;
         res.redirect(showUrl);
       }
   });
});


//DELETE ROUTE


app.delete("/blogs/:id", function(req, res){
   Blog.findByIdAndRemove(req.params.id, function(err, blog){
       if(err){
        res.redirect("/blogs");
       } else {
          
           res.redirect("/blogs");
       }
   }); 
});


app.listen(3000,function(){
    console.log("blogapp server has started")
  
});
