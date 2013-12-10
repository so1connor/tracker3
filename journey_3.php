<?php

include 'constants.php';



function logErrorToFile($code, $msg)
{ 
global $command, $userid;
$fd = fopen("journey_error.log", "a") or die('status='.DATABASE_ERROR.'&msg=could not open log file');	
$str = '['.date("Y/m/d h:i:s ", mktime()).']'.$command.' '.$userid.' '.$code.' '.$msg; 
fwrite($fd, $str . "\n");
fclose($fd);
}

function logErrorToDatabase($code, $msg)
{
global $command, $userid;
$query = 'INSERT INTO errors (command,userid,code,message) VALUES("'.$command.'","'.$userid.'","'.$code.'","'.$msg.'")';
mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
}

function setDatabaseError($msg) {
	logErrorToFile(DATABASE_ERROR,$msg);
	die('status='.DATABASE_ERROR.'&msg='.$msg);	
}


function setError($code,$msg) {
	logErrorToDatabase($code,$msg);
	die('status='.$code.'&msg='.$msg);
}

	
function get_user_by_id($userid)
	{
	$query='SELECT journey_id, sequence, token, lasttime FROM users WHERE id="'.$userid.'" LIMIT 1';
	$result = mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	$row=mysql_fetch_row($result);
	return $row;
	}
		
//function get_user_by_name_password($name, $password)
//	{
//	$query='SELECT id,jid FROM users WHERE user="'.$name.'" AND password="'.$password.'" LIMIT 1';
//	$result = mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
//	$row=mysql_fetch_row($result);
//	return $row;
//	}

function check_user_name($name)
	{
	$query='SELECT user FROM users WHERE user="'.$name.'" LIMIT 1';
	$result = mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	$row=mysql_fetch_row($result);
	return !$row ? false:true;
	}
	
function subscribe($user)
	{
	$password=hexdec(hash('crc32',$user));
	$token=uniqid(true);  // get a unique token based on the UTC timestamp
	$query = 'INSERT INTO users (user,password,token) VALUES("'.$user.'","'.$password.'","'.$token.'")';
	$result = mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	$userid=mysql_insert_id();  // make sure id column is not BIGINT or this will fail
	return 'status='.SUBSCRIBE_OK.'&userid='.$userid.'&user='.$user.'&password='.$password.'&token='.$token;
	}

function add_waypoint($id,$time,$lat,$lon,$alt,$acc)
	{
	$query = 'INSERT INTO waypoints (journey_id,time,latitude,longitude,altitude,accuracy) VALUES('.$id.','.$time.','.$lat.','.$lon.','.$alt.','.$acc.')';
	return mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	}

function add_journey($userid, $time)
	{
	$query = 'INSERT INTO journeys (userid, start_time, end_time) VALUES('.$userid.','.$time.','.$time.')';
	$result = mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	$new_id = mysql_insert_id() or setDatabaseError(mysql_error());
	return $new_id;
	}
	
function end_journey($journey_id, $time)
	{
	$query='UPDATE journeys SET end_time='.$time.', count = count + 1 WHERE id='.$journey_id;
	$result = mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	return $result;
	}
	

function update_user($userid, $sequence, $journey_id, $lasttime)
	{
	$query='UPDATE users SET sequence = '.$sequence. ', journey_id='.$journey_id.', lasttime='.$lasttime.' WHERE id='.$userid;
	$result = mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	return $result;
	}
	
function change_user($userid,$token)
	{
	$query='UPDATE users SET token="'.$token.'" WHERE id="'.$userid.'"';
	$result = mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	return $result;
	}
	
function process_waypoint($index, $userid, $time, $lasttime, $sequence, & $journey_id) {
		$lat=$_POST['lat'][$index];
		$lon=$_POST['lon'][$index];
		$alt=$_POST['alt'][$index];
		$acc=$_POST['acc'][$index];
		$myjid=$_POST['jid'][$index];
		isset($time, $lat, $lon, $alt, $acc, $myjid) or setError(PROTOCOL_ERROR,'parameter (lat,lon,alt,acc or jid) is not defined');
		$lat = floatval ($lat);
		$lon = floatval ($lon);
		$alt = floatval ($alt);
		$acc = floatval ($acc);
		$myjid = intval ($myjid);
		if($time > $lasttime) {
			if($myjid < $sequence) { // waypoint is from a previous journey - throw it away
				logErrorToDatabase(WAYPOINTS_FAIL, 'sequence '.$myjid.' is less than or equal to '.$sequence);
				return false;
				}
			if($myjid > $sequence) {
				// this is a new journey
				$journey_id = add_journey($userid,$time);
				$sequence = $myjid;
				}
			if($myjid == $sequence) { 
				// if the waypoint belongs to this journey
				add_waypoint($journey_id,$time,$lat,$lon,$alt,$acc);
				// set the end_time to the last waypoint's time - this keeps the journey duration consistent
				// we have to do this per waypoint, we can't predict when a new journey will start 
				end_journey($journey_id,$time);
				} 
			} else {
			logErrorToDatabase(WAYPOINTS_FAIL,'time '.$time.' is less than '.$lasttime);
			return false;
		}
	return $myjid;
	}

isset($_POST) or setError(PROTOCOL_ERROR,'empty request');


$link = mysql_connect('127.0.0.1', 'eggbutty', 'e996utty') or setDatabaseError(mysql_error());
mysql_select_db('eggbutty') or setDatabaseError(mysql_error());

//$link = mysql_connect('127.0.0.1', 'root', 'mysql') or die('status='.ERROR.'&msg='.mysql_error());
//mysql_select_db('tracker') or die('status='.ERROR.'&msg=could not select database');


$command=$_POST['command'];
isset($command) or setError(PROTOCOL_ERROR,'command is not defined');

if($command=="subscribe") {
	$user=$_POST['user'];
	isset($user) or setError(PROTOCOL_ERROR,'user name is not defined');
	if(strlen($user)<3) {
		setError(PROTOCOL_ERROR,'user name has to be at least 3 letters');
	}
	preg_match('/[^0-9^a-z]/i',$user) and setError(PROTOCOL_ERROR,'user name can only contain letters or numbers'); 	
	$user_exists=check_user_name($user);
	if($user_exists) {
		for($n=0;$n<10;$n++) {
			if(!check_user_name($user.$n)) {
				break;
			}
		}
		$user=$user.$n;
		setError(DIALOG, 'a user with this name already exists, try "'.$user.'"');
	}
	echo subscribe($user);
} else if($command=="add_waypoints") {
	$userid=$_POST['userid'];
	$token=$_POST['token'];
	// check validity of the inputs 
	isset($userid, $token) or setError(PROTOCOL_ERROR,'userid or token is not defined');
	if(!is_numeric ($userid)) {
		setError(PROTOCOL_ERROR,'userid <'.$userid.'> is not valid');
	}
	$userid = intval($userid);
	if($userid <= 0) {
		setError(PROTOCOL_ERROR,'userid <'.$userid.'> is not valid');
	}
	// valid inputs
	$row=get_user_by_id($userid);
	
	if(!$row) {
		setError(PROTOCOL_ERROR,'userid <'.$userid.'> does not exist');
	}
	if(strcmp($row[2],$token)!=0){
		setError(LOGIN_FAIL,'Try logging in again, go to Settings > User > Change User [Error : wrong token '.$token.']');
	}
	$journey_id=$row[0];
	$sequence=$row[1];
	$lasttime=$row[3];

	$count=count($_POST['time']);
	$count != 0 or setError(WAYPOINTS_FAIL,'waypoint count was zero');
	$badtimes=0;
	$goodtimes=0;
	//echo '['.$count.']';
	for ($i=0; $i < $count; $i++) {
		$time=$_POST['time'][$i];
		//echo '['.$time.']';
		isset($time) or setError(PROTOCOL_ERROR,'time is not defined at index '.$i);
		//echo '['.$time.']';
		$result = process_waypoint($i, $userid, $time, $lasttime, $sequence, $journey_id);
		if($result) {
			$sequence = $result;
			$lasttime=$time;
			$goodtimes++;
		} else {
			$badtimes++;	
		}
	}
	if($goodtimes > 0 ) {
		update_user($userid,$sequence,$journey_id, $lasttime);  // update the user entry
		$error = $badtimes>0 ? 'dropped '.$badtimes.' waypoint(s)' : '';
		#$error=$error.'('.$myjid.')('.$jid.')';
		echo 'status='.WAYPOINTS_OK.'&msg=added '.$goodtimes.' waypoint(s) '.$error;
	} else {
		echo 'status='.WAYPOINTS_OK.'&msg=dropped '.$badtimes.' waypoint(s) ';
	}
} else if($command=="login") {
	$user=$_POST['user'];
	$password=$_POST['password'];
	$token=$_POST['token'];
	preg_match('/[^0-9^a-f]/',$token) and setError(PROTOCOL_ERROR,'token <'.$token.'> is not valid');
	isset($user, $password, $token) or setError(PROTOCOL_ERROR,'user, password or token not defined');
	$row=get_user_by_name_password($user, $password);
	if($row) {
		$userid=$row[0];
		change_user($userid,$token);  // update the user entry for this timestamp
		echo 'status='.LOGIN_OK.'&userid='.$userid.'&user='.$user.'&password='.$password.'&jid='.$row[1];
	} else {
		setError(DIALOG,'user name <'.$user.'> could not be logged in');
	}
} else {
	//header("HTTP/1.0 404 Not Found");
	setError(PROTOCOL_ERROR,'command <'.$command.'> is not recognised');
}

mysql_close($link);
?>