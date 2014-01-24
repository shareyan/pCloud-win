var user = require('../controls/user');
var index = require('../controls/index');
var shareFolder = require('../controls/shareFolder');
var permissions = require('../controls/permissions');
var system = require('../controls/system');
var test = require('../controls/test');
var docs = require('../controls/docs');

module.exports = function(app){
	app.get('/',index.index);
	app.get('/register',user.register);
	app.get('/superUserReg',user.superUserReg);
	app.get('/login',user.login);
	app.get('/changePassword',user.changePassword);
	app.get('/getCode',user.getCode);
	app.get('/oa/SuperUserReg',user.oaSuperUserReg);
	app.get('/user/follow',user.follow);
	app.get('/user/sendPost',user.sendPost);
	app.get('/setShareFolder',shareFolder.setShareFolder);
	app.get('/admin',permissions.Permissions);
	app.get('/shutdown',system.shutdown);
	app.get('/del',system.delFile);
	app.get('/doc',docs.home);
	app.get('/whats-new',docs.newFeather);
	app.get('/getStarted',docs.getStarted);
	app.get('/manual',docs.manual);
	app.get('/community',docs.community);
	app.get('/license',docs.license);
	app.get('/about',docs.about);
	app.view();
}