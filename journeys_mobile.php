<?php
include 'services.php';
include 'constants.php';

function get_user_by_id($userid)
	{
	$query='SELECT journey_id, token, lasttime FROM users WHERE id="'.$userid.'" LIMIT 1';
	$result = mysql_query($query) or die(setResponse(DATABASE_ERROR, mysql_error().' '.$query));
	$row=mysql_fetch_row($result);
	return $row;
	}

function getJourneys($userid)	
{
$result=get_journeys($userid);
$json='';
$first=true;
while ($row = mysql_fetch_array($result, MYSQL_NUM))
	{
	$journey_id=$row[0];
	$start_time=$row[1];
	$end_time=$row[2];
	$distance=$row[3];
	$flag=$row[4];
	
	if($flag==1) {
		update_journey($journey_id, $start_time, $end_time, $distance);
	}
	if(!$first) {
		$json.=';';
	}
	$json .= $row[0];
	if($start_time!=null) {
		$json .=','.$start_time;
		if($end_time!=null) {
			//$json .=','.($end_time-$start_time);
			$json .=','.$end_time;
			}
		}
//	$description=$row[5];
//	$description=utf8_encode($description);
	
//	if($description!=null)
//		$json .=',"text":'.json_encode($description);
	if($distance!=null) {
		$json .=','.$distance;
		}
	$json .='';
	$first=false;
//	break;
	}
$json.='';
return $json;
}


function setResponse($code,$message)	{
	die('status='.$code.'&msg='.$message);
	}
	

//$link = mysql_connect('127.0.0.1', 'root', 'mysql') or die(setResponse(500,"mysql_connect:".mysql_error()));
//mysql_select_db('tracker') or die(setResponse(500,mysql_error()));

$link = mysql_connect('127.0.0.1', 'eggbutty', 'e996utty') or die(setResponse(DATABASE_ERROR,mysql_error()));
mysql_select_db('eggbutty_tracker_1') or die(setResponse(DATABASE_ERROR,mysql_error()));

$command=$_POST['command'];
$userid=$_POST['userid'];

isset($command,$userid) or setResponse(PROTOCOL_ERROR,'command or userid is not defined');
$userid=intval($userid);
//echo $userid;
if($userid == 0) {
	setResponse(PROTOCOL_ERROR,'userid is not valid ['.$_POST['userid'].']');
}

if($command=="get_journeys")
	{
	$row=get_user_by_id($userid);
	//$query='SELECT journeyid,token FROM users WHERE id="'.$userid.'"';
	//$result = mysql_query($query) or die('status='.HTTP_WAYPOINTS_FAIL.'&msg='.mysql_error());
	//$row=mysql_fetch_row($result);
	if(!$row)
		die(setResponse(PROTOCOL_ERROR,'userid '.$userid.' does not exist'));
//	if(strcmp($row[1],$token)!=0)
//		die('status='.HTTP_DIALOG.'&msg=Try logging in again, go to Settings > User > Change User [Error : wrong token '.$token.']');
	$result=getJourneys($userid);
	setResponse(GET_JOURNEYS_OK,$result);
	}
else
	{
	setResponse(PROTOCOL_ERROR,'command ['.$command.'] not recognised');
	}


 ?>
