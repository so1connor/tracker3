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
open_journey = null,
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
setSpeedAndDistance = function (j) {
	if(j.markers === undefined) {
		return;
	}
	var mlength=j.markers.length,
	dt,
	dx,
	dz,
	speed,
	speeds = [],
	marker0 = j.markers[0],
	marker1 = marker0,
	maxspeed = 0,
	//	ascent = 0,
	distance = 0;
	if(mlength === 0) {
		return;	
		}
	marker0.speed=0;
	marker0.dz = 0;
	marker0.dt = 0;
	marker0.dx = 0;
	
	speeds.push(0);
	if(mlength>1) {
		vector0.fromLatLng(marker0.lat,marker0.lon);
		for(var i=1; i < mlength; i++)
			{
			marker0=marker1;
			marker1=j.markers[i];
			dt = marker1.t - marker0.t;
			//dt *= 0.001; // convert milliseconds to seconds
			vector1.fromLatLng(marker1.lat,marker1.lon); //load new vector
			dx=vector1.distanceFrom(vector0);
			if(dt > 0) {
				speed = (1000*dx)/dt; //metres per second
				} else {
					speed = 0;
				}
			dz=marker1.alt-marker0.alt;
			//speeds.push(speed);
			distance += dx;
			vector0.copyVector(vector1); //save for next time
			marker0.dz = dz;
			marker0.dt = dt;
			marker0.dx = dx;
			//			if(dz > 0) {
			//				ascent += dz;
			//				}					
			marker1.speed = speed;
			speeds.push(speed);
			if(speed > maxspeed) {
				maxspeed = speed;
				}				
			}
		j.d = distance;
		j.dt = j.markers[mlength-1].t - j.markers[0].t;
		j.speed = j.dt === 0 ? 0 : j.d*1000/j.dt;
		j.speeds = speeds;
		//		j.ascent = ascent;
		j.maxspeed = maxspeed;
		}
	},
setAltitudeBounds = function(j) {
	var min_alt = 1000,
	max_alt = 0;
	for(var i=j.markers.length - 1; i >=0 ; i--) {
		var alt = j.markers[i].alt;
		if(alt > max_alt) {
			max_alt = alt;
		} else if(alt < min_alt) {
			min_alt = alt;
		}
	}
	j.max_alt = max_alt;
	j.min_alt = min_alt;
	},
setAverageSpeeds = function(j, count) {
	if(j.markers === undefined) {
		return;
	}

	var mlength = j.markers.length,
	N,
	marker,
	offset,
	maxspeed = 0,
	k,
	average = 0,
	speed;
	if(count <=1) return;
	if(mlength <= 1) return; // nothing to do....
	
	count = count > mlength ? mlength : count;
	N = count/2;
	if(N < 1) return;
	offset = N;
	for(var i=0; i < N; i++) {
		average += j.markers[i].speed;
	}
	//	alert(average + " " + N);
	for(k=0; k < mlength; k++) {
		speed = average / N;
		j.markers[k].speed = speed;
		if(speed > maxspeed) {
			maxspeed = speed;
			}
		//		if(k==0) {
		//			alert(j.markers[k].speed);
		//		}
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
//_textnode.className="journey-textarea";
_delnode.src="images/whitex.png";
_divnode.className="journey-description";
_divnode.style.display="none";
_container.className="container";
//_delnode.onmouseout=function () {
//	this.src = 'images/whitex.png'; 
//	};
//_delnode.onmouseover=function () {
//	this.src = 'images/redx.png'; 
//	};


return {
	attachJourney : function(node, journey) {
		node.appendChild(journey.node);
		node.appendChild(journey.markernode);
		},
	detachJourney : function(node, journey) {
		node.removeChild(journey.node);
		node.removeChild(journey.markernode);
		},
	init : function (j) {
		j.loadstate=0;
		j.tz *= 1000;
		j.speed = j.dt === 0 ? 0 : j.d*1000/j.dt;
		j.node=_node.cloneNode(true);
		j.delnode=_delnode.cloneNode(true);
		j.editnode=_editnode.cloneNode(true);
		j.rarrow=_rarrow.cloneNode(true);
		j.darrow=_darrow.cloneNode(true);
		j.title=_title.cloneNode(true);
		j.title.innerHTML=j.count + " " +j.jid+" "+utils.getDateString(j.t); //j.name;
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
			open_journey=null;
			j.node.replaceChild(j.rarrow,j.darrow);
			j.markernode.style.display="none";
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
			if(open_journey!==null && open_journey!==j) { 	// if another journey is open
				open_journey.darrow.onclick();				// close it
				}
			open_journey=j;									// this journey
			j.node.replaceChild(j.darrow,j.rarrow);			// is open
			j.markernode.style.display="block";				// show the markers (if they have been loaded)
			jm.setSpeedDivs();								// update the width of the speed bars
	
			j.title.onclick();
			// don't add code here... it will run before previous line has completed
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
		},
	setStatistics : function(j) {
		j.statistics.innerHTML = utils.getDistanceString(j.d);
		// + utils.getHourString(j.dt) + "h " + utils.getSpeedMinutes(j.speed) + " " + utils.getSpeedMinuteUnit();
		},
	rebuild : function (j) {
		if(j.markers === undefined) {
			return;
			}
		setSpeedAndDistance(j);
		setAltitudeBounds(j);
		//setAverageSpeeds(j,6);
		},
	setSpeedDivs : function () {
		if(open_journey === null || open_journey.markers === undefined) {
			return;
			}
		var j = open_journey,
		mlength=j.markers.length,
		speed_width,
		dspeed;
		
		if(speed_offset === undefined) {
			speed_offset = j.markers[0].titlenode.offsetWidth + 35;
			}
		
		speed_width = j.node.clientWidth - speed_offset;
		
		if(speed_width > max_speed_width) {
			speed_width = max_speed_width;
			}
		
		if(j.speed_width === speed_width) {
			return;
			}
		
		j.speed_width = speed_width;
			
		//		REMEMBER TO UPDATE MARGIN VALUE !! 
		dspeed = speed_width / j.maxspeed;
		//		alert(j.node.clientWidth + " " + j.markers[0].titlenode.offsetWidth);
		//speedwidth = j.markers[0].titlenode.style.width*100 / j.node.clientWidth;
		//alert("title="+j.markers[0].titlenode.style.width);
		//		speedwidth = j.node.clientWidth / 2;

		for(var i=0; i < mlength; i++) 	{
		//			var speed = j.markers[i].speed,
		//ispeed = speed * speedwidth / j.maxspeed;
		//		ispeed = speed*66 / j.maxspeed;
			j.markers[i].speed0.style.width = j.markers[i].speed * dspeed + 'px';
		//j.markers[i].speed1.style.width = (50 - ispeed) + '%'; //(speedwidth - ispeed) + 'px';
		}
	}
};

};