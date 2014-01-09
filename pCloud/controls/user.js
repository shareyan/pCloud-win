var formidable = require('formidable');
var querystring = require('querystring');
var User = require('../models/user').User;
var Code = require('../models/code');
var sys = require('../utils/sys');
var codes = require('../utils/code');

exports.register = function(app){
	if(app.req.method.toLowerCase() == 'post'){
		var form = new formidable.IncomingForm();
		form.parse(app.req, function(err, fields, files) {
			var username = fields.username;
			var password = fields.password;
			var myUser = new User(app);
			if(myUser.objects.get(username) != ''){
				return app.JSON({message:'Error','reason':'nameRepeat'});
			}
			myUser.name = username;
			myUser.setPassword(password);
			myUser.objects.save();
			return app.JSON({message:'OK'});
		});
	}
	else{
		var regPage = app.getTemplate('register.html');
		var context = {
			content:regPage,
			user:app.getUser().objects.getInfo(),
			onDeletePage:false,
		}
		return app.render('base.html',context);
	}
}

exports.oaSuperUserReg = function(app){
	//get user info
	var myUser = new User(app);
	if(myUser.objects.filter('is_superuser',true).length != 0){
		app.Text("你已经注册了管理员用户，如果想要修改请双击修改管理员信息。");
	}else{
		sys.post('pcloud.shareyan.cn/oa/userInfo',{
			sid:app.data.dataBase.sid,
		},function(data){
			if(data.message == "OK"){
				var user = data.user;
				var oahtml = app.getTemplate('oaReg.html');
				console.log(user);
				var context = {
					content:oahtml,
					user:app.getUser().objects.getInfo(),
					onDeletePage:false,
					source:user.APP_ID,
					username:user.name,
					access_token:user.access_token,
					type:user.type,
					openid:'',
				}
				if(user.type == 'qq'){
					context.openid = user.openid;
					context.username = user.data.name;
				}
				return app.render('base.html',context);
			}else{
				//get info failed, redirect to register page
				return app.redirect('/superUserReg');
			}
		});
	}
}

exports.sendPost = function(app){
	var form = new formidable.IncomingForm();
	form.parse(app.req,function(err,fields,files){
		if(fields.type == 'sina'){
			sys.httpsPost('https://api.weibo.com/2/statuses/update.json',{
				source:fields.source,
				access_token:fields.access_token,
				status:fields.content,
				visible:0,
			},function(res){
				return app.JSON({
					message:"OK"
				})
			})
		}
		if(fields.type == 'qq'){
			sys.httpsPost('https://graph.qq.com/t/add_t',{
				format:'json',
				content:fields.content,
				access_token:fields.access_token,
				oauth_consumer_key:fields.source,
				openid:fields.openid,
			},function(data){
				return app.JSON({
					message:'OK'
				})
			})
		}
	})
}

exports.follow = function(app){
	var form = new formidable.IncomingForm();
	form.parse(app.req,function(err,fields,files){
		if(fields.type == 'sina'){
			sys.httpsPost('https://api.weibo.com/2/friendships/create.json',{
				source:fields.source,
				access_token:fields.access_token,
				screen_name:"私有云pCloud",
			},function(res){
				return app.JSON({
					message:'OK'
				})
			})
		}
		if(fields.type == 'qq'){
			sys.httpsPost('https://graph.qq.com/relation/add_idol',{
				format:'json',
				access_token:fields.access_token,
				oauth_consumer_key:fields.source,
				openid:fields.openid,
				name:'mypcloud',
			},function(data){
				return app.JSON({
					message:'OK'
				})
			})
		}
	})
				
}

exports.superUserReg = function(app){
	var myUser = new User(app);
	if(myUser.objects.filter('is_superuser',true).length != 0){
		app.Text("你已经注册了管理员用户，如果想要修改请双击修改管理员信息。");
	}else{
		//send req to remote server,update ip and get sid
		var ip = sys.getIp();
		ip.port = app.port;
		sys.post('pcloud.shareyan.cn/getSid',{
			ip:JSON.stringify(ip),
		},function(data){
			if(data.message == 'OK'){
				app.data.dataBase.sid = data.sid;
			}else{
				return app.JSON({
					message:'Error',
					reason:'noNetwork',
				});
			}
			
			if(app.req.method.toLowerCase() == 'post'){
				var form = new formidable.IncomingForm();
				form.parse(app.req, function(err, fields, files) {
					var username = fields.username;
					var password = fields.password;
					var myUser = new User(app);
					if(myUser.objects.get(username) != ''){
						return app.JSON({message:'Error','reason':'nameRepeat'});
					}
					//check cloud name available
					var localIP = sys.getIp();
					localIP.port = app.port;
					//send req to server
					sys.post('shareyan.cn/cloud',{
						name:username,
						ip:JSON.stringify(localIP),
					},function(data){
						if(data.message != 'OK' && typeof data.reason != 'string'){
							return app.JSON({
								message:'Error',
								reason:'noNetwork',
							});
						}
						if(data.message != 'OK' && data.reason == 'nameRepeat'){
							return app.JSON({
								message:'Error',
								reason:'nameRepeat',
							});
						}
						if(data.message == 'OK'){
							//name available,get a code
							var serverCode = data.code;
							var myCode = new Code(app);
							myCode.code = serverCode;
							myCode.name = username;
							myCode.objects.save();
							//create superUser locally
							myUser.name = username;
							myUser.setPassword(password);
							myUser.is_superuser = true;
							myUser.objects.save();
							return app.JSON({message:'OK'});
						}
						console.warn("something wrong with superUserReg");
						console.warn(data);
					})
				});
			}else{
				var regPage = app.getTemplate('register.html');
				var context = {
					content:regPage,
					user:app.getUser().objects.getInfo(),
					onDeletePage:false,
					superUser:true,
					sid:app.data.dataBase.sid,
				}
				return app.render('base.html',context);
			}
		})
	}
}

module.exports.login = function(app){
	logout(app);
	if(app.req.method.toLowerCase() == 'post'){
		var form = new formidable.IncomingForm();
		form.parse(app.req, function(err, fields, files) {
			var username = fields.username;
			var password = fields.password;
			var myUser = checkPassWord(app,username,password);
			if(myUser){
				login(myUser);
				console.log(myUser);
				app.JSON({
					message:'OK',
				})
			}else{
				app.JSON({
					message:'Error',
					reason:'error',
				})
			}
		})
	}else{
		var loginPage = app.getTemplate('login.html');
		var context = {
			content:loginPage,
		}
		return app.render('base.html',context);
	}
}

function login(user){
	var app = user.app;
	app.setUser(user);
}

function checkPassWord(app,username,password){
	var myUser = new User(app);
	myUser = myUser.objects.get(username);
	if(myUser == ''){
		return false;
	}
	if(codes.hashEncode(password) == myUser.password){
		return myUser;
	}else{
		return false;
	}
}

function logout(app){
	var myUser = new User(app);
	app.setUser(myUser.anonymousUser());
}
		
function login_required(app){
	//check login states
	var user = app.getUser();
	if(user.id == 0){
		app.redirect('/login');
	}
}

module.exports.changePassword = function(app){
	login_required(app);
	if(app.req.method.toLowerCase() == 'post'){
		var form = new formidable.IncomingForm();
		form.parse(app.req,function(err,fields,files){
			var myUser = new User(app);
			myUser = app.getUser();
			var password = fields.password;
			myUser.setPassword(password);
			myUser.objects.save();
			return app.JSON({message:'OK'});
		})
	}else{
		var changePasswordPage = app.getTemplate('changePassword.html');
		var context = {
			content:changePasswordPage,
		}
		return app.render('base.html',context);
	}
}
module.exports.getCode = function(app){
	var myCode = new Code(app);
	var codes = myCode.objects.all();
	if(codes.length != 0){
		myCode = codes[0];
		return app.JSON({
			message:"OK",
			name:myCode.name,
		})
	}else{
		return app.JSON({
			message:Error,
			reason:'notFound',
		})
	}
}

module.exports.login_required = login_required;