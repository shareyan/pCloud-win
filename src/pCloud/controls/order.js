var User = require('../models/user').User;
var Code = require('../models/code');
var config = require('../config/configs');
var sys = require('../utils/sys');
var fs = require('fs');
var spawn = require('child_process').spawn;

function name(socket,app){
	//get admin name 
	var myUser = new User(app);
	var superUser = myUser.objects.filter('is_superuser',true);
	if(superUser.length == 0){
		socket.order("0");
	}
	else{
		superUser = superUser[0];
		socket.order(superUser.name);
	}
}


function getVersion(socket,app){
	socket.order(config.version);
}

function update(socket,app){
	//update functions
	socket.order("0");
	//start update process
	if(fs.existsSync('../../updates/node.exe')){
		console.log("update process started");
		var updatePro = spawn(__dirname+'/../../../updates/node.exe',['update.js','-v',config.version,'-p',app.socketPort],{
			cwd:__dirname+'/../../../updates/',
		});
		updatePro.on('error',function(err){
			console.log(err);
		})
	}else{
		//copy node.exe to target directory
		console.log("update process started");
		copyFile('./node.exe','../../updates/node.exe',function(err){
			if(err)console.log(err);
			var updatePro = spawn(__dirname+'/../../../updates/node.exe',['update.js','-v',config.version,'-p',app.socketPort],{
				cwd:__dirname+'/../../../updates/',
			});
			updatePro.on('error',function(err){
				console.log(err);
			})
		})
	}
	
}

function copyFile(source, target, cb) {
  var cbCalled = false;

  var rd = fs.createReadStream(source);
  rd.on("error", function(err) {
    done(err);
  });
  var wr = fs.createWriteStream(target);
  wr.on("error", function(err) {
    done(err);
  });
  wr.on("close", function(ex) {
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
}


function delSuperUser(socket,app){
	var myUser = new User(app);
	var superUser = myUser.objects.filter('is_superuser',true);
	if(superUser.length != 0){
		superUser = superUser[0];
		superUser.objects.delete();
		socket.order("1");
		var myCode = new Code(app);
		var codes = myCode.objects.all();
		//delete old codes
		codes.forEach(function(oldCode){
			oldCode.objects.delete();
		});
	}
	socket.order("0");
}

function resetPwd(socket,app){
	var myUser = new User(app);
	var superUser = myUser.objects.filter('is_superuser',true);
	if(superUser.length != 0){
		superUser = superUser[0];
		superUser.setPassword("admin");
		superUser.objects.save();
		socket.order("1");
	}else{
		socket.order("0");
	}
}

function getPort(socket,app){
	socket.order(app.port);
}

function checkUpdate(socket,app){
	socket.order("0");
	// 1 update available 2 no updates
	sys.post('pcloud.shareyan.cn/getVersion',{},function(data){
		if(data.message == 'OK'){
			if(config.version != data.version){
				sendNews("update",app);
			}
		}
	})	
}

function sendNews(news,app){
	if(typeof app.data.dataBase.news == 'undefined'){
		app.data.dataBase.news = [];
	}
	var newsList = app.data.dataBase.news;
	newsList.push(news);//add news to newList
}

function getNews(socket,app){
	if(typeof app.data.dataBase.news == 'undefined'){
		app.data.dataBase.news = [];
	}
	var news = app.data.dataBase.news;
	if(news.length == 0){
		socket.order("0");
	}else{
		socket.order(news[0]);
		news = news.splice(0,1);//remove sent news
		console.log(news);
		console.log(app.data.dataBase.news);
	}
	
}

function fileSocket(res){
	fs.writeFile('../../logs/socket',res,'utf8',function(err){
		if(err)console.log(res);
		console.log('fileSocket write:'+res);
		fs.readFile('../../logs/socket','utf8',function(err,data){
			console.log("read:"+data);
		})
	})
}

function getIp(socket,app){
	var ipList = sys.getIp();
	var port = app.port;
	socket.order(ipList.ipv4[0]+':'+port);
}

function fullExit(socket,app){
	sendNews('fullExit',app);
	socket.write('OK');
}


module.exports.name = name;
module.exports.getVersion = getVersion;
module.exports.update = update;
module.exports.getPort = getPort;
module.exports.resetPwd = resetPwd;
module.exports.delSuperUser = delSuperUser;
module.exports.checkUpdate = checkUpdate;
module.exports.getNews = getNews;
module.exports.sendNews = sendNews;
module.exports.getIp = getIp;
module.exports.fullExit = fullExit;