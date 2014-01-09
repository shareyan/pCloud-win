var formidable = require('formidable');
var getFiles = require('../utils/getFiles');
var ShareFolder = require('../models/shareFolder');

var setShareFolder = function(app){
	var user = app.getUser();
	if(!user.has_perm('shareFolder','change')){
		var notAllowPage = app.getTemplate('notAllow.html');
		var context = {
			content:notAllowPage,
			user:user.objects.getInfo(),
		}
		console.log(user.objects.getInfo());
		return app.render('base.html',context);
	}
	if(app.req.method.toLowerCase() =='post' ){
		var form = formidable.IncomingForm();
		form.parse(app.req,function(err,fields,files){
			var action = fields.action;
			var pathList = JSON.parse(fields.pathList);
			if(action == 'openFolder'){
				var filename = fields.filename;
				if(filename == '/'){
					getFiles('/','',function(fileList){
						var pathList = [];
						return app.JSON({
							fileList:fileList,
							pathList:pathList,
						})
					})
				}else{
					var filePath = '';
					var fileUrl = '';
					pathList.push(filename);
					pathList.forEach(function(path){
						filePath += path + '/';
						fileUrl += path + '/';
					})
					getFiles(filePath,fileUrl,function(fileList){
						return app.JSON({
							fileList:fileList,
							pathList:pathList,
						})
					})
				}
			}
			if(action == 'add'){
				var pathList = JSON.parse(fields.pathList);
				if(pathList.length == 0){
					var myFolders = new ShareFolder(app);
					var folders = myFolders.objects.all();
					var folderList = [];
					folders.forEach(function(folder){
						folderList.push(folder.objects.getInfo());
					})
					return app.JSON({
						message:'OK',
						addedFolders:folderList,
					})
				}else{
					var myFolder = new ShareFolder(app);
					var folders = myFolder.objects.filter('folder',JSON.stringify(pathList));
					if(folders.length != 0){
						return app.JSON({
							message:"Error",
							reason:"repeated",
						})
					}
					var newFolder = new ShareFolder(app);
					newFolder.folder = JSON.stringify(pathList);
					newFolder.url = "share/"+new Date().valueOf();
					newFolder.objects.save(function(){
						//add to staticList
						//return shareFolder data
						var folderList = [];
						var myFolder = new ShareFolder(app);
						var folders = myFolder.objects.all();
						folders.forEach(function(folder){
							folderList.push(folder.objects.getInfo());
						})
						return app.JSON({
							message:"OK",
							addedFolders:folderList,
						})
					});
				}
			}
			if(action == 'del'){
				var myFolder = new ShareFolder(app);
				var folders = myFolder.objects.all();
				folders.forEach(function(folder){
					var path = fields.path;
					if(folder.getPath() == path){
						//delete models 
						//change static files
						folder.objects.delete();
						//return folder data
						var myFolder = new ShareFolder(app);
						var folders = myFolder.objects.all();
						var folderList = [];
						folders.forEach(function(folder){
							folderList.push(folder.objects.getInfo());
						})
						return app.JSON({
							message:"OK",
							addedFolders:folderList,
						})
					}
				})
				return app.JSON({
					message:"Error",
					reason:"notFound",
				})
			}
		})
	}else{
		var myFolder = new ShareFolder(app);
		var folders = myFolder.objects.all();
		var folderList = [];
		folders.forEach(function(folder){
			folderList.push(folder.objects.getInfo());
		})
		getFiles('/','',function(fileList){
			var pathList = [];
			var shareFolderPage =  app.getTemplate('setFolder.html');
			var context = {
				content:shareFolderPage,
				user:app.getUser(),
				permissions:user.permissions,
				addedFolders:folderList,
				fileList:fileList,
				pathList:pathList,
				onDeletePage:false,
			}
			return app.render('base.html',context);
		})
	}
}

module.exports.setShareFolder = setShareFolder;