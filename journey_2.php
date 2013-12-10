<?php
define ("HTTP_ERROR",0);
define ("HTTP_WAYPOINTS_OK",1);
define ("HTTP_WAYPOINTS_FAIL",2);
define ("HTTP_SUBSCRIBE_OK",3);
define ("HTTP_SUBSCRIBE_FAIL",4);
define ("HTTP_LOGIN_OK",5);
define ("HTTP_LOGIN_FAIL",6);

//function get_user_by_name($name)
//	{
//	$query='SELECT id, jid, lasttime FROM users WHERE user="'.$name.'" LIMIT 1';
//	$result = mysql_query($query) or die('status='.HTTP_SUBSCRIBE_FAIL.'&msg='.mysql_error());
//	$row=mysql_fetch_row($result);
//	return $row;
//	}

//function get_journeys($userid)
//	{
//	$query='SELECT journeys.jid,journeys.start_time,journeys.end_time FROM journeys WHERE journeys.userid="'.$userid.'" ORDER BY journeys.start_time DESC';
//	$result=mysql_query($query) or die('status='.HTTP_JOURNEYS_FAIL.'&msg='.mysql_error());
//	return $result;
//	}
	
function get_user_by_id($userid)
	{
	$query='SELECT jid, token, lasttime FROM users WHERE id="'.$userid.'" LIMIT 1';
	$result = mysql_query($query) or die('status='.HTTP_SUBSCRIBE_FAIL.'&msg='.mysql_error());
	$row=mysql_fetch_row($result);
	return $row;
	}
	
function get_user_by_name_password($name, $password)
	{
	$query='SELECT id,jid FROM users WHERE user="'.$name.'" AND password="'.$password.'" LIMIT 1';
	$result = mysql_query($query) or die('status='.HTTP_LOGIN_FAIL.'&msg='.mysql_error());
	$row=mysql_fetch_row($result);
	return $row;
	}

function check_user_name($name)
	{
	$query='SELECT user FROM users WHERE user="'.$name.'" LIMIT 1';
	$result = mysql_query($query) or die('status='.HTTP_SUBSCRIBE_FAIL.'&msg='.mysql_error());
	$row=mysql_fetch_row($result);
	return !$row ? false:true;
	}
	
//function check_user_name_password($name, $password)
//	{
//	$query='SELECT id FROM users WHERE user="'.$name.'" AND password="'.$password.'" LIMIT 1';
//	$result = mysql_query($query) or die('status='.HTTP_LOGIN_FAIL.'&msg='.mysql_error());
//	$row=mysql_fetch_row($result);
//	return $row;
//	}

//function get_journeyid($userid)
//	{
//	$query='SELECT journeyid FROM users WHERE id="'.$userid.'"';
//	$result = mysql_query($query) or die('status='.HTTP_WAYPOINTS_FAIL.'&msg='.mysql_error());
//	$row=mysql_fetch_row($result);
//	return $row;
//	}	

function subscribe($user)
	{
	$password=hexdec(hash('crc32',$user));
	$token=uniqid(true);  // get a unique token based on the UTC timestamp
	//echo "password=".$password.'<br>';
	//return;
	$query = 'INSERT INTO users (user,password,token) VALUES("'.$user.'","'.$password.'","'.$token.'")';
	$result = mysql_query($query) or die('status='.HTTP_SUBSCRIBE_FAIL.'&msg='.mysql_error());
	$userid=mysql_insert_id();
	return 'status='.HTTP_SUBSCRIBE_OK.'&userid='.$userid.'&user='.$user.'&password='.$password.'&token='.$token;
	}

function add_waypoint($user,$jid,$time,$lat,$lon,$alt,$acc)
	{
	$query = 'INSERT INTO waypoints (userid,jid,time,latitude,longitude,altitude,accuracy) VALUES("'.$user.'","'.$jid.'","'.$time.'","'.$lat.'","'.$lon.'","'.$alt.'","'.$acc.'")';
	//echo 'Query was '.$query.'<br>';
	return mysql_query($query);
	// or die('status='.HTTP_WAYPOINTS_FAIL.'&msg='.mysql_error());
	//return mysql_insert_id();
	}

function add_journey($jid, $userid, $time)
	{
	$query = 'INSERT INTO journeys (jid, userid, start_time) VALUES("'.$jid.'","'.$userid.'","'.$time.'")';
	//echo 'Query was '.$query.'<br>';
	mysql_query($query) or die('status='.HTTP_WAYPOINTS_FAIL.'&msg='.mysql_error());
	return $jid;
	}
	
function end_journey($jid, $time)
	{
	$query='UPDATE journeys SET end_time="'.$time.'" WHERE jid="'.$jid.'"';
	//echo 'Query was '.$query.'<br>';
	mysql_query($query) or die('status='.HTTP_WAYPOINTS_FAIL.'&msg='.mysql_error());
	return 0;
	}
	

function update_user($userid,$jid, $lasttime)
	{
	$query='UPDATE users SET jid="'.$jid.'", lasttime="'.$lasttime.'" WHERE id="'.$userid.'"';
	//echo 'Query was '.$query.'<br>';
	return mysql_query($query) or die('status='.HTTP_WAYPOINTS_FAIL.'&msg='.mysql_error());
	}
	
function change_user($userid,$token)
	{
	$query='UPDATE users SET token="'.$token.'" WHERE id="'.$userid.'"';
	return mysql_query($query) or die('status='.HTTP_LOGIN_FAIL.'&msg='.mysql_error());
	}

$link = mysql_connect('127.0.0.1', 'eggbutty', 'e996utty') or die('status='.HTTP_ERROR.'&msg='.mysql_error());
mysql_select_db('tracker') or die('status='.HTTP_ERROR.'&msg=could not select database');

//$link = mysql_connect('127.0.0.1', 'root', 'mysql') or die('status='.HTTP_ERROR.'&msg='.mysql_error());
//mysql_select_db('tracker') or die('status='.HTTP_ERROR.'&msg=could not select database');


$command=$_POST['command'];
if($command=="subscribe")
	{
	$user=$_POST['user'];
	$user_exists=check_user_name($user);
	if($user_exists)
		{
		for($n=0;$n<10;$n++)
			{
			if(!check_user_name($user.$n))
				break;
			}
		$user=$user.$n;
		die('status='.HTTP_SUBSCRIBE_FAIL.'&msg=a user with this name already exists, try "'.$user.'"');	
		}
	echo subscribe($user);
	}
else if($command=="add_waypoints")
	{
	$userid=$_POST['userid'];
	$token=$_POST['token'];
	
	$row=get_user_by_id($userid);
	//$query='SELECT journeyid,token FROM users WHERE id="'.$userid.'"';
	//$result = mysql_query($query) or die('status='.HTTP_WAYPOINTS_FAIL.'&msg='.mysql_error());
	//$row=mysql_fetch_row($result);
	if(!$row)
		die('status='.HTTP_WAYPOINTS_FAIL.'&msg=userid '.$userid.' does not exist');
	if(strcmp($row[1],$token)!=0)
		die('status='.HTTP_WAYPOINTS_FAIL.'&msg=wrong token '.$token);
	$jid=$row[0];
	$lasttime=$row[2];
	
	$count=count($_POST['time']);
	$badtimes=0;
	$goodtimes=0;
	for ($i=0; $i < $count; $i++)
		{
		$time=$_POST['time'][$i];
		$lat=floatval($_POST['lat'][$i]);
		$lon=floatval($_POST['lon'][$i]);
		$alt=floatval($_POST['alt'][$i]);
		$acc=floatval($_POST['acc'][$i]);
		$myjid=intval($_POST['jid'][$i]);
		if($time >= $lasttime)
			{
			if($myjid > $jid)
				{
				add_journey($myjid, $userid,$time);
				$jid=$myjid;
				}
			if($myjid==$jid) // if the waypoint belongs to this journey
				{
				if(add_waypoint($userid,$myjid,$time,$lat,$lon,$alt,$acc))
					$goodtimes++;
				else
					$badtimes++;
				}
			else //throw away waypoints that are for previous journeys
				{
				$badtimes++;
				}
			$lasttime=$time;
			}
		else
			{
			$badtimes++;	
			}
		}
	end_journey($myjid,$time); //set the end_time to the last waypoint's time - this keeps the journey duration consistent
	update_user($userid,$myjid, $lasttime);  // and update the user entry
	//echo 'updated '.update_user($userid,$jid,$time).' rows';
	$error = $badtimes>0 ? 'dropped '.$badtimes.' waypoints ' : '';
	$error=$error.'('.$myjid.')('.$jid.')';
	echo 'status='.HTTP_WAYPOINTS_OK.'&msg=added '.$goodtimes.' waypoints '.$error;
	}
else if($command=="login")
	{
	$user=$_POST['user'];
	$password=$_POST['password'];
	$token=$_POST['token'];
	
	$row=get_user_by_name_password($user, $password);
	if($row)
		{
		$userid=$row[0];
		change_user($userid,$token);  // update the user entry for this timestamp
		echo 'status='.HTTP_LOGIN_OK.'&userid='.$userid.'&user='.$user.'&password='.$password.'&jid='.$row[1];
		}
	else
		echo 'status='.HTTP_LOGIN_FAIL.'&msg=user name '.$user. ' could not be logged in';
	}

// Closing connection
mysql_close($link);
 ?>