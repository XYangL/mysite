<?php  

# Install PSR-0-compatible class autoloader
spl_autoload_register(function($class){
	require preg_replace('{\\\\|_(?!.*\\\\)}', DIRECTORY_SEPARATOR, ltrim($class, '\\')).'.php';
});

# Get Markdown class
use \Michelf\Markdown;

class Parser{
	// private PARSER_FOLDER = getcwd ();
	const CONFIG_FOLDER = "API/config";//
	const BETA_FOLDER = "API/beta";//
	const CSS_FOLDER = "";
	const JS_FOLDER = "";
	
	public $success = FALSE; # will be true if presentableHTML is parsered as designed

	# Input from User
	public $title = "";
	public $contentMD = "";
	public $style = "";
	
	# Decided by $style according to paradigm.json; 
	# $paradigm will be FALSE if the style is not supported
	public $paradigm = "";

	# If $style is suportted ($paradigm is NOT FALSE), _config.xml will be loaded 
	# self::PARSER_FOLDER."/".self::CONFIG_FOLDER."/".$this->basicConfig;
	private $basicConfig = "basic_config.xml"; # will be DOMDocument after construct
	private $specificConfig = None;
	private $deli_array = array('<h1>','<h2>','<h3>');
	
	# private vars linking different parts of Parser 1&2
	private $rawBODY = ""; // private $rawBODY = "";
	private $basicHEAD = ""; // private $basicHTML = "";
	private $structuredBODY = ""; // private $structuredHTML = "";
	private $specificHTML = "";
	
	public $presentableHTML = "";

	function __construct($basicConfig="",$deli_array =array()){
		if ($basicConfig == "" ){ $basicConfig = $this->basicConfig; }
		if ($deli_array == array()){ $deli_array = $this->deli_array;}

		$dom = new DOMDocument;
		$dom->preserveWhiteSpace = FALSE;
		$dom->formatOutput = TRUE;
		$dom->load(self::CONFIG_FOLDER."/".$basicConfig);
		$this->basicConfig = $dom;
		unset($dom);

		$this->deli_array = $deli_array;
		
	}

	# called by User for converting content in Markdown to Presentable HTML
	public function main($title, $contentMD, $style)
	{	
		if( trim($title) == "" || trim($contentMD) == "" || trim($style) == "" ){
			$this->success = FALSE; $this->presentableHTML = "";
			return $this->presentableHTML;// ? return FALSE??
		} 

		#0 Check if the style is supported; If not support, the parser will be paused and return FALSE.
		$this->paradigm = $this->setParadigm($style);
		if( $this->paradigm == FLASE ){
			$this->success = FALSE; $this->presentableHTML = "";
			return $this->presentableHTML;// ? return FALSE??
		}

		$this->title = $title;
		$this->contentMD = $contentMD;
		$this->style = $style;
		
		# A Parser 1.1
		$this->rawBODY = $this->md2html($this->contentMD);

		# B Parser 1.2	public function setBasicHEAD($title,$basicConfig)
		$this->basicHEAD = $this->setBasicHEAD($this->title,$this->basicConfig);

		# C Parser 2.1	public function reOrganizeBODY($rawBODY,$paradigm)
		$this->structuredBODY = $this->reOrganizeBODY($this->title, $this->paradigm, $this->rawBODY);
		
		# D Parser 2.2	public function setSpecificStyle($structuredBODY, $specificConfig)
		$this->specificHTML = $this->setSpecificStyle($this->style, $this->basicHEAD, $this->structuredBODY);
		$this->success = TRUE;
		
		$this->presentableHTML = $this->specificHTML;
		
		return $this->success;
		
	}

	#if $style is suportted, set $paradigm [[& $configs ???? ]]  
	#Or, set $paradigm = FALSE
	public function setParadigm($style=""){
		if ($style == ""){ $style = $this->style; }

		$paradigm = "";

		// ----- TO-DO -----
		// Need to updated as checking configs files
		if ($style=="Slidy" || $style=="S5") {
			$paradigm = "Slide";
		} elseif ($style == "Scroll") {
			$paradigm = "List";
		} else {
			$paradigm = FALSE;
		}
		// ----------------

		return $paradigm;
	}

	# A Parser 1.1
	# Only process $content in Markdown
	# Returned $rawBODY only inlucdes content in list of <p>s+<h*>s
	public function md2html($contentMD=""){ 
		if ($contentMD == ""){ $contentMD = $this->contentMD; }
		
		$rawBODY="";
		
		#Convert content via the Markdown parser; Returned is list of <p>s+<h*>s
		$rawBODY = Markdown::defaultTransform($contentMD);

		#Math
		// ??workable now, but need check Latex in multilines & past input example

		return $rawBODY;
	}

	# B Parser 1.2
	# Generate the common part inside <head>
	# Returned $basicHEAD includes <$title> & $basicConfig about style
	public function setBasicHEAD($title="", $basicConfig=""){
		if ($title == ""){ $title = $this->title; }
		if ($basicConfig == ""){ $basicConfig = $this->basicConfig; }

		$basicHEAD = "";

		# Construct $rawBODY: html>(head>title)+(body>rawBODY)
		$titleInHead="\t<title>".$title."</title>";
		$basicStyleInHead =file_get_contents(self::BETA_FOLDER."/"."Basic_head.in");
		$basicHEAD ="$titleInHead\n$basicStyleInHead";
	
		return $basicHEAD;
	}

	# C Parser 2.1
	# Only process $rawBODY based on $paradigm, Also need title as the cover page
	# Returned $structuredBODY inlucdes an array of div.slide or an embeded list
	public function reOrganizeBODY($title="", $paradigm="",$rawBODY=""){  
		if ($title == ""){ $title = $this->title; }		
		if ($paradigm == ""){ $paradigm = $this->paradigm; }
		if ($rawBODY == ""){ $rawBODY = $this->rawBODY; }

		$structuredBODY = "";

		switch ($paradigm) {
			case 'Slide':
				$structuredBODY = $this->slideABLE($title, $rawBODY); # String
				break;
			case 'List':
				$structuredBODY = $this->listABLE($title, $rawBODY); # String
				break;
			
			default:
				# code...
				break;
		}

		return $structuredBODY;
	}

	# D Parser 2.2
	public function setSpecificStyle($style="", $basicHEAD="", $structuredBODY=""){
	// setSpecificStyle($structuredBODY, $specificConfig){
		if ($style == ""){
			$style = $this->style;
		}
		if ($basicHEAD == ""){
			$basicHEAD = $this->basicHEAD;
		}
		if ($structuredBODY == ""){
			$structuredBODY = $this->structuredBODY;
		}

		$specificHTML = "";

		$styleHEAD = file_get_contents(self::BETA_FOLDER."/".$style."_head.in");
		$styleBODY = file_get_contents(self::BETA_FOLDER."/".$style."_body.in");

		$specificHEAD = "$basicHEAD\n $styleHEAD\n";
		
		$countTEMP = 0;
		switch ($style) {
			case 'S5':				
				$specificBODY = str_replace("<structuredBODY/>", $structuredBODY, $styleBODY, $countTEMP);
				break;
			case 'Slidy':
				$specificBODY = $structuredBODY; $countTEMP = 1;

				break;
			case 'Scroll':

				$dom = new DOMDocument();
				$dom->preserveWhiteSpace = FALSE; $dom->formatOutput = TRUE;
				$dom->loadXML($structuredBODY);

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

				$structuredBODY = $dom->saveHTML();
				unset($dom);//echo $entries->length;

				$level_name = array('zero','one','two','three','four','five');
				for ($i=0; $i <count($level_name) ; $i++) { 
					$structuredBODY = str_replace("L_$i", $level_name[$i].'_level', $structuredBODY);
				}
				
				$specificBODY = str_replace("<structuredBODY/>", $structuredBODY, $styleBODY, $countTEMP);

				break;
			
			default:
				# code...
				break;
		}
		if ($countTEMP != 1) {
			echo "Parser Error : replace <structuredBODY/> $countTEMP times!";
		}

		$specificHTML = "<html>\n";
		$specificHTML .="<head>\n$specificHEAD</head>\n";
		$specificHTML .="<body>\n$specificBODY</body>\n";
		$specificHTML .="</html>\n";
		// echo $specificHTML;
		return $specificHTML;
	}

	public function output(){
		$presentableHTML = "";

		return $presentableHTML;
	}

	private function log($var){
		echo "<pre>";
		var_dump($var);
		echo "</pre>";
	}

/*--- SLIDE ---*/	
	/* When called from toppest:
		$div = $title.$body;
		$deli_array =array('<h1>','<h2>');   $deli_index = 0;
		$divs = splitSlide($div, $deli_array,$deli_index);

		$START = "\n<div class=\"slide\">";  $END = "\n</div>\n";
		for($i = 0; $i<count($divs);$i++) {
			$divs[$i] = $START.$divs[$i].$END;
		}

		$body_new = implode("",$divs);
	*/
	private function slideABLE($title, $rawBODY){
		$div =  $rawBODY; // !!!! ??? title + rawBODY
		
		#1. Split body into slides : splitSlide($div, $deli_array,$deli_index)
		$divs = $this->splitSlide($div, $this->deli_array, 0);
		
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

	private function splitSlide( $div, $deli_array,$deli_index){
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
				$divs = $this->splitSlide($div, $deli_array,$deli_index);
			
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
						$subTitle[$i] = $this->get_string_between($divs[$i],$delimiter);
						
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
					$divTemp = $this->splitSlide( $divTemp, $deli_array,$deli_index);

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

	private function get_string_between($string, $delimiter){
	    $string = " ".$string;
	    $start = $delimiter;
	    $end = "</".substr($delimiter, 1);
	    $ini = strpos($string,$start);
	    if ($ini == 0) return "";
	    $ini += strlen($start);
	    $len = strpos($string,$end,$ini) - $ini;
	    return $start.substr($string,$ini,$len).$end."\n";
	}
/*-------------*/

/*--- LIST ---*/
	/* When called from toppest:
		$list = "<h1>$title</h1> $body";
		$level = 1;
		$body_new = embedList($list,$level);
	2nd version of convert list of (<h>+<p>s)s in to embeded list
	Called embedList() recursivly
	*/
	private function listABLE($title, $rawBODY){		
		$list = "<h1>".$title."</h1>".$rawBODY;
		$level = 1;

		$structuredBODY = $this->embedList($list,$level); // String

		return $structuredBODY;
	}

	private function embedList($list, $level){ 
		$delimiter= "<h$level>";
		$deliEND = "</h$level>";
		$subTAG = "div";

		$newList = "";
		$pos = strpos($list, $delimiter);
		if ( $pos === false) {
		# Input List is just Array of <p>s	
			$newList = 	$this->wrapLI($list); 
		
		} else{
		# Input List is Array of <p>s + (<H*> + <p>s)s
			$uls = explode($delimiter, $list);
			
			#[ <p>s ]
			if(trim($uls[0])!=""){ $uls[0] = $this->wrapLI($uls[0]); }
			$newList .= $uls[0]."\n";

			#[(<H*> + <p>s)s]
			for($i = 1; $i<count($uls); $i++) {
				list($ulSubject,$ulContent) = explode($deliEND, $uls[$i]);
				$ulContent = $this->embedList($ulContent,$level+1);
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

	private function wrapLI($list){
		$dom = new DOMDocument();
		$dom->preserveWhiteSpace = FALSE;
		
		$dom->loadXML("<ul>$list</ul>");
		$root = $dom->documentElement;
		
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
/*-------------*/
}

//-- For Testing --
// $deli_array =array('<h1>','<h2>','<h3>');

// $PARSER = new Parser("", $deli_array);

// $mdSrc = getcwd ()."/mdSrc/content.md";
// $title ="Markdown Syntax";
// $contentMD = file_get_contents($mdSrc);
// $style = "Slidy";

// $PARSER->main($title, $contentMD, $style);

/* Output to File*/
// if($PARSER->success){
// 	// echo $PARSER->presentableHTML;	
// 	file_put_contents('../pTest_out.html', $PARSER->presentableHTML);
// } else{
// 	echo 'Error: Success==FALSE';
// }
// -----------------
?>