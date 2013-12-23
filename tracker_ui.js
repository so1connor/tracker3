window.ui_module = function () {

	var divmap = document.getElementById("map"),	//map container
	right_panel = document.getElementById("right"),
	panel = document.getElementById("list"),	//list container
	thetop = document.getElementById("thetop"),
	//graphdiv = document.getElementById("graph"),
	split_panel = split_panel_module(panel,right_panel,function () {
		tracker.resize();
		//jm.setSpeedDivs(j);
	}),
	polypath = null,
	polyline = null,
	polypaths = [],
	polylines = [],
	//hues = ["#f00","#f30","#f70","#fa0","#ff0","#af0","#7f0","#3f0","#0f0","#0f3","#0f7","#0fa","#0ff","#0af","#07f","#03f","#00f"],
	hues = ["#0a0","#ff0","#0a0","#ff0","#0a0","#ff0","#0a0","#ff0","#0a0","#ff0","#0a0","#ff0","#0a0","#ff0","#0a0","#ff0","#0a0","#ff0","#0a0","#ff0","#0a0","#ff0"],
	
	//hues = ["#fff","#eee","#ddd","#ccc","#bbb","#aaa","#999","#888","#777", "#666","#555","#444","#333", "#222", "#111", "#000"],
	
	map = null,
	options_map = {clickable:false, strokeColor: "#0000ff", strokeOpacity: 1, strokeWeight: 2},
	options_sat = {clickable:false, strokeColor: "#ff0000", strokeOpacity: 1, strokeWeight: 2},
	focus_marker = null,
	mapinfowindow = null, 	 							/* the information popup */
	icons = [],  										/* array of icon images for the map */
	mapmarkers = [],							/* array of Markers for the map */
	nIcons = 10,  									/* no. of icons to use, icons define a colour band */
	resizeTimeoutId,									/* windows timeout for resize events */
	online = false,						/* for when not connected to internet - stops failures with maps */
	greyIcon = null,
	greyIcons = [],
	colourIcons = [],
	clearlogin = function () {
		user.value="";
		password.value="";
		},
	real_resize = function () {
		var docheight=document.body.clientHeight; //window.innerHeight,
	    topheight = thetop.clientHeight,
	    newheight = (docheight - topheight),
	    docwidth=window.innerWidth;
	    divmap.style.height = newheight - graph.getHeight() + 'px';
	    panel.style.height = newheight + 'px';
	    split_panel.resize(docwidth,newheight);
		graph.resize();
	    if(online) {
	    	google.maps.event.trigger(map,'resize');
		    }
		},
	setMarkerDepths = function(bounds,mapmarkers) {
		var dlat = bounds.toSpan().lat(),
		lat0 = bounds.getNorthEast().lat();
		for(var i=0, n=mapmarkers.length; i < n; i++) {
			var mlat = mapmarkers[i].getPosition().lat();
			mapmarkers[i].setZIndex((lat0 - mlat)*500/dlat);
			}
		},
	attachMapMarkerEvents = function (j,mapmarker, marker) {
			google.maps.event.clearInstanceListeners(mapmarker);
			google.maps.event.addListener(mapmarker, "click", function () {
				info_node.setMarker(j,marker);
				mapinfowindow.setPosition(mapmarker.getPosition());
				mapinfowindow.open(map);
				});
			};
return {
	showFocusMarker : function(mapmarker) {
		if(online && mapmarker !== undefined){
			var position=mapmarker.getPosition();
			focus_marker.setPosition(position);
			focus_marker.setVisible(true);
			//focus_marker.setZIndex(m.mapmarker.getZIndex() + 1);
			//map.panTo(position);
		}
		},
	hideFocusMarker : function() {
		if(online){
			focus_marker.setVisible(false);
			}
		},
	deleteMapMarker : function(mapmarker) {
		if(online) {
			mapinfowindow.close();
			mapmarker.setMap(null);
			focus_marker.setVisible(false);
			}
		},
	openMapMarker : function(mapmarker) {
		if (online){
			google.maps.event.trigger(mapmarker,"click");
			}
		},
	loadMapMarkersX : function (journey) {
		if(!online || journey.markers === undefined) {
			return;
		}
		var mlength = journey.markers.length,
		k = 0,
		markers = journey.markers,
		position,
		bounds = new google.maps.LatLngBounds();
		for(var j=0; j< hues.length; j++) {
			polylines[j].getPath().clear();
		}
		for(var i=0; i< mlength; i++) {
			var new_k = Math.floor(hues.length*i/mlength);
			if(new_k !== k) {
				k++;
				polylines[k].getPath().push(position);
				}
			position=new google.maps.LatLng(markers[i].lat,markers[i].lon);
			bounds.extend(position);
			polylines[k].getPath().push(position);
			}
		//polyline.setPath(polypath);	
		map.fitBounds(bounds);
		focus_marker.setVisible(true);
		},
	loadMapMarkers0 : function (journey) {
		if(!online || journey.markers === undefined) {
			return;
		}
		var mlength = journey.markers.length,
		markers = journey.markers,
		maplength = mapmarkers.length,
		position,
		bounds = new google.maps.LatLngBounds();
		polypath.clear();
		for(var i=0; i< mlength; i++) {
			position=new google.maps.LatLng(markers[i].lat,markers[i].lon);
			bounds.extend(position);
			polypath.push(position);
			}
		polyline.setPath(polypath);	
		map.fitBounds(bounds);
		focus_marker.setVisible(true);
		},
	loadMapMarkers : function (journey) {
		if(!online || journey.markers === undefined) {
			return;
		}
		var mlength = journey.markers.length,
		markers = journey.markers,
		maplength = mapmarkers.length,
		position,
		bounds = new google.maps.LatLngBounds();
		for(var i=0; i< mlength; i++) {
			position=new google.maps.LatLng(markers[i].lat,markers[i].lon);
			bounds.extend(position);
			if(mapmarkers[i] === undefined) {
				mapmarkers.push(new google.maps.Marker({map:map, position:position, draggable: false}));
				}
			var j=Math.floor(nIcons*i/mlength);
			mapmarkers[i].setOptions({position:position, icon:icons[j], title:markers[i].title, map:map});
			attachMapMarkerEvents(journey,mapmarkers[i], markers[i]);
			markers[i].mapmarker = mapmarkers[i];
			//polypath.push(position);
			}
		//polyline.setPath(polypath);	
		//remove markers we are not using
		if(maplength > mlength) {
			for(var i=mlength; i < maplength; i++) {
				mapmarkers[i].setMap(null);	
				}
			}
		map.fitBounds(bounds);
		setMarkerDepths(bounds,mapmarkers);
		focus_marker.setVisible(true);
		},
	init: function() {
		split_panel.init();
		panel.onscroll = function () {
			//debug.innerHTML = this.scrollTop;
			}
		window.onresize = function () {
		    window.clearTimeout(resizeTimeoutId);
		    resizeTimeoutId = window.setTimeout(real_resize,100);
		    };
		try {
		map = new google.maps.Map(divmap, {zoom: 8, center: new google.maps.LatLng(54.459287, -3.261008), mapTypeId : google.maps.MapTypeId.HYBRID });
		online = true;
		} catch (error) {
		online = false;	
		}
		if(online) {
			//polypath=new google.maps.MVCArray();
			//polyline=new google.maps.Polyline(options_map);
			//polyline.setMap(map);
			//	icon=new google.maps.MarkerImage("images/white-outline1.png"),
			focus_marker=new google.maps.Marker({map:map, position: map.getCenter(), icon:new google.maps.MarkerImage("images/white-outline1.png"), zIndex: 1000});
			greyIcon = new google.maps.MarkerImage("images/grey.png");
			 for(var i=0; i < nIcons; i++) {
			// for(var i=0; i < hues.length; i++) {
			// 	polylines.push(new google.maps.Polyline({
			// 		map:map, 
			// 		path: new google.maps.MVCArray(), 
			// 		clickable:false, 
			// 		strokeColor: hues[i], 
			// 		strokeOpacity: 0.5, 
			// 		strokeWeight: 4
			// 	}));

				colourIcons.push(new google.maps.MarkerImage("images/blue"+i+".png"));
				//greyIcons.push(greyIcon);
				}
			icons = colourIcons;
			mapinfowindow=new google.maps.InfoWindow();//{maxWidth:400});
			google.maps.event.addListener(mapinfowindow, "closeclick", function () {
				info_node.close();
				});
			google.maps.event.addListener(map, "maptypeid_changed", function () {
				// var type = map.getMapTypeId();
				// alert("map type changed to " + type);
				// polyline.setOptions(type === "hybrid" ? options_sat : options_map);
				});
			
			mapinfowindow.setContent(info_node.node);
		} else {
			divmap.appendChild(info_node.node);
		}
		real_resize();
		},
	panel:panel
	};
};