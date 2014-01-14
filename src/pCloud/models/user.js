var codes = require('../utils/code')

var User = function(app){
	if(typeof app == 'undefined'){
		console.log('please pass app here');
	}
	//model properties
	this.name = '';
	this.password = '';//encoded
	this.permissions = {
		shareFolder:{
			add:false,
			delete:false,
			change:false,
			view:false,
		},
		user:{
			delete:true,
			change:true,
		}
	};
	this.regtime = '';
	this.id = '';
	this.is_anonymous = false;
	this.is_superuser = false;
	
	//basic data
	this.userList = app.data.dataBase.userList;
	this.app = app;
	
	
	//begin methods
	this.setPassword = function(password){
		this.password = codes.hashEncode(password);
	}
	
	this.getPermissions = function(){
		if(this.is_superuser){
			var permissions = {
				shareFolder:{
					add:true,
					delete:true,
					change:true,
					view:true,
				},
				user:{
					delete:true,
					change:true,
				}
			};
			return permissions;
		}
		return this.permissions;
	}
	
	this.has_perm = function(target,operation){
		if(this.is_superuser){
			return true
		};
		if(typeof this.permissions[target] == 'undefined'){
			return false;
		}else{
			if(typeof this.permissions[target][operation] == 'undefined'){
				return false;
			}
			return this.permissions[target][operation];
		}
	}
	
	this.anonymousUser = function(){
		var userInfo = {
			name:"anonyous",
			password:"",
			permissions:"",
			regtime:0,
			id:0,
			is_anonymous:true,
			is_superuser:false,
		}
		return userInfo;
	}
	
	//bgin model methods
	
	this.objects = {};
	
	this.objects.getInfo = function(){
		var info = {
			name:this.name,
			password:this.password,
			permissions:this.permissions,
			regtime:this.regtime,
			id:this.id,
			is_anonymous:this.is_anonymous,
			is_superuser:this.is_superuser,
		}
		return info;
	}.bind(this);
	
	
	this.objects.save = function(){
		 //save change to memory, not disk
		 //check vaild
		 if(this.name == '' || this.password == ''){
			throw "user info not vaild";
		 }
		 //check exist
		 if(this.id == ''){
			//check name repeat
			if(this.objects.get(this.name) != ''){
				//name repeat
				throw "name repeat";
			}else{
				this.id = new Date().valueOf();//get time stamp as id
				this.regtime = new Date().valueOf();
				var info = this.objects.getInfo();
				//save to memory
				this.userList.push(info);
				return;
			}
		 }else{
			for(var user in this.userList){
				if(this.userList[user].name == this.name){
					this.userList[user] = this.objects.getInfo();
				}
			}
		 }
	}.bind(this);
	
	this.objects.toObj = function(userJson){
		var userObj = new User(this.app);
		userObj.id = userJson.id;
		userObj.name = userJson.name;
		userObj.password = userJson.password;
		userObj.permissions = userJson.permissions;
		userObj.regtime = userJson.regtime;
		userObj.is_anonymous = userJson.is_anonymous;
		userObj.is_superuser = userJson.is_superuser;
		return userObj;
	}.bind(this);
	
	this.objects.all = function(callback){
		var resList = [];
		for(var user in this.userList){
			resList.push(this.objects.toObj(this.userList[user]));
		}
		return resList;
	}.bind(this);
	
	this.objects.get = function(name,raiseErr){
		for(var user in this.userList){
			if(this.userList[user].name == name){
				return this.objects.toObj(this.userList[user]);
			}
		}
		if(raiseErr){
			throw "user not found";
		}
		return '';
	}.bind(this);
	
	this.objects.delete = function(){
		for(var user in this.userList){
			if(this.userList[user].name = this.name){
				this.userList.splice(user,1);
			}
		}
	}.bind(this);
	
	this.objects.filter = function(type,value){
		var resList = [];
		for(var user in this.userList){
			if(this.userList[user][type] == value){
				resList.push(this.objects.toObj(this.userList[user]));
			}
		}
		return resList;
	}.bind(this);
}

exports.User = User;