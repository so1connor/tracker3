<?php

// HttpResponse codes for journey.php
// error codes - error mask is 0xf000
//define ("CONNECTION_ERROR",0x1000);   //connection failed client side
//define ("HTTP_ERROR",0x2000);         //server responded with a code other than 200
define ("PROTOCOL_ERROR",0x4000);     //script bailed because the parameters were incorrect or missing
define ("DATABASE_ERROR",0x8000);     //script bailed because the database bailed
define ("ERROR_MASK", 0xf000);
// non-error code mask is 0xfff
define ("SUBSCRIBE_OK",0x10);
define ("SUBSCRIBE_FAIL",0x11);
define ("LOGIN_OK",0x20);
define ("LOGIN_FAIL",0x21);
define ("WAYPOINTS_OK",0x40);
define ("WAYPOINTS_FAIL",0x41);
define ("DIALOG",0x80);
// HttpResponse code for journey_mobile.php
define ("GET_JOURNEYS_OK",0x100);

 ?>