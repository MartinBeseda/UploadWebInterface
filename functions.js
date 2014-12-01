function createStoredFilesTable(){
	//$('#storedItemsTableWrapper').updatePolyfill();
	
	var jsonObj;
	$.getJSON('/storedFilesList.json').done(function( obj ){ // loading external JSON file with info about stored files
		$('#storedItemsTableWrapper').empty();
		jsonObj = obj;

		storedItemsContent='<table class="table table-striped">\
							<tr><th class="textLeft">File Name</th><th>Size (Bytes)</th><th colspan=\"5\"></th></tr>';
		
		$.each( obj, function(key, value){ // output: filename [object]
			storedItemsContent += '<tr><td class=\"textLeft\">' + key + '</td>';
			
			$.each( value, function( attr, val ){ // parsing '[object]' 
				switch(attr){
				case 'path':
					storedItemsContent += '<td><a href=\"/uploadedFiles/' + key + '\">Download</a></td>';
					break;
				case 'size':
					storedItemsContent += '<td>' + val + '</td>';
					break;
				case 'expDate':
					storedItemsContent += '<td class=\"hidden\"><input type=\"date\"value=\"' + val + '\"></input></td>';
					break;
				case 'password':
					storedItemsContent += '<td class=\"hidden\"><input type=\"password\" value=\"' + val + '\"></input></td>';
					break;
				case 'showInSearch':
					storedItemsContent += '<td class=\"hidden\"><input type=\"checkbox\" value=\"' + val + '\"></input></td>';
					break;
				}
			});
			
			storedItemsContent += '<td><a class=\"deleteLink\">Delete</a></td><td><a class=\"details\">Details</a></td></tr>';
		});
		
		storedItemsContent += '</table>';
		$('#storedItemsTableWrapper').append(storedItemsContent);
	}).done(function(){
		
		$('.deleteLink').click(function(event){
			var filename = event.target.parentNode.parentNode.children[0].innerHTML;

			delete jsonObj[filename];
			
			//-------------------------------------------------//
			//--- REQUEST WITH NAME OF A FILE TO BE DELETED ---//
			//-------------------------------------------------//
			var url = '/delete';
			
			var xhr = new XMLHttpRequest();
			
			xhr.onreadystatechange = function(){
				if(xhr.readyState == 4){
					if(xhr.status == 200){
						console.log('Delete OK.');
						createStoredFilesTable();
					} else {
						console.log('ERROR: ' + xhr.responseText + ' : ' + xhr.status);
					}
				}
			};
			xhr.open('POST', url, true);
			xhr.send(filename);
		})
		
		$('.details').click(function(event){
			$('.modal').modal('show');
			$('#modalPasswordSuccess').hide();					
			$('#modalPasswordWarning').hide();

			$('#modalDateInput').val(event.target.parentNode.parentNode.children[2].children[0].value);
			$('#modalPasswordInput').val(event.target.parentNode.parentNode.children[4].children[0].value);
			$('#modalShowCheckbox').prop('checked', (event.target.parentNode.parentNode.children[5].children[0].value == 'true'));
			
			console.log('checkbox: ' + event.target.parentNode.parentNode.children[5].children[0].value);
			console.log('checkbox: ' + typeof(event.target.parentNode.parentNode.children[5].children[0].value));
			console.log((event.target.parentNode.parentNode.children[5].children[0].value == 'true'));
			
			$('#modalButton').click(function(){
				if( $('#modalPasswordInput')[0].checkValidity() ) {
					$('#modalPasswordWarning').hide();
					var filename = event.target.parentNode.parentNode.children[0].innerHTML;
					var password = $('#modalPasswordInput').val();
					var expDate = $('#modalDateInput').val();
					var showInSearch = $('#modalShowCheckbox').prop('checked');
					
					var xhr = new XMLHttpRequest();
					
					xhr.onreadystatechange = function(){
						if(xhr.readyState == 4){
							if(xhr.status == 200){
								console.log('Adding details OK.');
								createStoredFilesTable();
								$('#modalPasswordSuccess').show();
							} else {
								console.log('ERROR: ' + xhr.responseText + ' : ' + xhr.status);
							}
						}
					};
					xhr.open('POST', '/addDetails', true);
					xhr.send(filename + ';' + password + ';' + expDate + ';' + showInSearch);
					
				} else {
					$('#modalPasswordWarning').show();
					$('#modalPasswordSuccess').hide();					
				}				
			});
		});
	});
}

function updateProgressBar( event, bar, backBar) {
    if ( event.lengthComputable ) {
        var completed = (event.loaded / event.total) * 100;

        backBar.style.display = 'block';

        bar.style.width = completed + "%";
        bar.innerHTML = parseInt(completed) + "%";

    } else {
        alert('Progress bar error!');
    }
}

/**
 * 1 interface 1 - drag&drop, 2 - upload by button
 *
 * Data below are all included in one parameter 'data'
 * 2 queue Queue for uploaded data - this macro uses synchronous upload
 * 3 formData Uploaded data - 'filepath', file, filename 
 * 4 url Where to upload files
 * 5 $btn Upload button - only used by interface 2!
 * 6 uploadSuccess Div with success notice
 * 7 warning Div with warning notice
 * 8 progressBarWrapperArray divs containing progressBarArray and progressTitleArray - only used by interface1!
 * 9 progressBarArray Array containing progress bars
 * 10 progressTitleArray Array containing titles above progress bars - only used by interface 1!
 * 11 bar Colourful part of progress bar
 * 12 backBar Background part of progress bar
 * 13 progressTitle Title containing filename staying above progress bar
 */
function requestHandle( interface, data ) {

    //------------------------------------------//
    //--- GETTING DATA FROM 'data' PARAMETER ---//
    //------------------------------------------//
    var queue = data[0];
    var formData = data[1];
    var url = data[2];
    var $btn = data[3];
    var uploadSuccess = data[4];
    var warning = data[5];
    var progressBarWrapperArray = data[6];
    var progressBarArray = data[7];
    var progressTitleArray = data[8];
    var bar = data[9];
    var backBar = data[10];
    var progressTitle = data[11];    

    if (interface != 1 && interface != 2) {
        alert('DEBUG: Unknown interface code!');
    }

    //alert(url);
    
    var req = new XMLHttpRequest();

    //------------------------//
    //--- WARNING MESSAGES ---//
    //------------------------//
    var noFileSelected = " You haven't selected any files to upload! ";
    var resourceNotFound = "Resource couldn\'t be found!";
    var internalServerError = "Internal server error!";

    //---------------------//
    // --- BIND LOADBAR ---//
    //---------------------//
    req.upload.onprogress = function(event) {
        updateProgressBar(event, bar, backBar)
    }

    req.onreadystatechange = function() {
        if (req.readyState == 4) {

            if (req.status == 200) {     // SUCCESS

                if (queue.length == 0) {
                    if (interface == 1) {      // drag drop interface
                        removeWrapperArray( progressBarWrapperArray );
                        document.getElementById("DragDropField").innerHTML = "Drag your attachments here";
                    } else {
                        $btn.button("reset");
                    }
                    
                    hideProgressBarArray( progressBarArray );
                    uploadSuccess.style.display = 'block';
                }

            } else if (req.status == 404) {
                warning.innerHTML = resourceNotFound;
                warning.style.display = 'block';
            } else if (req.status == 500) {
                warning.innerHTML = internalServerError;
                warning.style.display = 'block';
            } else {
                warning.innerHTML = req.status + ' : ' + req.statusText;
                warning.style.display = 'block';
            }

           var newData = queue.shift();
           if( newData ) {
               requestHandle( interface, newData );
           } else {
               activeUploading = false;
           }
        }
    }

    req.open('POST', url, true);
    req.send(formData);
}

function removeWrapperArray( wrapperArray ) { 
    var len = wrapperArray.length;
    for( var i = 0; i < len ; i++ ) {
        wrapperArray[0].remove();
    }
}

function switchInterface() {
    document.getElementById("DragDrop").style.display = 'none';
    document.getElementById("UploadButton").style.display = 'block';
}

function hideProgressBarArray( progressBarArray ) {
    var len = progressBarArray .length;
    for( var i = 0; i < len ; i++ ) {
        progressBarArray [i].style.display = 'none';
    }
}
