var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var app = express();


//---------ここからpassport-----------

//エラー用フラッシュメッセージのモジュールを設定
var flash = require('connect-flash');
app.use(flash());

//passportの初期化
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
app.use(require('express-session')({
    secret: 'fjaiofjfiafkldsfkadjkafk', //セッションのハッシュ文字列。任意に変更すること。
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

//認証ロジック
passport.use(
	new LocalStrategy(
		{
			//Viewのアカウント入力フォームのname属性を指定する
			usernameField: 'user_name', 
			passwordField: 'user_password'
		},
		function(username, password, done) {
			//routerのpassport.authenticate()が呼ばれたらここの処理が走る。

			if(username == 'myname' && password == 'mypassword'){
				//ログイン成功
				//今回はここの判定式をハードコーディングにする
        		return done(null, username);
			}

			//ログイン失敗
			//messageはログイン失敗時のフラッシュメッセージ。
			//各routerの req.flash() で取得できる。
       		return done(null, false, {message:'ID or Passwordが間違っています。'});
		}
	)
);


//認証した際のオブジェクトをシリアライズしてセッションに保存する。
passport.serializeUser(function(username, done) {
	console.log('serializeUser');
	done(null, username);
});


//認証時にシリアライズしてセッションに保存したオブジェクトをデシリアライズする。
//デシリアライズしたオブジェクトは各routerの req.user で参照できる。
passport.deserializeUser(function(username, done) {
	console.log('deserializeUser');
	done(null, {name:username, msg:'my message'});
});

//---------ここまでpassport-----------


// view engine setup
app.set('views', path.join(__dirname, 'views'));
////app.set('view engine', 'jade');

var ECT = require('ect');
var ectRenderer = ECT({ watch: true, root: __dirname + '/views', ext : '.ect' });

app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
