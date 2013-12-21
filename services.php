<?php

// mysql interfacing logic
include 'vector.php';



function get_journeys($user)
{
$sorts = array("start_time", "envelope");
$query='SELECT journeys.jid,journeys.start_time,journeys.end_time,journeys.distance,journeys.flag,journeys.count,journeys.timezone_offset,journey_text.description FROM journeys LEFT JOIN journey_text ON journeys.jid=journey_text.jid WHERE journeys.userid='.$user->id.' ORDER BY journeys.'.$sorts[$user->sort].' DESC';
$result=mysql_query($query) or setResponse(500, mysql_error().$query);
//setResponse(500, mysql_error().$query);
return $result;
}

function get_journey_markers($journey)
	{
	$query='SELECT waypoints.id,waypoints.time,waypoints.latitude,waypoints.longitude,waypoints.altitude,waypoints.accuracy,waypoint_text.description FROM waypoints LEFT JOIN waypoint_text ON waypoints.id=waypoint_text.id WHERE waypoints.jid='.$journey.' ORDER BY waypoints.time ASC';
	$result=mysql_query($query) or setResponse(500,mysql_error());
	return $result;
	}

// function get_journeys($userid) {
// $query='SELECT journeys.id,journeys.start_time,journeys.end_time,journeys.distance FROM journeys WHERE journeys.userid="'.$userid.'" ORDER BY journeys.start_time DESC';
// $result=mysql_query($query) or setResponse(500,mysql_error());
// $rows = array();
// while($r = mysql_fetch_assoc($result)) {
//     $rows[] = $r;
// }
// return json_encode($rows);
// }


function set_journeys_flags($userid)
{
$query='UPDATE journeys SET flag=1 where userid = '.$userid;
$result=mysql_query($query) or setResponse(500,mysql_error());
return $result;
}


	
function get_markers($journey)
	{
	$query='SELECT waypoints.time,waypoints.latitude,waypoints.longitude FROM waypoints WHERE waypoints.jid='.$journey.' ORDER BY waypoints.time ASC';
	$result=mysql_query($query) or setResponse(500,mysql_error());
	return $result;
	}

function bounds_extend($value, & $lower, & $upper)	
{
if($value > $upper) {
		$upper = $value;
	} elseif ($value < $lower) {
		$lower = $value;
	}
}


function update_journey($id, $flag, & $start_time, & $end_time, & $distance, & $count, & $tzoffset)	
{
$markers = get_markers($id);
$count = mysql_num_rows($markers);
$vector0 = new Vector;
$vector1 = new Vector;
$distance = 0;
//$top = -90;  //minimum number
//$bottom = 90;
//$left = 180;  //maximum number
//$right = -180;

if($row = mysql_fetch_array($markers, MYSQL_NUM)) {
	$start_time = $row[0];
	$top = $row[1];  //minimum number
	$bottom = $row[1];
	$left = $row[2];  //maximum number
	$right = $row[2];
//	bounds_extend($row[1],$bottom, $top);
//	bounds_extend($row[2],$left, $right);
	
	$vector0->fromLatLng($row[1],$row[2]);
}

if($flag & 2) {
	$tzoffset = getTimeZoneOffset($row[0], $row[1],$row[2]);
	}

while ($row = mysql_fetch_array($markers, MYSQL_NUM)) {
	$vector1 -> fromLatLng($row[1],$row[2]);
	$distance = $distance + earthArcDistance($vector0,$vector1);
	$vector0 -> copyVector($vector1);
	$end_time = $row[0];
	bounds_extend($row[1],$bottom, $top);
	bounds_extend($row[2],$left, $right);
	}

$envelope = sprintf("%01.1f %01.1f %01.1f %01.1f", round($top,1), round($left,1), round($bottom,1), round($right,1));

$query = 'UPDATE journeys SET start_time='.$start_time.', end_time='.$end_time.', distance='.$distance.', flag=0, count='.$count.', envelope="'.$envelope.'", timezone_offset='.$tzoffset.' WHERE jid='.$id;
//$query='UPDATE journeys SET start_time='.$start_time.', end_time='.$end_time.', distance='.$distance.', flag=0, count='.$count.', envelope="'.$envelope.'" WHERE id='.$id;
mysql_query($query) or setResponse(500,mysql_error());
}



function setJourneyFlag($id, $flag)
{
$query='UPDATE journeys SET flag='.$flag.' WHERE id='.$id;
mysql_query($query) or setResponse(500,mysql_error());
}

	
function setJourneyText($id, $description)
	{
	$description=mysql_real_escape_string($description);
	$query='REPLACE INTO journey_text (jid,description) VALUES ('.$id.',"'.$description.'")';
	$result = mysql_query($query) or setResponse(500,mysql_error());
	return $result;
	}

function setMarkerText($id, $description)
	{
	$description=mysql_real_escape_string($description);
	$query='REPLACE INTO waypoint_text (id,description) VALUES ("'.$id.'","'.$description.'")';
	$result = mysql_query($query) or setResponse(500,mysql_error());
	return $result;
	}
	
function deleteMarker($id)
	{
	$query='DELETE FROM waypoints WHERE id='.$id.' LIMIT 1';
	$result = mysql_query($query) or setResponse(500,mysql_error());
	$query='DELETE FROM waypoint_text WHERE id='.$id.' LIMIT 1';
	$result = mysql_query($query) or setResponse(500,mysql_error());
	return $result;
	}

function moveMarker($id, $lat, $lng)
	{
	$query='UPDATE waypoints SET latitude = '.$lat.', longitude = '.$lng.' WHERE id='.$id;
	$result = mysql_query($query) or setResponse(500,mysql_error());
	return $result;
	}
	
function deleteJourney($id)
	{
	$query='DELETE FROM journeys WHERE id='.$id.' LIMIT 1';
	$result = mysql_query($query) or setResponse(500,mysql_error());
	$query='DELETE FROM journey_text WHERE jid='.$id.' LIMIT 1';
	$result = mysql_query($query) or setResponse(500,mysql_error());
	$query='DELETE FROM waypoints WHERE jid='.$id;
	$result = mysql_query($query) or setResponse(500,mysql_error());
	
	return $result;
	}

function check_userid($userid)
	{
	if($userid==null)return false;
	$query='SELECT id FROM users WHERE id='.$userid;
	$result = mysql_query($query) or setResponse(500,mysql_error());
	$row=mysql_fetch_row($result);
	return !$row ? false:true;
	}
	

	
//function check_userid_marker($id, $userid)
//	{
//	$query='SELECT id FROM waypoints WHERE id='.$id.' AND userid='.$userid;
//	$result = mysql_query($query) or setResponse(500,mysql_error());
//	$row=mysql_fetch_row($result);
//	return !$row ? false:true;
//	}

function check_userid_journey($id, $userid)
	{
	$query='SELECT jid FROM journeys WHERE jid='.$id.' AND userid='.$userid;
	$result = mysql_query($query) or setResponse(500,mysql_error());
	$row=mysql_fetch_row($result);
	return !$row ? false:true;
	}

function get_user($username, $password)
	{
	if($username==null || $password==null)return false;
	$query='SELECT id, units, sort FROM users WHERE user="'.$username.'" AND password="'.$password.'"';
	$result = mysql_query($query) or setResponse(500,mysql_error());
	$row=mysql_fetch_object($result);
	return $row;
//	return $row ? $row[0]: 0;
	}

function update_settings($userid, $units, $sort)
	{
	if($userid==null)return false;
	$query='UPDATE users SET units ='.$units.', sort ='.$sort.' WHERE id='.$userid;
	$result = mysql_query($query) or setResponse(500,mysql_error());
	return $result;
	}
	
function get_settings($userid)
	{
	if($userid==null)return false;
	$query='SELECT units, sort FROM users WHERE id='.$userid.' LIMIT 1';
	$result = mysql_query($query) or setResponse(500,mysql_error());
	return $result;
	}


function getTimeZoneOffset($time, $latitude, $longitude) {

if(insideUK ($latitude, $longitude) ) {
	$date = new DateTime('00:00:00', new DateTimeZone('Europe/London'));
	$date->setTimestamp($time/1000);
	return $date->getOffset();
}

$ch = curl_init();
if($ch == false) {
	setResponse(500,'could not init curl');
}
curl_setopt($ch, CURLOPT_URL, 'http://api.geonames.org/timezoneJSON?lat='.$latitude.'&lng='.$longitude.'&username=eggbutty');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//curl_setopt($ch, CURLOPT_HEADER, 0);

$result = curl_exec($ch);
if($result == false) {
	setResponse(500, 'error loading geonames API');
	}
$json = json_decode($result,true);
//setResponse(500, $result);
curl_close($ch);

$tzid = $json["timezoneId"];
if(!isset($tzid)) {
	setResponse(500, 'no timezoneId');
	} else {
//	try {
	$date = new DateTime('00:00:00', new DateTimeZone($tzid));
//	} catch (Exception $e) {
//	echo $e->getMessage();
//    exit(1);	
		
//	}
	$date -> setTimestamp($time/1000);
	return $date -> getOffset();
//	return $tzid;
	}
}

function insideUK($latitude, $longitude) {
if($latitude < 50.1 ) { return false; }
if($latitude > 58.4 ) { return false; }
if($longitude < -10.5) { return false; }
if($longitude > 1.43) { return false; }

return true;	
	
}


 ?>
