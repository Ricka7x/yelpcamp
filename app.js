var bodyParser = require('body-parser');
var expressSanitazer = require('express-sanitizer');
var mongoose = require('mongoose');
var passport = require('passport');
var localStrategy = require('passport-local');
var methodOverride = require('method-override');
var express = require('express');
var expressSession = require('express-session');
var app = express();
var seed = require('./seeds');


//ROUTES
var campgroundRoutes = require('./routes/campgrounds');
var commentRoutes = require('./routes/comments');
var authRoutes = require('./routes/auth');

//MONGOOSE MODEL/CONFIG
var Comment = require('./models/comment');
var Campground = require('./models/campground');
var User = require('./models/user');

// mongoose.connect('mongodb://localhost/yelpcamp');
mongoose.connect('mongodb://rick:sasuke@ds021999.mlab.com:21999/ycamp');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitazer()); //always after body parser
app.use(methodOverride('_method'));
app.use(express.static(__dirname + '/public'));



//passport configuration

app.use(expressSession({
  secret: "Sasuke is the best ninja",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});




app.use(authRoutes);
app.use('/campgrounds/:id', commentRoutes);
app.use(campgroundRoutes);


//ROUTES

app.get('/',function(req, res){
  res.render('index');
});






//auth ROUTES


//SERVER
app.listen(3000, function(){
  console.log('running in port 3000');
})
