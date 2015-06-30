window.console = window.console || function(t) {};
window.open = function(){ console.log('window.open is disabled.'); };
window.print = function(){ console.log('window.print is disabled.'); };
// Support hover state for mobile.
if (false) {
	window.ontouchstart = function(){};
}

/* For Bootstrap Initialize */
// initialize with defaults
$("#fileInput").fileinput();
$("#cssInput").fileinput();

window.onload = function () {
	if($('#ps-mode').val() == 'preview'){
		preveiw();
	}

	/*Reset the color of buttons generated from bootstrap-select*/ 
	$('.bootstrap-select >button').removeClass('btn-default').addClass('btn-primary');	

	/* Display selected md file in left textarea*/
	var fileInput = document.getElementById('ps-fileInput');
	var fileDisplayArea = document.getElementById('demo-notes');
	fileInput.addEventListener('change', function (e) {
		$('#ps-alert').hide();//$('#ps-alert').hide();
		$('#ps-alert >a').removeClass('btn-danger').removeClass('btn-success');
		var file = fileInput.files[0];
		var textType = /text.*/;
		if (file.type.match(textType)) {
			var reader = new FileReader();
			reader.onload = function (e) {
				fileDisplayArea.value = reader.result;
			};
			// console.log(file.name);
			reader.readAsText(file);
			$('#ps-title').val(file.name.substr(0,file.name.lastIndexOf('.')));
		} else {
			fileDisplayArea.value = '';
			$('#ps-title').val('');
			$('#ps-alert-content').html('<strong>Invalid File Type.</strong> Please Choose a text file !</a>');
			$('#ps-alert >a').addClass('btn-danger');
			$('#ps-alert').show();
		}
	});

	// Image
	$('#demo-notes-btn-6').click(function () {
		$('#ps-imageList >input:last').click();
		// $('#ps-image-'.concat($('#ps-imageNum').val())).click();
	});

	$('#ps-reset').click(function () {
		$('#ps-alert').hide();//$('#ps-alert').hide();
		
		$('#ps-alert >a').removeClass('btn-danger').removeClass('btn-success');
		$('#ps-title').val('');
		$('#demo-notes').val('');
		$('#ps-style').selectpicker('val', 'HTML');// $('#ps-style').reset()
	});

	$('#ps-preview').click(function () {
		$('#ps-alert').hide();//$('#ps-alert').hide();
		$('#ps-alert >a').removeClass('btn-danger').removeClass('btn-success');
		if (isConvertable()) {
			convert('preview');
		}
	});

	$('#ps-export-md').click(function(event) {
		if($('#demo-notes').val() !=''){
			var blob = new Blob([$('#demo-notes').val()], {type: "text/plain;charset=utf-8"});
			saveAs(blob, ($('#ps-title').val()|| 'content') + ".md");
		}
	});

	$('#ps-export-html').click(function(event) {
		$('#ps-alert').hide();
		$('#ps-alert >a').removeClass('btn-danger').removeClass('btn-success');
		if (isConvertable()) {
			convert('export');
		}
	});
};

function image(el){
	/*  Handler for onchange() of every #ps-imageList >input 
		The last input is invoke, if Image button on tool bar is clicked. 
		If an image is selected, i.e. input is changed, then this function is called.
	    - call markUp to insert image phas in #demo-notes
	    - append a new input[file] for next upload image
	*/
	markUp(6, "#demo-notes");

	var iNewIndex = +$('#ps-imageNum').val()+1;
	var iNewContent = "<input type='file' id='ps-image-"+iNewIndex+ "' name='ps-image-"+iNewIndex+ "' onchange='image(this)' accept='image/*' />";
	$('#ps-imageList').append(iNewContent);
	$('#ps-imageNum').val(iNewIndex);
};

function isConvertable(){
	var alertInfo = '';

	/*Check if style is supported*/
	// var supported_style =["Slidy","Scroll","S5","CAScroll","HTML","Slide","List"]; // Init in Editor.php
	var radios = document.getElementById('ps-style');
	var style = radios.options[radios.selectedIndex].text; //console.log(style);
	if ($.inArray(style, supported_style) > -1) {//isSupport()
		var title = $('#ps-title').val();
		var contentMD = $('#demo-notes').val();
		if (title!=''){
			if(contentMD!=''){
				return true;
			}else{
				alertInfo = '<strong>Empty Content!</strong></a>';
			}
		} else{
			alertInfo = '<strong>Empty Title!</strong></a>';
		}
	} else{
		alertInfo = '<strong>Invalid Style !</strong></a>';
	};

	$('#ps-alert-content').html(alertInfo);
	$('#ps-alert >a').addClass('btn-danger');
	$('#ps-alert').show();
	return false;
};

function convert( mode)
{
	f = document.forms['authorInput'];
	f.elements.namedItem('ps-mode').value = mode;
	f.submit();
};

function preveiw(){
	var src = 'present.php';//document.getElementById('present').src;
	var src_def = "http://127.0.0.1:8000/PresentSystem/"
	if (src != src_def ){
		// alert("open "+src+" in a new window");
		// window.open(src, '_blank');
		document.getElementById('ps-previewPopup').src=src;
		$('#ps-previewPopup').bPopup({
			position: ['auto', 'auto']
		});
	} else {
		alert("Nothing is ready for preview");
	}

	$('#ps-previewPopup')[0].contentWindow.focus();
};

