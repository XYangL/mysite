<?php 
session_start();
if (!empty($_SESSION['html-parsed'])) {
	echo $_SESSION['html-parsed'];
} else {
	echo "Please input in the left textarea, select the style, and click Convert. ";
}
 ?>