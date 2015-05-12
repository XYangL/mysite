<?php  

/*----------SLIDE------------*/
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
/*1st Version */
function splitSlide1( $div, $deli_array,$deli_index){
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

function slideABLE($title, $rawBODY){
	$div =  $rawBODY; // !!!! ??? title + rawBODY
	$deli_array =array('<h1>','<h2>','<h3>');
	#1. Split body into slides : splitSlide($div, $deli_array,$deli_index)
	$divs = splitSlide($div, $deli_array, 0);
	
	#2. Put every slides in a div.slide
	$START = "<div class=\"slide\">";
	$END = "</div>";
	for($i = 1; $i<count($divs);$i++) {
		$divs[$i] = $START."\n".$divs[$i].$END;
	}
	
	#3. Re-style the TOC slide
	$TOCSlide = array_shift($divs);
	$TOCSlide = str_replace("h1>","p>",$TOCSlide) ;
	$TOCSlide = "<div class=\"slide\">\n<h1>Outline</h1>".$TOCSlide."</div>";// echo "$TOCSlide";

	#4. Generate the 1st slide with Title 
	$titleSlide = "<div class=\"slide\">\n<h1>".$title."</h1>\n</div>"; // echo $titleSlide;
	
	#5. Compose all the divs into a string $structuredBODY
	$structuredBODY = implode("\n\n",$divs);// echo $structuredBODY;
	$structuredBODY =  $titleSlide."\n\n".$TOCSlide."\n\n".$structuredBODY; // echo $structuredBODY;

	return $structuredBODY;

}

function splitSlide( $div, $deli_array,$deli_index){
	# Check if need to split $div 
	if ($deli_index >= count($deli_array)){
	# C1 : NOT have More $delimiter, so No need to split
		$divs =  array($div);
	
	} else {
	# C2: DO have More Detailed $delimiter
		$delimiter = $deli_array[$deli_index];
		
		if (strpos(" ".$div, $delimiter) === FALSE){
		# C2-1 : NOT have $delimiter of this level, 
		# so try $delimiter of Next Level which is more Detailed
			$deli_index +=1;
			$divs = splitSlide($div, $deli_array,$deli_index);
		
		}else{
		# C2-2 : DO have $delimiter of this level, 
		# so start Split $div based on $delimiter
		
		#1. cut title+div into pieces separated by $delimiter
			#$div should be prepended with ' ' a whitespace to ensure an outline slides as $divs[0]
			$divs = explode($delimiter, " ".$div);
			
			#$divs[0] now contains title & will be treated as intro slide of this title setion, 
			#so sub-titles of this section wrapped by $delimiter should be appended to it
			$divs[0] .= "\n";

		#2. Add the sub-title of each div to intro slide $divs[0]
			$subTitle = array('subTitle');
			if ($delimiter!='<li>') {
				for($i = 1; $i<count($divs);$i++) {
			#2.1 re-add $delimiter to get meanful $divs, except $div[0]:outline	
					$divs[$i]=$delimiter.$divs[$i];
					
			#2.2 get the sutTitle of the slides
					$subTitle[$i] = get_string_between($divs[$i],$delimiter);
					
			#2.3 append the sutTitle to outline
					$divs[0] .= $subTitle[$i];
				}
			}

		#3. Try to further split divs:
			#3.0 $reslut is an array of all the new divs; 
			#so every new splitted array of divs will be appended to it
			$reslut = array($divs[0]);

			#3.1 Update Parameters	
			$deli_index +=1;
			for($i = 1; $i<count($divs);$i++) {
			
			#3.2 Further Split
				$divTemp = $divs[$i];
				$divTemp = splitSlide( $divTemp, $deli_array,$deli_index);

			#3.3 if not toppest slides, Add its own subTitle[$i] to all it splitted slides
			#sub[0] is outline, already contained all following subject, no need to add
				for($sub_i = 1; $sub_i<count($divTemp);$sub_i++) {
					$divTemp[$sub_i] = $subTitle[$i].$divTemp[$sub_i];
				}

			#3.4 append new splitted array of divs to $result	
				$reslut = array_merge($reslut,$divTemp);# $reslut += $divTemp;
			}

		#4. set results to return divs
			$divs = $reslut; //echo implode("", $divs)."\n--------\n";
		}
	}
	
	return $divs;
}

//-------------------20150508---------------
function splitLI($divs){
	/*Prettify HTML [!! NOT Work Properly !!]*/ 
	$dom = new DOMDocument();
	$dom->preserveWhiteSpace = FALSE; $dom->formatOutput = TRUE;
	$dom->loadXML($divs);

	$xpath = new DOMXPath($dom);
	$query = '/body/div/ol';
	$entries = $xpath->evaluate($query);

	foreach ($entries as $olNODE) {
		$nextSiblingDivNode = $olNODE->parentNode->nextSibling;
		
		$APPEND = $dom->saveXML($olNODE); // ol
		$olAppFrag = $dom->createDocumentFragment();
		$olAppFrag->appendXML($APPEND);
		
		$divNODE = $olNODE->parentNode;
		$divNODE->removeChild($olNODE);
		$TEMPLATE = $dom->saveXML($divNODE); // div

		$divNODE->parentNode->removeChild($divNODE);

		$dom->appendChild($olAppFrag);
		$liNODES = $dom->lastChild->childNodes;

		$len = $liNODES->length;
		for ($i = $len-1; $i>=0; $i--) {
			$liNODE = $liNODES->item($i);
			if ($liNODE->tagName !=="li") {
				$liNODE->parentNode->removeChild($liNODE);
			}
		}

		$len = $liNODES->length;
		for ($i = 0; $i<$len; $i++) {
			
			$olFragement =  $dom->createElement("ol");
			$i -=1;

			for($time = 0; $time <2; $time++){
				$i += 1;
				if($i<$len){
					$liNODE = $liNODES->item($i);
					$liFragement = $dom->createDocumentFragment();
					$liFragement->appendXML($dom->saveXML($liNODE)); //echo  $dom->saveXML($liFragement);

					$olFragement->appendChild($liFragement); //echo  $dom->saveXML($olFragement)."\n";
					unset($liFragement);	
				}
			}

			if ($olFragement->nodeValue != "") {
				$divTempFrag = $dom->createDocumentFragment();
				$divTempFrag->appendXML($TEMPLATE);			
				$divTempFrag->firstChild->insertBefore($olFragement);//echo  $dom->saveXML($divTempFrag)."\n";

				$dom->documentElement->insertBefore($divTempFrag,$nextSiblingDivNode);
				unset($divTempFrag);
			}
			unset($olFragement);
		}

		// $dom->documentElement->removeChild($olAppFrag);
		// $temp = $dom->saveXML($dom->documentElement);
		// $divs .= $temp."\n--------entry----\n\n";
	}

	$divs = "";
	foreach ($dom->documentElement->childNodes as $child) {
		$divs .= $dom->saveXML($child);
	}
	unset($dom);
	return $divs;
}

/*--------------------------*/


/*----------LIST------------*/
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
/*--------------------------*/


/*----------Test------------*/

$title = "Markdown Syntax";#<title>Markdown Syntax</title>
$body = file_get_contents("pTest.in");

$divs = slideABLE($title, $body);
$divs = "<body>".trim($divs)."</body>";
// $divs = str_replace("\n", "", $divs);
// $divs = str_replace("\t", "", $divs);
$divs=splitLI($divs);

/*Prettify HTML [!! NOT Work Properly !!]*/ 

$out = print_r($divs,true);file_put_contents('pTest.out', $out);

$template = file_get_contents("Slidy_template.html");
$template = str_replace("<body><structuredBODY/></body>", $divs, $template);
file_put_contents('../../pTest_out.html', $template);

//------------------------------
// 1st version of genterate List
// $list = "<h1>$title</h1> $body";
// $level = 1;
// $uls = list_albe($list,$level);
// $uls = implode("",$uls);

// if ($level==0) {$dt = print_r($uls,true);file_put_contents('pTest.out', $div);}
// $divs = implode("",$divs);
// file_put_contents('../../pTest_out.html', $divs);


//------------------------------
// 2nd version of generate List
# uls = listABLE($title,$body);
// $out = print_r($uls,true);file_put_contents('pTest.out', $out);

/*Specific Process for Scroll After getting the Embeded List*/
# $level_name = array('zero','one','two','three','four','five');
# for ($i=0; $i <count($level_name) ; $i++) { 
# 	$uls = str_replace("L_$i", $level_name[$i].'_level', $uls);
# }

# $dom = new DOMDocument();
# $dom->preserveWhiteSpace = FALSE;
# $dom->formatOutput = TRUE;
# $dom->loadXML($uls);
# $root = $dom->documentElement;

# $xpath = new DOMXPath($dom);
# $query = '//li/div';
# $entries = $xpath->evaluate($query);

# foreach ($entries as $entry) {
# 	$temp = trim($entry->ownerDocument->saveHTML($entry));
# 	$temp = str_replace("<a", "<bold", $temp);
# 	$temp = str_replace("</a>", "</bold>", $temp);

# 	$temp = str_replace("<p>", "<span>", $temp);
# 	$temp = str_replace("</p>", "</span>", $temp);

# 	$start = strlen("<div>");
# 	$length = strlen($temp)-$start*2-1;
# 	$temp = substr($temp, $start,$length);
# 	$temp = "<a>".trim($temp)."</a>";
	
# 	$fragment = $dom->createDocumentFragment();
# 	$fragment->appendXml($temp);
# 	$entry->parentNode->replaceChild($fragment,$entry);
# }

# $uls = $dom->saveHTML();
# $out = print_r("--\n".$uls,true);file_put_contents('pTest.out', $out);

# $template = file_get_contents("Scroll_template.html");
# $template = str_replace("<structuredBODY/>", $uls, $template);
# file_put_contents('../../pTest_out.html', $template);

?>