var url = require('url');
var whiskers = require('whiskers');
var configs = require('../config/configs');
var User = require('../models/user').User;

exports.app = function app(req,res,data){
	this.req = req;
	this.res = res;
	this.routes = [];
	this.data = data;
	this.port = "";
	//set template
	this.templates = data.templates;
	this.header = {};
	this.resFlag = false;
	this.getTemplate = function(templateName){
		for(var temp in this.templates){
			if(this.templates[temp]['filename'] == 'views\\'+templateName){
				return this.templates[temp]['content']
			}
		}
		console.log('views\\'+templateName);
		console.log("Yuor templates are");
		for(var temp in this.templates){
			console.log(this.templates[temp]['filename']);
		}
		throw 'template not found in';
	}
	
	this.render = function(templateName,content){
		var temp = this.getTemplate(templateName);
		
		//add basic content
		if(typeof this.getUser().id != 'undefined'){
			content.user = this.getUser().objects.getInfo();
			content.permissions = this.getUser().getPermissions();
		}
		
		var html = whiskers.render(temp,content);
		this.addHeader("Content-Length",Buffer.byteLength(html, 'utf8'));
		this.addHeader("Content-Type","text/html;charset=utf8");
		this.res.writeHead(200,this.header);
		this.res.write(html);
		this.res.end();
	}
	
	this.JSON = function(data){
		var content = JSON.stringify(data);
		this.addHeader("Content-Length",Buffer.byteLength(content, 'utf8'));
		this.addHeader("Content-Type","application/json;charset=utf8");
		this.res.writeHead(200,this.header);
		this.res.write(content);
		this.res.end();
	}
	
	this.Text = function(data){
		this.addHeader("Content-Length",Buffer.byteLength(data, 'utf8'));
		this.addHeader("Content-Type","text/plain;charset=utf8");
		this.res.writeHead(200,this.header);
		this.res.write(data);
		this.res.end();
	}
	
	this.page404 = function(){
		var page404 = this.getTemplate('404.html');
		var context = {
			content:page404,
			user:this.getUser(),
		}
		var html = whiskers.render('base.html',context);
		this.addHeader("Content-Length",Buffer.byteLength(html, 'utf8'));
		this.addHeader("Content-Type","text/html;charset=utf8");
		this.res.writeHead(404,this.header);
		this.res.write(html);
		this.res.end();
	}
	
	this.view = function(){
		var pathname = url.parse(this.req.url).pathname;
		for(var myUrl in this.routes){
			if(pathname == this.routes[myUrl].url){
				this.resFlag = true;
				this.routes[myUrl].view(this);
			}
		}
		if(!this.resFlag){
			this.page404();
		}
	}
	
	this.redirect = function(location){
		if(configs.port != 80){
			location = 'http://' + configs.domainName + ':' + this.port+location;
		}
		this.addHeader('Location',location);
		this.res.writeHead(302,this.header);
		this.res.end();
	}
	
	this.get = function(myUrl,view){
		var routeInfo = {
			url:myUrl,
			view:view
		}
		this.routes.push(routeInfo);
	}
	
	
	this.addHeader = function(name,value){
		this.header[name] = value;
	}
	
	this.getCookies = function(){
		var cookies = {};
		var request = this.req;
		request.headers.cookie && request.headers.cookie.split(';').forEach(function(cookie) {
			var parts = cookie.match(/(.*?)=(.*)$/)
			cookies[ parts[1].trim() ] = (parts[2] || '').trim();
		});
		return cookies;
	}
	
	this.setCookies = function(name,value){
		var time = new Date();
		time.setTime(time.valueOf()+1000*86400*7);//cookie expires 7 days latter
		this.addHeader("Set-Cookie",name+'='+value+";Expires="+time.toUTCString()+";Path=/;"+'HttpOnly;');
	}
	
	this.delCookies = function(name){
		this.addHeader("Set-Cookie",name+'=delete'+";Expires=Thu, 01-Jan-1970 00:00:01 GMT;Path=/;"+';HttpOnly;');
	}
	
	//session and user related
	var appUser = {};
	this.session = {};
	
	this.setUser = function(user){
		//accept user obj and simple obj
		if(!(user instanceof User)){
			var myUser = new User(this);
			myUser = myUser.objects.toObj(user);
		}else{
			var myUser = user;
		}
		//add user to app, and info to session
		appUser = myUser;
		this.session.user = myUser.objects.getInfo();
		this.session.objects.save();
	}
	this.getUser = function(){
		return appUser;
	}
}