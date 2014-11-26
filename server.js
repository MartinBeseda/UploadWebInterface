var http = require('http');
var fs = require('fs');
var path = require('path');
var util = require('util');
var formidable = require('formidable');

http.createServer(function(req, res) { // request, response
	console.log( 'Req method: ' + req.method + ' , URL: ' + req.url );

	//-----------------------//-------------------------------------------------------------------------------------
	//--- UPLOAD handling ---//
	//-----------------------//
	if (req.url == '/upload' && req.method.toLowerCase() == 'post') {
		var form = new formidable.IncomingForm();

		form.parse(req, function(err, fields, files) {
			if (err) throw err;

			fs.readFile( files.filepath.path, function (err, data) {
				if (err) throw err;
				
				var fileName = files.filepath.name;
				fs.writeFile( __dirname + '/uploadedFiles/' + fileName, data, function (err) {
					if (err) throw err;
					
					//-----------------------------------------------//---------------------------------------------
					//--- LOAD and APPEND external JSON file with ---//
					//--- data from request                       ---//
					//-----------------------------------------------//
					var jsonObj = require('./storedFilesList.json');

					jsonObj[fileName] = {size:files.filepath.size, expDate:'', path:__dirname + '/uploadedFiles/' + fileName, password:'', showInSearch:'true'};
					
					var jsonString = JSON.stringify(jsonObj); // convert JSON obj to String
					
					fs.writeFile('storedFilesList.json', jsonString, function(err){
						if (err) throw err;
						console.log('File ' + fileName + ' was succesfully written to JSON ext file.');
					});
					
					console.log('File ' + fileName + ' was succesfully saved.');
				});
			});

			res.writeHead(200, {'content-type': 'text/plain'});
			res.write('OK');
			res.end( util.inspect({fields: fields, files: files}) );
		});

		return;
	}
	
	//-----------------------//-------------------------------------------------------------------------------------
	//--- DELETE handling ---//
	//-----------------------//
	if (req.url == '/delete' && req.method.toLowerCase() == 'post') {
		
		req.on('data', function (data) {
	        var filename = data.toString('ascii');
	        
			var jsonObj = require('./storedFilesList.json');
			
			delete jsonObj[filename];
			
			var jsonString = JSON.stringify(jsonObj);

			fs.writeFile('storedFilesList.json', jsonString, function(err){
				if (err) throw err;
				
				fs.unlinkSync(__dirname + '/uploadedFiles/' + filename);

				console.log('File ' + filename + ' was succesfully deleted.');
				
			});
	        
			res.writeHead(200, {'content-type': 'text/plain'});
			res.write('OK');
			res.end();
			
	    });
		

		
		return;
	}
	
	//----------------------//--------------------------------------------------------------------------------------
	//--- ADDING DETAILS ---//
	//----------------------//	
	if (req.url == '/addDetails' && req.method.toLowerCase() == 'post') {
		req.on('data', function (data) {
			var dataArr = data.toString('ascii').split(';');
			var filename = dataArr[0];
			var passwd = dataArr[1];
			var eDate = dataArr[2];
			var show = dataArr[3];
			
			console.log(dataArr);

			var jsonObj = require('./storedFilesList.json');
			//console.log(filename);
			//console.log(jsonObj[filename]);

			jsonObj[filename].password = passwd;
			jsonObj[filename].expDate = eDate;
			jsonObj[filename].showInSearch = show;			
			
			fs.writeFile('storedFilesList.json', JSON.stringify(jsonObj), function(err){
				if (err) throw err;
				
				console.log('Details succesfully added.');
				
				res.writeHead(200, {'content-type': 'text/plain'});
				res.write('OK');
				res.end();
			});
			

		});
		
		return;
	}
	
	//---------------------------//---------------------------------------------------------------------------------
	//--- Source code loading ---//
	//---------------------------//
	var filePath = '.' + req.url;
	if (filePath == './')
		filePath = './index.html';
	if (filePath.indexOf('/../') !== -1) {
		res.writeHead(400);
		res.end();
	} else {
		var extname = path.extname(filePath);
		var contentType = 'text/plain';
		switch (extname) {
			case '.js': contentType = 'text/javascript'; break;
			case '.html': contentType = 'text/html'; break;
			case '.css': contentType = 'text/css'; break;
			case '.svg': contentType = 'image/svg+xml'; break;
			case '.json': contentType = 'application/json'; break;
		}
		fs.exists(filePath, function(exists) {
			if (exists) {
				fs.readFile(filePath, function(error, content) {
					if (error) {
						res.writeHead(500);
						res.end();
					} else {
						res.writeHead(200, { 'Content-Type': contentType });
						res.write(content, 'utf-8');
						res.end();
					}
				});
			} else {
				res.writeHead(404);
				res.end();
			}
		});
	}

}).listen(8123);

console.log('Server running at http://127.0.0.1:8123/');
