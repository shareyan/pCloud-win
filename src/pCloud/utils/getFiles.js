var spawn = require('child_process').spawn;
var fs = require('fs');

function getPartitions(cb){
	var cmd = spawn('C:\\WINDOWS\\system32\\cmd.exe');
	var data = "";
	var errorInfo = "";
	cmd.stdout.on('data', function (chunk) {
		data += chunk;
	});
	
	cmd.stderr.on('data', function (chunk) {
		errorInfo += chunk;
	});

	cmd.on('error',function(error){
		console.log(error);
	})
	
	cmd.on('close', function (code) {
		data = data.substring(data.indexOf("Name"));
		var res = data.split('\r\r\n');
		var target = [];
		res.forEach(function(part){
			if(part.indexOf(':') != -1 && part.indexOf('\n') == -1){
				try{
					fs.readdirSync(part.substring(0,part.indexOf(':')+1));
					target.push(part.substring(0,part.indexOf(':')+1));
				}catch(e){
					console.log('not a vailable disk');
				}
			}
		})
		cb(target);
	});
	cmd.stdin.write("wmic logicaldisk get name\n");
	cmd.stdin.end();
}

function getFiles(path,url,cb){
	if(path == '/'){
		getPartitions(function(partitionList){
			var fileList = [];
			for(var part in partitionList){
				now = new Date().valueOf();
				var info = {
					name:partitionList[part],
					url:'',
					ctime:now,
					mtime:now,
					path:partitionList[part],
					isFile:'false',
					size:0,
				}
				fileList.push(info);
			}
			cb(fileList);
		})
	}else{
		var fileList = [];
		fs.readdir(path,function(err,files){
			if(err){
				cb([]);
				return;
			}
			files.forEach(function(filename){
				fs.stat(path+filename,function(err,stat){
					if(err){
						//encountered privilege problems
						var fileInfo = {
							name:filename,
							path:path+filename,
							ctime:new Date().valueOf(),
							mtime:new Date().valueOf(),
							size:0,
							isFile:true,
							url:url+filename,
						}
						fileList.push(fileInfo);
						if(fileList.length == files.length){
							cb(fileList);
						}
						return;
					}
					var fileInfo = {
						name:filename,
						path:path+filename,
						ctime:stat.ctime.valueOf(),
						mtime:stat.mtime.valueOf(),
						size:stat.size,
						isFile:stat.isFile(),
						url:url+filename,
					}
					fileList.push(fileInfo);
					if(fileList.length == files.length){
						cb(fileList);
					}
				})
			})
		})
	}
}

module.exports = getFiles