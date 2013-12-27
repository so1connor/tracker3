window.graph_module = function () {

	var graph_element = document.getElementById("graph"),
	canvas = document.getElementById("graph-canvas"),
	container = document.getElementById("canvas-container"),
	graph_div = document.getElementById("graph-div"),
	speed_span = document.getElementById("graph-speed"),
	ascent_span = document.getElementById("graph-ascent"), 
	graph_marker = null, // what's this
	context = null,
	active = false,
	margin_left = 0, // what's this
	duration,
	t0,
	time_unit = 1,
	x0 = 0,
	x1 = 0,
	graph_journey = null, // the journey loaded into the graph
	getGraphMarker = function(time) { // get the marker latest marker that is before "time"
		var markers = graph_journey.markers;
		if(markers === undefined) {
			return null;
			}
		
		for(var i = markers.length - 1; i >= 0 ; i-- ) {
			if(markers[i].t < time) {
				return markers[i];
				}
			}
		return null;
		},
	drawGraph = function(journey) {
		speed_span.innerHTML = "";
		// y axis is speed
		// x axis is time

		context.clearRect(0,0,canvas.width,canvas.height);
		if(journey.markers === undefined || journey.markers.length < 2) {
			graph_div.style.visibility = "hidden";
			console.log("no graph to draw");
			return;
			}
		var mlength = journey.markers.length,
		markers = journey.markers,
		speed_unit = canvas.height * 0.9 / journey.metrics.max_speed,
		max_alt = journey.metrics.max_alt < 1000 ? 1000 : journey.metrics.max_alt,
		alt_unit = canvas.height * 0.9 / (max_alt - journey.metrics.min_alt),
		acc_unit = canvas.height * 0.9 / 100,
		origin_x,
		alt_base = journey.metrics.min_alt * alt_unit;
		
		t0 = markers[0].t;
		duration = markers[mlength - 1].t - t0;
		time_unit = duration > 0 ? (canvas.width - margin_left) / duration : 0;
		origin_x = margin_left;// + (markers[0].t - t0) * dx;
		
		
		graph_journey = journey;
		
		context.beginPath();
		context.strokeStyle = "#444";
		context.lineWidth = 1.0;
		context.fillStyle = "#999";
		var y0 = canvas.height - 1;
		context.moveTo(origin_x,y0 - (markers[0].speed * speed_unit));
		for(var i=1; i< mlength; i++) {
			var x = margin_left + (markers[i].t - t0) * time_unit;
			context.lineTo(x,y0 - (markers[i].speed * speed_unit));
			if(markers[i].text !== undefined) {
				context.fillRect(x-2,1,4,4);
				}
		}
		context.stroke();		
		context.beginPath();
		context.strokeStyle = "#f00";
		context.moveTo(origin_x,canvas.height + alt_base - (markers[0].alt * alt_unit));
		for(var i=1; i< mlength; i++) {
			context.lineTo(margin_left + (markers[i].t - t0) * time_unit ,canvas.height + alt_base - (markers[i].alt * alt_unit));
		}
		context.stroke();


		speed_span.innerHTML = "Average speed " + utils.getSpeedMinutes(graph_journey.metrics.average_speed) + " " + utils.getSpeedMinuteUnit();
		//		ascent_span.innerHTML = "Ascent " + graph_journey.ascent+ " m";
		};
return {
	loadGraph : function (journey) {
		if(active) {
			drawGraph(journey);
			}
		},
	getHeight : function () {	
		return active ? graph_element.clientHeight : 0;	
		},
	hideMarker : function() {
		graph_div.style.visibility = "hidden";
		},
	showMarker : function(marker) {
		graph_div.style.visibility = "visible";
		x0 = margin_left + (marker.t - t0) * time_unit;
		x1 = x0 + (marker.dt * time_unit);
		graph_div.style.left = x0;
		//console.log(x0);
		//console.log(x1);
		var w = x1 - x0;
		//alert(marker.dt);
		w = w <= 1 ? 1 : w;
		graph_div.style.width = w;
		graph_div.style.height = canvas.height;
		
		//console.log(w);
		//debug.innerHTML = x0 + " "+ w;
		//ui.showFocusMarker(markers[i].mapmarker);
		},
	setMarkerText : function(marker, text) {
		},
	resize : function () {
		if(!active) {
			return;
			}
		canvas.width = container.clientWidth;
		canvas.height = container.clientHeight; 
		// need to fix this
		if(graph_journey !== null) {
			drawGraph(graph_journey);
			}
		},	
	init: function() {
		context = canvas.getContext('2d');
		if(jQuery.support.boxModel === false || session === 0) {
			graph_element.style.display = "none";
			graph_div.style.display = "none";
			active = false;
			return;
			}
		active = true;
		graph_element.style.display = "block";
		document.getElementById("graph-control").style.display = "block";
		document.getElementById("canvas-container").style.display = "block";
		graph_div.style.display = "block";

		canvas.width = container.clientWidth;
		canvas.height = container.clientHeight; // need to fix this
		
		// graph_div.onmouseout = function(event) {
		// 	//console.log("overlay mouse out");
		// 	event.preventDefault();
		// }
		
		canvas.onmouseout = function(event) {
			console.log("mouse out");
			//tracker.hideMarker(graph_marker);
			};
			
		canvas.onmousemove = function(event) {
			//console.log(event);
			if(graph_journey === null || graph_journey.markers === undefined) {
				//console.log("no move");
				return;
			}			

			var marker = null;
			if(event.offsetX < x0 || event.offsetX > x1) {
				var t = t0 + (duration * event.offsetX) / canvas.width;
				//console.log(t);
				marker = getGraphMarker(t);
				//console.log(graph_marker);
			}

			if(marker !== null && marker !== graph_marker) {
				tracker.hideMarker(graph_marker);
				tracker.showMarker(marker);
				graph_marker = marker;
			}
			//alert("t0="+t0+" t=" +t+" dt="+dt);
			//speed_span.innerHTML = graph_journey.markers[graph_index].speed.toFixed(2) + " m/s";
			//ascent_span.innerHTML = graph_journey.markers[graph_index].alt+ " m";;
			//if(graph_index !== null) {
				//alert("mob");
			//tracker.showMarker(graph_marker);
			//event.preventDefault();
			};
		
		canvas.onclick = function(event) {
			graph_marker.titlenode.onclick();
			};
		}
	};
};