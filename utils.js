window.utils = function () {

var months=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
unitselection = 0,  //default to km 
units = [{name:"km ",speed:"m/km ",metres: 1000},{name:"mi ", speed:"m/mi ",metres: 1600}],
unit = units[0],
_textnode = document.createElement("textarea");
scriptname="journeys.php",							/* the server script */
getLoader =  function () {
	var object = null;
	// branch for native XMLHttpRequest object
	if(window.XMLHttpRequest && !(window.ActiveXObject)) 
		{
		try 
			{
			object = new XMLHttpRequest();
			} 
		catch(e) 
			{
			object = false;
			}
	// branch for IE/Windows ActiveX version
		} 
	else
		{
		 if(window.ActiveXObject)  
			{
			try 
				{
				object = new ActiveXObject("Msxml2.XMLHTTP");
				} 
			catch(e) 
				{	
				try 
					{
					object = new ActiveXObject("Microsoft.XMLHTTP");
					} 
				catch(e) 
					{
					object = false;
					}
				}
			}	
		}
	return object;
	},
setHttpStatus = function(node,type) {
switch(type)
	{
	case 0:node.innerHTML="";break;
	case 1:node.innerHTML="Opened...";break;
	case 2:node.innerHTML="Headers received...";break;
	case 3:node.innerHTML="Loading...";break;
 	case 4:node.innerHTML="";break;
	}
};


return {
		sendMessage : function (message,callback) {
		//alert("send message");
		var xmlhttp=getLoader();
		//handler=callback;
		if(xmlhttp === null)
				{
				alert("the loader was null");
				return;
				}
		//alert(message);
		xmlhttp.onreadystatechange = function() {
		  	var json;
		  	setHttpStatus(document.getElementById("status"),xmlhttp.readyState);
		  	if (xmlhttp.readyState==4) {	
		    		if (xmlhttp.status==200) {
						//alert(xmlhttp.responseText.substr(0,500));
						try {
							json=JSON.parse(xmlhttp.responseText);
						} catch (error) {
							alert("json parse error = ["+error + "] "+xmlhttp.responseText);
						}
//						if(handleResponseCode(json)) {
//							return;
//						}
						if(callback!==undefined) {
							callback(json);
						} else {
							//alert(json.response);
							if(json.code === 500 || json.code === 100) {
								alert(json.response);
							}
						}
					} else {
					alert(xmlhttp.status + " " + xmlhttp.responseText);
					}
				}
			}
		xmlhttp.open("POST", scriptname);
		xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
		xmlhttp.send("session="+session+"&"+message);
		},
	getDistanceString : function (distance) { // assume metres
		distance = distance / unit.metres;
		//var distance1=distance.toPrecision(1);
		var distance1=distance.toFixed(1);
		if(distance1.charAt(distance1.length-1)=='0')
			distance1=distance.toFixed(0);
		//alert(distance0+","+distance1);
		return distance1 + unit.name;
	},
	setUnit : function (i) {
		unitselection = i;
		unit = units[unitselection];
	},
	getUnit : function () {
		return unitselection;
	},

	getHourString : function(t) { // assume milliseconds
		var minutes=parseInt(t/60000);
		var hours=parseInt(minutes/60);
		minutes=minutes%60;
		if(minutes <10)
			minutes="0"+minutes;
		return ""+hours+":"+minutes;
	},
	setEditor : function (node, element, theclass, width, callback) {
	//	var w=element.offsetWidth;
		var h=element.offsetHeight;		
		h=h<15? 15:h;
		_textnode.style.width = width + "px";
		_textnode.style.height = h + "px";
		_textnode.value = element.innerHTML===undefined ? "": element.innerHTML;
		_textnode.className=theclass;
		node.replaceChild(_textnode,element);
		_textnode.focus();
		_textnode.onblur=function() {
			var text=this.value;
			text=text.replace(/^\s*/g,'');   // get rid of a string that only contains white space, trims from the left side			
			element.innerHTML=text;
			element.style.display = text.length === 0 ? "none" : "block";
			callback(text);
//			if(text.length === 0 )	{
//				info_node.resetText(m);
//				}
//			if(text!==m.text)	{
//				m.text=text;
//				info_node.setText(m,text);
//				utils.sendMessage("command=setMarkerText&jid="+j.jid+"&id="+m.id+"&description="+encodeURIComponent(text));
//				}
			node.replaceChild(element,_textnode);
			};
		},
//function getHourString(date)
//{
//var hours=date.getHours();
//var minutes=date.getMinutes();
//var seconds=date.getSeconds();
//var text="";
//if(hours < 10)
//	text+="0";
//text=text+hours+":";
//
//if(minutes < 10)
//	text+="0";
//text=text+minutes+":";
//if(seconds < 10)
//	text+="0";
//text=text+seconds;
//return text;
//}

	getMinuteString : function (t) { // assume milliseconds
	var seconds=parseInt(t*0.001);
	return (seconds/60).toFixed(2);
//	var minutes=parseInt(seconds/60);
//	seconds=seconds%60;
//	if(seconds <10)
//		seconds="0"+seconds;
//	return ""+minutes+":"+seconds;
	},
	getSpeedMinutes : function (speed) { // assume metres / second
	if(speed === 0) {
		return "&nbsp;";
		} else {
		return "" + (unit.metres/(speed*60)).toFixed(2);
		}
	},
	getSpeedMinuteUnit : function () { 
		return unit.speed;
	},
	getDateString : function (time) {
	var date=new Date(time);
	var text=date.getDate()+" "+months[date.getMonth()]+" "+date.getFullYear();
	//alert(text);
	return text;
	},

	getTimeOfDayString : function (time) {
	var date=new Date(time),
	hours=date.getHours(),
	minutes=date.getMinutes(),
	seconds=date.getSeconds(),
	text="";
	//return date.toUTCString();
	if(hours < 10)
		text+="0";
	text=text+hours+":";
	
	if(minutes < 10)
		text+="0";
	text=text+minutes+":";
	if(seconds < 10)
		text+="0";
	text=text+seconds;
	return text;
	},
	
}

}();


//window.textutils=function () {
//var textnode=document.createElement("textarea");
//var divnode;
//var handler;
//var parentnode;
//textnode.className="marker-textarea";
//textnode.onblur=function() {
//	var d=this.value;
//	d=d.replace(/^\s*/g,'');   // get rid of a string that only contains white space, trims from the left side
//	setText(d);
//	};
//
//var	setText = function (d) {
//	divnode.innerHTML=d;
//	//alert(typeof handler + " " +handler);
//	handler.setText(d);
//	parentnode.replaceChild(divnode, textnode);
//	};
//
//
//return {
//	open: function (d, theobject){
//	//alert(typeof h + " " +h);
//	if(d===undefined){
//		alert("undefined divnode");
//		return;
//	}
//	var w=d.offsetWidth;
//	var h=d.offsetHeight;
//	parentnode=d.parentNode;
//	if(parentnode===undefined){
//		alert("undefined parent");
//		return;
//	}
//	
//	h=h<15? 15:h;
//	textnode.style.width=""+(w-15)+"px";
//	textnode.style.height=""+h+"px";
//	textnode.value = d.innerHTML===undefined ? "": d.innerHTML;
//	divnode=d;
//	parentnode.replaceChild(textnode,divnode);
//	textnode.focus();
//	handler=theobject;
//	//google.maps.event.trigger("domready",tracker.mapinfowindow);
//	//tracker.mapinfowindow.close();
//	//tracker.mapinfowindow.setContent(infowindow.getNode());
//	//tracker.mapinfowindow.open(tracker.map);
//	
//	}
//}
//
//}();