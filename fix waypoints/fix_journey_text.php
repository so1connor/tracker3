<?php

$link = mysql_connect('127.0.0.1', 'eggbutty', 'e996utty') or die(mysql_error());
mysql_select_db('eggbutty_tracker_1') or die(mysql_error());

$userid=31;
$query='SELECT id, jid FROM journeys WHERE userid='.$userid;
$result=mysql_query($query) or die(mysql_error());

while ($row = mysql_fetch_array($result, MYSQL_NUM))
	{
	echo('('.$row[0].','.$row[1].')');
	//$query='UPDATE journey_text SET journey_id = '.$row[0].' WHERE jid='.$row[1];
	//mysql_query($query) or die(mysql_error());
	}

mysql_close($link);
?>