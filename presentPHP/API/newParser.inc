<?php  

## 1202
## Accept title and other config in content.src
## parserTest.php, newParser.inc, CAScroll.js, editor.js, ?editor.php?, 


# Install PSR-0-compatible class autoloader
spl_autoload_register(function($class){
	require preg_replace('{\\\\|_(?!.*\\\\)}', DIRECTORY_SEPARATOR, ltrim($class, '\\')).'.php';
});

# Get Markdown class
use \Michelf\Markdown;
use \Michelf\MarkdownExtra;

class Parser{
	// private PARSER_FOLDER = getcwd ();
	const API_FOLDER = __DIR__;//"API/"
	const CONFIG_FOLDER = "config";//
	const HB_FOLDER = "config/head_body";//
	const IMAGE_FOLDER = "images";
	const EXPORT_FOLDER = "export";
	const CSS_FOLDER = "";
	const JS_FOLDER = "";
	
	public $success = FALSE; # will be TRUE if presentableHTML is parsered as designed

	# Input from User
	public $title = "";
	public $contentMD = "";
	public $style = "";
	
	# Decided by $style according to paradigm.json; 
	# $paradigm will be FALSE if the style is not supported
	public $paradigm = "";
	public $supportedStyle = "";//supported_style.json

	# If $style is suportted ($paradigm is NOT FALSE), _config.xml will be loaded 
	# self::PARSER_FOLDER."/".self::CONFIG_FOLDER."/".$this->basicConfig;
	private $basicConfig = "xml/basic_config.xml"; # will be DOMDocument after construct
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
		$dom->load(self::API_FOLDER."/".self::CONFIG_FOLDER."/".$basicConfig);
		$this->basicConfig = $dom;
		unset($dom);

		$this->deli_array = $deli_array;
		
		/* Get list support style from folder config, since every must has *.json*/
		$this->supportedStyle = scandir(self::API_FOLDER."/".self::CONFIG_FOLDER);
		$this->supportedStyle = array_filter($this->supportedStyle,  function($item){
			return strpos($item, '.json');
		});
		foreach ($this->supportedStyle as &$value) { $value = explode('.json', $value)[0]; }
		$this->supportedStyle = array_values($this->supportedStyle);/*reset key from 0*/
	}

	# called by User for converting content in Markdown to Presentable HTML
	public function main($title, $contentSRC, $style)
	{	
		if( trim($contentSRC) == "" || trim($style) == "" ){
			$this->success = FALSE; $this->presentableHTML = "";
			return $this->presentableHTML;// ? return FALSE??
		} 

		#0 Check if the style is supported, 
		#  If support, load *style*.json & set $paradigm
		#  If not support, the parser will exit and return FALSE.
		if (in_array($style, $this->supportedStyle)) {
			$this->specificConfig = file_get_contents(self::API_FOLDER."/".self::CONFIG_FOLDER."/".$style.'.json');
			$this->specificConfig = json_decode($this->specificConfig, TRUE);
			$this->paradigm = $this->specificConfig['paradigm'];// print_r( $this->specificConfig);
		} else {
			$this->success = FALSE; $this->presentableHTML = "";
			return $this->presentableHTML;// ? return FALSE??
		}
		
		$this->title = $title;
		$this->contentMD = $contentSRC;
		$this->style = $style;

		# Convert new Syntax in to Markdown
		# also get $this->title and append user configure to $this->specificConfig['head']
		$this->contentMD = $this->src2md($this->contentMD);

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

	# Convert new Syntax in to Markdown
	# - [^img:1]:... to [^img:1]:![]:(...)
	# - move footnote [^...] to the end
	# - wrap list block with h$LEV > div[markdown='1']
	# - split list from lines in the same block into [^one:1]
	# - combine multi lines into one with <br/>
	# - tabs into #* for being converted to <h$LEV> later
	public function src2md( $inputSRC){
		if ($inputSRC == ""){ $inputSRC = $this->contentMD; }

		# $cotentSRC from <textarea> has carriage return indstead of \n
		$inputSRC = str_replace("\r", "",  $inputSRC);

		# Separate title and User Configureation from src
		list($configSRC , $contentSRC) = preg_split('/(\n)+====+(\n)+/', $inputSRC, 2);
		
		
		#Process customer configuration from user input
		if($contentSRC){
		# If HAS input configure, 
			# map the input configure to variables array
			$configSRC = str_replace(array(":", "\n"), array("=", "&"), $configSRC);
			parse_str($configSRC, $configMap); 
			$configMap = array_map('trim', $configMap);
			// preg_match_all("/([^:\n]+): *([^:\n]+)/", $configure, $configure); 
			// $configure = array_combine($configure[1], $configure[2]);	

			if(isset($configMap['title']))// if($configure['title'])
				$this->title = $configMap['title'];

			# compose input condiguration as a js object
			$userConfig = json_encode($configMap, JSON_PRETTY_PRINT);
			$userConfig = <<<CONFIG
\n	<script>
	var userConfigure = $userConfig;
	</script>\n
CONFIG;
			$this->specificConfig['head'] .=$userConfig;//var_dump($userConfig);			

		} else{
		# If NO input configure, content will be spit into config, so should be replaced.
			list($contentSRC, $configSRC) = array($configSRC , $contentSRC);
		}

		# items are separated by '\n\n'
		# - Replace the spaces in separated line with '\n'
		# --? repalce \n\n*\n with \n\n ?? 
		$regEL = "/^\s*$/m"; # separated line with spaces: from start to end are all white spaces
		$contentSRC = preg_replace($regEL, "", $contentSRC) or exit("Error :  preg_replace - regEL") ; 
		$items = explode("\n\n",$contentSRC);

		// $regSEP = "/(.+\n)+/";
		$regLEV = "/^\t*/";
		$regFN = "/^\s*(\[\^([a-zA-Z]*):[a-zA-Z0-9]*\]:)/";#"/^\s*\[\^[a-zA-Z0-9]*\]:/"; # Footnote Tag
		$refCON = "/({([^}]+)})$/";
		$regITEM = "/(^\t*)((.|\n)*)({([^}]+)})?$/";
		//$regBLockLineBreak = preg_replace("/(\n)\t*(?!-)(?=\w)/", "<br>", $input_lines);
		//  // "/(?<!\\)(?: ((?<!\$)\${1,2}(?!\$)))(.*(?R)?.*)(?<!\\)(?: ((?<!\$)\1(?!\$)))/gmx";

		$FNDic = array(); $oneI= 1;
		$MATHDic = array();
		foreach ($items as $key =>&$value) {
			preg_match("/^\t*/", $value, $iLEV);
			$regLBTab = $iLEV[0];
			$iLEV = substr_count($iLEV[0], "\t")+1;
			
			if (preg_match($regFN, $value, $matchedFN)){ 
				/*Footnote defination block*/
				$FNMarker = $matchedFN[1];
				
				if($matchedFN[2] == 'math'){
					$value = trim(str_replace($FNMarker, '', $value));
					$value = "<br/>\$".trim($value, "\$")."\$";
					
					$FNMarker = rtrim($FNMarker,':');
					if (array_key_exists($FNMarker, $MATHDic)) {
						$MATHDic[$FNMarker] .= "\t$value";
					} else{
						$MATHDic[$FNMarker] = $value;
					}
					unset($items[$key]);
					continue;
				}

				if($matchedFN[2] == 'img'){
					$value = preg_split($refCON, preg_split($regFN, $value)[1], -1,PREG_SPLIT_NO_EMPTY|PREG_SPLIT_DELIM_CAPTURE);
					$value = $matchedFN[1]." ![](".$value[0].") ".$value[1];// print_r( $value."\n");
					// $value = $matchedFN[1]." ![](".preg_split($regFN, $value)[1].")"; //echo $value;
				}

				$value = preg_replace("/\n\t*/", "\n\t", trim($value));
				if (array_key_exists($FNMarker, $FNDic)) {
					$value = trim(str_replace($FNMarker, '', $value));
					$FNDic[$FNMarker] .= "\n\n\t$value";
				} else{
					$FNDic[$FNMarker] = $value;
				}
				unset($items[$key]);
				continue;
				/* 0915 no need ; 0910 Support multi lines in one block*/
			} else if (preg_match("/^\t*-/", $value, $matchedFN)) {
				/*Only List item in one block*/
				$value = "<h$iLEV><div  markdown='1'>\n".preg_replace("/\n\t{".($iLEV-1)."}/", "\n", trim($value))."\n</div></h$iLEV>";
				continue;
			} else if (preg_match("/\n\t*(?=-)/", $value, $matchedFN)) {
				// echo "!".ltrim($matchedFN[0],"\n")."!!\n\n";
				// $FNTemp = explode($matchedFN[0], $value);
				// var_dump($FNTemp); 
				/*lines appended with List item in one block:*/
				$FNTemp = preg_split("/\n\t*(?=-)/", $value);

				$value = rtrim(array_shift($FNTemp));
				preg_match($refCON,$value,$iCON);
				$value = preg_split($refCON, $value)[0]."[^one:$oneI] ".$iCON[0];

				$FNDic["[^one:$oneI]"] = "[^one:$oneI]:".implode("\n\t", $FNTemp);
				$oneI ++;
				// continue;
			}

			/*Combine multi Lines in one Block into one line*/
			$value = preg_replace("/\n\t*(?!-)(?=[\w|\$])/", "<br/>", $value);

			$PRE = str_repeat("#", $iLEV);
			
			$value = trim($value);
			preg_match($refCON,$value,$iCON);
			$value = preg_split($refCON, $value);
			$value = trim($PRE .' '. trim($value[0]) .' '. $PRE.' ' . $iCON[0]);
		}

		$contentMD = implode("\n\n", $items)."\n\n".implode("\n\n", $FNDic);// echo $contentMD;
		// var_dump($MATHDic);
		$find = array_keys($MATHDic);
		$replace = array_values($MATHDic);
		$contentMD = str_ireplace($find, $replace, $contentMD);
		
		return $contentMD;
	}

	# A Parser 1.1
	# Only process $content in Markdown
	# Returned $rawBODY only inlucdes content in list of <p>s+<h*>s
	public function md2html($contentMD=""){ 
		if ($contentMD == ""){ $contentMD = $this->contentMD; }
		
		$rawBODY="";
		
		#Convert content via the Markdown parser; Returned is list of <p>s+<h*>s
		$rawBODY = MarkdownExtra::defaultTransform($contentMD);

		#Math
		// ??workable now, but need check Latex in multilines & past input example
		$rawBODY = str_replace("&#33;","\!",$rawBODY);

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
		$basicStyleInHead =file_get_contents(self::API_FOLDER."/".self::HB_FOLDER."/"."Basic_head.in");
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
			case 'Basic':
				$structuredBODY = $rawBODY;
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

		$styleHEAD = $this->specificConfig['head'];
		$specificHEAD = "$basicHEAD\n $styleHEAD\n";

		$styleBODY = $this->specificConfig['body'];

		$isUpdated = 0;
		if($styleBODY == ""){
			$specificBODY = $structuredBODY; $isUpdated = 1;
		} else {
			$specificBODY = str_replace("<structuredBODY/>", $structuredBODY, $styleBODY, $isUpdated);
		}

		if ($isUpdated != 1) {
			echo "Parser Error : replace <structuredBODY/> $countTEMP times!";
		}

		$specificHTML = "<html>\n";
		$specificHTML .="<head>\n$specificHEAD</head>\n";
		$specificHTML .="<body>\n$specificBODY</body>\n";
		$specificHTML .="</html>\n";
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
		#0 Check if has footnote:
		$fnDel = '<div class="footnotes">';
		list($div, $footnote)= explode($fnDel, $rawBODY);

		// $div =  $rawBODY; // !!!! ??? title + rawBODY
		
		#0. convert the parsered HTML from new Syntax to a version converted from old syntax
		$div = $this->preSlide( $div,1);
		/* !!!! Need to do:
			- [OK] footnote:one
			- [OK] Footnote:image
			- Image Size
			- footnote:tip
			- H4 & H5
			- Level-1 Structure Slides
		*/
		
		$FNDoc= new DOMDocument;
		$FNDoc->preserveWhiteSpace = FALSE;
		$FNDoc->loadHTML($fnDel.$footnote);
		// $root = $dom->documentElement;

		// $oneTemp = $FNDoc->getElementById('fn:one:3')->C14N();// echo $oneTemp."\n\n";
		// $oneTemp = "<div".substr($oneTemp, 3,-3)."div>";	// echo $oneTemp."\n";
		
		#fn:one
		$oneFN = '|<sup id="fnref:one:(\d+)">|';
		preg_match_all($oneFN, $div, $oneID );
		foreach ($oneID[1] as $key => $value) {
			$oneTemp = $FNDoc->getElementById("fn:one:$value");
			$htmlTemp = $oneTemp->C14N();
			$oneTemp->parentNode->removeChild($oneTemp);
			$oneTemp = "\n<div".substr($htmlTemp, 3,-3)."div>";

			$search = "<sup id=\"fnref:one:$value\"><a href=\"#fn:one:$value\" class=\"footnote-ref\">";
			$search = "/".$search."\d+<\/a><\/sup>/";
			$div = preg_replace($search , $oneTemp, $div);

			$search = "<p><a class=\"footnote-backref\" href=\"#fnref:one:$value\">";
			$search = "/".$search.".+<\/a><\/p>/";
			$div = preg_replace($search , " ", $div);
		}
		
		#fn:img
		$imgFN = '|<sup id="fnref:img:(.[^"]*)">|';
		preg_match_all($imgFN, $div, $imgID );
		foreach ($imgID[1] as $key => $value) {
			$imgTemp = $FNDoc->getElementById("fn:img:$value");
			$htmlTemp = $imgTemp->getElementsByTagName('img')->item(0)->C14N();// echo "$htmlTemp\n\n";
			$imgTemp->parentNode->removeChild($imgTemp);
			$imgTemp = "<div class=\"imgWrap\">$htmlTemp</div>";

			$search = "<sup id=\"fnref:img:$value\"><a href=\"#fn:img:$value\" class=\"footnote-ref\">";
			$search = "/".$search."\d+<\/a><\/sup>/";
			$div = preg_replace($search , $imgTemp, $div);
		}

		$footnote = $FNDoc->getElementsByTagName('ol')->item(0);
		$footnote = $FNDoc->saveXML($footnote);
		unset($FNDoc);


		#1. Split body into slides : splitSlide($div, $deli_array,$deli_index)
		$divs = $this->splitSlide($div, $this->deli_array, 0);
		
		#1.5 Append footnote as a single slide:
		if ($footnote!=null) {
			$divs[] ="<h1>Footnotes</h1>\n". preg_replace("|\n\n+|", "\n\n", $footnote);
		}

		#2. Put every slides in a div.slide
		$START = "<div class=\"slide\">";
		$END = "</div>";
		for($i = 1; $i<count($divs);$i++) {
			$divs[$i] = $START."\n".$divs[$i].$END;
		}
		
		#3. Re-style the TOC slide
		$TOCSlide = array_shift($divs);
		$TOCSlide = preg_replace("/(<\/?)h1(>)/", "$1li$2", $TOCSlide);
		$TOCSlide = "<div class=\"slide\">\n<h1>Outline</h1>\n<ul>".$TOCSlide."</ul>\n</div>";// echo "$TOCSlide";

		#4. Generate the 1st slide with Title 
		$titleSlide = "<div class=\"slide\">\n<h1>".$title."</h1>\n</div>"; // echo $titleSlide;
		
		#5. Compose all the divs into a string $structuredBODY
		$structuredBODY = implode("\n\n",$divs);// echo $structuredBODY;
		$structuredBODY =  $titleSlide."\n\n".$TOCSlide."\n\n".$structuredBODY; // echo $structuredBODY;

		return $structuredBODY;

	}

	private function preSlide( $div,$level){
	// convert the parsered HTML from new Syntax to a version converted from old syntax
		$divs = preg_split("/(<\/?h$level>)/", $div, -1, PREG_SPLIT_NO_EMPTY);
		$next = $level+1;

		$last = count($divs);
		$hasDetails = false;
		foreach ($divs as $key => &$value){
			$value = trim($value);
			if ($value == "") continue;
			
			if (strpos(" ".$value, "<h$next>") === FALSE){
			# title tiem
				if (strpos(" ".$divs[$key+1], "<h$next>") === False && !$hasDetails){
				# No Details
					$value = "<p>$value</p>\n";
				} else {
				# Has Details
					$value = "<h$level>$value</h$level>\n";
				}
			} else{
			#Detailed item 
				$value = $this->preSlide($value, $next);
				$hasDetails = true;
			}
		}

		return implode("\n", array_filter($divs));
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
		#0 Check if has footnote:
		$fnDel = '<div class="footnotes">';
		list($rawBODY, $footnote)= explode($fnDel, $rawBODY);

		$list = "<h1>".$title."</h1>".$rawBODY;
		$level = 1;

		$structuredBODY = $this->embedList($list,$level); // String
		
		/*Only List item in one block : delete unnecessary tags*/
		$structuredBODY = preg_replace("/(<div>)<p><div>\n\n(<ul>)/", "$1$2", $structuredBODY);
		$structuredBODY = preg_replace("/(<\/ul>)\n\n<\/div><\/p>(<\/div>)/", "$1$2", $structuredBODY);

		#0 Append footnote as a single div, same level as ul.L1:
		if ($footnote!=null) {
			$structuredBODY .=$fnDel.substr($footnote,7);
		}
		return $structuredBODY;
	}

	private function embedList($list, $level){ 
		$delimiter= "<h$level";
		$deliEND = "</h$level>";
		$subTAG = "div";

		$newList = "";
		$pos = strpos($list, $delimiter);
		if ( $pos === false) {
		# Input List is just Array of <p>s	(+images)
			if (trim($list) != '') $newList = 	$this->wrapLI($list); 

		} else{
		# Input List is Array of <p>s + (<H2> + <H3>s)s
			$uls = explode($delimiter, $list);
	
			foreach( $uls as $value) {
				$liType = strpos($value, '>');
				$attrClass = '';
				if ($liType === false){
					// echo "false: '$value'\n";
					continue;
				} else if ($liType === 0){// echo "0: $value \n";
					# '>...</h1>', NO class
					$value = substr($value, $liType+1);
				} else {//echo "1: $value \n";
					# ' class="test">...</h1>', has class,
					$attrClass = substr($value, 0, $liType);
					$value = substr($value, $liType+1);
				}
				list($ulSubject,$ulContent) = explode($deliEND, $value);
				$ulContent = $this->embedList($ulContent,$level+1);
				$ulSubject = trim($ulSubject);
				$ulContent = trim($ulContent);
				$newList .= "\n<li>\n<$subTAG$attrClass><p>$ulSubject</p></$subTAG>\n$ulContent</li>";
			}
		}

		$uls="";
		if(trim($newList)!=""){
			$uls = "\n<ul class=\"L_$level\">\n$newList\n</ul>";
		}

		return $uls;
	}

//?? NO MORE Need This Example
	private function wrapLI($list){ // return <li><div>$list</div></li>
		$dom = new DOMDocument();
		$dom->preserveWhiteSpace = FALSE;
		
		$dom->loadXML("<ul>$list</ul>");
		$root = $dom->documentElement;
		
		$newList = "";
		if($root->hasChildNodes()){
			foreach ($root->childNodes as $child) {
				$temp = $child->ownerDocument->saveXML($child); //echo "$temp\n------\n";
				$temp = str_replace("\n", "", $temp);
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

	public function upload($filePre, $fileNum, $fileList){
		$failedList = array();
		for ($i=0; $i < $fileNum ; $i++) { 
			$image=$fileList[$filePre.$i];
			$target_dir = self::IMAGE_FOLDER."/";
			$target_file = $target_dir . basename($image["name"]);
			$imageFileType = pathinfo($target_file,PATHINFO_EXTENSION);

			// Check file size
			if ($image["size"] == 0) {
				$failedList []= $image["name"]." of size 0 ";
			} else {
				if (move_uploaded_file($image["tmp_name"], $target_file)) {
					chmod($target_file, 0744);
				} else {
					$failedList []= $image["name"]."; ";
				}
			}
		}
		$uploadResult = empty($failedList) ? 'success':'Upload Failed: '.implode(', ', $failedList).'.';
		return $uploadResult;
	}

	private function download($files){
		$failedList = array();	
		# $files is the name list of uploaded files, 
		# and should be locaed in server root, where is API located
		$srcPrefix = self::API_FOLDER.'/..'.'/';//var_dump($files);

		# create new zip opbject
		$zip = new ZipArchive();

		# create a temp file & open it
		$tmpFile = $srcPrefix.self::EXPORT_FOLDER.'/'."present.zip";
		if ($zip->open($tmpFile, ZipArchive::OVERWRITE)) {
			# loop through each file & add it to zip
			foreach($files as $file){
				if(file_exists($srcPrefix.$file) && is_readable($srcPrefix.$file)) {
					$failedList []= $zip->addFile($srcPrefix.$file, $file)? "":"Failed to add $file ";
				} else{
					$failedList []="$file NOT Addable ";
				}
			}

			# add the converted/parsered HTML to zip 
			$zip->addFromString('present.html',$this->presentableHTML);

			# close zip
			$failedList[] = $zip->close()? "": "Fail to close Zip ";
			chmod($tmpFile, 0744); 

		} else{
			$failedList []= "Failed to create Zip ";
		}
		$failedList = array_diff($failedList, array(''));
		return array($tmpFile, $failedList);
	}

	public function export(){
		# get the image src list
		$domExport = new DOMDocument;
		$domExport->loadXML($this->presentableHTML);
		$imagesList = array();
		foreach ($domExport->getElementsByTagName('img') as $img) {
			$imagesList[]= str_replace("%20", ' ', $img->getAttribute('src'));
		}	
		unset($domExport);
		
		$files = array_merge($this->specificConfig['dependence'],$imagesList);
		list($tmpFile, $failedList) = $this->download($files);
		
		$exportResult = empty($failedList) ? 'success':'Export Failed: '.implode(', ', $failedList).'.';
		
		return array($tmpFile, $exportResult);
	}

}

?>
