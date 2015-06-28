<?php  
	$API_FOLDER = __DIR__;
	$CONFIG_FOLDER = "config/xml";//
	$HB_FOLDER = "config/head_body";//

	$supportedStyle = "supported_style.json";
	$supportedStyle = file_get_contents($API_FOLDER."/".$supportedStyle);
	$supportedStyle = json_decode($supportedStyle, TRUE);

	foreach ($supportedStyle as $name => $style) {

		$styleHEAD = file_get_contents($API_FOLDER."/".$HB_FOLDER."/".$name."_head.in");
		$styleBODY = file_get_contents($API_FOLDER."/".$HB_FOLDER."/".$name."_body.in");
		// echo $API_FOLDER."/"."beta"."/".$name."_head.in";
		$styleHEAD = ($styleHEAD) ? $styleHEAD : '' ;
		$styleBODY = ($styleBODY) ? $styleBODY : '' ;

		$deplist = array();
		foreach ($style['dependence'] as $dep) {
			$dep = __DIR__."/".$dep;
			$dep =array_slice(scandir($dep, 1), 0, -2);
			$deplist = array_merge($deplist, $dep);
		}
		$style['dependence'] = $deplist;//print_r($deplist);

		$style = array(
			'name' => $name, 
			'paradigm' => $style['paradigm'],
			'head' => $styleHEAD,
			'body' => $styleBODY,
			'format' =>$style['format'],
			'dependence' =>$style['dependence']
			);
		$filename = $API_FOLDER."/"."config"."/".$name.".json";
		file_put_contents($filename, json_encode($style, JSON_PRETTY_PRINT));

		// var_dump($style);
	}

?>