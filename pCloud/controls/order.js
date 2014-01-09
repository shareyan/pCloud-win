var User = require('../models/user').User;
var config = require('../config/configs');
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
}

function delSuperUser(socket,app){
	var myUser = new User(app);
	var superUser = myUser.objects.filter('is_superuser',true);
	if(superUser.length != 0){
		superUser = superUser[0];
		superUser.objects.delete();
		socket.order("1");
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

module.exports.name = name;
module.exports.getVersion = getVersion;
module.exports.update = update;
module.exports.getPort = getPort;
module.exports.resetPwd = resetPwd;
module.exports.delSuperUser = delSuperUser;