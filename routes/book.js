//controllers
var express = require('express');
//models
var Post = require("../models/Post");
//module
var router = express.Router();

// 게시글 목록 화면
router.get('/', function(req, res, next) {
    Post.find({}, function(err, post) { // 모든 정보들을 다 알기 위해 find를 쓴다.
    if (err) {
      return next(err);
    }
    res.render('book', {posts: post}); // 모든 정보들을 다 보기 위해 posts로 넘겨준다.
  });
});
module.exports = router;