<?php  

$SlidyHead = <<<SLIDY
<html lang="en" xml:lang="en" xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <link href="http://www.w3.org/Talks/Tools/Slidy2/styles/slidy.css" rel="stylesheet" type="text/css"/>
        <script charset="utf-8" src="http://www.w3.org/Talks/Tools/Slidy2/scripts/slidy.js" type="text/javascript">
        </script>
        <script src="http://code.jquery.com/jquery-latest.js" type="text/javascript">
        </script>
        <script src="http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript">
        </script>
        <title>
            Markdown Syntax
        </title>
    </head>
    <body>
SLIDY;
$SlidyEND = "\n</body>\n</html>";

// #!! Original div should be prepended with $title (& other info) before Split
// $div = $title.$body;
// $deli_array =array('<h1>','<h2>');
// $deli_index = 0;

// $divs = splitSlide($div, $deli_array,$deli_index);

// $START = "\n<div class=\"slide\">\n";
// $END = "\n</div>\n";
// for($i = 0; $i<count($divs);$i++) {
// 	$divs[$i] = $START.$divs[$i].$END;
// }
function splitSlide( $div, $deli_array,$deli_index){
	$delimiter = $deli_array[$deli_index];

	if (strpos($div, $delimiter) == false){
		// echo "\n***FLASE $div\n";
		return array($div);
	}
	
	#Base 1. cut title+div into pieces separated by $delimiter
	#$div should be prepended with ' ' a whitespace to ensure an outline slides as $divs[0]
	#$divs[0] contained Ttitle & intro; Will be appended with $delimiter[content]
	$divs = explode($delimiter, " ".$div);
	$divs[0] .= "\n";

	#Base 2. Add the subject ,$delimiter[content], of each div to outline slides
	$subject = array('title');
	for($i = 1; $i<count($divs);$i++) {
	#2.1 re-add $delimiter to get meanful $divs, except $div[0]:outline	
		$divs[$i]=$delimiter.$divs[$i];
	#2.2 get the sutject of the slides
		$subject[$i] = get_string_between($divs[$i],$delimiter);#echo "##$i SUB## ".$subject."\n";
	#2.3 append the sutject to outline
		$divs[0] .= $subject[$i];
	}
	
	#Base 3/Fur: Check if need further split:
	if ($deli_index < count($deli_array)-1) {
	#Case2: Need to split further
		#Fur 1: Update Parameters	
		$deli_index +=1;
		
		$reslut = array($divs[0]);
		for($i = 1; $i<count($divs);$i++) {
			$divTemp = $divs[$i];
			// $title = get_string_between($divTemp,$delimiter);
		#Fur 2: Further	
			$divTemp = splitSlide( $divTemp, $deli_array,$deli_index);
		
		#Fur 3: if not toppest slides, Add Subject to all it splitted slides
		#1st sub is outline, already contained subject, no need to add
			if($deli_index >0){
				for($sub_i = 1; $sub_i<count($divTemp);$sub_i++) {
					$divTemp[$sub_i] = $subject[$i].$divTemp[$sub_i];
				}
				// echo "\n##$i ## : "; var_dump($divTemp);
				$reslut = array_merge($reslut,$divTemp);// $reslut += $divTemp;
			}

		}

		$divs = $reslut;
	}#else {}
	#Case 1: NO need to split further, since $delimiter is the most detailed  


	return $divs;
}

function get_string_between($string, $delimiter){
    $string = " ".$string;
    $start = $delimiter;
    $end = "</".substr($delimiter, 1);
    $ini = strpos($string,$start);
    if ($ini == 0) return "";
    $ini += strlen($start);
    $len = strpos($string,$end,$ini) - $ini;
    return $start.substr($string,$ini,$len).$end."\n";
}

/*	1st version of convert list of (<h>+<p>s)s in to embeded list
	Olny use String Functions
	Called itself recursivly
*/
function list_albe($list, $level){
	$delimiter= "<h$level>";
	$deliEND = "</h$level>";
	$deliFINAL = "<p>";
	$uls = explode($delimiter, $list);

	for($i = 1; $i<count($uls); $i++) {
	
		list($ulSubject,$ulContent) = explode($deliEND, $uls[$i]);
		
		$levelNext = $level+1;
		$deliNext = "<h$levelNext>";

		if (strpos($ulContent, $deliNext)) {
		# HAS Further UL
			$temp = list_albe($ulContent, $levelNext);
			$ulContent = implode("",$temp);
		} elseif (strpos($ulContent, $deliFINAL)){
		# NO Further UL, left is $deliFINAL = <p>s
			# Repalce <p> with <li><a href=\"#\"><span>\n
			$temp = explode($deliFINAL, ' '.$ulContent);
			$deliReplace =  "<li><a href=\"#\"><span>";
			$temp = implode($deliReplace,$temp);
			$temp = explode("</p>", ' '.$temp);
			$deliReplace =  "</span></a></li>";
			$temp = implode($deliReplace,$temp);
			$ulContent = "<ul class = \"level_$levelNext\">\n".$temp."</ul>\n";
		} 

		$leadTAG = "a";
		$ulSubject ="<$leadTAG>$ulSubject</$leadTAG>";

		$uls[$i] = "$ulSubject \n$ulContent";
		$uls[$i] = "<li>".$uls[$i]."</li>\n";

	}

	$uls[0] = "<ul class = \"level_$level\">\n"; // PREPEND
	$uls[count($uls)]="</ul>\n"; // APPEND
	return $uls;
}

/*	2nd version of convert list of (<h>+<p>s)s in to embeded list
	Called embedList() recursivly
*/
function listABLE($title, $rawBODY){		
	$list = "<h1>".$title."</h1>".$rawBODY;
	$level = 1;

	# // Used for embedlist() V1
	# $uls = embedList($list,$level); // Array of <ul>s
	# $structuredBODY = implode("",$uls); //echo $structuredBODY;

	// Used for embedlist() V2
	$structuredBODY = embedList($list,$level); // String

	return $structuredBODY;
}

/*  Version 1 of embedList()
	Only use function of String to porcess the List
	output is $uls, an arrary of ul/li items 
*/
function embedList1($list, $level){
	$delimiter= "<h$level>";
	$deliEND = "</h$level>";
	$deliFINAL = "<p>";
	$subjectTAG = "a";

	$uls = explode($delimiter, $list);

	if (strpos($uls[0], $deliFINAL)!==FALSE){
	# NO Further UL, left is $deliFINAL = <p>s
		$uls[0] = str_replace("<a href","<bold href",$uls[0]);
		$uls[0] = str_replace("</a>","</bold>",$uls[0]);

		# Repalce <p> with <li><a href=\"#\"><span>\n
		$deliReplace =  "<li><a href=\"#\"><span>";
		$uls[0] = str_replace("<p>",$deliReplace,$uls[0]);
		
		$deliReplace =  "</span></a></li>";
		$uls[0] = str_replace("</p>",$deliReplace,$uls[0]);
	}

	for($i = 1; $i<count($uls); $i++) {
		list($ulSubject,$ulContent) = explode($deliEND, $uls[$i]);
		
		$ulSubject ="<$subjectTAG>$ulSubject</$subjectTAG>";

		$levelNext = $level+1;
		$deliNext = "<h$levelNext>";

		if (strpos($ulContent, $deliNext)!==FALSE) {
		# HAS Further UL
			$temp = embedList($ulContent, $levelNext);
			$ulContent = implode("",$temp);
		} elseif (strpos($ulContent, $deliFINAL)!==FALSE){
		# NO Further UL, left is $deliFINAL = <p>s

			$ulContent = str_replace("<a href","<bold href",$ulContent);
			$ulContent = str_replace("</a>","</bold>",$ulContent);

			#Repalce <p> with <li><a href=\"#\"><span>\n
			$deliReplace =  "<li><a href=\"#\"><span>";
			$ulContent = str_replace("<p>",$deliReplace,$ulContent);
			
			$deliReplace =  "</span></a></li>";
			$ulContent = str_replace("</p>",$deliReplace,$ulContent);
			
			$ulContent = "<ul class = \"level_$levelNext\">\n".$ulContent."</ul>\n"; // echo $ulContent;
		}

		$uls[$i] = "$ulSubject \n$ulContent";
		$uls[$i] = "<li>".$uls[$i]."</li>\n";
		
	}

	array_unshift($uls, "<ul class = \"level_$level\">");// PREPEND
	array_push($uls, "</ul>\n");// APPEND
 
	return $uls; 
}

/*  Version 2 of embedList()
	Using PHP XML DOM when list only contains <p>s
	Logic of recursion is also different from V0
*/
function embedList($list, $level){ 
	$delimiter= "<h$level>";
	$deliEND = "</h$level>";
	$subTAG = "div";

	$newList = "";
	$pos = strpos($list, $delimiter);
	if ( $pos === false) {
	# Input List is just Array of <p>s	
		$newList = 	wrapLI($list); 
	
	} else{
	# Input List is Array of <p>s + (<H*> + <p>s)s
		$uls = explode($delimiter, $list);
		
		#[ <p>s ]
		if(trim($uls[0])!=""){
			$uls[0] = wrapLI($uls[0]); 
		}
		$newList .= $uls[0]."\n";

		#[(<H*> + <p>s)s]
		for($i = 1; $i<count($uls); $i++) {
			list($ulSubject,$ulContent) = explode($deliEND, $uls[$i]);
			$ulContent = embedList($ulContent,$level+1);
			$newList .= "<li>\n<$subTAG>$ulSubject</$subTAG>\n$ulContent</li>";
		}

	}

	$uls="";
	if(trim($newList)!=""){
		$dom = new DOMDocument();
		$dom->preserveWhiteSpace = FALSE; $dom->formatOutput = TRUE;
		
		$root = $dom->createElement("ul");
		$root->setAttribute("class", "L_$level");
		$dom->appendChild($root);
		
		$fragement = $dom->createDocumentFragment();
		$fragement->appendXML("$newList");
		$root->appendChild($fragement);
		
		$uls = $dom->saveHTML();
		unset($dom);
	}

	return $uls;
}

/*  Used by embedList V2 for every item
	Input is a string cotains a list of items without any delimiter
	Wrap every of those items with <li> and then renturn
*/
function wrapLI($list){
	$dom = new DOMDocument();
	$dom->preserveWhiteSpace = FALSE;
	
	$dom->loadXML("<ul>$list</ul>");
	$root =$dom->documentElement;
	
	$newList = "";
	if($root->hasChildNodes()){
		foreach ($root->childNodes as $child) {
			$temp = $child->ownerDocument->saveXML($child); //echo "$temp\n------\n";
			if (trim($temp)!="") {
				$newList .= "<li><div>$temp</div></li>\n";
			}
		}
	}
	unset($dom);
	$newList = rtrim($newList, "\n"); //echo "$newList------\n";
	
	return $newList;
}

$title = "Markdown Syntax";#<title>Markdown Syntax</title>
$body = file_get_contents("pTest.in");

// 1st version of genterate List
// $list = "<h1>$title</h1> $body";
// $level = 1;
// $uls = list_albe($list,$level);
// $uls = implode("",$uls);

// if ($level==0) {$dt = print_r($uls,true);file_put_contents('pTest.out', $div);}
// $divs = implode("",$divs);
// file_put_contents('../../pTest_out.html', $divs);


// 2nd version of generate List
$uls = listABLE($title,$body);
// $out = print_r($uls,true);file_put_contents('pTest.out', $out);

/*Specific Process for Scroll After getting the Embeded List*/
$level_name = array('zero','one','two','three','four','five');
for ($i=0; $i <count($level_name) ; $i++) { 
	$uls = str_replace("L_$i", $level_name[$i].'_level', $uls);
}

$dom = new DOMDocument();
$dom->preserveWhiteSpace = FALSE;
$dom->formatOutput = TRUE;
$dom->loadXML($uls);
$root = $dom->documentElement;

$xpath = new DOMXPath($dom);
$query = '//li/div';
$entries = $xpath->evaluate($query);

foreach ($entries as $entry) {
	$temp = trim($entry->ownerDocument->saveHTML($entry));
	$temp = str_replace("<a", "<bold", $temp);
	$temp = str_replace("</a>", "</bold>", $temp);

	$temp = str_replace("<p>", "<span>", $temp);
	$temp = str_replace("</p>", "</span>", $temp);

	$start = strlen("<div>");
	$length = strlen($temp)-$start*2-1;
	$temp = substr($temp, $start,$length);
	$temp = "<a>".trim($temp)."</a>";
	
	$fragment = $dom->createDocumentFragment();
	$fragment->appendXml($temp);
	$entry->parentNode->replaceChild($fragment,$entry);
}

$uls = $dom->saveHTML();
$out = print_r("--\n".$uls,true);file_put_contents('pTest.out', $out);

$template = file_get_contents("Scroll_template.html");
$template = str_replace("<structuredBODY/>", $uls, $template);
file_put_contents('../../pTest_out.html', $template);



?>