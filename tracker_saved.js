var tracker,
info_node,
session,
mm,
ui,
graph = null,
jm;


jQuery(document).ready(function () {
//google.load('maps','3',{"other_params":"sensor=[true|false]"});
info_node = info_node_module();
mm = marker_module();
jm = journey_module();
ui = ui_module();
graph = graph_module();
tracker = tracker_module();
});


var tracker_module = function () {

	var user = document.getElementById("user"),				//user textfield
	password = document.getElementById("password"), 		//password textfield
	divlogin = document.getElementById("login"),						//login container
	login_button = document.getElementById("login_button"),
	unitselector = document.getElementById("units"),
	speedwidth = 100,
	journeys = [], 									/* array of journeys */
	selected_title = null,								//DOM element
	attachMarkerEvents = function (m,o,index) {
		m.node.onmouseover=function(){
			this.style.background="#eee";
//			m.speed0.style.background = "#aaa";
			m.delnode.style.display = "block";
			//m.speed0.innerHTML=utils.getSpeedMinutes(m.speed);
			showMarker(m);
			};
		m.node.onmouseout=function(){
			this.style.background="#fff";
//			m.speed0.style.background = "#eee";
			m.delnode.style.display = "none";
			//m.speed0.innerHTML="&nbsp;";
			hideMarker();
			};
	
		m.titlenode.onclick=function() {
			
			info_node.setMarker(o,m);
			ui.openMapMarker(m.mapmarker);
			;}

		m.delnode.onclick=function() {
			utils.sendMessage("command=deleteMarker&jid="+o.jid+"&id="+m.id);
			//info_node.setMarker(null);
			o.markernode.removeChild(m.node);
			o.markers.splice(index,1);
			jm.update(o);
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
			if(selected_title===this) {//don't select me if I am already selected
				return;
				}
			if(selected_title!==null) {
//				selected_title.style.color = "#0000ff";
				selected_title.className = "journey-title";
				}
			selected_title=this;
//			selected_title.style.color = "#ff0000";
			selected_title.className = "selected";
			if(o.loadstate===0) {
				loadMarkers(o);
			} else {
				ui.loadMapMarkers(o);
				graph.loadGraph(o);
				}
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
//				alert("sent");
			};
		},
	showMarker = function(m) {
		ui.showFocusMarker(m.mapmarker);

		
		
		},
	hideMarker = function(m) {
		ui.hideFocusMarker();
		
		
		},
	loadMarkers = function (o) {
		if(o.loadstate!==0) {
			return;
			}
		o.loadstate=1;
		o.statistics.innerHTML="Loading...";
		utils.sendMessage("command=getMarkers&jid="+o.jid, function (message) {
			var markers=message.content,
			i;
			o.loadstate=2;
			if(markers.length===0) {
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
			jm.setSpeedDivs(o);
			//o.markers[0].speed0.style.visibility = "hidden";
			ui.loadMapMarkers(o);
			graph.loadGraph(o);
			});
		},
	loadJourneys = function (message) {	
		utils.sendMessage("command=getJourneys", function (message) {
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
// check units button has not been initialised if reloading page
if(unitselector !== null) {
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
}
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
};

	
