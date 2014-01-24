var User = require('../../models/user').User;
var url = require('url');

var checkSuperUser = function(app){
	var urlInfo = url.parse(app.req.url);
	if(app.req.method == 'POST')return;//only redirect get req
	var passList = ['/superUserReg','/oa/SuperUserReg',"/favicon.ico",'/doc','/whats-new','/getStarted','/manual','/community','/license','/about'];
	if(passList.indexOf(urlInfo.pathname) != -1){
		return;
	}
	var myUser = new User(app);
	var superUser = myUser.objects.filter('is_superuser',true);
	if(superUser.length == 0){
		console.log('Redirected:'+urlInfo.pathname);
		return app.redirect('/superUserReg');
	}
}

module.exports.checkSuperUser = checkSuperUser;