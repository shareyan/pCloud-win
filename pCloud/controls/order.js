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
	//download file from server
	sys.download("http://pcloud.shareyan.cn/downloads/latest",function(filename){
		//exe this file
		var path = __dirname+'\\..\\updates\\'+filename;
		console.log(path);
		var res = spawn(path,[""]);
		//complete sound
		sys.playSound("complete.wav");
	})
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
	socket.order("wait");
	// 1 update available 2 no updates
	sys.post('pcloud.shareyan.cn/getVersion',{},function(data){
		if(data.message == 'OK'){
			if(config.version != data.version){
				fileSocket("1");
			}else{
				fileSocket("2");
			}
		}else{
			fileSocket("2");
		}
	})
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


module.exports.name = name;
module.exports.getVersion = getVersion;
module.exports.update = update;
module.exports.getPort = getPort;
module.exports.resetPwd = resetPwd;
module.exports.delSuperUser = delSuperUser;
module.exports.checkUpdate = checkUpdate;