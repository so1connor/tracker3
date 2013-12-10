<?php session_start();?>
<html>
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8"/>
    <title>Track My Run - use your mobile phone to remember your runs</title>
    
<script src="http://maps.google.com/maps/api/js?sensor=false" type="text/javascript"></script>
<script src="jquery-1.4.2.min.js" type="text/javascript"></script>

<script src="utils.js" type="text/javascript"></script>
<script src="vector.js" type="text/javascript"></script>
<script src="info_window.js" type="text/javascript"></script>
<script src="tracker_ui.js" type="text/javascript"></script>
<script src="split_panel.js" type="text/javascript"></script>
<script src="tracker_graph.js" type="text/javascript"></script>
<script src="tracker.js" type="text/javascript"></script>
<script src="markers.js" type="text/javascript"></script>
<script src="journeys.js" type="text/javascript"></script>
<script src="drag_marker.js" type="text/javascript"></script>


<link rel=stylesheet href="tracker.css" type="text/css">
 </head>

<body>
<div class="floater" id="status"></div>
<div id="thetop" class="top">
<h1></h1>

<?php if (isset($_SESSION['username'])) {?>

<script type="text/javascript">session="<?php echo session_id();?>";</script>

<div id="loggedin" style="display: block">
Logged in as <span id="username"><?php echo $_SESSION['username']?></span>&nbsp;<a href="logout.php">Logout</a>
<select id="units"><option>Kilometres</option><option>Miles</option></select>
<div id="debug"></div>
</div>
</div>

<div class = "left_panel" id="left_panel">
<!--div class = "sorter" id="sorter">SORTER</div-->
<div class="list" id="list"></div>
</div>

<?php } else { ?>

<script type="text/javascript">session=0;</script>

<div id="login" class="login">
user<INPUT id="user" name="user" type="text" value="">
password<INPUT id="password" name="password" type="password" value="">
<INPUT id="login_button" type="submit" value="Log in">
<div id="debug"></div>
</div>
<div id="loggedin" style="display:none">
Logged in as <span id="username"></span>&nbsp;<a href="logout.php">Logout</a>
<select id="units"><option>Kilometres</option><option>Miles</option></select>
<div id="debug"></div>
</div>
</div>

<div class="list" id="list">
<h2>What is it?</h2>
<!--img src="images/blackberry.png" style="float:left;"-->
<p>Track My Run lets you record your outdoor trips with a mobile phone and then view and edit them on the web with Google Maps.</p>
<h2>Why do I need it?</h2>
<p>If you are a runner you can use it to see how your training is progressing, your speed and timing is recorded. If you walk outdoors you can see exactly where you went and add notes and photos to the trip. Because the service uses a mobile phone, you don't need to carry extra gear.</p>
<h2>How does it work?</h2>
<p>You need a mobile phone with GPS. Here is a <a href="mobiles.html">list</a> of compatible devices. You download an app to your phone. When it is installed it will ask you to register and then you are ready to go. The app will record your when you are running, when an internet connection is available your tracks will be uploaded to the server. You can login here to see the results.
</p>
<h2>How much does it cost?</h2>
<p>
	The service is free up to 1000 footprints. You will be charged for data traffic by your mobile phone operator. But the service doesn't use much data to record your movements. If you are on contract and have a data plan included it won't cost you anything. If you are on PAYG (pay as you go), you get charged per MB of data. The service can store up to 5000 footprints with 1MB of data. What you will be charged depends on the operator. See <a href="dataplans.html">here</a> for details of UK operator data charges.
</p>
</div>
<?php } ?>

<div class="dragger" id="drag"></div>
<div class="right" id="right">
	<div class="graph" id="graph">
	<div class="graph-control" id="graph-control">
	<span class="graph-speed" id="graph-speed">speed</span>
	<span class="graph-ascent" id="graph-ascent"></span></div>
	<div class="canvas-container" id="canvas-container">
	<div class="graph-div" id="graph-div"></div>
	<canvas class="graph-canvas" id="graph-canvas">This text is displayed if your browser does not support HTML5 Canvas.</canvas>
	</div>
	</div>
	<div class="map" id="map"></div>
</div>

</div>

</body>
</html>