var fs = require('fs');
var formidable = require('formidable');
var shareFolder = require('../models/shareFolder');
var getFiles = require('../utils/getFiles');
var login_required = require('./user').login_required;

exports.index = function(app){
	//login_required(app);
	var user = app.getUser();
	if(!user.has_perm('shareFolder','view')){
		var notAllowPage = app.getTemplate('notAllow.html');
		var context = {
			content:notAllowPage,
			user:user.objects.getInfo(),
		}
		return app.render('base.html',context);
	}
	if(app.req.method.toLowerCase() == 'post'){
		//a flag to mark if this req is processed already
		var form = new formidable.IncomingForm();
		form.parse(app.req,function(err,field,files){
			var filename = field.filename;
			var pathList = JSON.parse(field.pathList);
			if(pathList.length == 0){
				var filePath = field.filePath;
				var myFolders = new shareFolder(app);
				var folders = myFolders.objects.all();
				var returnFlag = false;
				folders.forEach(function(folder){
					if(filePath == folder.getPath()){
						var pathList = JSON.parse(folder.folder);
						returnFlag = true;
						getFiles(filePath,'/'+folder.url+'/',function(fileList){
							return app.JSON({
								message:'OK',
								fileList:fileList,
								pathList:pathList,
							})
						})
					}
				})
				if(!returnFlag){
					console.log("hi there");
					var folderList = [];
					folders.forEach(function(folder){
						folderList.push(folder.objects.getInfo());
					})
					var pathList = [];
					return app.JSON({
						message:'OK',
						fileList:folderList,
						pathList:pathList, 
					})
				}
			}else{
				var returnFlag = false;
				var filePath = '';
				var myFolders = new shareFolder(app);
				var folders = myFolders.objects.all();
				folders.forEach(function(folder){
					var path = '';
					if(JSON.parse(folder.folder).length > pathList.length){
						return;
					}
					for(var count =0;count<JSON.parse(folder.folder).length;count++){
						path += pathList[count] + '/';
					}
					if(path == folder.getPath()){
						var fileUrl = '/' + folder.url + '/';
						pathList.push(filename);
						for(var count=0;count<pathList.length;count++){
							filePath += pathList[count]+'/';
							if(count>=JSON.parse(folder.folder)){
								fileUrl += pathList[count] + '/';
							}
						}
						//console
						console.log('filePath:',filePath);
						console.log('fileUrl',fileUrl);
						returnFlag = true;
						getFiles(filePath,fileUrl,function(fileList){
							return app.JSON({
								message:'OK',
								fileList:fileList,
								pathList:pathList,
							})
						})
					}
				})
				if(!returnFlag){
					//not found
					var folderList = [];
					folders.forEach(function(folder){
						folderList.push(folder.objects.getInfo());
					})
					var pathList = [];
					return app.JSON({
						message:'OK',
						fileList:folderList,
						pathList:pathList,
					})
				}
			}
		})
	}else{
		var myFolders = new shareFolder(app);
		var folders = myFolders.objects.all();
		var folderList = [];
		folders.forEach(function(folder){
			folderList.push(folder.objects.getInfo());
		})
		var pathList = [];
		var indexPage = app.getTemplate('index.html');
		var context = {
			content:indexPage,
			user:app.getUser().objects.getInfo(),
			permissions:user.getPermissions(),
			fileList:folderList,
			pathList:pathList,
			onDeletePage:true,
		}
		return app.render('base.html',context);
	}
};
