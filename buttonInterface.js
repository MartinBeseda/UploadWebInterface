$(document).ready(function() {
	//------------------//
	//----- CONFIG -----//
	//------------------//
	var url = '/upload';

	var queue = []; // queue for uploaded items - synchronous upload is used

	//------------------//
	//--- ADD BUTTON ---//
	//------------------//
	$("#Add").click(function() {

		var intId = $("#inputFields div").length / 3;
		var fieldWrapper = $("<div id=\"field" + intId + "\" />");
		var fBody = $("<input type=\"file\" name=\"browsers[]\" class=\"browserElement\" value=\"Browse...\" \" />");

		var removeButton = $('<span class="removeButton glyphicon glyphicon-remove" ></span>');
		removeButton.click(function() {
			$(this).parent().remove();
		});

		var progressBar = $("<div name=\"progressBars[]\" id=\"ProgressBackBar" + intId + "\" class=\"progress\">\
				<div id=\"progressBar" + intId + "\" class=\"progress-bar progress-bar-striped active\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>\
		</div>");

		fieldWrapper.append(fBody);
		fieldWrapper.append(removeButton);
		fieldWrapper.append(progressBar);
		$("#InputFields").append(fieldWrapper);
	});

	//---------------------//
	//--- UPLOAD BUTTON ---//
	//---------------------//
	$("#Upload").click(function() {

		var $btn = $(this);
		$btn.button().button("loading");
		
		//-----------------------------------------------//
		//--- DIV WITH NOTICE AFTER SUCCESSFUL UPLOAD ---//
		//-----------------------------------------------//
		var uploadSuccess = document.getElementById("UploadSuccess2");
		uploadSuccess.style.display = 'none'

		//-----------------------------------------------------------//
		//--- WARNING WHEN NO FILE IS SELECTED - INITIALLY HIDDEN ---//
		//-----------------------------------------------------------//
		var warning = document.getElementById("Warning2");
		warning.style.display = 'none';

		var browserArray = document.getElementsByName('browsers[]'); // array of inputs

		//----------------------------------------------//
		//--- CHECK IF THERE ARE SOME FILES SELECTED ---//
		// ---------------------------------------------//
		if (browserArray.length === 0) {
			$btn.button("reset");
			warning.style.display = 'block';
			return;
		}

		var chosenFilesCount = 0;
		for (var i = 0; i < browserArray.length; i++) {
			if (browserArray[i].files.length != 0) {
				chosenFilesCount++;
			}
		}

		if (chosenFilesCount === 0) {
			$btn.button("reset");
			warning.style.display = 'block';
			return;
		}

		//-----------------------------------------//
		//--- CHECK IF BROWSER SUPPORTS FileAPI ---//
		// ----------------------------------------//
		var fileApiSupported = !!(window.File && window.FileReader && window.FileList && window.Blob);
		if (!fileApiSupported) {
			alert('Your browser is not supported!');
			return;
		}

		var progressBarArray = document.getElementsByName('progressBars[]'); // array of progress bars for inputs

		var formData;
		var file;
		var backBar;
		var bar;
		for (var i = 0; i < browserArray.length; i++) {
			file = browserArray[i].files[0];
			backBar = progressBarArray[i]; // background of loadbar
			bar = backBar.children[0]; // "colourful part" in loadbar

			//------------------------------------------------// 
			//--- CHECK IF FILE INPUT ELEMENT IS NOT EMPTY ---//
			// -----------------------------------------------//
			if (file) {
				formData = new FormData();
				formData.append('filepath', file, file.name);

				//----------------------------//
				//--- PUSH DATA INTO QUEUE ---//                    
				//----------------------------//
				var data = [queue, formData, url, $btn, uploadSuccess, warning, null, progressBarArray, null, bar, backBar, null];
				queue.push(data);

			}

		}

		//------------------------//
		//--- REQUEST HANDLING ---//                    
		//------------------------//
		var data = queue.shift();
		requestHandle( 2, data );
	});
});
