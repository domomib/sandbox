var RSVP = require('rsvp');
var fs = require('fs');
var sqlite3 = require("sqlite3").verbose();

// Add debug function 
var log = require('debug')('toto:log')
var info = require('debug')('toto:info')
var errorLog = require('debug')('toto:errorLog')
/*var convert = function(index){
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
};*/

// Manage database
let dbFile = "./jobsEvents.db"
var isDBExists = fs.existsSync(dbFile);

if(!isDBExists) {
  console.log("Creating DB file.");
  fs.openSync(dbFile, "w");
}
var db = new sqlite3.Database(dbFile);

var convertInt = function(int){
	var a = String(parseInt(int));
	if (int < 10){
		a = '0' + a;
	}
	return a;
}
// Read folder data jobs inventories 
var folder ='data';

var readJobsInventories = new RSVP.Promise(function (resolve, reject){
	var data = [];
	fs.readdir(folder, function(err, files){
		for (var afile of files){
			if (afile.search('Software_Jobs_By') !== -1) {

				var result = afile.match(/_(\d\d)(\d\d)(\d\d)_/);
				var date = result[2] +'/' + convertInt(result[3] - 1) + '/20' + result[1];

				log("Read file "+ afile + "   for date: "+ date);

				var lineReader = require('readline').createInterface({
				 	input: fs.createReadStream(folder+'/' + afile)
				});

				lineReader.on('line', function (line) {

					if (line.search(date) != -1){
						console.log(line);
						var item = line.split(',');
						var elems = item[0].split('.'); 
						var time = item[7].split(' ');
						data.push({'filename':afile, 'string':elems[1], 'server':elems[0], 'package':item[2], 'version':item[3], 'procedure':item[4], 'status':item[5], 'tack':item[6], 'date':time[0], 'time':time[1] });
					}
				});

				lineReader.on('close', function(){
					log("List data provide to database");
					log(data);
					resolve(data);
				});
			}
		}
	});
});


var updateDatabase = function(values){
	log("Updating database in progress....");
	db.serialize(function () {
		if (!isDBExists) {
		 	db.run("CREATE TABLE jobs (string, server, package, version, procedure, status, tack, date, time, filename)");
		 }

		 var stmt = db.prepare("INSERT INTO jobs VALUES (?,?,?,?,?,?,?,?,?,?)");  
		 for (let items of values) {
		 	stmt.run(items['string'], items['server'], items['package'], items['version'], items['procedure'], items['status'], items['tack'], items['date'], items['time'], items['filename']);
		 }
		 stmt.finalize();
  
		db.each("SELECT * FROM jobs", function (err, row) {
	    	if (err ===null){
	    		log(row);
	    	}
	    	else {
	    		log("no data found")
	    	}
	  	});
	  	log("Database updated!");

	});
	//db.close();
	
};

readJobsInventories.then(function(values){
	log("readJobsInventories successfully executed")
	//info(values);
	log("update database");
	updateDatabase(values);

}).catch(function(error){
	error("Error during readJobsInventories")
});
