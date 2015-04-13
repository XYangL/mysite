<?php
require 'parser.inc';

$mdSrc = getcwd ()."/mdsrc/Slides.md";
$title ="Presentation Title";
$contentMD = file_get_contents($mdSrc);
$style = "S5";

$PARSER = new Parser();
$PARSER->main($title, $contentMD, $style);
$html= $PARSER->presentableHTML;

?>
<!DOCTYPE html>
<html>
    <head>
        <title>PHP Markdown Lib - Readme</title>
    </head>
    <body>
		<?php
			# Put HTML content in the document
			echo $html;
		?>
    </body>
</html>
