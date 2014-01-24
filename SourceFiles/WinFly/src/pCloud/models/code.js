// define models

var Code = function(app){
	//model properties
	this.code = '';
	this.name = '';
	this.time = '';
	this.id = '';
	
	//basic data
	this.app = app;
	this.codeList = app.data.dataBase.codeList;
	
	//model methods
	
	this.objects = {};
	
	this.objects.getInfo = function(){
		var info = {
			code:this.code,
			name:this.name,
			time:this.time,
			id:this.id,
		}
		return info;
	}.bind(this);
	
	this.objects.save = function(){
		//check valid
		if(this.code == '' || this.name == ''){
			throw "code invalid";
		}else{
			//check repeat
			if(this.id == ''){
				if(this.objects.get(this.name) != ''){
					throw "name repeat";
				}
				this.time = new Date().valueOf();
				this.id = new Date().valueOf();
				var info = this.objects.getInfo();
				console.log('code',info);
				this.codeList.push(info);
			}else{
				for(var code in this.codeList){
					if(this.id == this.codeList[code].id){
						this.codeList[code] = this.objects.getInfo();
						return;
					}
				}
				throw "save code failed";
			}
		}
	}.bind(this);
	
	this.objects.toObj = function(info){
		var myCode = new Code(this.app);
		myCode.code = info.code;
		myCode.name = info.name;
		myCode.time = info.time;
		myCode.id = info.id;
		return myCode;
	}.bind(this);
	
	this.objects.all = function(){
		var ResList = [];
		for(var code in this.codeList){
			ResList.push(this.objects.toObj(this.codeList[code]));
		}
		return ResList;
	}.bind(this);
	
	this.objects.get = function(name,raiseErr){
		for(var code in this.codeList){
			if(this.codeList[code].name == name){
				return this.toObj(this.codeList[code]);
			}
		}
		if(raiseErr){
			throw "code not found";
		}
		return '';
	}.bind(this);

	this.objects.delete = function(){
		for(var code in this.codeList){
			if(this.codeList[code].id == this.id){
				this.codeList.splice(code,1);
				return;
			}
		}
		console.log("delete code error");
	}.bind(this);
}

module.exports =  Code;