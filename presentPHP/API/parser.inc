<?php  

# Install PSR-0-compatible class autoloader
spl_autoload_register(function($class){
	require preg_replace('{\\\\|_(?!.*\\\\)}', DIRECTORY_SEPARATOR, ltrim($class, '\\')).'.php';
});

# Get Markdown class
use \Michelf\Markdown;

class Parser{
	// private PARSER_FOLDER = getcwd ();
	const CONFIG_FOLDER = "config";
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
	
	# private vars linking different parts of Parser 1&2
	private $rawHTML = "";
	private $basicHTML = "";
	private $structuredHTML = "";
	private $specificHTML = "";
	
	public $presentableHTML = "";

	function __construct($basicConfig=""){
		if($basicConfig == ""){
			$dom = new DOMDocument;
			$dom->preserveWhiteSpace = FALSE;
			$dom->formatOutput = TRUE;
			$dom->load(self::CONFIG_FOLDER."/".$this->basicConfig);
			$this->basicConfig = $dom;
			unset($dom);
		}
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
		$this->rawHTML = $this->md2html($this->contentMD);

		# B Parser 1.2	public function setBasicStyle($rawHTML,$basicConfig)
		$this->basicHTML = $this->setBasicStyle($this->rawHTML,$this->title,$this->basicConfig);

		// --- to do ---
		$this->success = true;
		# C Parser 2.1	public function reOrganize($basicHTML,$paradigm)
		$this->structuredHTML = $this->reOrganize($this->basicHTML,$this->paradigm);

		# D Parser 2.2	public function setSpecificStyle($structuredHTML, $specificConfig)
		$this->specificHTML = $this->setSpecificStyle($this->structuredHTML, $this->specificConfig);
		
		
		$this->presentableHTML = $this->basicHTML;
		
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
	# Returned rawHTML only inlucdes content in list of <p>s+<h*>s
	public function md2html($contentMD=""){ 
		if ($contentMD == ""){
			$contentMD = $this->contentMD;
		}
		
		$rawHTML="";
		
		#Convert content via the Markdown parser
		# Returned is list of <p>s+<h*>s
		$rawHTML = Markdown::defaultTransform($contentMD);

		#Math
		// ??workable now, but need check Latex in multilines & past input example

		return $rawHTML;
	}

	# B Parser 1.2
	public function setBasicStyle($rawHTML="", $title="", $basicConfig=""){
		if ($rawHTML == ""){
			$rawHTML = $this->rawHTML;
		}
		if ($title == ""){
			$title = $this->title;
		}
		if ($basicConfig == ""){
			$basicConfig = $this->basicConfig;
		}

		# Construct $basicHTML: html>(head>title)+(body>rawHTML)
		$head="<head><title>".$this->title."</title></head>";
		$body= "<body>".$rawHTML."</body>";
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
}

//-- For Testing --
$PARSER = new Parser();

$mdSrc = getcwd ()."/mdSrc/content.md";
$title ="Presentation Title";
$contentMD = file_get_contents($mdSrc);
$style = "S5";

$PARSER->main($title, $contentMD, $style);

if($PARSER->success){
	// echo $PARSER->presentableHTML;	
	file_put_contents('pTest_out.html', $PARSER->presentableHTML);
} else{
	echo 'Error: Success==False';
}
//-----------------
?>