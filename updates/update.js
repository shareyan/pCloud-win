//main process
//1. get update file list
//2. download update files
//better not to include file outside
//copy another node.exe here
//formate update -v version -p portNum

process.chdir(__dirname);
var net = require('net');
var url = require('url');
var http = require('http');
var fs = require('fs');
var mkdirp = require('./mkdirp');
var rimraf = require('./rimraf');
var spawn = require('child_process').spawn;

//error process

var accessLog = fs.createWriteStream('./node.access.log', { flags: 'a' })
      , errorLog = fs.createWriteStream('./log.txt', { flags: 'a' });

// redirect stdout / stderr
process.__defineGetter__('stderr', function() { return errorLog });
process.__defineGetter__('stdout', function() { return accessLog });


//main process
var parms = processCmd();
update(parms.version,parms.port);



//process cmd commands get version num and port num
function processCmd(){
	if(process.argv.indexOf('-v') == -1){
		throw "version num is need";
	}
	if(process.argv.indexOf('-p') == -1){
		throw "port num is need";
	}
	var version = process.argv[process.argv.indexOf('-v')+1];
	var port = process.argv[process.argv.indexOf('-p')+1];
	var res = {
		version:version,
		port:port,
	}
	return res;
}


function update(version,port){
	getFileList(version,function(fileList){
		console.log(fileList);
		var tempList = [];
		for(var count =0;count<fileList.length;count++){
			if(fileList[count].indexOf('\\') == -1){
				//special char in the string
				//remove it from list
				tempList.push(fileList[count]);
			}
		}
		fileList = tempList;
		console.log(fileList);
		downloadCtr(fileList,function(){
			//stop main process
			send('fullExit',port,function(){
				//wait process to exit
				setTimeout(function(){
					//mv files
					console.log('updating files')
					var fileCount = 0;
					fileList.forEach(function(filePath){
						var orginPath = './tmp/'+filePath;
						var targetPath = '../'+filePath;
						var pathList = targetPath.split('/');
						pathList = pathList.slice(0,pathList.length-1);
						console.log(pathList.join('/'));
						if(deleteFileList.indexOf(filePath) != -1){
							//the file has been delete
							console.log('del:'+targetPath);
							rimraf(targetPath,function(err){
								if(err){console.log(err)};
								fileCount += 1;
								console.log('count:'+fileCount);
								console.log('fileList:'+fileList.length); 
								if(fileCount == fileList.length){
									//all file has been updated
									//restart main process
									console.log("start main process");
									spawn(__dirname+'/../src/WinFly.exe',[''],{
										cwd:__dirname+'/../src/',
									});
									//delete temp files
									rimraf('./tmp',function(err){
										if(err)console.log(err);
										setTimeout(function(){
											process.exit();
										},20000);
									})
								}
							})
						}else{
							mkdirp(pathList.join('/'),function(){
								//delete old files
								console.log('replace:'+targetPath);
								rimraf(targetPath,function(err){
									if(err)console.log(err);
									//mv new files
									fs.rename(orginPath,targetPath,function(err){
										if(err)console.log(err);
										fileCount += 1;
										console.log('count:'+fileCount);
										if(fileCount == fileList.length){
											//all file has been updated
											//restart main process
											console.log("start main process");
											spawn(__dirname+'/../src/WinFly.exe',[''],{
												cwd:__dirname+'/../src/',
											});
											//delete temp files
											rimraf('./tmp',function(err){
												if(err)console.log(err);
												//wait process start
												setTimeout(function(){
													process.exit();
												},20000);
											})
										}
									});
								})
							})
						}
					})
				},2000);
			});
		});
	})
}

//get the files need to be updated
var updateFileList = [];
function getFileList(version,cb){	
	get('pcloud.shareyan.cn/media/updates/'+version+'.json',function(data){
		if(data.message == 'OK'){
			data.fileList.forEach(function(filePath){
				//add to updateFileList,check repeat
				if(updateFileList.indexOf(filePath) == -1){
					updateFileList.push(filePath);
				}
			});
			if(typeof data.next != 'undefined'){
				//get next fileList
				console.log('get next:'+version);
				getFileList(data.next,cb);
			}else{
				//already the latest
				cb(updateFileList);
			}
		}
	})
}


//send get request
function get(myurl,cb){
	if(myurl.indexOf("http://") != 0){
		myurl = "http://" +myurl;
	}
	
	var get_options = {
		host: url.parse(myurl).host,
		port: '80',
		path: url.parse(myurl).pathname,
		method: 'GET',
	};
	var req = http.get(get_options, function(res) {
		var data = '';
		res.on('data',function(chunk){
			data += chunk;
		})
		res.on('end', function() {
			console.log("end");
			return cb(JSON.parse(data));
		}).on('error',function(err){
			var message = {
				message:'Error',
				reason:err
			}
			return cb(message);
		})
	})
}

//download a list of files
var downloadIndex = 0;
function downloadCtr(fileList,cb){
	download('pcloud.shareyan.cn/media/pcloud-latest/'+fileList[downloadIndex],'tmp/',function(filePath){
		downloadIndex += 1;
		//download complete 
		if(downloadIndex == fileList.length){
			cb();
			return;
		}
		//start a new download
		downloadCtr(fileList,cb);
	})
}


//send message to node socket server
function send(content,port,cb){
	var client = new net.Socket();
	client.connect(port, '127.0.0.1', function() {
		console.log('CONNECTED TO: ' + '127.0.0.1' + ':' + port);
		console.log('send:'+content);
		client.write(content);
	});
	client.on('data', function(data) {
		console.log('DATA: ' + data);
		if(typeof cb != 'undefined')cb(data);
		client.destroy();
	});
	client.on('close', function() {
		console.log('Connection closed');
	});
	client.on('error',function(err){
		console.log(err);
	})
}

//post data to http server
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


//download file name
var filename = "";
//files has been delete in the update
var deleteFileList = [];
function download(myurl,targetPath,cb){
	if(myurl.indexOf("http://") != 0){
		myurl = "http://" + myurl;
	}
	
	var get_options = {
		host: url.parse(myurl).host,
		port: '80',
		path: url.parse(myurl).pathname,
		method: 'GET',
	};
	
	//get filename
	var pathList = get_options.path.split('/')
	filename = pathList[pathList.length -1];
	console.log(filename);
	var req = http.get(get_options, function(res) {
		//redirect
		var data = "";
		if(res.statusCode == '302'){
		req.abort();
		console.log(res.headers.location);
		var redirect = download(res.headers.location,cb);
		return;
		}

		//write to file
		//mkdir if target path not exist
		console.log(pathList);
		pathList = pathList.slice(pathList.indexOf('pcloud-latest')+1,pathList.length-1);
		targetPath = targetPath + pathList.join('/')+'/';
		console.log('./'+targetPath);
		
		if(res.statusCode == '404'){
			//the file has been deleted
			req.abort();
			deleteFileList.push(pathList.join('/')+'/'+filename);
			return cb();
		}
		
		mkdirp('./'+targetPath, function (err) {
			if (err) console.error(err)
			var target = fs.createWriteStream('./'+targetPath+filename,{flags:'w+'});
			target.on('error',function(err){
				console.log(err);
			})
			target.on('finish',function(){
				return cb(filename);
			})
			
			var totalSize = 0;
			
			res.pipe(target);
			res.on('data',function(chunk){
				totalSize += chunk.length;
				console.log(totalSize/1024+"K");
			})
			res.on('end', function() {
				target.end();
				console.log("end");
			}).on('error',function(err){
				console.log(err);
			})
		});
	});	
}