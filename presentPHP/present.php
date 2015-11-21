<?php 
session_start();
if (!empty($_SESSION['html-parsed'])) {
	echo $_SESSION['html-parsed'];
	// echo "<textarea style='width=500 ;height:500;'>".$_SESSION['html-parsed']."</textarea>";

} else {
	echo "Please input in the left textarea, select the style, and click Convert. ";
}
 ?>