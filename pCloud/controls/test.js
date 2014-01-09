function test(app){
	var content = app.getTemplate('test.html');
	var context = {
		content:content,
	}
	return app.render('base.html',context);
}

module.exports = test;