//controllers
var express = require('express');
//models
var Post = require("../models/Post"),
    multer  = require('multer'),
    path = require('path'),
    _ = require('lodash'),
    fs = require('fs'),
    upload = multer({ dest: 'tmp' }),
    Comment = require('../models/comment');
//module
var router = express.Router();

var mimetypes = {
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/png": "png"
};


// 게시글 목록 화면
router.get('/', function(req, res, next) {
    Post.find({}, function(err, post) { // 모든 정보들을 다 알기 위해 find를 쓴다.
    if (err) {
      return next(err);
    }
    res.render('posts/index', {posts: post}); // 모든 정보들을 다 보기 위해 posts로 넘겨준다.
  });
});

// 게시글 쓰기 화면
router.get('/new', function(req, res, next) {
  res.render('posts/edit', {post: req.body}); 
});

// 게시글 보기 화면
router.get('/:id', function(req, res, next) {
    Post.findById(req.params.id, function(err, post) { // 특정 id를 가진 post를 알기 위해 findById를 쓴다.
    if (err) {
      return next(err);
    }
    post.read++; // 조회수 증가

    post.save(function (err) { // 조회수 저장
			if (err) {
				return next(err);
			}
      Comment.find({post: post.id}, function(err, comments) {
        if (err) {
          return next(err);
        }
        res.render('show', {post: post, comments: comments});
    //res.render('show', {post: post});
      });
  });
 });
});

// 게시글 수정 화면
router.get('/:id/edit', function(req, res, next) {
  Post.findById(req.params.id, function(err, post) { // 특정 id를 가진 post를 알기 위해 findById를 쓴다.
    if (err) {
      return next(err);
    }
    res.render('posts/edit', {post: post});
  });
});

router.post('/:id/comments', function(req, res, next) {
  var comment = new Comment({
    post: req.params.id,
    name: req.body.name,
    content: req.body.content
  });

  comment.save(function(err) {
    if (err) {
      return next(err);
    }
    Post.findByIdAndUpdate(req.params.id, {$inc: {numComment: 1}}, function(err) {
      if (err) {
        return next(err);
      }
      res.redirect('/posts/' + req.params.id);
    });
  });
});


// 게시글 삭제
router.delete('/:id', function(req, res, next) {
    Post.findOneAndRemove({_id: req.params.id}, function(err) { // 특정 게시물을 삭제하기 위해 findOneAndRemove를 쓴다.
    if (err) {
      return next(err);
    }
    res.redirect('/posts');
  });
});

// 게시글 수정
router.put('/:id', function(req, res, next) {
  Post.findById({_id: req.params.id}, function(err, post) { // 특정 id를 가진 post를 알기 위해 findById를 쓴다.
    if (err) {
      return next(err);
    }

    post.title = req.body.title;
    post.city = req.body.city;
    post.address = req.body.address;
    post.fee = req.body.fee;
    post.facilities = req.body.facilities;
    post.rule = req.body.rule;
    post.createdAt = req.body.createdAt; // new!

    if (post.password !== req.body.password) { // 비밀번호가 일치하지 않으면 수정할 수 없도록 한다.
      req.flash('back', '비밀번호가 일치하지 않습니다.');
      return res.redirect('back');
    }

    post.save(function(err) { // 수정내용 저장
      if (err) {
        return next(err);
      }
      res.redirect('/posts');
    });
  });
});

// 게시글 작성
router.post('/', upload.array('photos'), function(req, res, next) {
  var dest = path.join(__dirname, '../public/images/');
  var images = [];
  if (req.files && req.files.length > 0) {
    _.each(req.files, function(file) {
      var ext = mimetypes[file.mimetype];
      if (!ext) {
        return;
      }
      var filename = file.filename + "." + ext;
      fs.renameSync(file.path, dest + filename);
      images.push("/images/" + filename);
    });
  }

   var newPost = new Post({
    read : req.body.read,
    name: req.session.user.name, //로그인한 user의 이름 불러오기
    title : req.body.title,
    city : req.body.city,
    address : req.body.address,
    fee : req.body.fee,
    facilities : req.body.facilities,
    rule : req.body.rule,
    images: images,
    createdAt : req.body.createdAt, // new!
   });
   newPost.password = req.body.password;

   newPost.save(function(err) { // 게시글 저장
    if (err) {
      return next(err);
     } else {
       res.redirect('/book');
    }
  });
});


module.exports = router;