function home(app){
	var html = app.getTemplate('home.html');
	var context = {
		content:html,
		title:"主页",
		homeClass:'active',
	}
	return app.render('base-doc.html',context);
}

function newFeather(app){
	var html = app.getTemplate('new.html');
	var context = {
		content:html,
		title:"新功能",
		whatsNewClass:'active',
		header:"<div class='jumbotron jumbotron-ad hidden-print' style='color:white;'>"+
				  "<div class='container'>"+
					"<h1><i class='fa fa-lightbulb-o'></i>&nbsp; 新功能</h1>"+
					"<p>最新版本添加了哪些新的功能？ —— pCloud 1.0.2a</p>"+
				  "</div>"+
				"</div>",
	}
	return app.render('base-doc.html',context);
}

function getStarted(app){
	var html = app.getTemplate('getStarted.html');
	var context = {
		content:html,
		title:"开始使用",
		body:"data-spy=\"scroll\" data-target=\".bs-sidebar\"",
		getStartedClass:'active',
		header:"<div class='jumbotron jumbotron-ad hidden-print' style='color:white;'>"+
				  "<div class='container'>"+
					"<h1><i class='fa fa-rocket'></i>&nbsp; 开始使用</h1>"+
					"<p>想要把自己的电脑变成私有云吗，赶快开始使用pCloud吧</p>"+
				  "</div>"+
				"</div>",
	}
	return app.render('base-doc.html',context);
}

function manual(app){
	var html = app.getTemplate('manual.html');
	var context = {
		content:html,
		title:"用户手册",
		body:"data-spy=\"scroll\" data-target=\".bs-sidebar\"",
		manualClass:'active',
		header:"<div class='jumbotron jumbotron-ad hidden-print' style='color:white;'>"+
				  "<div class='container'>"+
					"<h1><i class='fa fa-book'></i>&nbsp; 用户手册</h1>"+
					"<p>详细介绍pCloud的具体功能，想要更多的了解pCloud那就开始吧。</p>"+
				  "</div>"+
				"</div>",
	}
	return app.render('base-doc.html',context);
}

function community(app){
	var html = app.getTemplate('community.html');
	var context = {
		content:html,
		title:"社区",
		communityClass:'active',
		header:"<div class='jumbotron jumbotron-ad hidden-print' style='color:white;'>"+
				  "<div class='container'>"+
					"<h1><i class='fa fa-group'></i>&nbsp; 社区</h1>"+
					"<p>pCloud的社区</p>"+
				  "</div>"+
				"</div>",
	}
	return app.render('base-doc.html',context);
}

function license(app){
	var html = app.getTemplate('license.html');
	var context = {
		content:html,
		title:"版权协议",
		licenseClass:'active',
		header:"<div class='jumbotron jumbotron-ad hidden-print' style='color:white;'>"+
				  "<div class='container'>"+
					"<h1><i class='fa fa-legal'></i>&nbsp; 版权协议</h1>"+
					"<p>关于本软件版权的一些说明</p>"+
				  "</div>"+
				"</div>",
	}
	return app.render('base-doc.html',context);
}

function about(app){
	var html = app.getTemplate('about.html');
	var context = {
		content:html,
		title:"关于我们",
		html:"xmlns:'wb=\"http://open.weibo.com/wb\"'",
		head:"<script src='http://tjs.sjs.sinajs.cn/open/api/js/wb.js' type='text/javascript' charset='utf-8'></script>",
		aboutClass:"active",
		header:"<div class='jumbotron jumbotron-ad hidden-print' style='color:white;'>"+
				  "<div class='container'>"+
					"<h1><i class='fa fa-hand-o-right'></i>&nbsp; 关于我们</h1>"+
					"<p>介绍pCloud开发团队的信息</p>"+
				  "</div>"+
				"</div>",
	}
	return app.render('base-doc.html',context);
}

module.exports.home = home;
module.exports.newFeather = newFeather;
module.exports.getStarted = getStarted;
module.exports.manual = manual;
module.exports.community = community;
module.exports.license = license;
module.exports.about = about;