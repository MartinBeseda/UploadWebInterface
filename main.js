$(window).on('load', function(){
	
	createStoredFilesTable();

	$('#storedFilesButton').click(function(){		

		createStoredFilesTable();
		
		$('#contentCont').css('border-color', '#3071a9');

		$('#UploadButton').hide();
		$('#DragDrop').hide();
		$('#storedFiles').show();
	});
	
	$('#uploadFilesButton').click(function(){
		
		$('#contentCont').css('border-color', '#F0AD4E');
		
		$('#storedFiles').hide();

		if ('draggable' in document.createElement('span')) {
			$("#UploadButton").hide();
			$("#DragDrop").show();
		} else {
			$("#DragDrop").hide();
			$("#UploadButton").show();
		}
	});
	
	$(".btn-group-vertical > .btn").click(function(){
	    $(this).addClass("active").siblings().removeClass("active");
	});
});