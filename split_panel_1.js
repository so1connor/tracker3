window.split_panel_module = function (left_panel, right_panel, callback) {

	var dragger = document.getElementById("drag"),
	originX = 0,
	left_width = 250,
	right_width = 250,
	draggerWidth = 20,
	drag_resize = function (event) {
//		if(drag===false) return;
		var dX = event.clientX - originX;
		//if(dX>0)dX+=8;
		//if(dX<0)dX-=8;
//		debug.innerHTML=""+left_width;
		if(left_width + dX < 200 && dX <= 0) {
			return;
		}
		
		if(right_width - dX < 200 && dX >=0) {
			return;	
		}
			
		left_panel.style.width = (left_width + dX) + 'px';
		right_panel.style.width = (right_width - dX) + 'px';
		if(callback !== null) {
			callback();
		}
		//event.stopPropagation();
	},
	drag_end = function (event) {
		drag_resize(event);
		left_width = parseInt(left_panel.style.width); 
		right_width = parseInt(right_panel.style.width);
		dragger.style.backgroundColor="#fff";
		window.onmousemove = null;
		window.onmouseup = null;
//		if(observer !== null) {
//			observer.split_resize();
//		}
		
	};
return {
	init: function() {	
		left_panel.style.width = left_width + 'px';
		dragger.style.width = draggerWidth + 'px';
		    
		dragger.onmousedown = function (event) {
			originX=event.clientX;
			// note you have to get these from the DOM because what was set has been flowed back 
			// and the DOM may have changed the values
			left_width = parseInt(left_panel.style.width); 
			right_width = parseInt(right_panel.style.width);
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
			left_width = parseInt(left_panel.style.width); 
			right_width = parseInt(right_panel.style.width);
			dragger.style.backgroundColor="#fff";
			};
		},
	setObserver : function(o){
		observer = o;
		},
	resize : function (width, height) {
	    dragger.style.height = height + 'px';
	    if(right_width >= 250) {
		    right_width = width - left_width - draggerWidth - 20;
	    	} else {
			right_width = 250;	    
		    left_width = width - right_width - draggerWidth - 20;
	    	}
    	right_panel.style.width = right_width +'px';
    	left_panel.style.width = left_width + 'px';
    	if(callback !== null) {
    		callback();
    		}
		}
	};
};