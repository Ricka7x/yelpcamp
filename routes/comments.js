var express = require('express');
var router = express.Router({mergeParams: true});
var Campground = require('../models/campground');
var Comment = require('../models/comment');

router.get('/comments/new', isLoggedIn, function(req, res){
  var id = req.params.id;
  Campground.findById(id, function(err, campground){
    if(err){
      console.log(err);
    }else{
      res.render('comments/new', {campground: campground});
    }
  });
});

router.post('/comments/', isLoggedIn, function(req, res){
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

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

module.exports = router;
