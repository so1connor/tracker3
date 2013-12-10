window.drag_marker_module = function (map) {
	var drag_marker = null,
	saved_icon = null,
	default_icon = null,
	move_marker = null,
	vector0 = new Vector(),
	vector1 = new Vector(),
	vector2 = new Vector(),
	vector3 = new Vector(),
	vector4 = new Vector();
	
	move_marker=new google.maps.Marker({map:map, position: map.getCenter(), icon:new google.maps.MarkerImage("images/blue-dot.png"), zIndex: 1000});
	move_marker.setVisible(true);

return {
	attachDragMarkerEvents : function (mapmarker,marker,journey) {

		// don't allow modification of end points
		if(marker.next === null || marker.prev === null) {
			return;
			}

		google.maps.event.addListener(mapmarker, "rightclick", function () {
			if(drag_marker !== null) {
				drag_marker.setDraggable(false);
				drag_marker.setIcon(saved_icon);
				if(mapmarker === drag_marker) {
					drag_marker = null;
					return;
					}
				drag_marker = null;
			} 	
			drag_marker = mapmarker;
			saved_icon = drag_marker.getIcon();
			drag_marker.setDraggable(true);
			drag_marker.setIcon(null);
			});	
		google.maps.event.addListener(mapmarker, "dragstart", function () {
			move_marker.setVisible(true);
			});
		google.maps.event.addListener(mapmarker, "drag", function (event) {
				var projection = map.getProjection(),
				point0 = projection.fromLatLngToPoint(marker.prev.mapmarker.getPosition()),
				point1 = projection.fromLatLngToPoint(event.latLng),
				point2 = projection.fromLatLngToPoint(marker.next.mapmarker.getPosition());
				vector0.fromXY(point0.x, point0.y);
				vector1.fromXY(point1.x, point1.y);
				vector2.fromXY(point2.x, point2.y);
				vector3.subtract(vector2,vector0);
				//vector1.subtract(vector1, vector0);
				var dt02 = marker.next.t - marker.prev.t;
				var dt01 = marker.t - marker.prev.t;
				var factor = dt01/dt02;
				
				//list.innerHTML = vector3.print();
				vector4.normalTo(vector3);
				//list.innerHTML += vector4.print();
				
				vector4.normalise();
				
				
				vector3.times(factor, vector3);
				vector3.add(vector3,vector0);
				vector1.subtract(vector1,vector3);
				var dot = vector1.dot(vector4);
				//alert(dot);
				vector4.times(dot,vector4);
				vector3.add(vector3,vector4);
				
				move_marker.setPosition(projection.fromPointToLatLng(new google.maps.Point(vector3.x, vector3.y)));
			});
		google.maps.event.addListener(mapmarker, "dragend", function (event) {
			//alert("dragged");
			var pos = move_marker.getPosition();
			move_marker.setVisible(false);
			mapmarker.setPosition(pos);
			marker.lat = pos.lat();
			marker.lon = pos.lng();
			jm.update(journey);
			utils.sendMessage("command=moveMarker&jid="+journey.jid+"&id="+marker.id+"&lat="+marker.lat+"&lng="+marker.lon);
			if(drag_marker !== null) {
				drag_marker.setDraggable(false);
				drag_marker.setIcon(saved_icon);
				if(mapmarker === drag_marker) {
					drag_marker = null;
					return;
					}
				drag_marker = null;
				}
			});
		if(drag_marker !== null) {
			drag_marker.setDraggable(false);
			drag_marker.setIcon(saved_icon);
			drag_marker = null;
			saved_icon = null;
			}
		}
	};
}	