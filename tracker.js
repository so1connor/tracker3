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
	var unitselector = null,
	sortselector = null,
	login_button = null,
	speedwidth = 100,
	journeys = [],
	open_journey = null,									/* array of journeys */
	selected_title = null,								//DOM element
//	selected_journey = null,
//	attachMarkerEvents = function (m,o,index) {
	
		// m.titlenode.onclick=function() {			
		// 	info_node.setMarker(o,m);
		// 	ui.openMapMarker(m.mapmarker);
		// 	var h = getScrollPosition(o,m);
		// 	if(h !== null) {
		// 		//debug.innerHTML = "" + getScrollPosition(o,m);
		// 		var h0 = ui.panel.clientHeight / 2;
		// 		ui.panel.scrollTop = h - h0;
		// 		}
		// 	;}

		// m.delnode.onclick=function() {
		// 	utils.sendMessage("command=deleteMarker&jid="+o.jid+"&id="+m.id);
		// 	//info_node.setMarker(null);
		// 	o.markernode.removeChild(m.node);
		// 	o.markers.splice(index,1);
		// 	jm.rebuild(o);
		// 	jm.setStatistics(o);
		// 	ui.deleteMapMarker(m.mapmarker);
		// 	graph.loadGraph(o);
		// 	}
		// if(m.text!==undefined) {
		// 	mm.attachMarkerTextNode(o,m);
		// 	}
		// },
	// attachJourneyEvents = function (o,index) {	
	// 	o.delnode.onclick = function () {
	// 			var r=confirm("Are you sure you want to delete this journey?");
	// 			if (r===false) {
	// 			  return;
	// 			  }
	// 			//open_index=undefined; //invalid now we are deleting a journey
	// 			//unselect this journey if it is selected before you delete it
	// 			if(selected_title === o.title)
	// 				{
	// 				//alert("deleting selected");
	// 				//journeys[0].title.onclick();
	// 				}						
	// 			//j.detachEvents();
	// 			//alert(ui.panel.o.node);
	// 			jm.detachJourney(ui.panel, o);
	// 			//				ui.panel.removeChild(o.node);
	// 			//				ui.panel.removeChild(o.markernode);
	// 			//delete journeys[i];
	// 			//deletes this
	// 			journeys.splice(index,1);
	// 			var newindex = index>0 ? index-1 : index;
	// 			selected_journey=journeys[newindex];
	// 			selected_journey.title.onclick();
	// 			utils.sendMessage("command=deleteJourney&jid=" + o.jid);
	// 		};
	// 	},
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
				mm.decorate(m,o);
				m.index = i;
				o.markernode.appendChild(m.node);
				//attachMarkerEvents(m,o,i);
				}
			o.update();
			// this won't work is the marker node is not attached to the DOM
			jm.setSpeedDivs(o);
			//o.markers[0].speed0.style.visibility = "hidden";
			ui.loadMapMarkers(o);
			graph.loadGraph(o);
			});
		},
	loadJourneys = function (message) {	
		utils.sendMessage("command=getJourneys", function (message) {
			console.log(message);
			if(message.code === 500 || message.code === 100) {
				console.log(message.response);
			} else {
				journeys=message.content.journeys;
				utils.setUnit(message.content.settings.units);
				unitselector.selectedIndex = message.content.settings.units;
				utils.setSort(message.content.settings.sort);
				sortselector.selectedIndex = message.content.settings.sort;

				ui.panel.innerHTML="";
				if(journeys.length===0) {
					ui.panel.html = "no journeys to show";
					return;
					}
				for (var i = 0; i < journeys.length; i++)  {
					var j=journeys[i];
					jm.decorate(j);
					j.index = i;
					//jm.setStatistics(j);
					jm.attachJourney(ui.panel,j);
					//attachJourneyEvents(j,i);
					}
				journeys[0].title.onclick();
				}
			});
		},
	clearlogin = function () {
		user.value="";
		password.value="";
		},
	setSettings = function () {
			var unitselection = unitselector.selectedIndex,
			sortselection = sortselector.selectedIndex;
			//alert(selection);
			if(utils.getUnit() === unitselection && utils.getSort() === sortselection) {
				return;
			} else {
				utils.setUnit(unitselection);
				utils.setSort(sortselection);
				utils.sendMessage("command=setSettings&units=" + unitselection + "&sort=" + sortselection, function() {
				// for (var i = 0, n=journeys.length; i < n ; i++) 	{
				// 	jm.setStatistics(journeys[i]);
				// }
				//utils.sendMessage()

				});
			}
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
	openMarker : function(m,j) {
		info_node.setMarker(j,m);
		ui.openMapMarker(m.mapmarker);
		var h = getScrollPosition(j,m);
		if(h !== null) {
			//debug.innerHTML = "" + getScrollPosition(o,m);
			var h0 = ui.panel.clientHeight / 2;
			ui.panel.scrollTop = h - h0;
			}
		},
	openMarkerEditor : function(m) {
		utils.setEditor(m.node,m.divnode, "marker-textarea", m.divnode.offsetWidth - 15, function(text) {
			if(text.length === 0 )	{
				info_node.resetText(m);
				}
			if(text !== m.text)	{
				m.text = text;
				info_node.setText(m,text);
				utils.sendMessage("command=setMarkerText&jid="+j.jid+"&id="+m.id+"&description="+encodeURIComponent(text));
				}
			});
		},
	resize : function() {
		jm.setSpeedDivs(open_journey);
		graph.resize();
		},
	deleteJourney : function(j) {
		var r = confirm("Are you sure you want to delete this journey?");
		if (r === false) {
		  return;
		  }
		//j.detachEvents();
		jm.detachJourney(ui.panel, j);
		journeys.splice(j.index,1);

		if(selected_title === j.title) { //deleting the selected journey
			var newindex = j.index > 0 ? j.index-1 : j.index;
			selected_journey = journeys[newindex];
			selected_journey.title.onclick();
			}

		for(var i = 0; i<journeys.length; i++) {
			journeys[i].index = i;
			}
		//utils.sendMessage("command=deleteJourney&jid=" + j.jid);
		},
	deleteMarker : function(m,j) {
			//info_node.setMarker(null);
			j.markernode.removeChild(m.node);
			j.markers.splice(m.index,1);
			j.update();
			for(var i = 0; i < j.markers.length; i++) {
				markers[i].index = i;
			}
			ui.deleteMapMarker(m.mapmarker);
			graph.loadGraph(j);
			//utils.sendMessage("command=deleteMarker&jid="+o.jid+"&id="+m.id);
		},
	showJourney : function(j) {
		if(selected_title===j.title) {	//don't select me if I am already selected
			return;
			}
		if(selected_title !== null) { 	//unselect currently selected journey 	
			selected_title.className = "journey-title";
			}
		selected_title = j.title;			//selected this journey 	
		selected_title.className = "selected"; //show it is selected
		//		selected_journey = j;
		if(j.loadstate === 0) {
			loadMarkers(j);
		} else {
			ui.loadMapMarkers(j);
			graph.loadGraph(j);
			}
		},
	openJourney : function(j) {
		if(open_journey !== null && open_journey !== j) { 	// if another journey is open
			//console.log("closing " + open_journey);
			tracker.closeJourney(open_journey);
			}
		open_journey=j;									// this journey
		j.node.replaceChild(j.darrow,j.rarrow);			// is open
		j.markernode.style.display="block";				// show the markers (if they have been loaded)
		jm.setSpeedDivs(j);								// update the width of the speed bars
		j.title.onclick();
		console.log(open_journey)
		// don't add code here... it will run before previous line has completed
		},
	closeJourney : function(j) {
		j.node.replaceChild(j.rarrow,j.darrow);
		j.markernode.style.display="none";
		open_journey = null;
	},
	init : function() {
		var user = document.getElementById("user"),				//user textfield
		password = document.getElementById("password"), 		//password textfield
		divlogin = document.getElementById("login");			//login container
		
		login_button = document.getElementById("login_button");
		unitselector = document.getElementById("units");
		sortselector = document.getElementById("sort");
		
		unitselector.onchange = setSettings;
		console.log(sortselector);
		sortselector.onchange = setSettings;

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
					//console.log(j);
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
		// this is the reload when you are logged in
		if(session !== 0) {
			loadJourneys();
			}
		}
	};
}();