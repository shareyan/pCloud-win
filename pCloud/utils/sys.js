var querystring = require('querystring');
var http = require('http');
var https = require('https');
var url =  require('url')
var spawn = require('child_process').spawn;
var Code = require('../models/code');

function getIp(){
	var ipv4List = [];
	var ipv6List = [];
	var os=require('os');
	var ifaces=os.networkInterfaces();
	for (var dev in ifaces) {
		ifaces[dev].forEach(function(details){
			if (details.family=='IPv4' && !details.internal) {
				//ipv4 and not internal
				ipv4List.push(details.address);
			}
			if(details.family == 'IPv6' && details.address[0] == '2'){
				//ipv6 address not start with 2
				ipv6List.push(details.address);
			}
		});
	}
	if(ipv4List.length == 0){
		//no external ip, get internal ip instead
		for (var dev in ifaces) {
			ifaces[dev].forEach(function(details){
				if (details.family=='IPv4') {
					ipv4List.push(details.address);
				}
			});
		}
	}
	var goodIp = {
		ipv4:ipv4List,
		ipv6:ipv6List,
	}
	return goodIp;
}

function post(myurl,data,cb) {
	if(myurl.indexOf('http://') != 0){
		myurl = "http://" + myurl;
	}
  
	var post_data = querystring.stringify(data);

	// An object of options to indicate where to post to
	var post_options = {
		host: url.parse(myurl).host,
		port: '80',
		path: url.parse(myurl).pathname,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Content-Length': post_data.length,
		}
	};
	// Set up the request
	var data = ''
	try{
		var post_req = http.request(post_options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end',function(){
					cb(JSON.parse(data));
			})
		});
	}catch(e){
		var info = {
			message:"Error",
			reason:e,
		}
		cb(info);
	}
	post_req.on('error', function(e) {
		var info = {
			message:"Error",
			reason:e,
		}
		cb(info);
	})
		
	// post the data
	post_req.write(post_data);
	post_req.end();
}

function httpsPost(myurl,data,cb) {
	if(myurl.indexOf('https://') != 0){
		myurl = "https://" + myurl;
	}
  
	var post_data = querystring.stringify(data);

	// An object of options to indicate where to post to
	var post_options = {
		host: url.parse(myurl).host,
		port: '443',
		path: url.parse(myurl).pathname,
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			'Content-Length': post_data.length,
		}
	};
	// Set up the request
	var data = ''
	try{
		var post_req = https.request(post_options, function(res) {
			res.setEncoding('utf8');
			res.on('data', function (chunk) {
				data += chunk;
			});
			res.on('end',function(){
					cb(JSON.parse(data));
			})
		});
	}catch(e){
		var info = {
			message:"Error",
			reason:e,
		}
		cb(info);
	}
	post_req.on('error', function(e) {
		var info = {
			message:"Error",
			reason:e,
		}
		cb(info);
	})
		
	// post the data
	post_req.write(post_data);
	post_req.end();
}

function shutdown(){
	sd = spawn("C:\\Windows\\System32\\shutdown.exe",["/p"]);
	var data = "";
	var errorInfo = "";
	sd.stdout.on('data', function (chunk) {
		data += chunk;
	});
	
	sd.stderr.on('data', function (chunk) {
		errorInfo += chunk;
	});

	sd.on('error',function(error){
		console.log(error);
	})

	sd.on('close', function (code) {
	});
}

function delFile(filePath,cb){
	rm = spawn(__dirname+"/cmdutils/Recycle.exe",["-f",filePath]);
	var data = "";
	var errorInfo = "";
	rm.stdout.on('data', function (chunk) {
		data += chunk;
	});
	
	rm.stderr.on('data', function (chunk) {
		errorInfo += chunk;
	});

	rm.on('error',function(error){
		console.log(error);
	})

	rm.on('close', function (code) {
		if(typeof cb != 'undefined'){
			cb();
		}
	});
	
}




function updateIp(app){
	var myIp = getIp();
	//add port in myIp
	myIp.port = app.port;
	var myCode = new Code(app);
	var codes = myCode.objects.all();
	if(codes.length == 0){
		console.log('no code found,return');
		return
	}else{
		myCode = codes[0];
	}
	
	post('shareyan.cn/cloud',{
		ip:JSON.stringify(myIp),
		code:myCode.code,
		name:myCode.name,
	},function(data){
		if(data.message == 'OK'){
			console.log('message update success');
		}else{
			console.log("update error");
			console.log(data);
		}
	})
}

module.exports.getIp = getIp;
module.exports.post = post;
module.exports.shutdown = shutdown;
module.exports.delFile = delFile;
module.exports.updateIp = updateIp;
module.exports.httpsPost = httpsPost;