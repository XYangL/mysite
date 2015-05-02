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


function list_albe($list, $level){
	$delimiter= "<h$level>";
	$deliEND = "</h$level>";
	$deliFINAL = "<p>";
	$uls = explode($delimiter, $list);

	for($i = 1; $i<count($uls); $i++) {
	
		// $uls[$i]=$delimiter.$uls[$i];
		list($ulSubject,$ulContent) = explode($deliEND, $uls[$i]);
		// $uls[$i]=$ulSubject."--/n".$ulContent;
		
		$levelNext = $level+1;
		$deliNext = "<h$levelNext>";

		if (strpos($ulContent, $deliNext)) {
			# HAS Further UL
			$temp = list_albe($ulContent, $levelNext);
			$ulContent = implode("",$temp);
		} elseif (strpos($ulContent, $deliFINAL)){
			# NO Further UL, left is $deliFINAL = <p>s
			// !!!! Repalce <p> with <li><a href=\"#\"><span>\n ???? with<li><a><p>\n
			$temp = explode($deliFINAL, ' '.$ulContent);
			$deliReplace =  "<li><a href=\"#\"><span>";
			$temp = implode($deliReplace,$temp);
			$temp = explode("</p>", ' '.$temp);
			$deliReplace =  "</span></a></li>";
			$temp = implode($deliReplace,$temp);
			// print_r($temp);
			$ulContent = "<ul class = \"level_$levelNext\">\n".$temp."</ul>\n";
		} 

		// if (!strpos($ulContent, $levelNext)) {
			# NO further ul
		$leadTAG = "a";
		$ulSubject ="<$leadTAG>$ulSubject</$leadTAG>";
	// 		$ulContent = str_replace("<p>", "<li><div>", $ulContent);
	// 		$ulContent = str_replace("</p>", "</div></li>", $ulContent);
	// 		$ulContent= "<ul class=\"level_".($level+1)."\">$ulContent</ul>\n";
	// 	}
	// 	// $uls[$i]= array($ulSubject,$ulContent);
		$uls[$i] = "$ulSubject \n$ulContent";
		$uls[$i] = "<li>".$uls[$i]."</li>\n";
	
	// 	// $uls[0] .= $subject[$i];

	}

	$uls[0] = "<ul class = \"level_$level\">\n"; // PREPEND
	$uls[count($uls)]="</ul>\n"; // APPEND
	return $uls;
}

function listABLE($title, $rawBODY){		
	$list = "<h1>".$title."</h1>".$rawBODY;
	$level = 1;
	$uls = embedList($list,$level); // Array of <ul>s

	$structuredBODY = implode("",$uls); //echo $structuredBODY;
	return $structuredBODY;
}

function embedList($list, $level){
	$delimiter= "<h$level>";
	$deliEND = "</h$level>";
	$deliFINAL = "<p>";
	$subjectTAG = "a";
	$uls = explode($delimiter, $list);

	for($i = 1; $i<count($uls); $i++) {

		list($ulSubject,$ulContent) = explode($deliEND, $uls[$i]);
		
		$ulSubject ="<$subjectTAG>$ulSubject</$subjectTAG>";

		$levelNext = $level+1;
		$deliNext = "<h$levelNext>";
		if (strpos($ulContent, $deliNext)) {
			# HAS Further UL
			$temp = embedList($ulContent, $levelNext);
			$ulContent = implode("",$temp);
		} elseif (strpos($ulContent, $deliFINAL)){
			# NO Further UL, left is $deliFINAL = <p>s

			$ulContent = str_replace("<a href","<bold href",$ulContent);
			$ulContent = str_replace("</a>","</bold>",$ulContent);

			// !! Repalce <p> with <li><a href=\"#\"><span>\n ???? with<li><a><p>\n
			$deliReplace =  "<li><a href=\"#\"><span>";
			// $temp = explode($deliFINAL, ' '.$ulContent);
			// $temp = implode($deliReplace,$temp);
			$ulContent = str_replace("<p>",$deliReplace,$ulContent);
			
			$deliReplace =  "</span></a></li>";
			// $temp = explode("</p>", ' '.$temp);
			// $temp = implode($deliReplace,$temp);
			$ulContent = str_replace("</p>",$deliReplace,$ulContent);
			
			$ulContent = "<ul class = \"level_$levelNext\">\n".$ulContent."</ul>\n"; // echo $ulContent;
		}

		$uls[$i] = "$ulSubject \n$ulContent";
		$uls[$i] = "<li>".$uls[$i]."</li>\n";
		
	}

	array_unshift($uls, "<ul class = \"level_$level\">\n");
	array_push($uls, "</ul>\n");
	// $uls[0] = "<ul class = \"level_$level\">\n"; // PREPEND
	// $uls[count($uls)]="</ul>\n"; // APPEND
	return $uls;
}


$title = "Markdown Syntax";#<title>Markdown Syntax</title>
$body = file_get_contents("pTest.in");

$list = "<h1>$title</h1> $body";
$level = 1;

// $uls = list_albe($list,$level);
// $uls = implode("",$uls);

$uls = listABLE($title,$body);

$out = print_r($uls,true);file_put_contents('pTest.out', $out);

// if ($level==0) {$dt = print_r($uls,true);file_put_contents('pTest.out', $div);}


// $divs = implode("",$divs);
// file_put_contents('pTest_out.html', $SlidyHead.$divs.$SlidyEND);

?>