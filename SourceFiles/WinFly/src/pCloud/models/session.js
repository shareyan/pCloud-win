var codes = require('../utils/code');

function Session(app){
	//model properties
	this.id = '';//use first created timestamp as id
	this.user = {};
	this.sid = "";
	this.time = "";//last action time
	
	//basic data
	this.sessionList = app.data.dataBase.sessionList;
	this.app = app;
	
	//methods
	this.update = function(){
		this.time = new Date().valueOf();
		this.objects.save();
	}
	//model methods
	
	this.objects = {};
	
	this.objects.getInfo = function(){
		var info = {
			id:this.id,
			user:this.user,
			sid:this.sid,
			time:this.time,
		}
		return info;
	}.bind(this);
	
	this.objects.save = function(){
		if(typeof this.user.name == 'undefined'){
			console.warn('session  invaild');
			console.warn("id",this.id);
			console.warn("user",this.user);
		}
		if(this.id == ''){
			//create new session
			this.sid = codes.randomCodes();
			this.id = new Date().valueOf();
			this.time = new Date().valueOf();
			var info  = this.objects.getInfo();
			this.sessionList.push(info);
			//set cookie to header
			this.app.setCookies("sid",this.sid);
		}else{
			//find old session
			for(var session in this.sessionList){
				if(this.sid == this.sessionList[session].sid){
					var info = this.objects.getInfo();
					this.sessionList[session] = info;
					return;
				}
			}
			console.log(this);
			console.warn("session error");
		}
	}.bind(this);
	
	this.objects.toObj = function(info){
		var mySession = new Session(this.app);
		mySession.id = info.id;
		mySession.user = info.user;
		mySession.sid = info.sid;
		mySession.time = info.time;
		return mySession;
	}.bind(this);
	
	this.objects.get = function(sid,raiseErr){
		for(var session in this.sessionList){
			if(sid == this.sessionList[session].sid){
				return this.objects.toObj(this.sessionList[session]);
			}
		}
		if(raiseErr){
			console.warn("sessionList",this.sessionList);
			console.warn("sid",sid);
			console.warn("session not found");
			throw "session not found";
		}
	}.bind(this);
	
	this.objects.filter = function(sid){
		var resList = [];
		for(var session in this.sessionList){
			if(sid == this.sessionList[session].sid){
				resList.push(this.objects.toObj(this.sessionList[session]));
			}
		}
		return resList;
	}.bind(this);
	
}

exports.Session = Session;