window.marker_module = function() {

	var _node = document.createElement("div"),
	_titlenode=document.createElement("a"),
	_speed0=document.createElement("div"),
	_delnode=document.createElement("img"),
	_divnode=document.createElement("div");
		
	_speed0.className="marker-speed0";
	_speed0.innerHTML="&nbsp;";
	_delnode.src="images/whitex.png";
	_titlenode.className="marker-title";
	_titlenode.href="#";
	_node.className="marker";
	_divnode.className="marker-description";


	return {
		decorate : function (m,j) {
			m.journey=j; // this is the parent object
			m.t += j.tz;
			m.node=_node.cloneNode(true);
			m.titlenode=_titlenode.cloneNode(true);
			m.speed0=_speed0.cloneNode(true);
			m.delnode=_delnode.cloneNode(true);
			m.titlenode.innerHTML=m.id + ' ' + utils.getTimeOfDayString(m.t);
			m.node.appendChild(m.titlenode);
			m.node.appendChild(m.speed0);
			m.node.appendChild(m.delnode);
			m.delnode.style.display = "none";
			m.node.style.visibility="visible";
			m.delnode.onmouseout=function() {
				this.src='images/whitex.png';
				}
			m.delnode.onmouseover=function() {
				this.src='images/redx.png';
				}
			if(m.text !== undefined && m.text.length !== 0) {
				//alert("text="+m.text);
				m.divnode =_divnode.cloneNode(true);
				m.divnode.innerHTML = m.text;
				m.node.appendChild(m.divnode);
				m.divnode.onclick = function() {
					tracker.openMarkerEditor(m,j);
					};
				}
			m.node.onmouseover = function(){
				tracker.showMarker(m);
				};
			m.node.onmouseout=function(){
				tracker.hideMarker(m);
				};
			m.titlenode.onclick=function() {			
				tracker.openMarker(m,j);
				};
			m.delnode.onclick=function() {
				tracker.deleteMarker(m,j);
				};
			},
		getStatistics : function (m) {
			var text="<table><tr class=\"header\">";
			text=text+"<td>time</td><td>latitude</td><td>longitude</td><td>altitude</td><td>accuracy</td></tr>";
			text=text+"<tr><td>"+m.t+"</td><td>"+m.lat+"</td><td>"+m.lon+"</td><td>"+m.alt+"</td><td>"+m.acc+"</td></tr></table>";
			return text;
			//return "time="+this.time+"alt="+this.alt+"&rArr;"+this.dx+"m &Phi;"+this.dt+"s &Delta;"+this.dz+"m<br>"+this.speed+"m/5min "+this.power+"W";
		},
		// attachMarkerTextNode : function (j,m) {
		// 	if(m.text === undefined) {
		// 		return;
		// 		}
		// 	if(m.divnode === undefined) {
		// 		m.divnode = _divnode.cloneNode(true);
		// 		m.divnode.innerHTML = m.text;
		// 		m.node.appendChild(m.divnode);
		// 		}
		// 	m.divnode.onclick = function() {
		// 		utils.setEditor(m.node,m.divnode, "marker-textarea", m.divnode.offsetWidth - 15, function(new_text) {
		// 			if(new_text.length === 0 )	{
		// 				info_node.resetText(m);
		// 				}
		// 			if(new_text !== m.text)	{
		// 				m.text = new_text;
		// 				info_node.setText(m,new_text);
		// 				utils.sendMessage("command=setMarkerText&jid="+j.jid+"&id="+m.id+"&description="+encodeURIComponent(new_text));
		// 				}
		// 			});
		// 		};	
		// 	}
		};
	}

