<?php

function get_journeys($userid) {
$query='SELECT journeys.jid,journeys.id FROM journeys WHERE journeys.userid='.$userid;
$result=mysql_query($query) or setResponse(500,mysql_error());
return $result;
}

function setResponse($code,$message)	{
	die('{"code":'.$code.',"response":"'.$message.'"}');
	}

function fix_journey($userid, $jid, $id) {
$query='UPDATE waypoints SET jid='.$id.' WHERE jid='.$jid.' and userid='.$userid;
mysql_query($query) or setResponse(500,mysql_error());
}

$link = mysql_connect('127.0.0.1', 'eggbutty', 'e996utty') or die(mysql_error());
mysql_select_db('eggbutty_tracker') or die(mysql_error());

$userid = 31;

// 2 waypoints should have jid of 314

$result=get_journeys($userid);
while ($row = mysql_fetch_array($result, MYSQL_NUM)) {
	$jid=$row[0];
	$id=$row[1];
	fix_journey($userid, $jid, $id);
	}

mysql_close($link);

 ?>
 

