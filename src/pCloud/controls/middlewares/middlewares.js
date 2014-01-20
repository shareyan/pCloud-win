var Session = require('./session');
var checkSuperUser = require('./user').checkSuperUser;
module.exports = function(app){
	checkSuperUser(app);
	Session(app);
}