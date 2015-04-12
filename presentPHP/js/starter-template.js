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
 
/*  with plugin options */
// $("#fileInput").fileinput({'showUpload':false, 'previewFileType':'any'});
// $("#cssInput").fileinput({'showUpload':false, 'previewFileType':'any'});

/* Display selected md file in left textarea*/
window.onload = function () {
	var fileInput = document.getElementById('fileInput');
	var fileDisplayArea = document.getElementById('input-md');
	fileInput.addEventListener('change', function (e) {
		var file = fileInput.files[0];
		var textType = /text.*/;
		if (file.type.match(textType)) {
			var reader = new FileReader();
			reader.onload = function (e) {
				fileDisplayArea.innerText = reader.result;
			};
			reader.readAsText(file);
		} else {
			fileDisplayArea.innerText = 'File not supported!';
		}
	});
};

function preview(){
	var src = document.getElementById('present').src;
	var src_def = "http://127.0.0.1:8000/PresentSystem/"
	if (src != src_def ){
		// alert("open "+src+" in a new window");
		// window.open(src, '_blank');
		document.getElementById('element_to_pop_up').src=src;
		$('#element_to_pop_up').bPopup({
			position: ['auto', 20]
		});
	} else {
		alert("Nothing is ready for preview");
	}


};

/* Actions performed by button Convert*/

function convert()
{
	var supported_paradigm =
	{
		"S5"	:{"paradigm":"slide" 	, "file_name":"[S5]Markdown Syntax.html",},
		"Scroll":{"paradigm":"scroll" 	, "file_name":"[scroll]Markdown Syntax.html"},
		"Slidy"	:{"paradigm":"slide" 	, "file_name":"[slidy]Markdown Syntax.xhtml"},
	}

	var radios = document.getElementById('paradigm');
	var paradigm = radios.options[radios.selectedIndex].text;

	var is_support = false
	for (var key in supported_paradigm)	{
		if (key == paradigm){
			is_support = true;
			break;
		}
	}

	if (is_support){
		
		f = document.forms['authorInput'];
		f.elements.namedItem('input-paradigm').value = paradigm;
		f.elements.namedItem('input-submit').value = 'true';
		f.submit();
	} else {
		alert("NOT Support Paradigm! "+paradigm);
	}
};

