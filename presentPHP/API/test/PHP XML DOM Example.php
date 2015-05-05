<?php 
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
 ?>