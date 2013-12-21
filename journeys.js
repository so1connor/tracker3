window.journey_module = function() {
	
var _node=document.createElement("div"),
_title=document.createElement("a"),
_floatright=document.createElement("div"),
_editnode=document.createElement("a"),
_delnode=document.createElement("img"),
_statistics=document.createElement("span"),
_rarrow=document.createElement("img"),
_darrow=document.createElement("img"),
_markernode=document.createElement("div"),
_divnode=document.createElement("div"),
//_textnode=document.createElement("textarea"),
_container=document.createElement("div"),
//open_journey = null,
vector0=new Vector3D(),
vector1=new Vector3D(),
speed_offset,
max_speed_width = 200,
//speeds,
//distance = 0;
//speed_list = [];
//setStatistics = function (j,unit) {
//	var minPerKm = j.d===0 ? 0 : (unit.minfactor*j.dt/j.d);
//	j.statistics.innerHTML = timeutils.getDistanceString(j.d) + unit.name + timeutils.getHourString(j.dt) + "h " + timeutils.getMinuteString(minPerKm) + unit.speed;
//},
measureJourney = function (j) {
	if(j.markers === undefined || j.markers.length < 2) {
		return;
	}
	var count = j.markers.length,
	speeds = [],
	marker0 = j.markers[0],
	marker1 = marker0,
	distance = 0;
	marker0.speed = 0;
//	marker0.metrics = {speed:0,dt:0,dx:0,dz:0};
	speeds.push(0); // this is the speed of the first marker which is of course zero
	vector0.fromLatLng(marker0.lat,marker0.lon);
	j.metrics = {duration: 0, distance: 0, average_speed: 0, max_speed: 0, min_alt: 1000, max_alt: 0};
		
	for(var i=1; i < count; i++) {
		marker0 = marker1;
		marker1 = j.markers[i];
		var dt = marker1.t - marker0.t;
		vector1.fromLatLng(marker1.lat,marker1.lon); //load new vector
		var dx = vector1.distanceFrom(vector0);
		var speed = dt > 0 ? (1000 * dx)/dt : 0;
//		var dz = marker1.alt - marker0.alt;
		if(marker1.alt > j.metrics.max_alt) {
			j.metrics.max_alt = marker1.alt;
		} else if(marker1.alt < j.metrics.min_alt) {
			j.metrics.min_alt = marker1.alt;
		}
		distance += dx;
		vector0.copyVector(vector1); //save for next time
		marker1.speed = speed;
		marker1.dt = dt;
		marker1.dx = dx;
		speeds.push(speed);
		if(speed > j.metrics.max_speed) {
			j.metrics.max_speed = speed;
			}
		}
	j.metrics.distance = distance; // total distance
	j.metrics.duration = j.markers[count-1].t - j.markers[0].t; // total duration
	j.metrics.average_speed = j.metrics.duration === 0 ? 0 : distance * 1000/j.metrics.duration;
	j.speeds = speeds;
	},
// setAltitudeBounds = function(j) {
// 	if(j.marker === undefined) {
// 		return;
// 	}
// 	var min_alt = 1000,
// 	max_alt = 0;
// 	for(var i=j.markers.length - 1; i >=0 ; i--) {
// 		var alt = j.markers[i].alt;
// 		if(alt > max_alt) {
// 			max_alt = alt;
// 		} else if(alt < min_alt) {
// 			min_alt = alt;
// 		}
// 	}
// 	j.max_alt = max_alt;
// 	j.min_alt = min_alt;
// 	},
setAverageSpeeds = function(j, count) {
	if(j.markers === undefined) {
		return;
	}

	var mlength = j.markers.length,
	N,
//	marker,
	offset,
	maxspeed = 0,
	//k,
	average = 0;
	//speed;
	if(count <= 1 || mlength <= 1) {
		return; // nothing to do....
		}
	
	count = count > mlength ? mlength : count;
	N = count/2;
	if(N < 1) {
		return;
		}
	offset = N;
	for(var i=0; i < N; i++) {
		average += j.markers[i].speed;
	}
	//	alert(average + " " + N);
	for(var k=0; k < mlength; k++) {
		var speed = average / N;
		j.markers[k].speed = speed;
		if(speed > maxspeed) {
			maxspeed = speed;
			}
		if(N < count) {
			average += j.markers[N].speed;
			N++;
		} else {
			average -= j.markers[k+offset-N].speed;
			if(k < mlength - offset) {
				average += j.markers[k+offset].speed;
				} else {
					N--;
				}
			
			}
		}
	j.maxspeed = maxspeed;
	};


_node.className="journey";
_floatright.className="float-right";
_rarrow.src="images/greyleft.png";
_darrow.src="images/greydown.png";
_rarrow.className="arrow";
_darrow.className="arrow";
_title.className="journey-title";
_title.href="#";
_statistics.className="journey-statistics";
_editnode.className="journey-edit";
_editnode.innerHTML="edit";
_editnode.href="#";
_delnode.src="images/whitex.png";
_divnode.className="journey-description";
_divnode.style.display="none";
_container.className="container";


return {
	attachJourney : function(node, journey) {
		node.appendChild(journey.node);
		node.appendChild(journey.markernode);
		},
	detachJourney : function(node, journey) {
		node.removeChild(journey.node);
		node.removeChild(journey.markernode);
		},
	decorate : function (j) {
		var timezone_offset = j.tz >= 0 ? "+" : "";
		timezone_offset += j.tz/3600;
		j.loadstate=0;
		j.tz *= 1000; // turn seconds into milliseconds
		//j.speed = j.dt === 0 ? 0 : j.d*1000/j.dt;
		j.node=_node.cloneNode(true);
		j.delnode=_delnode.cloneNode(true);
		j.editnode=_editnode.cloneNode(true);
		j.rarrow=_rarrow.cloneNode(true);
		j.darrow=_darrow.cloneNode(true);
		j.title=_title.cloneNode(true);
		j.title.innerHTML=j.count + "[" +j.jid+"] "+utils.getDateString(j.t) + "[" + timezone_offset + "]"; //j.name;
		//j.title.innerHTML=utils.getDateString(j.t); //j.name;
		j.statistics=_statistics.cloneNode(true);
		j.floatright=_floatright.cloneNode(true);
		j.markernode=_markernode.cloneNode(true);
		j.divnode=_divnode.cloneNode(true);
		j.container=_container.cloneNode(true);
		
		//setStatistics(j);
			
		j.floatright.appendChild(j.editnode);
		j.floatright.appendChild(j.delnode);
		j.container.appendChild(j.title);
		j.container.appendChild(j.statistics);
		j.node.appendChild(j.floatright);
		j.node.appendChild(j.rarrow);
		j.node.appendChild(j.container);
		j.node.appendChild(j.divnode);
		
		if(j.text!==undefined && j.text.length>0) {
			j.editnode.style.display="none";
			j.divnode.style.display="block";
			j.divnode.innerHTML=j.text;
		} else {
			j.editnode.style.display="inline";
			j.divnode.style.display="none";
			}
		j.markernode.style.visibility="hidden";
		j.markernode.style.display="none";
		j.floatright.style.display="none";
		
		j.rarrow.onmouseover=function() {
			this.src='images/dgreyleft.png';
			};
		j.darrow.onmouseover=function() {
			this.src='images/dgreydown.png';
			};
		j.rarrow.onmouseout=function() {
			this.src='images/greyleft.png';
			};
		j.darrow.onmouseout=function() {
			this.src='images/greydown.png';
			};
		j.delnode.onmouseout=function () {
			this.src = 'images/whitex.png'; 
			};
		j.delnode.onmouseover=function () {
			this.src = 'images/redx.png'; 
			};
		j.darrow.onclick=function() {
			tracker.closeJourney(j);
			};
		
		j.node.onmouseover=function(){
			this.style.background="#eee";
			j.floatright.style.display = "block";
			};
		
		j.node.onmouseout=function(){
			this.style.background="#fff";
			j.floatright.style.display = "none";
			};
		
		j.editnode.onclick = function ()	{
			this.style.display="none";
			j.divnode.onclick();
			};
		
		j.rarrow.onclick=function() {
			tracker.openJourney(j);
			// if(open_journey!==null && open_journey!==j) { 	// if another journey is open
			// 	open_journey.darrow.onclick();				// close it
			// 	}
			// open_journey=j;									// this journey
			// j.node.replaceChild(j.darrow,j.rarrow);			// is open
			// j.markernode.style.display="block";				// show the markers (if they have been loaded)
			// jm.setSpeedDivs(j);								// update the width of the speed bars
	
			// j.title.onclick();
			// // don't add code here... it will run before previous line has completed
			};
		
		j.divnode.onclick = function ()	{
			utils.setEditor(j.node, j.divnode, "journey-textarea", j.divnode.offsetWidth - 15, function (new_text) {
				j.editnode.style.display = new_text.length===0 ? "inline" : "none";
				j.divnode.style.display = new_text.length ===0 ? "none" : "block";
				if(new_text!==j.text) {
					j.text=new_text;
					utils.sendMessage("command=setJourneyText&jid="+j.jid+"&description="+encodeURIComponent(new_text));
					}
				});
			};

		j.title.onclick = function() {
			tracker.showJourney(j);
			};

		j.delnode.onclick = function () {
			tracker.deleteJourney(j);
			};

		j.update = function() {
			measureJourney(j);
			//setAltitudeBounds(j);
			j.statistics.innerHTML = utils.getDistanceString(j.d) + " " + j.metrics.max_speed;
			};
		j.update();
		},
	// setStatistics : function(j) {
	// 	j.statistics.innerHTML = 
	// 	// + utils.getHourString(j.dt) + "h " + utils.getSpeedMinutes(j.speed) + " " + utils.getSpeedMinuteUnit();
	// 	},
	setSpeedDivs : function (j) {
		if(j === null || j.metrics === undefined) {
			//console.log(j);
			return;
		}
		var w = j.node.clientWidth - j.markers[0].titlenode.clientWidth + 35;
		//w = w > 500 ? 500 : w;
		//console.log(w);
		var factor = w / j.metrics.max_speed;

		//		alert(j.node.clientWidth + " " + j.markers[0].titlenode.offsetWidth);
		//speedwidth = j.markers[0].titlenode.style.width*100 / j.node.clientWidth;
		//alert("title="+j.markers[0].titlenode.style.width);
		//		speedwidth = j.node.clientWidth / 2;

		for(var i=0; i < j.markers.length; i++) 	{
			//j.markers[i].speed0.style.width = j.markers[i].speed * factor;
			j.markers[i].speed0.style.width = j.markers[i].speed * 80 / j.metrics.max_speed + "%";
			
			
		}
	}
};

};