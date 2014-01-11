var http = require('http');
var url = require('url');
var fs = require('fs');

var filename = "";
function download(myurl,cb){
	if(myurl.indexOf("http://") != 0){
		myurl += "http://";
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
	  var target = fs.createWriteStream('./updates/'+filename,{flags:'w+'});
	  var totalSize = 0;
	  target.on('error',function(err){
		console.log(err);
	  })
	  res.pipe(target);
	  res.on('data',function(chunk){
		totalSize += chunk.length;
		console.log(totalSize/1024+"K");
	  })
	  res.on('end', function() {
		console.log("end");
		cb(filename);
	  }).on('error',function(err){
		console.log(err);
	  })
	});	
}

download('http://pcloud.shareyan.cn/media/downloads/latest/GO!GO!MANIAC.mp3',function(filename){
	console.log(filename);
})