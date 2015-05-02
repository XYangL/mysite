<?php  

# Install PSR-0-compatible class autoloader
spl_autoload_register(function($class){
	require preg_replace('{\\\\|_(?!.*\\\\)}', DIRECTORY_SEPARATOR, ltrim($class, '\\')).'.php';
});

# Get Markdown class
use \Michelf\Markdown;

class Parser{
	// private PARSER_FOLDER = getcwd ();
	const CONFIG_FOLDER = "API/config";
	const BETA_FOLDER = "API/beta";
	const CSS_FOLDER = "";
	const JS_FOLDER = "";
	
	public $success = false; # will be true if presentableHTML is parsered as designed

	# Input from User
	public $title = "";
	public $contentMD = "";
	public $style = "";
	
	# Decided by $style according to paradigm.json; 
	# $paradigm will be None if the style is not supported
	public $paradigm = "";

	# If $style is suportted, _config.xml will be loaded 
	# self::PARSER_FOLDER."/".self::CONFIG_FOLDER."/".$this->basicConfig;
	private $basicConfig = "basic_config.xml"; # will be DOMDocument after construct
	private $specificConfig = None;
	private $deli_array = array('<h1>','<h2>');
	
	# private vars linking different parts of Parser 1&2
	private $rawBODY = "";
	private $basicHTML = "";
	private $structuredHTML = "";
	private $specificHTML = "";
	
	public $presentableHTML = "";

	function __construct($basicConfig="",$deli_array =array()){
		if($basicConfig == ""){
			$basicConfig = $this->basicConfig;
		}
		if ($deli_array == array()){
			$deli_array = $this->deli_array;;
		}

		$dom = new DOMDocument;
		$dom->preserveWhiteSpace = FALSE;
		$dom->formatOutput = TRUE;
		$dom->load(self::CONFIG_FOLDER."/".$basicConfig);
		$this->basicConfig = $dom;
		unset($dom);

		$this->deli_array = $deli_array;
		// var_dump($this->basicConfig->saveXML());
		
	}

	# called by User for converting content in Markdown to Presentable HTML
	public function main($title, $contentMD, $style)
	{	
		if( trim($title) == "" || trim($contentMD) == "" || trim($style) == "" ){
			$this->success = false;
			$this->presentableHTML = "";
			return $this->presentableHTML;
		} 

		// --- to do ---
		// $this->paradigm = $this->setParadigm($style);
		// if(!isset($this->paradigm)){
		// 	$this->$success = false;
		// 	$this->$presentableHTML = "";
		// 	return "";
		// }
		// ------------

		$this->title = $title;
		$this->contentMD = $contentMD;
		$this->style = $style;
		
		# A Parser 1.1
		$this->rawBODY = $this->md2html($this->contentMD);

		# B Parser 1.2	public function setBasicStyle($rawBODY,$basicConfig)
		// $this->basicHTML = $this->setBasicStyle($this->rawBODY,$this->title,$this->basicConfig);
		$basicHead =file_get_contents(self::BETA_FOLDER."/"."Basic_head.in");

		$div = $this->rawBODY;
		// file_put_contents('pTest.out', $div);
		$deli_array = $this->deli_array;
		$deli_index = 0;
		
		$START = "\n<div class=\"slide\">";
		$END = "\n</div>\n";

		$styleBody = file_get_contents(self::BETA_FOLDER."/".$style."_body.in");
		$styleHead = file_get_contents(self::BETA_FOLDER."/".$style."_head.in");
		switch ($style) {
			case 'S5':
				$reOrganizeBody = $this->splitSlide($div, $deli_array,$deli_index);#divs
				for($i = 1; $i<count($reOrganizeBody);$i++) {
					$reOrganizeBody[$i] = $START.$reOrganizeBody[$i].$END;
				}

				$titleSlide = "<div class=\"slide\"><h1>$title</h1></div>\n";
				
				$TOCSlide = array_shift($reOrganizeBody);
				$TOCSlide = implode("p>",explode("h1>",$TOCSlide));
				$TOCSlide = "<div class=\"slide\">\n<h1>Outline</h1>$TOCSlide</div>\n";// echo "$TOCSlide\n";

				$reOrganizeBody = implode("",$reOrganizeBody);
				$reOrganizeBody =  $titleSlide.$TOCSlide.$reOrganizeBody;
				
				$specificHTML = "<html>\n";
				$specificHTML .= "<head>\n<title>$title</title>\n $styleHead \n $basicHead </head>\n";
				$specificHTML .= "<body>\n $styleBody\n <div class=\"presentation\"> $reOrganizeBody</div>\n";
				$specificHTML .= "</body>\n</html>";

				break;
			case 'Slidy':
				$reOrganizeBody = $this->splitSlide($div, $deli_array,$deli_index);#divs
				for($i = 1; $i<count($reOrganizeBody);$i++) {
					$reOrganizeBody[$i] = $START.$reOrganizeBody[$i].$END;
				}

				$titleSlide = "<div class=\"slide\"><h1>$title</h1></div>\n";
				
				$TOCSlide = array_shift($reOrganizeBody);
				$TOCSlide = implode("p>",explode("h1>",$TOCSlide));
				$TOCSlide = "<div class=\"slide\">\n<h1>Outline</h1>$TOCSlide</div>\n";

				$reOrganizeBody = implode("",$reOrganizeBody);
				$reOrganizeBody =  $titleSlide.$TOCSlide.$reOrganizeBody;
				
				$specificHTML = "<html>\n";
				$specificHTML .= "<head>\n<title>$title</title>\n $styleHead \n $basicHead </head>\n";
				$specificHTML .= "<body>\n $reOrganizeBody\n";
				$specificHTML .= "</body>\n</html>";
				break;
			case 'Scroll':
				# code...
				break;
			
			default:
				# code...
				break;
		}

		// --- to do ---
		$this->success = true;
		# C Parser 2.1	public function reOrganize($basicHTML,$paradigm)
		// $this->structuredHTML = $this->reOrganize($this->basicHTML,$this->paradigm);

		# D Parser 2.2	public function setSpecificStyle($structuredHTML, $specificConfig)
		// $this->specificHTML = $this->setSpecificStyle($this->structuredHTML, $this->specificConfig);
		
		
		$this->presentableHTML = $specificHTML;
		
		return $this->presentableHTML;
		
	}

	#if $style is suportted, set $paradigm & $configs  
	#Or, set $paradim = None
	public function setParadigm($style){
		$paradigm = None;

		return $paradigm;
	}

	# A Parser 1.1
	# Only process content in Markdown
	# Returned rawBODY only inlucdes content in list of <p>s+<h*>s
	public function md2html($contentMD=""){ 
		if ($contentMD == ""){
			$contentMD = $this->contentMD;
		}
		
		$rawBODY="";
		
		#Convert content via the Markdown parser
		# Returned is list of <p>s+<h*>s
		$rawBODY = Markdown::defaultTransform($contentMD);

		#Math
		// ??workable now, but need check Latex in multilines & past input example

		return $rawBODY;
	}

	# B Parser 1.2
	public function setBasicStyle($rawBODY="", $title="", $basicConfig=""){
		if ($rawBODY == ""){
			$rawBODY = $this->rawBODY;
		}
		if ($title == ""){
			$title = $this->title;
		}
		if ($basicConfig == ""){
			$basicConfig = $this->basicConfig;
		}

		# Construct $basicHTML: html>(head>title)+(body>rawBODY)
		$head="<head><title>".$this->title."</title></head>";
		$this->rawBODY= "<body>".$rawBODY."</body>";
		$basicHTML ="<html>$head$body</html>";

		$dom = new DOMDocument();
		$dom->preserveWhiteSpace = FALSE;
		$dom->formatOutput = TRUE;
		$dom->loadXML($basicHTML);
		$basicHTML = $dom;
		unset($dom);
		
		// $body = $basicHTML->getElementsByTagName('body')->item(0);
		$head = $basicHTML->getElementsByTagName('head')->item(0);

		$xpath = new DOMXPath($basicConfig);
		$query = '//config/append/father[. = "head"]/following-sibling::*/*';
		$entries = $xpath->evaluate($query);

		foreach ($entries as $entry) {

			$fragment = $basicHTML->createDocumentFragment();
			$fragment->appendXml($basicConfig->saveXML($entry));
			$head->appendChild($fragment);
		    // echo $basicConfig->saveXML($entry)."\n";
		}

		$basicHTML = $basicHTML->saveHTML();#"";
		
		$this->basicHTML = $basicHTML;
		return $basicHTML;
	}

	# C Parser 2.1
	public function reOrganize($basicHTML,$paradigm){ 
		if ($basicHTML == ""){
			$basicHTML = $this->basicHTML;
		}
		if ($paradigm == ""){
			$paradigm = $this->paradigm;
		}

		$structuredHTML = "";

		return $structuredHTML;
	}

	# D Parser 2.2
	public function setSpecificStyle($structuredHTML, $specificConfig){
		if ($structuredHTML == ""){
			$structuredHTML = $this->structuredHTML;
		}
		if ($specificConfig == ""){
			$specificConfig = $this->specificConfig;
		}

		$specificHTML = "";

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
	private function splitSlide( $div, $deli_array,$deli_index){
		$delimiter = $deli_array[$deli_index];

		if (strpos(" ".$div, $delimiter) == false){
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
			$subject[$i] = $this->get_string_between($divs[$i],$delimiter);#echo "##$i SUB## ".$subject."\n";
		#2.3 append the sutject to outline
			if ($delimiter!='<li>') {
				$divs[0] .= $subject[$i];
			}
			
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

}

// //-- For Testing --
// $deli_array =array('<h1>','<h2>','<li>');

// $most_detailed = 3;
// $PARSER = new Parser("", array_slice($deli_array, 0, $most_detailed));

// $mdSrc = getcwd ()."/mdSrc/content.md";
// $title ="Markdown Syntax";
// $contentMD = file_get_contents($mdSrc);
// $style = "Slidy";

// $PARSER->main($title, $contentMD, $style);

// if($PARSER->success){
// 	// echo $PARSER->presentableHTML;	
// 	file_put_contents('../pTest_out.html', $PARSER->presentableHTML);
// } else{
// 	echo 'Error: Success==False';
// }
// -----------------
?>