var bodyParser = require('body-parser');
var expressSanitazer = require('express-sanitizer');
var mongoose = require('mongoose');
var methodOverride = require('method-override');
var express = require('express');
var app = express();
var seed = require('./seeds');

mongoose.connect('mongodb://localhost/yelpcamp');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitazer()); //always after body parser
app.use(methodOverride('_method'));


//MONGOOSE MODEL/CONFIG
var Comment = require('./models/comment');
var Campground = require('./models/campground');




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

app.post('/campgrounds', function(req, res){
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

app.get('/campgrounds/new', function(req, res){
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

app.get('/campgrounds/:id/edit', function(req, res){
  var id = req.params.id;
  Campground.findById(id, function(err, campground){
    if(err){
      console.log(err);
    }else{
      res.render('campgrounds/edit',{campground: campground});
    }
  });
});

app.put('/campgrounds/:id', function(req, res){
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

app.delete('/campgrounds/:id', function(req, res){
  var id = req.params.id;
  Campground.findByIdAndRemove(id, function(err){
    if(err){
      res.redirect('/campgrounds');
    }else{
      res.redirect('/campgrounds');
    }
  });
});


app.get('/campgrounds/:id/comments/new', function(req, res){
  var id = req.params.id;
  Campground.findById(id, function(err, campground){
    if(err){
      console.log(err);
    }else{
      res.render('comments/new', {campground: campground});
    }
  });
});

app.post('/campgrounds/:id/comments/', function(req, res){
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

//SERVER
app.listen(3000, function(){
  console.log('running in port 3000');
})
