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
	var fileDisplayArea = document.getElementById('author-ta');
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
	alert("Preview is Clicked.");

};

/* Actions performed by button Convert*/

function convert()
{
	var has_server = true;
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
		
		f = document.forms['mdtext'];
		f.elements[1].value = paradigm;
		// alert(f.elements[1].value);

		if (has_server){
			f.submit();
		
		} else {	
			var out_file_path = "/static/PresentSystem/API/";
			out_file_path += supported_paradigm[paradigm]['file_name']

			document.getElementById('present').src= out_file_path
			document.getElementById('present').contentWindow.focus();
		}

	} else {
		alert("NOT Support Paradigm! "+paradigm);
	}
};

function convert_v0()
{
	if (has_server){
		f = document.forms['mdtext'];
		f.submit();
	} else {	
		var path_pre = "/static/PresentSystem/API/";

		var radios = document.getElementById('paradigm');
		var paradigm = radios.options[radios.selectedIndex].text;

		var src = path_pre
		switch(paradigm)
		{
			case 'S5':
				src += "[S5]Markdown Syntax.html";
				break;
			case 'Scroll':
				src += "[scroll]Markdown Syntax.html";
				break;
			case 'Slidy':
				src += "[slidy]Markdown Syntax.xhtml";
				break;
			default:
				// alert('Undefined Paradigm!')
		}
		
		if (src != path_pre)
		{
			document.getElementById('present').src= src
			document.getElementById('present').contentWindow.focus();
		} else {
			alert("Undefined Paradigm! "+paradigm);
		}

	}
};