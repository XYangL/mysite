<?php 
session_start();
$title = $contentMD = $style = "";
$title ="A Maximum Likelihood Routing Algorithm for Smart Grid Wireless Network";
$contentSRC = file_get_contents("API/mdSrc/Smart Grid.src");
$style ="CAScroll";
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Demo &middot; Present System</title>

	<!-- Bootstrap -->
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" />

	<!-- Optional theme -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css" / >

	<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
	<!--[if lt IE 9]>
		<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
		<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
	<![endif]-->

	<!-- Code Mirror -->
	<script src="codemirror/codemirror.js"></script>
	<link  href="codemirror/codemirror.css" rel="stylesheet">
	<link  href="codemirror/neat.css" rel="stylesheet">
	<script src="codemirror/mode/markdown.js"></script>
	<style type="text/css">
		/*.CodeMirror {border-top: 1px solid black; border-bottom: 1px solid black;}*/
		.CodeMirror pre > * { text-indent: 0px; }
	</style>

	<!-- Custom Setting -->
	<link href="css/index_editor.css" rel="stylesheet" />

</head>
<body>
	<nav class="navbar navbar-inverse navbar-fixed-top">
		<div class="container">
			<div class="navbar-header">
				<button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
					<span class="sr-only">Toggle navigation</span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</button>
				<a class="navbar-brand" href="#">Present System</a>
			</div>
			<div id="navbar" class="collapse navbar-collapse">
				<ul class="nav navbar-nav">
					<li><a href="index.php">Home</a></li>
					<li><a href="Editor.php">Editor</a></li>
					<li class="active"><a href="demo.php">Demo</a></li>
					<li><a href="ScrollSlide.php">Scroll Slide</a></li>
					<!-- <li><a href="#review">Review</a></li> -->
					<!-- <li><a href="#about">About</a></li> -->
					<!-- <li><a href="#contact">Contact</a></li> -->
				</ul>
			</div><!--/.nav-collapse -->
		</div>
	</nav>

	<div>
		<div class="container">
<!-- 			<div class="page-header">
				<h2>Demo <small>Demo of different styles converted from the same paintext source in new syntax</small></h2>
			</div> -->
			<div id="demos-wrapper" >
				<ul class="nav nav-pills nav-justified">
					<li class="input-lg  active"><a data-toggle="tab" href="#SL">Scroll List</a></li>
					<li class="input-lg"><a data-toggle="tab" href="#SS">Scroll Slide</a></li>
					<li class="input-lg"><a data-toggle="tab" href="#S5">Slides in S5</a></li>
					<li class="input-lg"><a data-toggle="tab" href="#SRC">Plain Text Source</a></li>
				</ul>
				<div class="tab-content">
					<div id="SL" class="tab-pane fade in active" data-src="demo/SL Routing.html">
						<iframe src=""></iframe>
					</div>
					<div id="SS" class="tab-pane fade " data-src="demo/SS Routing.html">
						<iframe src=""></iframe>
					</div>
					<div id="S5" class="tab-pane fade " data-src="demo/S5 Routing.html">
						<iframe src=""></iframe>
					</div>
					<div id="SRC" class="tab-pane fade ">
						<textarea id="demo-source" placeholder="Content in Markdown"><?php if ($contentSRC!='') { echo $contentSRC; } ?></textarea>
					</div>
				</div>


			</div><!--.row #md2ps --> 
		</div><!--.container -->
	</div>

	<!-- Element to pop up -->
	<iframe id="ps-previewPopup"></iframe>

	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>

	<!-- Latest compiled and minified JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>

	<script>

		/* Code Mirror */
		var editorCM = null;
		$(document).ready(function() {
			/*Init textarea based on CodeMirror*/ 
			editorCM = CodeMirror.fromTextArea(document.getElementById("demo-source"), {
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
				readOnly: true,
			});
			$('#demo-source').val('');
			/*Set same tab indent for multiple lines in one paragraph*/
			var charWidth = editorCM.defaultCharWidth(), basePadding = 4;
			editorCM.on("renderLine", function(cm, line, elt) {
				var off = CodeMirror.countColumn(line.text, null, cm.getOption("tabSize")) * charWidth;
				elt.style.textIndent = "-" + off + "px";
				elt.style.paddingLeft = (basePadding + off) + "px";
				});
			editorCM.refresh();

			setSrc("#demos-wrapper >ul>li.active>a");

			var tabHeight = $(window).height()- $('.tab-content').offset().top - 15;
			$('.tab-content >div').height(tabHeight);

		});


		/*Set Tab Content*/
		var setSrc = function(clicked) {
			var target = $(clicked).attr("href");
			setTimeout(function() {
				if ($(target + " iframe").length){
					$(target + " iframe").attr('src', $(target).attr('data-src'));	
					$(target + " iframe")[0].contentWindow.focus();
				} else {	
					editorCM.refresh();
				}	
			},500);
		}

		$('#demos-wrapper >ul >li >a').each(function() {
			$(this).on('show.bs.tab', function(e){ setSrc(e.target); });
		});
	</script>

</body>
</html>