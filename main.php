<?php

// core tracker functions

session_start();
include 'services.php';

function getMarkers($userid, $jid)
{
$json="[";
$markers=get_journey_markers($jid);
$first=true;
while ($m = mysql_fetch_array($markers, MYSQL_NUM))
	{
	if(!$first)
		$json.=',';
	$json .='{"id":'.$m[0].',"t":'.$m[1].',"lat":'.$m[2].',"lon":'.$m[3].',"alt":'.$m[4].',"acc":'.$m[5];
	$description=$m[6];
	$description=utf8_encode($description);

	if($description!=null)
		$json .=',"text":'.json_encode($description);
	$json .='}';
	$first=false;
	}
$json .=']';
return $json;
}



function getJourneys($user)
{
$result=get_journeys($user);
//echo $result;
$json="[";
$first=true;
while ($row = mysql_fetch_array($result, MYSQL_NUM))
	{
	$rowcount = count($row);
	if($rowcount < 6) {
		setResponse(500,'a journey with ['.$userid.'] had '.$rowcount.' parameters');
		}
	$id=$row[0];
	$start_time=$row[1];
	$end_time=$row[2];
	$distance=$row[3];
	$flag=$row[4];
	$count=$row[5];
	$tz_offset = $row[6];
	if($flag) {
		update_journey($id, $flag, $start_time, $end_time, $distance, $count, $tz_offset);
		}
	if(!$first)
		$json.=',';
	$json .='{"jid":'.$id;
	$json .=',"t":'.$start_time;
	$json .=',"dt":'.($end_time-$start_time);
	if(isset ($row[6]) ) {
		$description=utf8_encode($row[7]);
		$json .=',"text":'.json_encode($description);
	}
	$json .=',"d":'.$distance;
	$json .=',"count":'.$count;
	$json .=',"tz":'.$tz_offset;
	$json .='}';
	$first=false;
	}
$json.=']';
return $json;
}

function getSettings($userid) {
	$result=get_settings($userid);
	$row = mysql_fetch_array($result, MYSQL_NUM);
	$json = '{"units":'.$row[0].',"sort":'.$row[1].'}';
	return $json;
	}

function setResponse($code,$message)	{
	die('{"code":'.$code.',"response":"'.$message.'"}');
	}
	
function setResponseWithContent($code,$message,$content)	{
	die('{"code":'.$code.',"response":"'.$message.'","content":'.$content.'}');
	}

error_reporting(E_ALL);

$link = mysql_connect('localhost', 'eggbutty', 'e996utty') or die(setResponse(500,"mysql_connect:".mysql_error()));

//$link = mysql_connect('localhost', 'eggbutty', 'e996utty') or die(setResponse(500,mysql_error()));
mysql_select_db('tracker') or die(setResponse(500,mysql_error()));

$command=$_POST['command'];

if($command=="login")	{
	$username=$_POST['user'];
	$password=$_POST['password'];
	if(preg_match("/^[a-zA-Z0-9]+$/",$username)==0 or preg_match("/^[a-zA-Z0-9]+$/",$password)==0)
		setResponse(500,"User name and password should be letters and numbers only");
	$user=get_user($username, $password);
//	setResponse(500, var_dump($user));
	if($user == NULL)
		setResponse(500,"User was not found");
	else
		{
		//session_start();
		$_SESSION['username']=$username;
		$_SESSION['user']=$user;
		$session=session_id();
		//setResponse(400,"userid is ".$userid);
		setResponseWithContent(200,$session,$user->id);
		//setResponseWithContent(200,$session,getJourneys($user));
		//setResponse(200,$command,getUserXml($userid));
		}
} else {
	$session=$_POST['session'];
}

if($session!=session_id())
	setResponse(500,"You need to login ".$session." != ".session_id());

//if(isset($_SESSION['userid'])==false)
//	setResponse(300,"session","pass thru");

if($command=="getJourneys")
	{
	$journeys = getJourneys($_SESSION['user']);
	$settings = getSettings($_SESSION['user']->id);
	$content = '{"journeys":'.$journeys.',"settings":'.$settings.'}';
	setResponseWithContent(200,"OK",$content);
	}
else if($command=="getMarkers")
	{
	$jid=$_POST['jid'];
	setResponseWithContent(200,"OK",getMarkers($_SESSION['user']->id,$jid));
	}
else if($command=="logout")
	{
	//session_start();
	unset($_SESSION['user']);
	unset($_SESSION['username']);
	
	session_destroy();
	header( 'Location: tracker1.php' );
	//setResponse(200,$command,"Logged out");
	}
else if($command=="deleteJourney")
	{
	$jid=$_POST['jid'];
//	$id=intval($id);
	$userid = $_SESSION['user']->id;
	if($jid<=0 or check_userid_journey($jid,$userid)==false) {
		setResponse(500,'journey id ['.$jid.'] or userid ['.$userid.'] is invalid');
	}
	$result=deleteJourney($jid);
	setResponse(200,$result);
	}
else if($command=="deleteMarker")
	{
	$id=$_POST['id'];
	$jid=$_POST['jid'];
	//$id=intval($id);
	$userid = $_SESSION['user']->id;
	if($id<=0 or check_userid_journey($jid,$userid) == false) {
		setResponse(500,'journey id ['.$jid.'] or userid ['.$userid.'] is invalid');
	}
	$result=deleteMarker($id);
	setJourneyFlag($jid,1); //this will trigger an update next time the journey is loaded
	setResponse(200,$result);
	}
else if($command=="moveMarker")
	{
	$id=$_POST['id'];
	$jid=$_POST['jid'];
	$lat=$_POST['lat'];
	$lng=$_POST['lng'];
	$userid = $_SESSION['user']->id;
	//$id=intval($id);
	if($id<=0 or check_userid_marker($id,$userid)==false) {
		setResponse(500,'marker id ['.$id.'] or userid ['.$userid.'] is invalid');
	}
	$result=moveMarker($id, $lat, $lng);
	setJourneyFlag($jid,1); //this will trigger an update next time the journey is loaded
	setResponse(200,$result);
	}
else if($command=="setJourneyText")
	{
	$jid=$_POST['jid'];
	//$jid=intval($jid);
	$userid = $_SESSION['user']->id;
	if($jid<=0 or check_userid_journey($jid,$userid)==false) {
		setResponse(500,'journey id ['.$jid.'] or userid ['.$userid.'] is invalid');
	}
	$description=$_POST['description'];
	$description=urldecode($description);
	$result=setJourneyText($jid,$description);
	setResponse(100,$result);
	}
else if($command=="setMarkerText")
	{
	$id=$_POST['id'];
	$jid=$_POST['jid'];
	$userid = $_SESSION['user']->id;
	if($id<=0 or check_userid_journey($jid,$userid)==false)
		setResponse(500,'journey id ['.$id.'] or userid ['.$userid.'] is invalid');
	$description=$_POST['description'];
	$description=urldecode($description);
	$result=setMarkerText($id,$description);
	setResponse(100,$result." for ".$id);
	}
else if($command=="setSettings")
	{
	$units = $_POST['units'];
	$sort = $_POST['sort'];
	$userid = $_SESSION['user']->id;
	$result=update_settings($userid,$units, $sort);
	if($result == 0) {
		setResponse(500,'could not update settings for userid ['.$userid.'] it may not exist');
	} else {
		setResponse(200,$result);
	}
	}
else
	{
	setResponse(500,'Bad command ['.$command.']');
	}
	
mysql_close($link);

 ?>
