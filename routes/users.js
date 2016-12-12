var express = require('express');
var User = require('../models/User');
var Post = require('../models/Post');
var Reserve = require('../models/Reserve');
var router = express.Router();

function needAuth(req, res, next) {
    if (req.session.user) {
      next();
    } else {
      req.flash('danger', '로그인이 필요합니다.');
      res.redirect('/signin');
    }
}

function validateForm(form, options) {
  var name = form.name || "";
  var email = form.email || "";
  name = name.trim();
  email = email.trim();

  if (!name) {
    return '이름을 입력해주세요.';
  }

  if (!email) {
    return '이메일을 입력해주세요.';
  }

  if (!form.password && options.needPassword) {
    return '비밀번호를 입력해주세요.';
  }

  if (form.password !== form.password_confirmation) {
    return '비밀번호가 일치하지 않습니다.';
  }

  if (form.password.length < 6) {
    return '비밀번호는 6글자 이상이어야 합니다.';
  }

  return null;
}

/* GET users listing. */
router.get('/', needAuth, function(req, res, next) {
  if (req.session.admin === true) {
    return res.redirect('/users/index'); 
  }
  res.render('users/admin', {messages: req.flash()});
});

router.get('/profile', function(req, res, next) {
  res.render('users/profile');
});

router.post('/', function(req, res, next) {
  if(req.body.password === '123456') {
    req.session.admin = true;
    return res.redirect('/users/index');
  }

  req.session.admin = false;
  req.flash('danger', '비밀번호가 틀렸습니다.');
  res.redirect('back');
});

router.get('/index', function(req, res, next) {
  if(req.session.admin !== true) {
    return res.redirect('/users');
  }
  User.find({}, function(err, users) {
    if (err) {
      return next(err);
    }
    res.render('users/index', {users: users}); //users정보들을 넘겨주기
  });
});

router.get('/new', function(req, res, next) {
  res.render('users/new', {messages: req.flash()});
});

router.get('/:id/edit', function(req, res, next) {
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    res.render('users/edit', {user: user});
  });
});

router.put('/:id', function(req, res, next) {
  var err = validateForm(req.body);
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }

  User.findById({_id: req.params.id}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      req.flash('danger', '존재하지 않는 사용자입니다.');
      return res.redirect('back');
    }

    if (user.password !== req.body.current_password) {
      req.flash('danger', '현재 비밀번호가 일치하지 않습니다.');
      return res.redirect('back');
    }

    user.name = req.body.name;
    user.email = req.body.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    user.save(function(err) {
      if (err) {
        return next(err);
      }
      req.flash('success', '사용자 정보가 변경되었습니다.');
      res.redirect('/');
    });
  });
});

router.delete('/:id', function(req, res, next) {
  delete req.session.user;
  User.findOneAndRemove({_id: req.params.id}, function(err) {
    if (err) {
      return next(err);
    }
    req.flash('success', '회원탈퇴가 완료되었습니다.');
    res.redirect('/signin');
  });
});

router.get('/:id', function(req, res, next) {
  if (!req.session.user) {
      return next();
  }
  User.findById(req.params.id, function(err, user) {
    if (err) {
      return next(err);
    }
    Post.find({name:req.session.user.name}, function(err, posts){
      if (err) {
        return next(err);
      }
      Reserve.find({host:req.session.user.name}, function(err, hosts){
        if (err) {
          return next(err);
        }
        Reserve.find({requester:req.session.user.name}, function(err, reservations){
          if (err) {
            return next(err);
          }
         res.render('users/profile', {user: user, posts:posts, hosts:hosts, reservations:reservations});
        });
      });
    });
  });
});

router.post('/new', function(req, res, next) {
  var err = validateForm(req.body, {needPassword: true});
  if (err) {
    req.flash('danger', err);
    return res.redirect('back');
  }
  User.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      return next(err);
    }
    if (user) {
      req.flash('danger', '동일한 이메일 주소가 이미 존재합니다.');
      res.redirect('back');
    }
    var newUser = new User({
      name: req.body.name,
      email: req.body.email,
    });
    newUser.password = req.body.password;

    newUser.save(function(err) {
      if (err) {
        return next(err);
      } else {
        req.flash('success', '가입이 완료되었습니다. 로그인 해주세요.');
        res.redirect('/');
      }
    });
  });
});


module.exports = router;
