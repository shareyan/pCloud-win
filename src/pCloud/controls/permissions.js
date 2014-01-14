var formidable = require('formidable');
var User = require('../models/user').User;

var Permissions = function(app){
	var user = app.getUser();
	if(!user.is_superuser){
		var content = app.getTemplate('notAllow.html');
		var context = {
			content:content,
		}
		return app.render('base.html',context);
	}
	if(app.req.method.toLowerCase() == 'post'){
		var form = formidable.IncomingForm();
		form.parse(app.req,function(err,fields,files){
			var username = fields.username;
			var perm = fields.permission.substring(0,fields.permission.indexOf('_'));
			var myUser = new User(app);
			myUser = myUser.objects.get(username);
			if(myUser.has_perm('shareFolder',perm)){
				myUser.permissions.shareFolder[perm] = false;
			}else{
				myUser.permissions.shareFolder[perm] = true;
			}
			myUser.objects.save();
			return app.JSON({
				message:"OK",
			})
		})
	}else{
		var myUser = new User(app);
		var users = myUser.objects.all();
		var userList = [];
		users.forEach(function(user){
			var info = {
				is_superuser:user.is_superuser,
				username:user.name,
				view_sharefolder:user.has_perm('shareFolder','view'),
				change_sharefolder:user.has_perm('shareFolder','change'),
				delete_sharefolder:user.has_perm('shareFolder','delete'),
			}
			userList.push(info);
		})
		var content = app.getTemplate('admin.html');
		var context = {
			content:content,
			userList:userList,
		}
		return app.render('base.html',context);
	}
}

module.exports.Permissions = Permissions;