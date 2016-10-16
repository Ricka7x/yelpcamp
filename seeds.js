var mongoose = require('mongoose');
var faker = require('faker');
var Campground = require('./models/campground');
var Comment = require('./models/comment');

var data = [];

for(var i = 0; i < 30;i++){
  data.push({name: faker.lorem.words(2), image: faker.image.nature(), description: faker.lorem.words(30)});
}

function seedDB(){
  Campground.remove({}, function(err){
    if(err){
      console.log(err);
    }else {
      console.log("all records have been deleted");
    }
  });
  data.forEach(function(item){
    Campground.create(item, function(err, campground){
      if(err){
        console.log(err);
      }else{
        Comment.create(
          {
            text: "This place is grate but I wish there was internet",
            author: 'Homer'},function(err, comment){
              if(err){
                console.log(err);
              }else{
                campground.comments.push(comment);
                campground.save();
              }
          });
      }
    });
  })

}

module.exports = seedDB;
