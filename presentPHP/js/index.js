window.console = window.console || function(t) {};
window.open = function(){ console.log('window.open is disabled.'); };
window.print = function(){ console.log('window.print is disabled.'); };
// Support hover state for mobile.
if (false) {
	window.ontouchstart = function(){};
}

window.onload = function () {
	if($('#ps-mode').val() == 'preview'){
		/*Show the preview iframe as popup*/
		document.getElementById('ps-previewPopup').src='present.php';
		$('#ps-previewPopup').bPopup({
			position: ['auto', 'auto']
		});
		$('#ps-previewPopup')[0].contentWindow.focus();
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
			
			showAlert('btn-danger','<strong>Invalid File Type.</strong> Please Choose a text file !</a>');
		}
	});

	/* Image Button @ toolbar, will active a <input/file> & call image() if select sth. */
	$('#demo-notes-btn-6').click(function () {
		$('#ps-imageList >input:last').click();
	});

	$('#ps-reset').click(function () {
		$('#ps-alert').hide();
		
		$('#ps-title').val('');
		$('#demo-notes').val('');
		$('#ps-style').selectpicker('val', 'HTML');// $('#ps-style').reset()
	});

	$('#ps-preview').click(function () {
		$('#ps-alert').hide();
		
		if (isConvertable()) {
			convert('preview');
		}
	});

	$('#ps-export-md').click(function(event) {
		$('#ps-alert').hide();

		if($('#demo-notes').val() !=''){
			var blob = new Blob([$('#demo-notes').val()], {type: "text/plain;charset=utf-8"});
			saveAs(blob, ($('#ps-title').val()|| 'content') + ".md");
		} else{
			showAlert('btn-danger', "Content is Empty!");
		}
	});

	$('#ps-export-html').click(function(event) {
		$('#ps-alert').hide();
		
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

	showAlert('btn-danger', alertInfo);
	return false;
};

function convert( mode)
{
	f = document.forms['authorInput'];
	f.elements.namedItem('ps-mode').value = mode;
	f.submit();
};

function showAlert(kind, msg){
	$('#ps-alert-content').html(msg);
	$('#ps-alert >a').attr('class','btn btn-sm disabled');
	$('#ps-alert >a').addClass(kind);
	$('#ps-alert').show();
}
