<?php  

# This file passes the content of the Readme.md file in the same directory
# through the Markdown filter. You can adapt this sample code in any way
# you like.

# Install PSR-0-compatible class autoloader
spl_autoload_register(function($class){
	require preg_replace('{\\\\|_(?!.*\\\\)}', DIRECTORY_SEPARATOR, ltrim($class, '\\')).'.php';
});

# Get Markdown class
use \Michelf\Markdown;

class Parser{
	
	public $success = false; # will be true if presentableHTML is parsered as designed

	# Input from User
	public $title = "";
	public $contentMD = "";
	public $style = "";
	
	# Decided by $style according to paradigm.json; 
	# $paradigm will be None if the style is not supported
	public $paradigm = "";

	# If $style is suportted, _config.xml will be loaded 
	private $basicConfig = None;
	private $specificConfig = None;
	
	# private vars linking different parts of Parser 1&2
	private $rawHTML = "";
	private $basicHTML = "";
	private $structuredHTML = "";
	private $specificHTML = "";
	
	public $presentableHTML = "";

	# called by User for converting content in Markdown to Presentable HTML
	public function main($title, $contentMD, $style)
	{	
		if( empty($title) || empty($contentMD) || empty($style) ){
			$this->$success = false;
			$this->$presentableHTML = "";
			return $this->$presentableHTML;
		} 

		// --- to do ---
		// $this->paradigm = $this->setParadigm($style);
		// if(!isset($this->paradigm)){
		// 	$this->$success = false;
		// 	$this->$presentableHTML = "";
		// 	return "";
		// }

		$this->title = $title;
		$this->contentMD = $contentMD;
		$this->style = $style;
		
		# A Parser 1.1
		$this->rawHTML = $this->md2html($this->contentMD);
		
		// --- to do ---
		$this->success = true;

		# B Parser 1.2	public function setBasicStyle($rawHTML,$basicConfig)
		$this->basicHTML = $this->setBasicStyle($this->rawHTML,$this->basicConfig);

		# C Parser 2.1	public function reOrganize($basicHTML,$paradigm)
		$this->structuredHTML = $this->reOrganize($this->basicHTML,$this->paradigm);

		# D Parser 2.2	public function setSpecificStyle($structuredHTML, $specificConfig)
		$this->specificHTML = $this->setSpecificStyle($this->structuredHTML, $this->specificConfig);
		
		
		$this->presentableHTML = $this->rawHTML;
		
		return $this->presentableHTML;
		
	}

	#if $style is suportted, set $paradigm & $configs  
	#Or, set $paradim = None
	public function setParadigm($style){
		$paradigm = None;

		return $paradigm;
	}

	# A Parser 1.1
	public function md2html($contentMD=NUll){ 
		if (!isset($contentMD)){
			$contentMD = $this->contentMD;
		}
		
		$rawHTML="";
		#pass content through the Markdown parser
		$rawHTML = Markdown::defaultTransform($contentMD);

		// --- to do ---
		// $bodyHTML = Markdown::defaultTransform($contentMD);
		// $headHTML = head>title[value=$this->title]
		// $rawHTML = $bodyHTML + $headHtml

		return $rawHTML;
	}

	# B Parser 1.2
	public function setBasicStyle($rawHTML,$basicConfig){
		if (!isset($rawHTML)){
			$rawHTML = $this->rawHTML;
		}
		if (!isset($basicConfig)){
			$basicConfig = $this->basicConfig;
		}

		$basicHTML = "";

		return $basicHTML;
	}

	# C Parser 2.1
	public function reOrganize($basicHTML,$paradigm){ 
		if (!isset($basicHTML)){
			$basicHTML = $this->basicHTML;
		}
		if (!isset($paradigm)){
			$paradigm = $this->paradigm;
		}

		$structuredHTML = "";

		return $structuredHTML;
	}

	# D Parser 2.2
	public function setSpecificStyle($structuredHTML, $specificConfig){
		if (!isset($structuredHTML)){
			$structuredHTML = $this->structuredHTML;
		}
		if (!isset($specificConfig)){
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

?>