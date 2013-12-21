window.split_panel_module = function (left_panel, right_panel, resize_callback) {
	if(left_panel === null) {
		alert("split panel left panel was null");
		return null;

	}
	if(right_panel === null) {
		alert("split panel right panel was null");
		return null;
		
	}


	var dragger = document.getElementById("drag"),
	debug = document.getElementById("debug"),
	originX = 0,
	left_width = 250,
	right_width = 250,
	draggerWidth = 20,
	drag_resize = function (event) {
		//debug.innerHTML = "drag_resize" + new Date().toString();
		var dX = event.clientX - originX;
		// if(left_width + dX < 200 && dX <= 0) {
		// 	debug.innerHTML = "left too small";
		// 	return;
		// }
		
		// if(right_width - dX < 200 && dX >=0) {
		// 	debug.innerHTML = "right too small";
		// 	return;	
		// }

		debug.innerHTML = "[" + (left_width + dX) + "-" + (right_width - dX) + "]";
					
		left_panel.style.width = (left_width + dX) + 'px';
		right_panel.style.width = (right_width - dX) + 'px';
		
		if(resize_callback !== null) {
			resize_callback();
		}
	},
	drag_end = function (event) {
		//drag_resize(event);
		left_width = left_panel.offsetWidth; 
		right_width = right_panel.offsetWidth;

		// left_width = parseInt(left_panel.style.width); 
		// right_width = parseInt(right_panel.style.width);
		dragger.style.backgroundColor="#fff";
		window.onmousemove = null;
		window.onmouseup = null;
		
	};
return {
	init: function() {
		left_width = left_panel.offsetWidth;
		right_width = right_panel.offsetWidth;

		dragger.style.width = draggerWidth + 'px';
		    
		dragger.onmousedown = function (event) {
			originX=event.clientX;
			// note you have to get these from the DOM because what was set has been flowed back 
			// and the DOM may have changed the values
			// left_width = parseInt(left_panel.style.width); 
			// right_width = parseInt(right_panel.style.width);
			left_width = left_panel.offsetWidth; 
			right_width = right_panel.offsetWidth;
			//debug.innerHTML = "<" + left_width + " " + right_width + ">"; 
			//debug.innerHTML = "<" + left_panel.style.width + ">";
			dragger.style.backgroundColor="#ddd";
			window.onmousemove=drag_resize;
			window.ommouseup=drag_end;
			};

		dragger.onmouseover = function (event) {
			dragger.style.backgroundColor="#eee";
			};
		
		dragger.onmouseout = function (event) {
			dragger.style.backgroundColor="#fff";
			};
		
		window.onmouseup = function (event) {
			window.onmousemove = null;
			left_width = left_panel.offsetWidth; 
			right_width = right_panel.offsetWidth;

			// left_width = parseInt(left_panel.style.width); 
			// right_width = parseInt(right_panel.style.width);
			dragger.style.backgroundColor="#fff";
			};
		},
	resize : function (width, height) {
	    dragger.style.height = height + 'px';
		right_width = width - left_width - draggerWidth - 20;

	  //   if(right_width >= 250) {
		 //    right_width = width - left_width - draggerWidth - 20;
	  //   	} else {
			// right_width = 250;	    
		 //    left_width = width - right_width - draggerWidth - 20;
	  //   	}
    	right_panel.style.width = right_width +'px';
//    	left_panel.style.width = left_width + 'px';
    	// if(callback !== null) {
    	// 	callback();
    	// 	}
	 	}
	};
};