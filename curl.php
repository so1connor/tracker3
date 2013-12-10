<?php

function getTimeZoneOffset($time, $latitude, $longitude) {

if(insideUK ($latitude, $longitude) ) {
	return 0;
}

$ch = curl_init();
if($ch == false) {
	return 0;
}
curl_setopt($ch, CURLOPT_URL, 'http://api.geonames.org/timezoneJSON?lat='.$latitude.'&lng='.$longitude.'&username=eggbutty');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
//curl_setopt($ch, CURLOPT_HEADER, 0);

$result = curl_exec($ch); 
if($result == false) {
	return 0;
	}
$json = json_decode($result,true);
curl_close($ch);
$tzid = $json["timezoneId"];
if(!isset($tzid)) {
	return 0;
	} else {
//	try {
	$date = new DateTime('00:00:00', new DateTimeZone($tzid));
//	} catch (Exception $e) {
//	echo $e->getMessage();
//    exit(1);	
		
//	}
	$date->setTimestamp($time/1000);
	return $date->getOffset();
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
$tz = getTimeZoneOffset(1236424741064,-33,151);

echo "timezone is ".$tz;

?>