var RSVP = require('rsvp');
var fs = require('fs');
var sqlite3 = require("sqlite3").verbose();

// Add debug function 
var log = require('debug')('readJobsFile:log')
var info = require('debug')('readJobsFile:info')
var errorLog = require('debug')('readJobsFile:errorLog')

// Manage database
let dbFile = "./jobsEvents.db"

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
	// Get all job files
	fs.readdir(folder, function(err, files){
		// loop each files
		for (var afile of files){
			// Check if files is Software jobs
			if (afile.search('Software_Jobs_By') !== -1) {
				// Get date from  filename
				var result = afile.match(/_(\d\d)(\d\d)(\d\d)_/);
				
			 	//var date = result[2] +'/' + convertInt(result[3] - 1) + '/20' + result[1];
				var date = result[2] +'/' + convertInt(result[3]) + '/20' + result[1];

				log("Read file "+ afile + "   for date: "+ date);

				// handler of line reader
				var lineReader = require('readline').createInterface({
				 	input: fs.createReadStream(folder+'/' + afile)
				});

				// Line read Event
				lineReader.on('line', function (line) {
					if (line.search(date) != -1){
						info('date found: ' + date);
						var items = line.split(',');
						var elems = items[0].split('.'); 
						var time = items[7].split(' ');
						data.push({'filename':afile, 'string':elems[1], 'server':elems[0], 'package':items[2], 'version':items[3], 'procedure':items[4], 'status':items[5], 'tack':items[6], 'date':time[0], 'time':time[1] });
					}
				});

				// Close Event 
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
		// Create database if not exists
		if (!isDBExists) {
		 	db.run("CREATE TABLE jobs (string, server, package, version, procedure, status, tack, date, time, filename)");
		 }

		 var stmt = db.prepare("INSERT INTO jobs VALUES (?,?,?,?,?,?,?,?,?,?)");  
		 for (let items of values) {
		 	stmt.run(items['string'], items['server'], items['package'], items['version'], items['procedure'], items['status'], items['tack'], items['date'], items['time'], items['filename']);
		 }
		 stmt.finalize();
  
  		// Check id data is present and display
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


var isDBExists = fs.existsSync(dbFile);

if(!isDBExists) {
  console.log("Creating DB file.");
  fs.openSync(dbFile, "w");
}

var db = new sqlite3.Database(dbFile);


readJobsInventories.then(function(values){
	log("readJobsInventories successfully executed")
	info(values);
	log("update database");
	updateDatabase(values);

}).catch(function(error){
	error("Error during readJobsInventories")
});
