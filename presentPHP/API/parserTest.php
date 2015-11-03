<?php 

require 'newParser.inc';
//-- For Testing --
$deli_array =array('<h1>','<h2>','<h3>');

$PARSER = new Parser("", $deli_array);

// // $mdSrc = getcwd ()."/mdSrc/MD Syntax Extra.md";
// // $title ="Markdown Syntax";
// $mdSrc = getcwd ()."/mdSrc/CAScroll.src";
// $title ="New Present Paradigm : Scroll List";
// $contentMD = file_get_contents($mdSrc);
// $style = "CAScroll";

$mdSrc = getcwd ()."/mdSrc/Smart Grid.src";
$title ="A Maximum Likelihood Routing Algorithm for Smart Grid Wireless Network";

// $mdSrc = getcwd ()."/mdSrc/SL-UserGuide.src";
// $title ="Scroll List User Guide";
$contentSRC = file_get_contents($mdSrc);
$style = "CAScroll";

$PARSER->main($title, $contentSRC, $style);

/* Output to File*/
if($PARSER->success){
	// echo $PARSER->export()[1];
	//echo $PARSER->presentableHTML;	
	file_put_contents("../$title.html", $PARSER->presentableHTML);
} else{
	echo 'Error: Success==FALSE';
}


// -----------------
// ob_start();
// var_dump(str_replace("\n", "#", $value));
// $result = ob_get_clean();
// $test .= $result."\n-------------\n";

 ?>