//------------------//
//----- CONFIG -----//
//------------------//
var url = '/upload';

var queue = [];
activeUploading = false;

$(document).ready(function(){
	$.fn.dndhover = function(options) {
		return this.each(function() {

			var self = $(this);
			var collection = $();

			self.on('dragenter', function(event) {
				if (collection.size() === 0) {
					self.trigger('dndHoverStart');
				}
				collection = collection.add(event.target);
			});

			self.on('dragleave', function(event) {
				/*
				 * Firefox 3.6 fires the dragleave event on the previous element
				 * before firing dragenter on the next one so we introduce a delay
				 */
				setTimeout(function() {
					collection = collection.not(event.target);
					if (collection.size() === 0) {
						self.trigger('dndHoverEnd');
					}
				}, 1);
			});
		});
	};

	$("#DragDropField").dndhover().on({

		'dndHoverStart': function(event) {
			if( !activeUploading ) {
				$(".dragdrop").css("background", "#ffff99");
			}
			event.stopPropagation();
			event.preventDefault();
			return false;
		},

		'dndHoverEnd': function(event) {
			if( !activeUploading ) {
				$(".dragdrop").css("background", "#ffffe5");
			}
			event.stopImmediatePropagation();
			event.preventDefault();
			return false;
		}
	});

	document.getElementById("DragDropField").ondrop = function(event) {
		console.log(event);
		console.log(activeUploading);
		event.stopImmediatePropagation();
		event.preventDefault();

		if( activeUploading ) {
			return;
		} else {
			activeUploading = true;
		}

		$(".dragdrop").css("background", "#ffffe5");
		$("#DragDropField").html("" +
				"<!-- CSS3 loading spinner -->" +
					"<div id=\"floatingCirclesG\">" +
						"<div class=\"f_circleG\" id=\"frotateG_01\"></div>" +
						"<div class=\"f_circleG\" id=\"frotateG_02\"></div>" +
						"<div class=\"f_circleG\" id=\"frotateG_03\"></div>" +
						"<div class=\"f_circleG\" id=\"frotateG_04\"></div>" +
						"<div class=\"f_circleG\" id=\"frotateG_05\"></div>" +
						"<div class=\"f_circleG\" id=\"frotateG_06\"></div>" +
						"<div class=\"f_circleG\" id=\"frotateG_07\"></div>" +
						"<div class=\"f_circleG\" id=\"frotateG_08\"></div>" +
					"</div>");

		//--------------//
		//--- UPLOAD ---//
		//--------------//
		var fileArray = event.dataTransfer.files;

		var file;
		var formData;
		var progressBarArray;
		for (var i = 0; i < fileArray.length; i++) {

			//-----------------------------//
			//--- CREATING PROGRESS BARS --//
			// ----------------------------//
			var wrapper = $('<div name="progressBarWrapperArray[]" class="progressBarWrapper"></div> ');
			var title = $('<div name="progressTitleArray[]" class="progress-title">File name unknown</div>');
			var pb = $('<div name="progressBarArray[]" class="progress">\
					<div class="progress-bar progress-bar-striped active" role="progressbar" aria-valuemin="0" aria-valuemax="100"></div>\
			</div>');

			wrapper.append(title);
			wrapper.append(pb);
			$("#ProgressBars").append(wrapper);

			//----------------------------------------//
			//--- GETTING FILE & CREATING FORM DATA --//
			//----------------------------------------//
			file = fileArray[i];
			formData = new FormData();
			formData.append('filepath', file, file.name);

			//----------------------//
			//--- STATEMENT DIVS ---//
			//-----------------------------------------------//
			//--- DIV WITH NOTICE ABOUT SUCCESSFUL UPLOAD ---//
			//-----------------------------------------------//
			var uploadSuccess = document.getElementById("UploadSuccess");
			uploadSuccess.style.display = 'none'

			//-----------------------------------------------------------//
			//--- WARNING WHEN NO FILE IS SELECTED - INITIALLY HIDDEN ---//
			//-----------------------------------------------------------//
			var warning = document.getElementById("Warning");
			warning.style.display = 'none';

			//----------------------------------//
			//--- PROGRESS BAR WRAPPER ARRAY ---//
			//----------------------------------//
			var progressBarWrapperArray = document.getElementsByName('progressBarWrapperArray[]');
			var wrapperArray = progressBarWrapperArray[i];

			//--------------------------//
			//--- PROGRESS BAR ARRAY ---//
			//--------------------------//
			progressBarArray = document.getElementsByName('progressBarArray[]');

			var backBar = progressBarArray[i];
			var bar = backBar.children[0];

			//------------------------------//
			//--- SET PROGRESS BAR TITLE ---//
			//------------------------------//
			var progressTitleArray = document.getElementsByName('progressTitleArray[]');
			var progressTitle = progressTitleArray[i];
			progressTitle.innerHTML = file.name;

			//----------------------------//
			//--- PUSH DATA INTO QUEUE ---//                    
			//----------------------------//
			var data = [ queue, formData, url, null, uploadSuccess, warning, progressBarWrapperArray, progressBarArray, progressTitleArray, bar, backBar, progressTitle ];
			queue.push(data);

		}

		//------------------------//
		//--- REQUEST HANDLING ---//                    
		//------------------------//
		var data = queue.shift();
		requestHandle(1, data );
	}

//	---------------------------------------------------------------------------------//
//	--- IMPORTANT! This function prevents the browser from just copying  the file ---//
//	---------------------------------------------------------------------------------//
	document.getElementById("DragDropField").ondragover = function(event) {
		event.preventDefault();
	}
});