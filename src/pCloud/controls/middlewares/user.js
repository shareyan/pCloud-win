var User = require('../../models/user').User;
var url = require('url');

var checkSuperUser = function(app){
	var urlInfo = url.parse(app.req.url);
	if(app.req.method == 'POST')return;//only redirect get req
	if(urlInfo.pathname == '/superUserReg' || urlInfo.pathname == '/oa/SuperUserReg' || urlInfo.pathname == "/favicon.ico"){
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