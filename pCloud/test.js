var spawn = require('child_process').spawn;

function delFile(filePath,cb){
	console.log(filePath);
	rm = spawn(__dirname + "/utils/cmdutils/Recycle.exe",["-f",filePath]);
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
	});
	if(typeof cb != 'undefined'){
		cb();
	}
}

delFile("D:/temp/test.js");