var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comment');

router.get('/campgrounds', function(req, res){
  Campground.find({}, function(err, campgrounds){
    if(err){
      console.log(err);
    }else{
      res.render('campgrounds/index',{campgrounds : campgrounds});
    }
  });
});

router.post('/campgrounds', isLoggedIn, function(req, res){
  req.body.campground.description = req.sanitize(req.body.campground.description);

  req.body.campground.author = {id: req.user._id, username: req.user.username}
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

router.get('/campgrounds/new', isLoggedIn, function(req, res){
  res.render('campgrounds/new');
});

router.get('/campgrounds/:id', function(req, res){
  var id = req.params.id;
  Campground.findById(id).populate('comments').exec(function(err, campground){
    if(err){
      console.log(err);
    }else{
      res.render('campgrounds/show',{campground: campground});
    }
  });
});

router.get('/campgrounds/:id/edit', isAuthorized, function(req, res){
  var id = req.params.id;
  Campground.findById(id, function(err, campground){
      res.render('campgrounds/edit',{campground: campground});
  });
});

router.put('/campgrounds/:id', isAuthorized, function(req, res){
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

router.delete('/campgrounds/:id', isAuthorized, function(req, res){
  var id = req.params.id;
  Campground.findByIdAndRemove(id, function(err){
    if(err){
      res.redirect('/campgrounds');
    }else{
      res.redirect('/campgrounds');
    }
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

function isAuthorized(req, res, next){
  if(req.isAuthenticated()){
    Campground.findById(req.params.id, function(err, campground){
      if(err){
        res.redirect('back');
      }else{
        if(campground.author.id.equals(req.user._id)){
          next();
        }else{
          res.redirect('back');
        }
      }
    });
  }else{
    res.redirect('/login');
  }
}
module.exports = router;
