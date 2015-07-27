<?php  

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
	public function main($title, $contentMD, $style)
	{	
		if( trim($title) == "" || trim($contentMD) == "" || trim($style) == "" ){
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
		
		#1. Split body into slides : splitSlide($div, $deli_array,$deli_index)
		$divs = $this->splitSlide($div, $this->deli_array, 0);
		
		#1.5 Append footnote as a single slide:
		if ($footnote!=null) {
			$divs[] ="<h1>Footnotes</h1>".$fnDel.substr($footnote,7);
		}

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
		#0 Check if has footnote:
		$fnDel = '<div class="footnotes">';
		list($rawBODY, $footnote)= explode($fnDel, $rawBODY);
		
		$list = "<h1>".$title."</h1>".$rawBODY;
		$level = 1;

		$structuredBODY = $this->embedList($list,$level); // String
		#0 Append footnote as a single div, same level as ul.L1:
		if ($footnote!=null) {
			$structuredBODY .=$fnDel.substr($footnote,7);
		}
		return $structuredBODY;
	}

	private function embedList($list, $level){ 
		$delimiter= "<h$level>";
		$deliEND = "</h$level>";
		$subTAG = "div";

		$newList = "";
		$pos = strpos($list, $delimiter);
		if ( $pos === false) {
		# Input List is just Array of <p>s	(+images)
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
			$uls = "<ul class=\"L_$level\">\n$newList\n</ul>";
		}

		return $uls;
	}

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
			$imagesList[]= $img->getAttribute('src');
		}	
		unset($domExport);
		
		$files = array_merge($this->specificConfig['dependence'],$imagesList);
		list($tmpFile, $failedList) = $this->download($files);
		
		$exportResult = empty($failedList) ? 'success':'Export Failed: '.implode(', ', $failedList).'.';
		
		return array($tmpFile, $exportResult);
	}

}

// //-- For Testing --
// $deli_array =array('<h1>','<h2>','<h3>');

// $PARSER = new Parser("", $deli_array);

// $mdSrc = getcwd ()."/mdSrc/MD Syntax Extra.md";
// $title ="Markdown Syntax";
// $contentMD = file_get_contents($mdSrc);
// $style = "CAScroll";

// $PARSER->main($title, $contentMD, $style);

// /* Output to File*/
// if($PARSER->success){
// 	echo $PARSER->export()[1];
// 	//echo $PARSER->presentableHTML;	
// 	file_put_contents('../pTest_out.html', $PARSER->presentableHTML);
// } else{
// 	echo 'Error: Success==FALSE';
// }
// -----------------
?>
