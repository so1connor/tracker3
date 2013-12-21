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



function getJourneys($userid)
{
$result=get_journeys($userid);
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
	$tzcount = $row[6];
	if($flag) {
		update_journey($id, $flag, $start_time, $end_time, $distance, $count, $tzcount);
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
	$json .=',"tz":'.$tzcount;
	$json .='}';
	$first=false;
	}
$json.=']';
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
	$user=$_POST['user'];
	$password=$_POST['password'];
	if(preg_match("/^[a-zA-Z0-9]+$/",$user)==0 or preg_match("/^[a-zA-Z0-9]+$/",$password)==0)
		setResponse(500,"User name and password should be letters and numbers only");
	$userid=get_userid($user, $password);
	if($userid==0)
		setResponse(500,"User was not found");
	else
		{
		//session_start();
		$_SESSION['username']=$user;
		$_SESSION['userid']=$userid;
		$session=session_id();
		//setResponse(400,$command,"userid is ".$userid);
		setResponseWithContent(200,$session,getJourneys($userid));
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
	$journeys = getJourneys($_SESSION['userid']);
	$settings = get_settings($_SESSION['userid']);
	$content = '{"journeys":'.$journeys.',"settings":'.$settings.'}';
	setResponseWithContent(200,"OK",$content);
	}
else if($command=="getMarkers")
	{
	$jid=$_POST['jid'];
	setResponseWithContent(200,"OK",getMarkers($_SESSION['userid'],$jid));
	}
else if($command=="logout")
	{
	//session_start();
	unset($_SESSION['username']);
	session_destroy();
	header( 'Location: tracker1.php' );
	//setResponse(200,$command,"Logged out");
	}
else if($command=="deleteJourney")
	{
	$jid=$_POST['jid'];
//	$id=intval($id);
	$userid = $_SESSION['userid'];
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
	$userid = $_SESSION['userid'];
	if($id<=0 or check_userid_journey($jid,$userid)==false) {
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
	$userid = $_SESSION['userid'];
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
	$userid = $_SESSION['userid'];
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
	$userid = $_SESSION['userid'];
	if($id<=0 or check_userid_journey($jid,$userid)==false)
		setResponse(500,'journey id ['.$id.'] or userid ['.$userid.'] is invalid');
	$description=$_POST['description'];
	$description=urldecode($description);
	$result=setMarkerText($id,$description);
	setResponse(100,$result." for ".$id);
	}
else if($command=="getSettings")
	{
	$result=get_settings($_SESSION['userid']);
	if($result == -1) {
		setResponse(500,'could not get settings for userid ['.$userid.'] it may not exist');
	} else {
		setResponse(200,$result);
	}
	}
else if($command=="setSettings")
	{
	$units = $_POST['units'];
	$userid = $_SESSION['userid'];
	$result=update_settings($userid,$units);
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
