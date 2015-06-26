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
	/*Reset the color of buttons generated from bootstrap-select*/ 
	$('.bootstrap-select >button').removeClass('btn-default').addClass('btn-primary');	

	/* Display selected md file in left textarea*/
	var fileInput = document.getElementById('ps-fileInput');
	var fileDisplayArea = document.getElementById('demo-notes');
	fileInput.addEventListener('change', function (e) {
		$('#ps-alert').hide();$('#ps-alert').hide();
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
		// $('#ps-style').reset()
	});

	if($('#ps-mode').val() == 'preview'){
		preveiw();
	}

	$('#ps-reset').click(function () {
		$('#ps-alert').hide();$('#ps-alert').hide();
		
		$('#ps-alert >a').removeClass('btn-danger').removeClass('btn-success');
		$('#ps-title').val('');
		$('#demo-notes').val('');
		// $('#ps-style').reset()
	});

	$('#ps-preview').click(function () {
		$('#ps-alert').hide();$('#ps-alert').hide();
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

};

function isConvertable(){
	var alertInfo = '';
	if (isSupport()) {
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
}

function isSupport(){
	var supported_style =
	{
		"S5"	:{"paradigm":"slide" 	, "file_name":"[S5]Markdown Syntax.html",},
		"Scroll":{"paradigm":"scroll" 	, "file_name":"[scroll]Markdown Syntax.html"},
		"Slidy"	:{"paradigm":"slide" 	, "file_name":"[slidy]Markdown Syntax.xhtml"},
		"CAScroll"	:{"paradigm":"scroll" 	, "file_name":"[CAScroll]Markdown Syntax.xhtml"},
	}
	
	var radios = document.getElementById('ps-style');
	var style = radios.options[radios.selectedIndex].text; //console.log(style);
	for (var key in supported_style)	{
		if (key == style){
			return true;
			break;
		}
	}
	return false;
}

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

