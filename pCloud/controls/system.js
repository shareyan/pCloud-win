var sys = require('../utils/sys');
var formidable = require('formidable');
var shareFolder = require('../models/shareFolder');
var fs = require('fs');
var getFiles = require('../utils/getFiles');

function shutdown(app){
	var user = app.getUser();
	if(!user.is_superuser){
		var content = app.getTemplate('notAllow.html');
		var context = {
			content:content,
		}
		return app.render('base.html',context);
	}
	var content = app.getTemplate('shutdown.html');
	var context = {
		content:content,
	}
	app.render('base.html',context);
	//save dataBase before shutdown
	var data = JSON.stringify(dataBase);
	fs.writeFile('../models/db',data,'utf8',function(err){
		return sys.shutdown();
	})
	
}

function delFile(app){
	var user = app.getUser();
	if(!user.has_perm('file','delete')){
		var content = app.getTemplate('notAllow.html');
		var context = {
			content:content,
		}
		app.render('base.html',context);
	}
	var form = new formidable.IncomingForm();
	form.parse(app.req,function(err,fields,files){
		var filename = fields.filename;
		var pathList = JSON.parse(fields.pathList);
		if(pathList.length == 0){
			app.resFlag = false;
			var filePath = fields.filePath;
			var myFolder = new shareFolder(app);
			var folders = myFolder.objects.all();
			folders.forEach(function(folder){
				if(filePath == folder.getPath()){
					app.resFlag = true;
					//delete file
					sys.delFile(filePath,function(){
						//delete records
						folder.objects.delete();
						var folderList = [];
						//there might be bugs
						var folders = myFolder.objects.all();
						folders.forEach(function(folder){
							folderList.push(folder.objects.getInfo());
						})
						return app.JSON({
							message:"OK",
							fileList:folderList,
							pathList:pathList,
						})
					});
				}
			})
			if(!app.resFlag){
				return app.JSON({
					message:'Error',
					reason:'notFound',
				})
			}
		}else{
			var myFolder = new shareFolder(app);
			var folders = myFolder.objects.all();
			var path = '';
			var filePath = '';
			app.resFlag = false;
			folders.forEach(function(folder){
				if(JSON.parse(folder.folder).length > pathList.length){
					return;
				}
				for(var count=0;count<JSON.parse(folder.folder).length;count++){
					path += pathList[count] +'/';
				}
				if(path == folder.getPath()){
					app.resFlag = true;
					var fileUrl = '/'+folder.url+'/';
					for(var count=0;count<pathList.length;count++){
						filePath += pathList[count]+'/';
						if (count != 0){
							fileUrl += pathList[count] + '/';
						}
					}
					sys.delFile(filePath+filename,function(){
						//update file info
						getFiles(filePath,fileUrl,function(fileList){
							return app.JSON({
								message:"OK",
								fileList:fileList,
								pathList:pathList,
							})
						})
					});
				}
			})
			if(!app.resFlag){
				return app.JSON({
					message:"Error",
					reason:"notFound",
				})
			}			
		}
	})
}

module.exports.delFile = delFile;
module.exports.shutdown = shutdown;