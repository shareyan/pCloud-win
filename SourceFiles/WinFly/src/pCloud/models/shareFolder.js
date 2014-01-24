var fs = require('fs');

//model only store data, data get from other functions
var ShareFolder = function(app){
	//model properties
	this.folder = "";
	this.url = "";
	this.id = "";
	this.name = "";
	this.path = "";
	this.ctime = "";
	this.mtime = "";
	this.size = "";
	this.isFile = "";
	//base data
	this.app = app;
	this.shareFolderList = app.data.dataBase.shareFolderList;
	
	//methods
	this.getPath = function(){
		var pathList = JSON.parse(this.folder);
		var newPath = '';
		for(var path in pathList){
			newPath += pathList[path] + '/';
		}
		return newPath;
	}
	
	
	//model methods
	
	this.objects = {};
	
	this.objects.getInfo = function(){
		var info = {
			folder:this.folder,
			url:this.url,
			id:this.id,
			name:this.name,
			path:this.path,
			ctime:this.ctime,
			mtime:this.mtime,
			size:this.size,
			isFile:this.isFile,
		}
		return info;
	}.bind(this);
	
	this.objects.save = function(cb){
		//check valid
		if(this.folder == "" || this.url == ""){
			console.log("folder not valid");
			return;
		}
		if(this.id == ""){	
			var pathList = JSON.parse(this.folder);
			filename = pathList[pathList.length - 1];
			this.id = new Date().valueOf();
			this.name = filename;
			this.path = this.getPath();
			var that = this;
			fs.stat(this.getPath(),function(err,stat){
				that.ctime = stat.ctime.valueOf();
				that.mtime = stat.mtime.valueOf();
				that.size = stat.size;
				that.isFile = stat.isFile()+'';
				var info = that.objects.getInfo();
				that.shareFolderList.push(info);
				cb();
			})
		}else{
			var pathList = JSON.parse(this.folder);
			filename = pathList[pathList.length - 1];
			this.name = this.filename;
			this.path = this.getPath();
			var info = this.objects.getInfo();
			for(var folder in this.shareFolderList){
				if(this.id == this.shareFolderList[folder].id){
					this.shareFolderList[folder] = info;
					return;
				}
			}
			cb();
			console.warn("save shareFolder failed");
		}
	}.bind(this);
	
	this.objects.toObj = function(info){
		var myFolder = new ShareFolder(this.app);
		myFolder.folder = info.folder;
		myFolder.id = info.id;
		myFolder.url = info.url;
		myFolder.name = info.name;
		myFolder.path = info.path;
		myFolder.ctime = info.ctime;
		myFolder.mtime = info.mtime;
		myFolder.size = info.size;
		myFolder.isFile = info.isFile;
		return myFolder;
	}.bind(this)
	
	this.objects.all = function(){
		var resList = [];
		var that = this;
		this.shareFolderList.forEach(function(folder){
			resList.push(that.objects.toObj(folder));
		})
		return resList;
	}.bind(this);
	
	this.objects.filter = function(name,value){
		var resList = []
		var that = this;
		this.shareFolderList.forEach(function(folder){
			if(folder[name] == value){
				resList.push(that.objects.toObj(folder));
			}
		})
		return resList;
	}.bind(this);
	
	//this.objects.get = function(){}
	this.objects.delete = function(){
		for(var folder in this.shareFolderList){
			if(this.shareFolderList[folder].id == this.id){
				this.shareFolderList.splice(folder,1);
				return;
			}
		}
		console.warn("delete failed");
	}.bind(this);
}

module.exports = ShareFolder;