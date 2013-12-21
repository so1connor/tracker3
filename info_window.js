
window.info_node_module=function () {
	var node=document.createElement("div"),
	titlenode=document.createElement("h3"),
	statistics=document.createElement("span"),
	delnode=document.createElement("a"),
	editnode=document.createElement("a"),
//	movenode=document.createElement("a"),
//	textnode=document.createElement("textarea"),
	divnode=document.createElement("div"),
	container=document.createElement("div"),
	journey = null,
	open_marker = null;
	//marker = null,
	getStatistics = function (m) {
		var time = new Date(m.t),
		text = "time: " + time.toString() + "<br>id: " + m.id + "<br>latitude: " + m.lat + " &deg; longitude: " + m.lon + "&deg;<br>altitude: " + m.alt + " m<br>accuracy: " + m.acc + " m";
		text += (" speed = " + m.speed);
//		var text="<table><tr class=\"header\">";
//		text=text+"<td>time</td><td>latitude</td><td>longitude</td><td>altitude</td><td>accuracy</td></tr>";
//		text=text+"<tr><td>"+m.t+"</td><td>"+m.lat+"</td><td>"+m.lon+"</td><td>"+m.alt+"</td><td>"+m.acc+"</td></tr></table>";


		//text+="<br>";
		//text=text+"<table><tr class=\"header\"><td>dx</td><td>dt</td><td>dz</td><td>speed</td><td>power</td></tr>";
		//text=text+"<tr><td>"+this.dx+"m</td><td>"+this.dt+"s</td><td>"+this.dz+"m</td><td>"+this.speed+"m/5min</td><td>"+this.power+"W</td></tr></table>";
		return text;
		},
	reset = function() {
		titlenode.innerHTML="Name";
		statistics.innerHTML="Statistics";
		delnode.onclick = undefined;
		divnode.style.display = "none";
		journey = null;
		open_marker = null;
	}

	titlenode.className="info-title";
	statistics.className="info-statistics";
	delnode.innerHTML="delete";
	delnode.className="info-delete";
	delnode.href="#";
	//divnode.innerHTML="some text to edit";
	editnode.target = "_parent";
	editnode.href="#";
	editnode.innerHTML="edit";
	editnode.className="info-edit";
	divnode.className="info-description";
//	textnode.className="info-textarea";
//	textnode.style.display="none";
	
	container.appendChild(delnode);
	container.appendChild(divnode);
//	container.appendChild(textnode);
	container.appendChild(editnode);
	//container.appendChild(movenode);
	
	
	node.appendChild(titlenode);
	node.appendChild(statistics);
	node.appendChild(document.createElement("hr"));
	node.appendChild(container);
	
	reset();
	
	divnode.onclick = function () {
		editnode.style.display="none";
		utils.setEditor(container, divnode, "info-textarea", node.offsetWidth-delnode.offsetWidth-10, function(text) {
			if(text.length===0) {
				text = undefined;
				}
			editnode.style.display = text===undefined ? "inline": "none";

//
//			if(new_text.length === 0 )	{
//				info_node.resetText(m);
//				}
//			if(new_text!==m.text)	{
//				m.text=new_text;
//				info_node.setText(m,new_text);
//				utils.sendMessage("command=setMarkerText&jid="+j.jid+"&id="+m.id+"&description="+encodeURIComponent(new_text));
//				}
//
			if(open_marker !== null){
				if(text !== undefined) {
					if(open_marker.text !== text) {
						utils.sendMessage("command=setMarkerText&jid="+journey.jid+"&id="+open_marker.id+"&description="+encodeURIComponent(text));
						}
					open_marker.text=text;
					if(open_marker.divnode===undefined) {
						mm.attachMarkerTextNode(journey,open_marker);
						}
					}
				if(open_marker.divnode!==undefined) {
					open_marker.divnode.style.display = text===undefined ? "none": "block";
					open_marker.divnode.innerHTML = text===undefined ? "": text;
					}
				}
			});
			//};
		};
	editnode.onclick = divnode.onclick;
	
	return {
		node: node,
		//textnode:textnode,
		divnode:divnode,
		editnode:editnode,
		delnode:delnode,
		setMarker : function (j, marker) {
			if(marker !== null) {
				journey = j;
				open_marker = marker;
				delnode.onclick = marker.delnode.onclick;
				titlenode.innerHTML=marker.titlenode.innerHTML;
				statistics.innerHTML=getStatistics(marker);
				divnode.innerHTML = marker.text===undefined ? "":marker.text;
				divnode.style.display = marker.text===undefined ? "none" : "block";
				editnode.style.display = marker.text===undefined ? "inline" :"none";
			} else {
				reset();
				}
			},
		close : function () {
			open_marker = null;
			},
		resetText : function(marker) {
			if(open_marker != null && open_marker===marker) {
				divnode.style.display="none";
				editnode.style.display = "inline";
				}
			},
		setText : function(marker,text) {
			if(open_marker != null && open_marker===marker) {
				divnode.innerHTML=text;
				}
			}
		};
	};