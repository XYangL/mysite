<?php  
$input_title = "Presentation Title";
$input_md =implode('', file("./API/content.md"));
$input_paradigm = 'Scroll';

#call Python parser
$data = array($input_title, $input_md, $input_paradigm);

$result = shell_exec('python ./API/parser.py ' . escapeshellarg(json_encode($data)));
$resultData = json_decode($result, true);
// $_SESSION['html-parsed']= $resultData['html-parsed'];
echo $resultData['html-parsed'];#print  $result;
?>