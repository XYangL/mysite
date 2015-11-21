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
	// var fileDisplayArea = document.getElementById('fileDisplayArea');
	fileInput.addEventListener('change', function (e) {
		$('#ps-alert').hide();//$('#ps-alert').hide();
		$('#ps-alert >a').removeClass('btn-danger').removeClass('btn-success');
		var file = fileInput.files[0];
		var textType = /text.*/;		
		if (file.type.match(textType) || file.name.match(/\.src$/)) {
			var reader = new FileReader();
			reader.onload = function (e) {
				editorCM.setValue(reader.result);//fileDisplayArea.value = reader.result;
			};
			reader.readAsText(file);
			$('#ps-title').val(file.name.substr(0,file.name.lastIndexOf('.')));
		} else {
			editorCM.setValue('');//fileDisplayArea.value = '';
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
		editorCM.setValue('');// $('#demo-notes').val('');
		$('#ps-style').selectpicker('val', 'CAScroll');// $('#ps-style').reset()
	});

	$('#ps-preview').click(function () {
		$('#ps-alert').hide();
		
		if (isConvertable()) {
			convert('preview');
		}
	});

	$('#ps-export-md').click(function(event) {
		$('#ps-alert').hide();

		var temp = editorCM.getValue().trim();//'#demo-notes').val()
		if( temp!=''){
			var blob = new Blob([temp], {type: "text/plain;charset=utf-8"});
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
		- call editorTool to insert image phas in #demo-notes
		- append a new input[file] for next upload image
	*/
	editorTool(6);

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
	var style = radios.options[radios.selectedIndex].text;
	style = (style=='Scroll List') ? 'CAScroll' :style;// console.log(style);
	style = (style=='Scroll Slide') ? 'ScrollSlide' :style;
	radios.options[radios.selectedIndex].text = style;
	if ($.inArray(style, supported_style) > -1) {//isSupport()
		var title = $('#ps-title').val();
		var contentMD = editorCM.getValue().trim();//$('#demo-notes').val();
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

/* Code Mirror */
var editorCM = null;
$(document).ready(function() {
	/*Init textarea based on CodeMirror*/ 
	editorCM = CodeMirror.fromTextArea(document.getElementById("demo-notes"), {
		//value: string|CodeMirror.Doc,
		mode: 'simple', //string|object markdown
		theme: 'neat', //string

		indentUnit: 4,//How many spaces a block (whatever that means in the edited language) should be indented. The default is 2.
		//smartIndent: boolean, //Whether to use the context-sensitive indentation that the mode provides (or just indent the same as the line before). Defaults to true.
		//tabSize: integer,//The width of a tab character. Defaults to 4.
		indentWithTabs: true ,// Whether, when indenting, the first N*tabSize spaces should be replaced by N tabs. Default is false.
		//??electricChars: boolean,//Configures whether the editor should re-indent the current line when a character is typed that might change its proper indentation (only works if the mode supports indentation). Default is true.

		lineWrapping: true, // Whether CodeMirror should scroll or wrap for long lines. Defaults to false (scroll).
		lineNumbers: true,// Whether to show line numbers to the left of the editor.
	});
	$('#demo-notes').val('');
	/*Set same tab indent for multiple lines in one paragraph*/
	var charWidth = editorCM.defaultCharWidth(), basePadding = 4;
	editorCM.on("renderLine", function(cm, line, elt) {
		var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
		elt.style.textIndent = "-" + off + "px";
		elt.style.paddingLeft = (basePadding + off) + "px";
		});
	editorCM.refresh();

	// imageUrl = "Editor.png";
	// $('html').append($('<div/>',{'id': 'logo'}).html('<image src="'+imageUrl+'"/>'));

});

/* ====================================================
 * kv-markdown.js -- Revised by xyli to support toolbar
 * ====================================================
 * A markdown editor parser for PHP Markdown Extra and 
 * PHP SmartyPants. Designed for Yii Framework 2.0
 *
 * https://github.com/kartik-v/yii2-markdown
 * 
 * Copyright (c) 2015, Kartik Visweswaran  
 * Krajee.com  
 * Licensed under BSD-3 License. 
 * Refer attached LICENSE.md for details. 
 * Version: 1.3.1
 */
String.prototype.trimRight = function (charlist) {
	if (charlist === undefined) {
		charlist = "\s";
	}
	return this.replace(new RegExp("[" + charlist + "]+$"), "");
};

String.prototype.repeat = function (n) {
	n = n || 1;
	return Array(n + 1).join(this);
}

function isEmpty(value, trim) {
	return value === null || value === undefined || value == []
		|| value === '' || trim && $.trim(value) === '';
}

function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function setMarkUp(txt, begin, end) {
	var m = begin.length,
		n = end.length
	var str = txt
	if (m > 0) {
		str = (str.slice(0, m) == begin) ? str.slice(m) : begin + str
	}
	if (n > 0) {
		str = (str.slice(-n) == end) ? str.slice(0, -n) : str + end
	}
	return str;
}

function setBlockMarkUp(txt, begin, end) {
	var str = txt
	if (str.indexOf('\n') < 0) {
		str = setMarkUp(txt, begin, end);
	} else {
		var list = []
		list = txt.split('\n')
		$.each(list, function (k, v) {
			list[k] = setMarkUp(v.trimRight(), begin, end + '  ')
		})
		str = list.join('\n')
	}
	return str
}

var hideNum = 0;
var tipNum = 0;
function editorTool(btn) {
	editorCM.focus()// el.focus();
	var caretLine = editorCM.getCursor('from').line;
	var caretStart = editorCM.getCursor('from').ch;
	// var caretEnd = editorCM.getCursor('to').ch;

	var txt = editorCM.getSelection() //el.extractSelectedText(),
		len = txt.length,
		str = txt;

	function markupCursor(mark){ // len == 0
		caretStart +=mark.length;
		return  mark.repeat(2);
	}
	// Bold
	if (btn == 1) {
		markupTemp = '**'
		str = (len==0) ? markupCursor(markupTemp) : setBlockMarkUp(txt, markupTemp, markupTemp);
	}
	// Italic
	else if (btn == 2) {
		markupTemp = '*'
		str = (len==0) ? markupCursor(markupTemp) : setBlockMarkUp(txt, markupTemp, markupTemp);
	}
	// Inline MathJax
	else if (btn == 14) {
		markupTemp = '$'
		str = (len==0) ? markupCursor(markupTemp) : setBlockMarkUp(txt, markupTemp, markupTemp);
	}
	// Dispaly MathJax
	else if (btn == 15) {
		markupTemp = '$$'
		str = (len==0) ? markupCursor(markupTemp) : setBlockMarkUp(txt, markupTemp, markupTemp);
	}

	// Image -- Revised for PS with new Syntax : keep original txt, and append [^img:] to line end
	else if (btn == 6) {
		link = imagesFolder.concat($('#ps-imageList >input:last')[0].files[0].name);
		id = (len==0) ? $('#ps-imageList >input').size(): txt.trim();
		id = "[^img:" + id + "]";
		tabTemp = editorCM.getLine(caretLine).match(/^\t*/);
		notes = " "+id +" \n\n"+tabTemp+id+": "+link+"\n";

		editorCM.replaceRange(notes,  {line:caretLine});
		str = '';
	}

	// More/Hide Content
	else if (btn == 20) {
		hideNum +=1;
		id = (len==0) ? hideNum : txt;
		id = "[^hide:" + id + "]";
		tabTemp = editorCM.getLine(caretLine).match(/^\t*/);
		notes = " "+id +" \n\n"+tabTemp+id+":\n\t"+tabTemp

		editorCM.replaceRange(notes,  {line:caretLine});
		str = '';
	}
	// Tip Content
	else if (btn == 21) {
		tipNum +=1;
		id = (len==0) ? tipNum: txt;
		id = "[^tip:" + id + "]";
		tabTemp = editorCM.getLine(caretLine).match(/^\t*/);
		notes = " "+id +" \n\n"+tabTemp+id+":\n\t"+tabTemp;
		
		editorCM.replaceRange(notes,  {line:caretLine});
		str = '';
	}

	if (!isEmpty(str)) {
	   editorCM.replaceSelection(str);// el.replaceSelectedText(str, "select")
	}

	// SetCaretPosition -- Append for PS
	if ($.inArray(btn, [1,2,14,15]) >-1 && len ==0) {
	   editorCM.setCursor({line:caretLine,ch:caretStart});
	};
	if($.inArray(btn, [20,21]) >-1){
		editorCM.setCursor({line:caretLine +=3});
	}

	// console.log(txt,"\nstr:",str,"\n");
}
