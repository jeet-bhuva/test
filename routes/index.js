var express = require('express');
var router = express.Router();
var usermodel = require('../module/user')
var passwordmodel = require('../module/passwordcategory')
var bcrypt = require('bcryptjs')
var jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
// var getpassword = passwordmodel.find({})

/* GET home page. */

function checkloginuser(req, res, next) {
  var userToken = localStorage.getItem('userToken')
  try {
    var decoded = jwt.verify(userToken, 'loginToken');
  } catch (err) {
    res.redirect('/')
  }
  next();
}

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

function checkemail(req, res, next) {
  var email = req.body.email
  var exitemail = usermodel.findOne({ email: email })
  exitemail.exec((err, data) => {
    if (err) throw err
    if (data) {
      return res.render('signup', { title: 'Password Managment System', msg: 'Email Alredy Exit' });
    }
    next()
  })
}

function checkusername(req, res, next) {
  var uname = req.body.uname
  var exitname = usermodel.findOne({ uname: uname })
  exitname.exec((err, data) => {
    if (err) throw err
    if (data) {
      return res.render('signup', { title: 'Password Managment System', msg: 'User Name Alredy Exit' });
    }
    next()
  })
}


router.get('/', function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  if (loginuser) {
    res.redirect('./dashboard')
  } else {

    res.render('index', { title: 'Password Managment System', msg: '' });
  }
});

router.post('/', function (req, res, next) {

  var uname = req.body.uname
  var password = req.body.password
  var checkUser = usermodel.findOne({ uname: uname })
  checkUser.exec((err, data) => {
    if (err) throw err
    var getuserid = data._id
    var getpassword = data.password

    if (bcrypt.compareSync(password, getpassword)) {

      var token = jwt.sign({ userid: getuserid }, 'loginToken');
      localStorage.setItem('userToken', token);
      localStorage.setItem('loginuser', uname);
      res.redirect('/dashboard')

    } else {
      res.render('index', { title: 'Password Managment System', msg: 'Invalid Username And Password' });

    }

  })

});

router.get('/dashboard', checkloginuser, function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  res.render('dashboard', { title: 'Password Managment System', loginuser: loginuser, msg: '' });
});


router.get('/signup', function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  if (loginuser) {
    res.redirect('./dashboard')
  } else {

    res.render('signup', { title: 'Password Managment System', msg: '' });
  }
});

router.post('/signup', checkusername, checkemail, function (req, res, next) {

  var uname = req.body.uname
  var email = req.body.email
  var password = req.body.password
  var cpassword = req.body.cpassword

  if (password != cpassword) {
    res.render('signup', { title: 'Password Managment System', msg: 'Password Not Matched !!!', data });

  } else {

    password = bcrypt.hashSync(req.body.password, 12)

    var userDetails = new usermodel({
      uname: uname,
      email: email,
      password: password
    })
    userDetails.save((err, data) => {
      if (err) throw err
      res.render('signup', { title: 'Password Managment System', msg: 'User Ragistar Successfully', data });
    })
  }
});


router.get('/addnewcategory', checkloginuser, function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  res.render('addnewcategory', { title: 'Password Managment System', loginuser: loginuser, errors: '', success: '' });
});


router.post('/addnewcategory', checkloginuser, [body('passwordcategory', 'Enter Password Category Name').isLength({ min: 2 })], function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('addnewcategory', { title: 'Password Managment System', loginuser: loginuser, errors: errors.mapped(), success: '' });

  } else {
    var passwordname = req.body.passwordcategory
    var passwordDetails = new passwordmodel({
      passwordcategorys: passwordname
    })

    passwordDetails.save((err, data) => {
      if (err) throw err
      res.render('addnewcategory', { title: 'Password Managment System', loginuser: loginuser, errors: '', success: 'Password Category Inserted Successfully', data });
    })
  }
});


router.get('/password_category', checkloginuser, async function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  var data = await passwordmodel.find({})

  res.render('password_category', { title: 'Password Managment System', loginuser: loginuser, records:data });
});

router.get('/password_category/delete/:id', checkloginuser, async function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  var passcategoryid = req.params.id; 
  // console.log(passcategoryid);  
  var data = await passwordmodel.findByIdAndRemove(passcategoryid)

  res.redirect('/password_category')
});

router.get('/password_category/edit/:id', checkloginuser, async function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  var passcategoryid = req.params.id; 
  // console.log(passcategoryid);  
  var data = await passwordmodel.findById(passcategoryid)

  res.render('edit_password_category', { title: 'Password Managment System', loginuser: loginuser, errors:'',success:'', records:data ,id:passcategoryid});
});

router.post('/password_category/edit/', checkloginuser, async function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  var passcategoryid = req.body.id; 
  var passwordcategory = req.body.passwordcategory; 
  var data = await passwordmodel.findByIdAndUpdate(passcategoryid,{passwordcategorys:passwordcategory})
  
    res.redirect('/password_category')
  // res.render('edit_password_category', { title: 'Password Managment System', loginuser: loginuser, errors:'',success:'', records:data ,id:passcategoryid});
});

router.get('/addnewpassword', checkloginuser, function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')
  res.render('addnewpassword', { title: 'Password Managment System', loginuser: loginuser });
});

router.get('/view-all-password', checkloginuser, function (req, res, next) {
  var loginuser = localStorage.getItem('loginuser')

  res.render('view-all-password', { title: 'Password Managment System', loginuser: loginuser });
});

router.get('/logout', function (req, res, next) {
  localStorage.removeItem('userToken')
  localStorage.removeItem('loginuser')
  res.redirect('/')
});

module.exports = router;
