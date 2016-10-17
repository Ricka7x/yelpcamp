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

//MONGOOSE MODEL/CONFIG
var Comment = require('./models/comment');
var Campground = require('./models/campground');
var User = require('./models/user');

mongoose.connect('mongodb://localhost/yelpcamp');
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







//ROUTES

app.get('/',function(req, res){
  res.render('index');
});

app.get('/campgrounds', function(req, res){
  Campground.find({}, function(err, campgrounds){
    if(err){
      console.log(err);
    }else{
      res.render('campgrounds/index',{campgrounds : campgrounds});
    }
  });
});

app.post('/campgrounds', isLoggedIn, function(req, res){
  req.body.campground.description = req.sanitize(req.body.campground.description);
  var newCampground = req.body.campground;
  Campground.create(newCampground, function(err, campground){
    if(err){
      console.log(err);
    }else{
      console.log('campground was succesfully created', campground);
      res.redirect('/campgrounds');
    }
  });
});

app.get('/campgrounds/new', isLoggedIn, function(req, res){
  res.render('campgrounds/new');
});

app.get('/campgrounds/:id', function(req, res){
  var id = req.params.id;
  Campground.findById(id).populate('comments').exec(function(err, campground){
    if(err){
      console.log(err);
    }else{
      res.render('campgrounds/show',{campground: campground});
    }
  });
});

app.get('/campgrounds/:id/edit', isLoggedIn, function(req, res){
  var id = req.params.id;
  Campground.findById(id, function(err, campground){
    if(err){
      console.log(err);
    }else{
      res.render('campgrounds/edit',{campground: campground});
    }
  });
});

app.put('/campgrounds/:id', isLoggedIn, function(req, res){
  req.body.campground.description = req.sanitize(req.body.campground.description);
  var id = req.params.id;
  var campground = req.body.campground;
  Campground.findByIdAndUpdate(id, campground, function(err, campground){
    if(err){
      console.log(err);
    }else{
      res.redirect('/campgrounds');
    }
  });
});

app.delete('/campgrounds/:id', isLoggedIn, function(req, res){
  var id = req.params.id;
  Campground.findByIdAndRemove(id, function(err){
    if(err){
      res.redirect('/campgrounds');
    }else{
      res.redirect('/campgrounds');
    }
  });
});


app.get('/campgrounds/:id/comments/new', isLoggedIn, function(req, res){
  var id = req.params.id;
  Campground.findById(id, function(err, campground){
    if(err){
      console.log(err);
    }else{
      res.render('comments/new', {campground: campground});
    }
  });
});

app.post('/campgrounds/:id/comments/', isLoggedIn, function(req, res){
  var id = req.params.id;
  Campground.findById(id, function(err, campground){
    if(err){
      console.log(err);
    }else{
      var newComment = req.body.comment;
      Comment.create(newComment, function(err, comment){
        if(err){
          console.log(err);
        }else{
          campground.comments.push(comment);
          campground.save();
          res.redirect('/campgrounds/' + campground._id);
        }
      });
    }
  })
});

//auth ROUTES

app.get('/signup', function(req, res){
  res.render('signup');
});

app.post('/signup', function(req, res){
  var newUser = new User({username: req.body.username});
  var password = req.body.password;
  User.register(newUser, password, function(err, user){
    if(err){
      console.log(err);
      return res.render('signup');
    }
    passport.authenticate('local')(req, res, function(){
      res.redirect('/campgrounds');
    });
  });
});


app.get('/login', function(req, res){
  res.render('login');
});

app.post('/login', passport.authenticate('local',
  {
    successRedirect: '/campgrounds',
    failureRedirect: '/login'
  }),function(req, res){
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}
//SERVER
app.listen(3000, function(){
  console.log('running in port 3000');
})
