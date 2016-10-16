
var fs = require('fs');
var sqlite3 = require('sqlite3');


db = new sqlite3.Database('./jobsEvents.db');


// Database initialization
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='jobevents'",
	function(err, rows) {
	 	if (err !== null) {
	    	console.log(err);
	  	}
	  	else if(rows === undefined) {
	    	db.run(	'CREATE TABLE "jobs" ' +
	           	'("id" INTEGER PRIMARY KEY AUTOINCREMENT, ' +
	           	'"string" VARCHAR(10), ' +
	           	'"server" VARCHAR(7), ' +
	           	'"package" VARCHAR(100), ' +
	           	'"version" VARCHAR(10), ' +
	           	'"procedure" VARCHAR(50), ' +
	           	'"status" VARCHAR(7), ' +
				'"task" VARSCHAR(10), ' +
				'"activation" VARCHAR(19))'
	           , function(err) {
	      			if(err !== null) {
	        			console.log(err);
	     			}
	      			else {
	        			console.log("SQL Table 'jobs' initialized.");
	      			}
	    		}		
	    	);
	  	}
	  	else {
	    	console.log("SQL Table 'jobs' already initialized.");
	  	}
	}
);


var convert = function(index){
	var value = "";
	switch (index) {
		case 0:
			value = "Serveur Name";
			break;
		case 1:
			value = "Domaine Name";
			break;
		case 2:
			value = "Package"
			break;
		case 3:
			value = "Version"
			break;
		case 4:
			value = "Procedure"
			break;
		case 5:
			value = "Status"
			break;
		case 6:
			value = "Task"
			break;
		case 7:
			value = "Activation time"
			break;
	}
	return value;
};

var taille = new Map();
for (var i=0; i< 8; i++){
	taille.set(convert(i), 0);
};

var folder ='data';
		fs.readdir(folder, function(err, files){
			console.log(files);
			for (let afile of files){
				var result = afile.match(/_(\d\d)(\d\d)(\d\d)_/);
				var date = result[2] +'/' + String(parseInt(result[3]) - 1) + '/20' + result[1];
				console.log(date);

				var lineReader = require('readline').createInterface({
				 	input: fs.createReadStream('data/' + afile)
				});

				lineReader.on('line', function (line) {
					if (line.search(date) != -1){
						var item = line.split(',')
						for (var i=0; i< 8; i++){
							var element = convert(i);
							taille.set(element, Math.max(taille.get(element), item[i].length))
							sqlrequest = "INSERT INTO 'jobs' (string, server, package, version, procedure, status, tack, activation) " +
									"VALUES ('STE40', item[1], item[2], item[3], item[4], item[5], item[6], item[7])" 
						}
			  		}
				});

				lineReader.on('close', function(){
					console.log(taille);
				});
			};
		});
	


