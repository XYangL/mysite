<?php
session_start();
$commentSrcDiv = "srcComment/";

date_default_timezone_set('Asia/Hong_Kong');
$time = date('Y-m-d H:i:s',time());

if ($_SERVER["REQUEST_METHOD"] == "POST"){
	$user = trim($_POST['username']);
	$content =$_POST['content'];
	$content = str_replace("\r", "",  $content);
	$content = str_replace("\n", "<br/>",  trim($content));

	if (($user=="") and ($content=="")){
		echo "Error!";
	}else{
		$str = "{$user}###{$time}###{$content} \r\n";
		$file = fopen($commentSrcDiv."comments.txt","a+");
		$write = fwrite($file,$str);
		fclose($file);
		// echo "Comments Saved!";
	}
} else{

}

// Recored the Visit Traffic
	if (!$_SESSION['recorded']) {
		$ip=$_SERVER['REMOTE_ADDR'];
		$str = $ip . '|' .$time."\r\n";//ip|2015-11-6 10:24:15
		file_put_contents($commentSrcDiv."countVisit.txt",$str,FILE_APPEND);

		$_SESSION['recorded'] = true;
	} else{
		// echo "old";
	}

// Count Visit
	$str =file_get_contents($commentSrcDiv."countVisit.txt");
	$rows = explode("\r\n",trim($str));
	$countVisit = count($rows);

	$today = date('Y-m-d',time());
	$todayVisit = 0;
	foreach(array_reverse($rows) as $value){
		$date = substr(explode("|",$value)[1],0,10); 
		if($date == $today){
			$todayVisit++; //echo "<br/>-".$date;
		} else{
			break;
		}
	}

//Count Convert
	$str =file_get_contents($commentSrcDiv."countConvert.txt");
	$rows = explode("\r\n",trim($str));
	$countConvert = count($rows);

	$todayConvert = 0;
	foreach(array_reverse($rows) as $value){
		$date = substr(explode("|",$value)[1],0,10); 
		if($date == $today){
			$todayConvert++; //echo "<br/>-".$date;
		} else{
			break;
		}
	}
?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>Comments &middot; Present System</title>

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

	<!-- Custom Setting -->
	<link href="css/index_editor.css" rel="stylesheet" />
	<!-- <link href="css/comment.css" rel="stylesheet" /> -->

</head>
<body role="document">
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
					<li><a href="Editor.php">Editor</a></li>
					<li><a href="demo.php">Demo</a></li>
					<li class="active"><a href="comment.php">Comments</a></li>
					<!-- <li><a href="ScrollSlide.php">Scroll Slide</a></li> -->
					<!-- <li><a href="#review">Review</a></li> -->
					<!-- <li><a href="#about">About</a></li> -->
					<!-- <li><a href="#contact">Contact</a></li> -->
				</ul>
			</div><!--/.nav-collapse -->
		</div>
	</nav>

	<div class="container">
		<div class="page-header">
			<h1>Comments</h1>
		</div>

		<div class="row" style="margin:20px 0;padding:48px 60px 24px 60px ; background-color: #eee;border-radius: 6px;">
			<div class="col-md-8" style="margin-bottom:24px;">
				<form name="comFrom" action="<?php echo htmlspecialchars($_SERVER['PHP_SELF']); ?>" method="post" onsubmit = "return validateForm()">
					<div class="row"><textarea name="content" placeholder="Comments"  class="form-control" rows="5" required></textarea><br/></div>
					<div class="row">
						<div class="col-md-offset-5 col-md-4"><input type="text" name="username"  class="form-control " placeholder="Username" required /></div>
						<div class="col-md-3"><input type="submit" name="submit" value="Submit" class="btn btn-primary form-control"/></div>
					</div> <!-- pull-right -->
				</form>
			</div>
			<div class="col-md-3 col-md-offset-1">
				<ul class="list-group" >
					<li class="list-group-item">
						ListPoint Today<span class="badge"><?php echo $todayConvert; ?></span> 
					</li>
					<li class="list-group-item">
						Total ListPoint <span class="badge"><?php echo $countConvert; ?></span> 
					</li>
					<li class="list-group-item">
						Total Visit <span class="badge"><?php echo $countVisit; ?></span> 
					</li>
					<li class="list-group-item">
						Visit Today<span class="badge"><?php echo $todayVisit; ?></span> 
					</li>
				</ul>
			</div>
		</div>
		
		<!-- Comment Boards -->
		<div class="row" style="margin:20px 0;">
			<table class="table table-striped">
				<thead><tr>
					<!-- <th class="col-md-1">#</th> -->
					<th class="col-md-1">Date</th>
					<th class="col-md-1">Username</th>
					<th>Comments</th>
				</tr></thead>
			
				<tbody>
<?php
$file = file($commentSrcDiv."comments.txt");
$arr = array_reverse($file);//reverse the comments
foreach($arr as $value){
	$list = explode("###",$value);
	$date = substr($list[1], 5,5);
	$shortname = substr($list[0], 0,3);
// 	echo <<<CONTENT
// 		<div class="panel panel-default">
// 		<div class="panel-heading">$list[0] @ $list[1]</div>
// 		<div class="panel-body">
// 			$list[2]
// 		</div>
// 		</div>
// CONTENT;
	echo <<<CONTENT
			<tr>
				<!-- <th scope="row">1</th> -->
				<td>$date</td>
				<td>$shortname***</td>
				<td>$list[2]</td>
			</tr>
CONTENT;

}
?>
				</tbody>
			</table>
		</div><!-- Comment Boards -->

	</div><!--.container -->


	<!-- jQuery (necessary for Bootstrap's JavaScript plugins) -->
	<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>

	<!-- Latest compiled and minified JavaScript -->
	<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/js/bootstrap.min.js"></script>

	<script>
	function validateForm() {
		var x = document.forms["comFrom"]["content"];
		var y = document.forms["comFrom"]["username"];

		if (!x.value.trim()){
			x.focus(); return false;
		} else if (!y.value.trim()){
			y.focus(); return false;
		} else{
			return true;
		}
	}
	</script>

</body>
</html>