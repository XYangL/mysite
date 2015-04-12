<?php 
session_start();
$input_title = $input_md = $input_paradigm = "";
if ($_SERVER["REQUEST_METHOD"] == "POST" && $_POST['input-submit']=='true'){
	$input_title = $_POST['input-title'];
	$input_md = $_POST['input-md'];
	$input_paradigm = $_POST['input-paradigm'];

	// $input_2_title = "Presentation Title";
	// $input_2_md =implode('', file("./API/content.md"));
	$input_2_paradigm = 'S5';

	// #call Python parser

	$data = array($input_title, $input_md, $input_paradigm);

	$srcHolder = getcwd();
	$srcPath = $srcHolder.'/API/parser.py ';// echo $srcPath."\n";
	$result = shell_exec('python '.$srcPath.' ' . escapeshellarg(json_encode($data)));
	// $result = shell_exec('python ./API/parser.py ' . escapeshellarg(json_encode($data)));
	$resultData = json_decode($result, true);

	$_SESSION['html-parsed']= $resultData['html-parsed'];
	
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>MD 2 PS</title>

	<!-- Bootstrap -->
	<!-- Latest compiled and minified CSS -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" />

	<!-- Optional theme -->
	<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap-theme.min.css" / >
	
	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>

	<!-- Latest compiled and minified JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>


	<!-- Bootstrap-select -->
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.3/css/bootstrap-select.min.css" />
	<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.3/js/bootstrap-select.min.js"></script>
	<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-select/1.6.3/js/i18n/defaults-*.min.js"></script>-->


	<!-- Bootstrap File Input -->
	<!-- <link href="http://netdna.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" rel="stylesheet"> -->
	<link href="css/fileinput.min.css" media="all" rel="stylesheet" type="text/css" />
	<!--<script src="//ajax.googleapis.com/ajax/libs/jquery/2.0.0/jquery.min.js"></script>-->
	<script src="js/fileinput.min.js" type="text/javascript"></script>

	<!-- bpopup -->
	<script src="js/jquery.bpopup.min.js"></script>

	<!-- HTML5 shim and Respond.js for IE8 support of HTML5 elements and media queries -->
	<!-- WARNING: Respond.js doesn't work if you view the page via file:// -->
	<!--[if lt IE 9]>
		<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
		<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
		<![endif]-->

	<!-- Custom setting -->
	<link href="css/starter-template.css" rel="stylesheet" />
	<script src="js/starter-template.js"></script>
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
					<li class="active"><a href="#">Home</a></li>
					<li><a href="#review">Review</a></li>
					<li><a href="#about">About</a></li>
					<li><a href="#contact">Contact</a></li>
				</ul>
			</div><!--/.nav-collapse -->
		</div>
	</nav>

	<div>
		<div class="container">
			<div id="md2ps" class="row">
				<div id="left" class="col-md-5">
					<form id="authorInput" name="authorInput" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" method = "post" >
						<!-- {% csrf_token %} -->
						<input type="text" id="input-title" class="form-control" name="input-title" 
							placeholder="Pesentation Title"	value="<?php echo $input_title; ?>">
						<br>
						<textarea id="input-md" class="form-control"  name="input-md" placeholder="Content in Markdown"><?php if ($input_md!='') { echo $input_md; } ?></textarea>	
						
						<input type="hidden" id="input-paradigm"  name="input-paradigm" value="S5" />
						<input type="hidden" id="input-submit"  name="input-submit" value="false" />
					</form>
				</div>

				<div id="right" class="col-md-7">
					<!-- <div class="bg-info" id="present" >
						<br><h3>Final output can be viewed here after clicking 'Convert'</h2>
					</div> -->
					<?php 
					if ($_SERVER["REQUEST_METHOD"] == "POST" && $_POST['input-submit']=='true'){
						echo "<iframe id=\"present\" src=\"present.php\" ></iframe>";

					} else {
						echo "<iframe id=\"present\" ></iframe>";
					}
					 ?>
					
					<form id="config" class="form-horizontal" >
						<div class="form-group">
							<label class="col-sm-2 control-label" for="fileInput">Content .txt/md</label>
							<div class="col-sm-6">
								<input id="fileInput" type="file" class="file form-control" data-show-preview="false" data-show-upload="false" data-show-remove="false" placeholder="Content .txt/md">
								<!-- <p class="help-block">You can input the source plain text via file.</p> -->
							</div>
							<button class="btn btn-primary col-md-2 col-md-offset-1" type="button" onclick="convert()" >Convert</button>
						</div>
						<div class="form-group">
							<label class="col-sm-2 control-label" for="cssInput">Style .css/js</label>
							<div class="col-sm-6">
								<!-- <input id="cssInput" type="file" class="form-control"> -->
								<input id="cssInput" type="file" class="file form-control" data-show-preview="false" data-show-upload="false" data-show-remove="false">
							</div>
							<button class="btn btn-primary col-md-2 col-md-offset-1" type="button" onclick="preview()">Preview</button>						
						</div>
						<div class="form-group">
							<label class="col-sm-2 control-label" for="paradigm">Paradigm</label>
							<div class="col-sm-6">
								<!-- <input id="paradigm" type="text" class="form-control" placeholder="**Radio**"> -->
								<select class="selectpicker" id="paradigm">
									<optgroup label="Slide">
										<option>S5</option>
										<option>Slidy</option>
										<option>Reveal.js</option>
									</optgroup>
									<optgroup label="Flow">
										<option data-subtext="Movie End Credit">Scroll</option>
										<option data-subtext="Zooming Scroll List">ZSL</option>
									</optgroup>
									<optgroup label="Canvas/ZUI">
										<option>TBA</option>
										<option>TBA</option>
									</optgroup>
								</select>
							</div>
							<button class="btn btn-primary col-md-2 col-md-offset-1" type="button">Save as</button>
						</div>
							
						<!-- <div class="" id="callPY">
							<button class="btn btn-primary btn-lg col-md-2 col-md-offset-1" type="button" onclick="convert()">Convert</button>
							<button class="btn btn-primary btn-lg col-md-2 col-md-offset-2" type="button">Preview</button>
							<button class="btn btn-primary btn-lg col-md-2 col-md-offset-2" type="button">Save as</button>
						</div> -->
					</form>
				</div>
			</div><!--.row -->
		</div><!--.container -->
	</div><!--#md2ps -->

	<!-- Element to pop up -->
    <iframe id="element_to_pop_up"></iframe>	

</body>
</html>