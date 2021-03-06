var Session = require('../../models/session').Session
var User = require('../../models/user').User
var sys = require('../../utils/sys');

module.exports = function(app){
	//check cookie
	var cookies = app.getCookies();
	var mySession = new Session(app);
	if(typeof cookies.sid == 'undefined'){
		//new session
		//default anonymous user
		var myUser = new User(app);
		var myUser = myUser.anonymousUser()
		app.session = mySession;
		app.setUser(myUser);
		//play notify sound
		sys.playSound('new.wav');
	}else{
		//get session info
		var mySessionList = mySession.objects.filter(cookies.sid);
		if(mySessionList.length != 0){
			mySession = mySessionList[0];
			app.session = mySession;
			app.setUser(mySession.user);
		}else{
			//delete old session and start a new one;
			var myUser = new User(app);
			var myUser = myUser.anonymousUser()
			app.session = mySession;
			app.setUser(myUser);
			//play notify sound
			sys.playSound('new.wav');
		}
	}
	//update session time
	app.session.update();
}