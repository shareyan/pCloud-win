var http = require('http');
var path = require('path');
var routes = require('./config/route');
var send = require('send');
var url = require('url');
var fs = require('fs');
var net = require('net');
//models
var User = require('./models/user').User;
var loadFiles = require('./utils/loadFiles').loadFiles;
var codes = require('./utils/code');
//my own framework
var app = require('./utils/syFrm').app;
var middlewares = require('./controls/middlewares/middlewares');
var freePort = require('./utils/freePort');
var sys = require('./utils/sys');
var order = require('./controls/order');
//error process

var accessLog = fs.createWriteStream('../../logs/node.access.log', { flags: 'a' })
     , errorLog = fs.createWriteStream('../../logs/log.txt', { flags: 'a' });

// redirect stdout / stderr
process.__defineGetter__('stderr', function() { return errorLog });
process.__defineGetter__('stdout', function() { return accessLog });

//important data
var dataBase = {};
var templates = {};
var port = '';
var key = "";
//load data to memory
var myDataBase = new loadFiles('./models/db');
myDataBase.load(function(data){
	//get key
	if(fs.existsSync('./models/key')){
		key = fs.readFileSync('./models/key','utf8');
		//compare key with mac
		sys.getMac(function(macList){
			var hashedMacList = [];
			macList.forEach(function(mac){
				var hashedMac = codes.hashEncode(mac);
				hashedMacList.push(hashedMac);
			});
			if(hashedMacList.length != 1 && hashedMacList.indexOf(key) == -1){
				//key mac no match
				//generate new key
				var mac = macList[0];
				key = codes.hashEncode(mac);
				fs.writeFileSync('./models/key',key,'utf8');
			}
			startapp(data);
		})
	}else{
		//getMac
		sys.getMac(function(mac){
			mac = mac[0];
			key = codes.hashEncode(mac);
			fs.writeFileSync('./models/key',key,'utf8');
			startapp(data);
		})
	}
})
	
function startapp(data){
	try{
		data = codes.decode(data,key);
		dataBase = JSON.parse(data);
	}catch(err){
		dataBase = {
			userList:[],
			codeList:[],
			shareFolderList:[],
			sessionList:[],
		};
	}
	//load template files to memory
	var myTemplates = new loadFiles('./views');
	myTemplates.load(function(data){
		templates = data;
		//get a free port
		freePort(function(myport){
			port = myport;
			//start server
			http.createServer(onreq).listen(port,function(){
				console.log("start serving on "+port);
				//update ip and port info
				//create fake app
				var data = {
					templates:templates,
					dataBase:dataBase
				}
				var req = {},res = {};
				var myapp = new app(req,res,data);
				myapp.port = port;
				sys.updateIp(myapp,function(msg){
					if(msg.message == "Error"){
						//updateIp failed
						order.sendNews("noNetwork",myapp);
					}
				});
			});
		})
		//start a socket to communicate with win socket
		freePort(function(myport){
			//start a tcp server
			net.createServer(function(socket){
				socket.on('data',function(data){
					var command = data.toString("ascii");
					console.log(data);
					console.log("command:"+command+':');
					if(command == "hello"){
						socket.write("echo\0");
					}
					if(command == "stop"){
						exit();
					}
					//
					socket.order = function(cmd){
						this.write(cmd+'\0');
						console.log("send:"+cmd);
					}
					//fake app
					var data = {
						templates:templates,
						dataBase:dataBase
					}
					var req = {},res = {};
					var myapp = new app(req,res,data);
					//http port
					myapp.port = port;
					//socket port
					myapp.socketPort = myport;
					if(command == 'name')order.name(socket,myapp);
					//if(command == 'sign')order.sign(socket,myapp);
					if(command == 'getVersion')order.getVersion(socket,myapp);
					if(command == 'update')order.update(socket,myapp);
					if(command == 'getPort')order.getPort(socket,myapp);
					if(command == 'resetPwd')order.resetPwd(socket,myapp);
					if(command == 'delSuperUser')order.delSuperUser(socket,myapp);
					if(command == 'checkUpdate')order.checkUpdate(socket,myapp);
					if(command == 'news')order.getNews(socket,myapp);
					if(command == 'getIp')order.getIp(socket,myapp);
					if(command == 'fullExit')order.fullExit(socket,myapp);
				});
				
				socket.on('error',function(err){
					console.log(err);
				});
				
				socket.on('close',function(data){
					console.log('socket closed');
				})
			}).listen(myport,'127.0.0.1');//only listen local req
			//write basic info to logs
			 fs.writeFile('../../logs/port.txt',myport,'utf8',function(err){
				if(err){
					console.log('err');
				}
			})
		})
	})
}

function onreq(req,res){
	//prepare basic data
	var data = {
		templates:templates,
		dataBase:dataBase
	}
	var myapp = new app(req,res,data);
	myapp.port = port;
	var resFlag = false;
	//add static file server
	//get install package
	if(req.url.indexOf('/download/Winfly.msi') == 0){
		resFlag = true;
		var rootPath = __dirname.split('\\');
		rootPath.splice(rootPath.length-2,2);
		rootPath = rootPath.join('\\');
		send(req,rootPath + '/updates/Winfly.msi')
		.on('error', function(err){console.log(err);})
		.pipe(res);
	}
	if(req.url.indexOf('/static/') == 0){
		resFlag = true;
		//static file
		req.url = req.url.substring("/static".length);
		console.log(req.url);
		send(req, url.parse(req.url).pathname)
		  .root('./public')
		  .on('error', function(err){
				console.log(err);
				if(err.status == 404){
					myapp.page404();
				}
			})
		  .pipe(res);
	}
	if(req.url.indexOf('/share/') == 0){
		//share files
		req.url = req.url.substring("/share/".length);
		//get /share/22222
		var code = req.url.substring(0,req.url.indexOf('/'));
		req.url = req.url.substring(req.url.indexOf('/')+1);
		dataBase.shareFolderList.forEach(function(shareFolder){
			//find the shareFolder
			if("share/"+code == shareFolder.url){
				resFlag = true;
				console.log(req.url);
				send(req, req.url)
				  .root(shareFolder.path)
				  .on('error', function(err){
						console.log(err);
						if(err.status == 404){
							myapp.page404();
						}
					})
				  .pipe(res);
			}
		})
		//return 404
		if(!resFlag)myapp.page404();
	}
	
	//load middlewares
	if(!resFlag)middlewares(myapp);
	//process views
	if(!resFlag)routes(myapp);
}

function exit(){
	console.log('saving data before quiting');
	//delete all sessions
	dataBase.sessionList = [];
	var data = JSON.stringify(dataBase);
	//encode before save
	console.log(key);
	console.log(data);
	data = codes.encode(data,key);
	fs.writeFile('./models/db',data,'utf8',function(err){
		if(err)console.log(err);
		fs.writeFile('../../logs/port.txt',0,'utf8',function(err){
			if(err){
				console.log(err);
			}
			process.exit();
		})
	})
}
//save important data before quit
process.on( 'SIGINT', function() {
	exit();
})

