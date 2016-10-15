var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


// models

mongoose.connect('mongodb://localhost/yelpcamp');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');


var campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String
});

var Campground = mongoose.model('Campground', campgroundSchema);

app.get('/',function(req, res){
  res.render('index');
});

app.get('/campgrounds', function(req, res){
  Campground.find({}, function(err, campgrounds){
    if(err){
      console.log(err);
    }else{
      res.render('campgrounds',{campgrounds : campgrounds});
    }
  });
});

app.post('/campgrounds', function(req, res){
  var name = req.body.name;
  var image = req.body.image;
  var description = req.body.description;
  var newCampground = {name: name, image: image, description: description}
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
  res.render('new');
});

app.get('/campgrounds/:id', function(req, res){
  var id = req.params.id;
  Campground.findById(id, function(err, campground){
    if(err){
      console.log(err);
    }else{
      res.render('show',{campground: campground});
    }
  });
});

app.listen(3000, function(){
  console.log('running in port 3000');
})
