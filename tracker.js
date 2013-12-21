var session,
info_node,
mm,
jm,
ui,
graph = null;


jQuery(document).ready(function () {

info_node = info_node_module();
mm = marker_module();
jm = journey_module();
ui = ui_module();
graph = graph_module();
tracker.init();
});


window.tracker = function () {

//	var user = document.getElementById("user"),				//user textfield
//	password = document.getElementById("password"), 		//password textfield
//	divlogin = document.getElementById("login"),						//login container
//	login_button = document.getElementById("login_button"),
	var unitselector = null,
	login_button = null,
	speedwidth = 100,
	journeys = [], 									/* array of journeys */
	selected_title = null,								//DOM element
//	selected_journey = null,
	attachMarkerEvents = function (m,o,index) {
		m.node.onmouseover=function(){
			//			this.style.background="#eee";
			//			m.speed0.style.background = "#aaa";
			//			m.delnode.style.display = "block";
			//m.speed0.innerHTML=utils.getSpeedMinutes(m.speed);
			tracker.showMarker(m);
			};
		m.node.onmouseout=function(){
			//			this.style.background="#fff";
			//			m.speed0.style.background = "#eee";
			//			m.delnode.style.display = "none";
			//m.speed0.innerHTML="&nbsp;";
			tracker.hideMarker(m);
			};
	
		m.titlenode.onclick=function() {
			
			info_node.setMarker(o,m);
			ui.openMapMarker(m.mapmarker);
			var h = getScrollPosition(o,m);
			if(h !== null) {
				//debug.innerHTML = "" + getScrollPosition(o,m);
				var h0 = ui.panel.clientHeight / 2;
				ui.panel.scrollTop = h - h0;
				}
			;}

		m.delnode.onclick=function() {
			utils.sendMessage("command=deleteMarker&jid="+o.jid+"&id="+m.id);
			//info_node.setMarker(null);
			o.markernode.removeChild(m.node);
			o.markers.splice(index,1);
			jm.rebuild(o);
			jm.setStatistics(o);
			ui.deleteMapMarker(m.mapmarker);
			graph.loadGraph(o);
			}
		if(m.text!==undefined) {
			mm.attachMarkerTextNode(o,m);
			}
		},
	attachJourneyEvents = function (o,index) {	
		o.title.onclick = function() {
			tracker.showJourney(o);
			//			if(selected_title===this) {//don't select me if I am already selected
			//				return;
			//				}
			//			if(selected_title!==null) {
			////				selected_title.style.color = "#0000ff";
			//				selected_title.className = "journey-title";
			//				}
			//			selected_title=this;
			////			selected_title.style.color = "#ff0000";
			//			selected_title.className = "selected";
			//			if(o.loadstate===0) {
			//				loadMarkers(o);
			//			} else {
			//				tracker.showJourney(o);
			//				}
			};	
		o.delnode.onclick = function () {
				var r=confirm("Are you sure you want to delete this journey?");
				if (r===false) {
				  return;
				  }
				//open_index=undefined; //invalid now we are deleting a journey
				//unselect this journey if it is selected before you delete it
				if(selected_title===o.title)
					{
					//alert("deleting selected");
					//journeys[0].title.onclick();
					}						
				//j.detachEvents();
				//alert(ui.panel.o.node);
				jm.detachJourney(ui.panel, o);
				//				ui.panel.removeChild(o.node);
				//				ui.panel.removeChild(o.markernode);
				//delete journeys[i];
				//deletes this
				journeys.splice(index,1);
				var newindex = index>0 ? index-1 : index;
				selected_journey=journeys[newindex];
				selected_journey.title.onclick();
				utils.sendMessage("command=deleteJourney&jid="+o.jid);
			};
		},
	getScrollPosition = function(o,m) {
		if(o.markernode.style.display !== "block") {
			return null;
			}
		var h = 0;
		for (var i = 0; i < journeys.length; i++) 	{
			h+=journeys[i].node.clientHeight;
			if(journeys[i] === o) {
				var markers = journeys[i].markers;
				for (var k = 0; k < markers.length; k++) 	{
					h+=markers[k].node.clientHeight;
					if(markers[k] === m) {
						return h;
						}
					}
				}
			}
		return null;
		},
	loadMarkers = function (o) {
		if(o.loadstate!==0) {
			return;
			}
		o.loadstate=1;
		o.statistics.innerHTML="Loading...";
		utils.sendMessage("command=getMarkers&jid="+o.jid, function (message) {
			//console.log(message);
			var markers=message.content,
			i;
			o.loadstate=2;
			if(markers.length === 0) {
					alert("no markers to show");
					jm.setStatistics(o);
					return;
					}
			//alert("markers length="+markers.length);
			o.markers=markers;
			for (i = 0, n = markers.length ; i < n; i++) {
				var m=markers[i];
				mm.init(m,o);
				//				if(m.text !== undefined) {
				//				alert(i+" "+m.text);	
				//				}
				o.markernode.appendChild(m.node);
				attachMarkerEvents(m,o,i);
				}
			jm.rebuild(o);
			jm.setStatistics(o);
			
			// this won't work is the marker node is not attached to the DOM
			jm.setSpeedDivs();
			//o.markers[0].speed0.style.visibility = "hidden";
			ui.loadMapMarkers(o);
			graph.loadGraph(o);
			});
		},
	loadJourneys = function (message) {	
		utils.sendMessage("command=getJourneys", function (message) {
			console.log(message);
			journeys=message.content.journeys;
			utils.setUnit(message.content.settings);
			unitselector.selectedIndex = message.content.settings;
			ui.panel.innerHTML="";
			if(journeys.length===0)
				{
				ui.panel.html = "no journeys to show";
				return;
				}
			for (var i = 0; i < journeys.length; i++) 
				{
				var j=journeys[i];
				jm.init(j);
				jm.setStatistics(j);
				jm.attachJourney(ui.panel,j);
				//				ui.panel.appendChild(j.node);
				//				ui.panel.appendChild(j.markernode);
				attachJourneyEvents(j,i);
				}
			journeys[0].title.onclick();
			});
		},
	clearlogin = function () {
		user.value="";
		password.value="";
		};
return {
	showMarker : function(m) {
		if(m === null) {
			return;
		}
		m.node.style.background="#eee";
		m.delnode.style.display = "block";
		ui.showFocusMarker(m.mapmarker);
		graph.showMarker(m);
		},
	hideMarker : function(m) {
		if(m === null) {
			return;
		}
		m.node.style.background="#fff";
		m.delnode.style.display = "none";
		ui.hideFocusMarker();
		graph.hideMarker();
		},
	resize : function() {
		jm.setSpeedDivs();
		graph.resize();
		},
	showJourney : function(j) {
		if(selected_title===j.title) {	//don't select me if I am already selected
			return;
			}
		if(selected_title!==null) { 	//unselect currently selected journey 	
			selected_title.className = "journey-title";
			}
		selected_title=j.title;			//selected this journey 	
		selected_title.className = "selected"; //show it is selected
		//		selected_journey = j;
		if(j.loadstate===0) {
			loadMarkers(j);
		} else {
			ui.loadMapMarkers(j);
			graph.loadGraph(j);
			}
		},
	init : function() {
		var user = document.getElementById("user"),				//user textfield
		password = document.getElementById("password"), 		//password textfield
		divlogin = document.getElementById("login");						//login container
		login_button = document.getElementById("login_button");
		unitselector = document.getElementById("units");
		//alert("init");
		// check units button has not been initialised if reloading page
		//		if(unitselector !== null) {
			unitselector.onchange = function() {
				var selection = unitselector.selectedIndex;
				alert(selection);
				if(utils.getUnit() === selection) {
					return;
				} else {
					utils.setUnit(selection);
					utils.sendMessage("command=setSettings&units="+selection);
					for (var i = 0, n=journeys.length; i < n ; i++) 	{
						jm.setStatistics(journeys[i]);
					}
				}
			};
		//		} else {
		//		alert ("unit selector null");
		//		}
		// check logging in before initialising if reloading page
		if(login_button !== null) {
			login_button.onclick = function(){
				var user_name=user.value,
				the_password=password.value,
				regex=new RegExp(/^[a-zA-Z0-9]+$/);
			//	alert("clicked");
				if(regex.test(user_name)===false || regex.test(the_password)===false) {
					alert("User name ("+user_name+") and password ("+the_password+") should be letters and numbers only");
					clearlogin();
					return;
					}
				utils.sendMessage("command=login&user="+user_name+"&password="+the_password, function (j) {
					if(j.code === 200) {
							session=j.response;
							document.getElementById("username").innerHTML = user.value;
							divlogin.style.display = "none";
							document.getElementById("loggedin").style.display = "block";
							ui.panel.innerHTML="";
							graph.init();
							loadJourneys();
							
					} else {
							alert(j.response);
							clearlogin();
					}
				});
			};
		}
		graph.init();
		ui.init();
		if(session!==0) {
				loadJourneys();
			}
		}
	};
}();

	
