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
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          campground.comments.push(comment);
          campground.save();
          res.redirect('/campgrounds/' + campground._id);
        }
      });
    }
  })
});


router.get('/comments/:comment_id/edit', isAuthorized, function(req, res){
  Comment.findById(req.params.comment_id, function(err, comment){
    if(err){
      console.log(err);
    }else{
      res.render('comments/edit', {campground_id: req.params.id, comment: comment});
    }
  })
});

router.put('/comments/:comment_id',isAuthorized, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, comment){
    if(err){
      res.redirect('back');
    }else{
      res.redirect('/campgrounds/' + req.params.id);
    }
  })
});

router.delete('/comments/:comment_id',isAuthorized, function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
      res.redirect('back');
    }else{
      res.redirect('/campgrounds/' + req.params.id);
    }
  })
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}

function isAuthorized(req, res, next){
  if(req.isAuthenticated()){
    Comment.findById(req.params.comment_id, function(err, comment){
      if(err){
        res.redirect('back');
      }else{
        if(comment.author.id.equals(req.user._id)){
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
