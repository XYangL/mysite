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
	private $deli_array = array('<h1>','<h2>');
	
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
				
				$specificBODY = str_replace("<structuredBODY/>", $structuredBODY, $styleBODY, $countTEMP);
				$specificBODY = str_replace("<ul class = \"level_1\">","<ul class = \"one_level\">", $specificBODY);
				$specificBODY = str_replace("<ul class = \"level_2\">","<ul class = \"two_level\">", $specificBODY);
				$specificBODY = str_replace("<ul class = \"level_3\">","<ul class = \"three_level\">", $specificBODY);
				$specificBODY = str_replace("<ul class = \"level_4\">","<ul class = \"four_level\">", $specificBODY);
				$specificBODY = str_replace("<ul class = \"level_5\">","<ul class = \"five_level\">", $specificBODY);
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
		$delimiter = $deli_array[$deli_index];

		// -- to do -- check how to decided when to stop splitting
		if (strpos(" ".$div, $delimiter) == FALSE){
			return array($div);
		}
		
		#Base 1. cut title+div into pieces separated by $delimiter
		#$div should be prepended with ' ' a whitespace to ensure an outline slides as $divs[0]
		#$divs[0] contained Ttitle & intro; Will be appended with $delimiter[content]
		$divs = explode($delimiter, " ".$div);
		$divs[0] .= "\n";

		#Base 2. Add the subject ,$delimiter[content], of each div to outline slides
		$subject = array('title');
		if ($delimiter!='<li>') {
			
			for($i = 1; $i<count($divs);$i++) {
				#2.1 re-add $delimiter to get meanful $divs, except $div[0]:outline	
				$divs[$i]=$delimiter.$divs[$i];
				
				#2.2 get the sutject of the slides
				$subject[$i] = $this->get_string_between($divs[$i],$delimiter);
				
				#2.3 append the sutject to outline
				$divs[0] .= $subject[$i];
			}
			// echo $divs[0]."\n------\n";
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
				$divTemp = $this->splitSlide( $divTemp, $deli_array,$deli_index);
			
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

	/* When called from toppest:
		$list = "<h1>$title</h1> $body";
		$level = 1;

		$uls = embedList($list,$level); // Array of <ul>s

		$body_new = implode("",$divs);
	*/
	private function listABLE($title, $rawBODY){		
		$list = "<h1>".$title."</h1>".$rawBODY;
		$level = 1;
		$uls = $this->embedList($list,$level); // Array of <ul>s

		$structuredBODY = implode("",$uls); //echo $structuredBODY;
		return $structuredBODY;
	}
	private function embedList($list, $level){
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
				$temp = $this->embedList($ulContent, $levelNext);
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

}

// //-- For Testing --
// $deli_array =array('<h1>','<h2>','<li>');

// $most_detailed = 3;
// $PARSER = new Parser("", array_slice($deli_array, 0, $most_detailed));

// $mdSrc = getcwd ()."/mdSrc/content.md";
// $title ="Markdown Syntax";
// $contentMD = file_get_contents($mdSrc);
// $style = "Scroll";

// $PARSER->main($title, $contentMD, $style);

// if($PARSER->success){
// 	// echo $PARSER->presentableHTML;	
// 	file_put_contents('../pTest_out.html', $PARSER->presentableHTML);
// } else{
// 	echo 'Error: Success==FALSE';
// }
// -----------------
?>