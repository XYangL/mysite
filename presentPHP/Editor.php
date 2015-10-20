<?php 
session_start();
$title = $contentSRC = $style = "";
require 'API/newParser.inc';
$PARSER = new Parser();
$PARSER->success = false;
$mode = 'default';
$uploadResult = 'success'; $exportResult = 'success';
if ($_SERVER["REQUEST_METHOD"] == "POST" && $_POST['ps-mode']!='default'){
	$title = $_POST['ps-title'];
	$contentSRC = $_POST['Demo']['notes'];//$contentSRC = $_POST['contentMD'];
	$style = $_POST['ps-style'];
	$mode = $_POST['ps-mode'];
	// ------
	$deli_array =array('<h1>','<h2>','<h3>');
	$most_detailed = 3;
	$PARSER = new Parser("", array_slice($deli_array, 0, $most_detailed));// ? $most_detailed
	// -------

	$PARSER->main($title, $contentSRC, $style);
	
	if($PARSER->success){	
		$_SESSION['html-parsed']= $PARSER->presentableHTML;
		
		/*Upload Image List*/
		if ($_POST['ps-imageNum'] != '0') {
			$uploadResult = $PARSER->upload('ps-image-', intval($_POST['ps-imageNum']), $_FILES);
		} 

		/*Export present.html, dependences & uploaded images*/
		if ($mode == 'export') {
			list($tempFile, $exportResult) = $PARSER->export();
			$tempFile  = "export/present.zip";
		}
	} else{
		// echo 'Error: Success==FALSE';
		$mode = 'failed';
	}
} else{
	$title ="A Maximum Likelihood Routing Algorithm for Smart Grid Wireless Network";
	$contentSRC = file_get_contents("API/mdSrc/Smart Grid.src");
	$style ="CAScroll";
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Editor &middot; MD 2 PS</title>

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

	<!-- Bootstrap-select -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.5/css/bootstrap-select.min.css" />

	<!-- Bootstrap File Input -->
	<!-- <link href="http://netdna.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" rel="stylesheet"> -->
	<link href="css/fileinput.min.css" media="all" rel="stylesheet" type="text/css" />

	<!-- Code Mirror -->
	<script src="codemirror/codemirror.js"></script>
	<link  href="codemirror/codemirror.css" rel="stylesheet">
	<link  href="codemirror/neat.css" rel="stylesheet">
	<script src="codemirror/mode/markdown.js"></script>
	<style type="text/css">
		/*.CodeMirror {border-top: 1px solid black; border-bottom: 1px solid black;}*/
		.CodeMirror pre > * { text-indent: 0px; }
	</style>

	<!-- yii2-md-editor -->
	<link href="yii2-md-editor/css/kv-markdown.css" rel="stylesheet">

	<!-- Custom Setting -->
	<link href="css/index_editor.css" rel="stylesheet" />
	<script>
	<?php  
		echo "supported_style =[\"".implode( "\",\"" , $PARSER->supportedStyle)."\"];" ,"\n\t";
		echo "imagesFolder = \"".$PARSER::IMAGE_FOLDER."/\";" ,"\n\t";
	?>
	</script>

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
				</button>
				<a class="navbar-brand" href="#">Present System</a>
			</div>
			<div id="navbar" class="collapse navbar-collapse">
				<ul class="nav navbar-nav">
					<li><a href="index.php">Home</a></li>
					<li class="active"><a href="Editor.php">Editor</a></li>
					<li><a href="demo.php">Demo</a></li>
					<!-- <li><a href="#review">Review</a></li> -->
					<!-- <li><a href="#about">About</a></li> -->
					<!-- <li><a href="#contact">Contact</a></li> -->
				</ul>
			</div><!--/.nav-collapse -->
		</div>
	</nav>

	<div>
		<div class="container"><div id="md2ps" class="row">
			<form id="authorInput" name="authorInput" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" method = "post" enctype="multipart/form-data">
				<input type="hidden" id="ps-mode"  name="ps-mode" value="<?php echo $mode ?>" />
				<input type="hidden" id="ps-imageNum"  name="ps-imageNum" value="0" />
				<input type="text" id="ps-title" class="form-control" name="ps-title" placeholder="Presentation Title"	value="<?php if ($title!='') {echo $title;} ?>">
				<br/>

				<div class="form-group field-demo-notes required">
					<div id="demo-notes-container" class="kv-md-container"><div id="demo-notes-editor" class="kv-md-editor">
						<div id="demo-notes-header" class="kv-md-header btn-toolbar">
							<div class="btn-group">
								<button type="button" id="demo-notes-btn-1" class="btn  btn-default" title="Bold" onclick="editorTool(1)"><i class='glyphicon glyphicon-bold'></i></button>
								<button type="button" id="demo-notes-btn-2" class="btn  btn-default" title="Italic" onclick="editorTool(2)"><i class='glyphicon glyphicon-italic'></i></button>
							</div>

							<div class="btn-group">
								<button type="button" id="demo-notes-btn-14" class="btn  btn-default " title="Inline Code" onclick="editorTool(14)"><div style="margin-top: -4px; margin-bottomInline Code: -1px;">
									<span style="font-size: 1.2em;">&lsaquo;</span>/<span style="font-size: 1.2em;">&rsaquo;</span>
								</div></button>
								<button type="button" id="demo-notes-btn-15" class="btn  btn-default " title="Code Block" onclick="editorTool(15)"><i class='glyphicon glyphicon-sound-stereo'></i></button>
							</div>

							<div class="btn-group">
								<button type="button" id="demo-notes-btn-6" class="btn  btn-default" title="Image"><i class='glyphicon glyphicon-picture'></i></button><!-- editorTool(6, &quot;#demo-notes&quot;) -->
								<button type="button" id="demo-notes-btn-20" class="btn  btn-default" title="More" onclick="editorTool(20)"><i class='glyphicon glyphicon-plus-sign'></i></button>
								<button type="button" id="demo-notes-btn-21" class="btn  btn-default" title="Tip" onclick="editorTool(21)"><i class='glyphicon glyphicon-info-sign'></i></button>
							</div>
							<div id="ps-imageList"  style='display:none;'>
								<input type='file' id='ps-image-0' name='ps-image-0' onchange='image(this)' accept='image/*' />
							</div>

							<div class="btn-group" >
								<div class="row-fluid">
									<select id="ps-style" class="selectpicker show-tick span1" data-width="120px" name="ps-style"> <!-- multiple data-max-options="1" title="Choose one style ..." -->
										<optgroup label="Paradigm">
											<option  <?php if ($style == "HTML" ) {echo "selected";} ?> data-subtext="Without Style" >HTML</option>
											<option  <?php if ($style == "Slide" ) {echo "selected";} ?> disabled="disabled" >Slide</option>
											<option  <?php if ($style == "List" ) {echo "selected";} ?> data-subtext="Flow" >List</option>
										</optgroup>
										<optgroup label="Slide">
											<option  <?php if ($style == "S5" ) {echo "selected";} ?> disabled="disabled" >S5</option>
											<option  <?php if ($style == "Slidy" ) {echo "selected";} ?> disabled="disabled" >Slidy</option>
											<option  <?php if ($style == "js" ) {echo "selected";} ?>  disabled="disabled" >Reveal.js</option>
										</optgroup>
										<optgroup label="Flow">
											<option  <?php if ($style == "Scroll" ) {echo "selected";} ?> >Scroll</option>
											<option  <?php if ($style == "CAScroll" ) {echo "selected";} ?>  data-subtext="Contaxt Aware" >CAScroll</option>
										</optgroup>
										<optgroup label="Canvas/ZUI">
											<option  <?php if ($style == "TBA" ) {echo "selected";} ?>  disabled="disabled" >TBA</option>
										</optgroup>
									</select>
								</div>
							</div>

							<div class="pull-right btn-group">
								<!-- <button type="button" id="demo-notes-btn-17" class="btn btn-default" title="Toggle full screen" data-enabled><i class='glyphicon glyphicon-fullscreen'></i></button> -->
							</div>
						</div> <!-- demo-notes-header -->

						<textarea id="demo-notes" class="kv-md-input form-control meltdown"  name="Demo[notes]" placeholder="Content in Markdown"><?php if ($contentSRC!='') { echo $contentSRC; } ?></textarea>	

						<div id="demo-notes-preview" class="kv-md-preview hidden"></div>

						<div id="demo-notes-footer" class="kv-md-footer">
							<div class = "btn-toolbar ">
								<div class="btn-group pull-right">
									<button type="button" id="ps-preview" class="btn btn-sm btn-default" title="Preview formatted text"><i class='glyphicon glyphicon-search'></i> Preview</button>
								</div>

								<div class="btn-group pull-right">
									<button type="button" id="demo-notes-btn-51" class="btn btn-sm btn-primary dropdown-toggle" title="Export content" data-enabled data-toggle="dropdown"><i class='glyphicon glyphicon-floppy-disk'></i> Export <span class="caret"></span></button>
									<ul class='dropdown-menu'>
										<li><a id="ps-export-md" href="#" title="Save as text"><i class="glyphicon glyphicon-floppy-save"></i> Content.md</a></li>
										<li><a id="ps-export-html" href="#" title="Save as HTML"><i class="glyphicon glyphicon-floppy-saved"></i> Present.html</a></li>
									</ul>
								</div>

								<div class="btn-group">
									<div class="col-sm-6" style=" ">
										<input id="ps-fileInput" name="ps-fileInput" type="file" class="file">
									</div>
								</div>
								<div class="btn-group">
									<button type="button" id="ps-reset" class="btn btn-sm btn-default" value="Reset" title="Reset all Input"><span class="glyphicon glyphicon-remove"></span> Reset</button>
								</div>

								<div class="btn-group" id="ps-alert" >
									<!-- <p class=" bg-danger"><strong>Invalid File Type.</strong> Please Choose a text file !</p> -->
									<a href="#" class="btn btn-sm disabled" role="button"><span id="ps-alert-content"><strong>Invalid File Type.</strong> Please Choose a text file !</a></span>
								</div>
							</div>
						</div> <!-- demo-notes-footer -->

					</div><!-- demo-notes-editor --> </div><!-- demo-notes-container -->

				</div> <!-- field-demo-notes -->
			</form>
		</div><!--.row #md2ps --> </div><!--.container -->
	</div>

	<!-- Element to pop up -->
	<iframe id="ps-previewPopup"></iframe>

	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>

	<!-- Latest compiled and minified JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>

	<!-- Bootstrap-select -->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.5/js/bootstrap-select.min.js"></script>

	<!-- Bootstrap File Input -->
	<script src="js/fileinput.min.js" type="text/javascript"></script>
	<script>
		/* Automatically convert a file input to a bootstrap file input widget by setting its class as 'file' */ 
		/* Javascript call to initialize plugin with your desired options */
		$("#ps-fileInput").fileinput({
			showCaption: false, // Hide the caption : data-show-caption="false"
			showRemove: false,	// Hide the remove button : data-show-remove="false"
			showUpload: false,  // Hide the upload button : data-show-upload="false"
			showPreview: false, // Hide file preview thumbnails :  data-show-preview="false"
			browseClass: "btn btn-primary btn-sm",
			browseLabel: " Import",
		}); 
	</script>

	<!-- bpopup -->
	<script src="js/jquery.bpopup.min.js"></script>

	<!-- yii2-md-editor -->
	<script src="yii2-md-editor/js/rangyinputs-jquery-1.1.2.min.js"></script>
	<script src="yii2-md-editor/js/kv-markdown.js"></script> <!-- not min.js -->

	<!-- File Saver -->
	<script src="js/Blob.js"></script>
	<script src="js/FileSaver.min.js"></script>

	<!-- Custom Setting -->
	<script src="js/editor.js"></script>

	<!-- Show alert if failed to upload image or export html-->
	<?php 
	if ($mode!='default') {
		if ($uploadResult != 'success') {
			echo "<script>". "showAlert('btn-danger', '$uploadResult');" ."</script>";	
		} else if ($exportResult != 'success') {
			echo "<script>". "showAlert('btn-danger', '$exportResult');" ."</script>";	
		}
		
	}
	?>
	
	<!-- Set Download src for Exprot mode -->
	<iframe id="exportSrc" style="display:none;" <?php echo "src = \"$tempFile\""; ?> > </iframe>
	<script>
		function Download(url) {
			document.getElementById('exportSrc').src = url;
			alert('this');
		};
	</script>
</body>
</html>