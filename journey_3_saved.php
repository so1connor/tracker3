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
	$query='SELECT jid, token, lasttime FROM users WHERE id="'.$userid.'" LIMIT 1';
	$result = mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	$row=mysql_fetch_row($result);
	return $row;
	}
	
function get_user_by_name_password($name, $password)
	{
	$query='SELECT id,jid FROM users WHERE user="'.$name.'" AND password="'.$password.'" LIMIT 1';
	$result = mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	$row=mysql_fetch_row($result);
	return $row;
	}

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

function add_waypoint($userid,$jid,$time,$lat,$lon,$alt,$acc)
	{
	$query = 'INSERT INTO waypoints (userid,jid,time,latitude,longitude,altitude,accuracy) VALUES("'.$userid.'","'.$jid.'","'.$time.'","'.$lat.'","'.$lon.'","'.$alt.'","'.$acc.'")';
	return mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	}

function add_journey($jid, $userid, $time)
	{
	$query = 'INSERT INTO journeys (jid, userid, start_time, end_time) VALUES('.$jid.','.$userid.','.$time.','.$time.')';
	return mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	}
	
function end_journey($jid, $userid, $time)
	{
	$query='UPDATE journeys SET end_time='.$time.' WHERE jid='.$jid.' and userid='.$userid;
	return mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	}
	

function update_user($userid,$jid, $lasttime)
	{
	$query='UPDATE users SET jid="'.$jid.'", lasttime="'.$lasttime.'" WHERE id="'.$userid.'"';
	return mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	}
	
function change_user($userid,$token)
	{
	$query='UPDATE users SET token="'.$token.'" WHERE id="'.$userid.'"';
	return mysql_query($query) or setDatabaseError(mysql_error().' '.$query);
	}
	
function process_waypoint($index, $userid, $time, $lasttime, $jid) {
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

			if($myjid < $jid) { // waypoint is from a previous journey - throw it away
				logErrorToDatabase(WAYPOINTS_FAIL, 'jid '.$myjid.' is less than or equal to '.$jid);
				return false;
				}
			if($myjid > $jid) {
				// this is a new journey
				add_journey($myjid,$userid,$time);
				$jid=$myjid;
				}
			if($myjid==$jid) { 
				// if the waypoint belongs to this journey
				add_waypoint($userid,$jid,$time,$lat,$lon,$alt,$acc);
				// set the end_time to the last waypoint's time - this keeps the journey duration consistent
				// we have to do this per waypoint, we can't predict when a new journey will start 
				end_journey($jid,$userid,$time);
				} 
			} else {
			logErrorToDatabase(WAYPOINTS_FAIL,'time '.$time.' is less than '.$lasttime);
			return false;
		}
	return $myjid;
	}

isset($_POST) or setError(PROTOCOL_ERROR,'empty request');


$link = mysql_connect('127.0.0.1', 'eggbutty', 'e996utty') or setDatabaseError(mysql_error());
mysql_select_db('eggbutty_tracker_1') or setDatabaseError(mysql_error());

//$link = mysql_connect('127.0.0.1', 'root', 'mysql') or die('status='.ERROR.'&msg='.mysql_error());
//mysql_select_db('tracker') or die('status='.ERROR.'&msg=could not select database');


$command=$_POST['command'];
isset($command) or setError(PROTOCOL_ERROR,'command is not defined');

if($command=="subscribe")
	{
	$user=$_POST['user'];
	isset($user) or setError(PROTOCOL_ERROR,'user name is not defined');
	if(strlen($user)<3) {
		setError(PROTOCOL_ERROR,'user name has to be at least 3 letters');
	}
	preg_match('/[^0-9^a-z]/i',$user) and setError(PROTOCOL_ERROR,'user name can only contain letters or numbers'); 	
	$user_exists=check_user_name($user);
	if($user_exists)
		{
		for($n=0;$n<10;$n++)
			{
			if(!check_user_name($user.$n))
				break;
			}
		$user=$user.$n;
		setError(DIALOG, 'a user with this name already exists, try "'.$user.'"');
		}
	echo subscribe($user);
	}
else if($command=="add_waypoints")
	{
	$userid=$_POST['userid'];
	$token=$_POST['token'];
	isset($userid, $token) or setError(PROTOCOL_ERROR,'userid or token is not defined');
	if(!is_numeric ($userid))
		setError(PROTOCOL_ERROR,'userid <'.$userid.'> is not valid');	
	$userid = intval($userid);
	if($userid <= 0)
		setError(PROTOCOL_ERROR,'userid <'.$userid.'> is not valid');
	$row=get_user_by_id($userid);
	//$query='SELECT journeyid,token FROM users WHERE id="'.$userid.'"';
	//$result = mysql_query($query) or die('status='.WAYPOINTS_FAIL.'&msg='.mysql_error());
	//$row=mysql_fetch_row($result);
	if(!$row)
		setError(PROTOCOL_ERROR,'userid <'.$userid.'> does not exist');
	if(strcmp($row[1],$token)!=0)
		setError(LOGIN_FAIL,'Try logging in again, go to Settings > User > Change User [Error : wrong token '.$token.']');
	$jid=$row[0];
	$lasttime=$row[2];

	$count=count($_POST['time']);
	$count != 0 or setError(WAYPOINTS_FAIL,'waypoint count was zero');
	$badtimes=0;
	$goodtimes=0;
	//echo '['.$count.']';
	for ($i=0; $i < $count; $i++)
		{
		$time=$_POST['time'][$i];
		//echo '['.$time.']';
		isset($time) or setError(PROTOCOL_ERROR,'time is not defined at index '.$i);
		//echo '['.$time.']';
		$result = process_waypoint($i, $userid, $time, $lasttime, $jid);
		if($result) {
			$jid = $result;
			$lasttime=$time;
			$goodtimes++;
			}
		else
			{
			$badtimes++;	
			}
		}
	if($goodtimes > 0 ) {
		update_user($userid,$jid, $lasttime);  // update the user entry
		$error = $badtimes>0 ? 'dropped '.$badtimes.' waypoint(s)' : '';
		#$error=$error.'('.$myjid.')('.$jid.')';
		echo 'status='.WAYPOINTS_OK.'&msg=added '.$goodtimes.' waypoint(s) '.$error;
	} else {
		echo 'status='.WAYPOINTS_OK.'&msg=dropped '.$badtimes.' waypoint(s) ';
		}
	}
else if($command=="login")
	{
	$user=$_POST['user'];
	$password=$_POST['password'];
	$token=$_POST['token'];
	preg_match('/[^0-9^a-f]/',$token) and setError(PROTOCOL_ERROR,'token <'.$token.'> is not valid');
	isset($user, $password, $token) or setError(PROTOCOL_ERROR,'user, password or token not defined');
	$row=get_user_by_name_password($user, $password);
	if($row)
		{
		$userid=$row[0];
		change_user($userid,$token);  // update the user entry for this timestamp
		echo 'status='.LOGIN_OK.'&userid='.$userid.'&user='.$user.'&password='.$password.'&jid='.$row[1];
		}
	else
		setError(DIALOG,'user name <'.$user.'> could not be logged in');
	}
else {
	//header("HTTP/1.0 404 Not Found");
	setError(PROTOCOL_ERROR,'command <'.$command.'> is not recognised');
}

mysql_close($link);
 ?>