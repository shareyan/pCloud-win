var key = "nvkdfn]pdpwY&Y32";
var crypto = require('crypto');

exports.encode = function encode(data,mykey){
	if(typeof mykey == 'undefined'){
		var cipher = crypto.createCipher('aes-256-cbc',key);
	}else{
		var cipher = crypto.createCipher('aes-256-cbc',mykey);
	}
	var crypted = cipher.update(data,'utf8','hex');
	crypted += cipher.final('hex');
	return crypted
}

exports.decode = function decode(data,mykey){
	if(typeof mykey == 'undefined'){
		var decipher = crypto.createDecipher('aes-256-cbc',key);
	}else{
		var decipher = crypto.createDecipher('aes-256-cbc',mykey);
	}
	var dec=decipher.update(data,'hex','utf8');
	dec += decipher.final('utf8');
	return dec;
}

exports.hashEncode = function(data){
	data = data + '';
	var hasher=crypto.createHash("md5");
	hasher.update(data);
	var hashmsg=hasher.digest('hex');
	return hashmsg;
}

exports.randomCodes = function(){
	var num = parseInt(10000000000000000000*Math.random());
	return exports.hashEncode(num+'');
}
