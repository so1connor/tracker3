<?php 
$useragent = $_SERVER['HTTP_USER_AGENT'];
$tokens = explode("/", $useragent);
echo $tokens[0];

 ?> 