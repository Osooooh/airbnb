//controllers
var express = require('express');
//models
var User = require("../models/User");
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

router.post('/:id', needAuth, function(req, res, next) {
    Post.findById(req.params.id, function (err, posts){
        var newReserve = new Reserve({
            requester: req.session.user.name, 
            host: posts.name,
            title: req.params.id,
            checkin: req.body.checkin, 
            checkout: req.body.checkout,
            personnel: req.body.personnel,
            situation: "요청중"
        });
        newReserve.save(function(err) {
        if (err) {
            return next(err);
        } else {
            req.flash('success', '예약을 요청했습니다.');
            res.redirect('/');
        }
        });
    });
});

router.get('/:id/accept', function(req, res, next) {
   Reserve.findById(req.params.id, function (err, reserve){
        reserve.situation = "수락";
        reserve.save(function(err) {
        if (err) {
            return next(err);
        } else {
            req.flash('success', '예약을 수락했습니다.');
            res.redirect('back');
            }   
        });
    }); 
});

router.get('/:id/reject', function(req, res, next) {
   Reserve.findById(req.params.id, function (err, reserve){
        reserve.situation = "거절";
        reserve.save(function(err) {
        if (err) {
            return next(err);
        } else {
            req.flash('danger', '예약을 거절했습니다.');
            res.redirect('back');
        }
        });
    }); 
});

router.delete('/:id', function(req, res, next) {
    Reserve.findOneAndRemove({_id: req.params.id}, function(err) {
      if (err) {
        return next(err);
      } else {
            req.flash('danger', '예약을 삭제했습니다.');
            res.redirect('back');
        }
      
    });
});




module.exports = router;