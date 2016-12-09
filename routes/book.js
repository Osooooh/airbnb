//controllers
var express = require('express');
//models
var Post = require("../models/Post");
var Reserve = require("../models/Reserve");
//module
var router = express.Router();

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}

router.get('/', function(req, res, next) {
    Post.find({}, function(err, post) { 
    if (err) {
      return next(err);
    }
    res.render('book', {posts: post});
  });
});

router.post('/', function(req, res, next) {
  Post.find({city:req.body.city}, function(err, posts){
    res.render('book', {posts:posts, city:req.body.city});
  });
});


module.exports = router;