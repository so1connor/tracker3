Vector.prototype.dot=dot;
Vector.prototype.fromXY=fromXY;
Vector.prototype.add=add;
Vector.prototype.subtract=subtract;
Vector.prototype.normalise=normalise;
Vector.prototype.normalTo=normalTo;
Vector.prototype.times=times;
Vector.prototype.size = size;
Vector.prototype.print = print;

Vector3D.prototype.fromLatLng=fromLatLng;
Vector3D.prototype.dot=dot3D;
Vector3D.prototype.distanceFrom=distanceFrom;
Vector3D.prototype.copyVector=copyVector;


function Vector3D()
{
this.x=0;
this.y=0;
this.z=0;
}


function Vector()
{
this.x=0;
this.y=0;
}

		
function fromXY(x0,y0) {
	this.x=x0;
	this.y=y0;
}

function add(vector0, vector1) {
	this.x = vector0.x + vector1.x;
	this.y = vector0.y + vector1.y;
}

function normalTo(vector0) {
if(this === vector0)	{
	var temp = this.x;
	this.x = vector0.y;
	this.y = -temp;
	} else {
	this.x = vector0.y;
	this.y = -vector0.x;
	}
}

function subtract(vector0, vector1) {
this.x = vector0.x - vector1.x;
this.y = vector0.y - vector1.y;
}

function times(factor, vector) {
// need to check factor is a number
this.x = vector.x * factor;
this.y = vector.y * factor;
	
}
		
function dot(vector)
		{
		return this.x*vector.x + this.y*vector.y;	
		}
		

function normalise()
		{
		var size = Math.sqrt(this.x*this.x + this.y*this.y);
		if(size === 0) {
			return;
		} else {
			size = 1/size;
			this.x = this.x*size;
			this.y = this.y*size;
			}
		}
		
function print() {
	return "(" + this.x + "," + this.y + ")";
}

function size() {
return Math.sqrt(this.x*this.x + this.y*this.y);
}

function fromLatLng(lat, lon) // this defines a 3d vector
		{
		var rad=Math.PI/180.0;
		lat=lat*rad;
		lon=lon*rad;
		this.z=Math.sin(lat);
		var r=Math.cos(lat);
		this.x=r*Math.sin(lon);
		this.y=r*Math.cos(lon);
		}


function dot3D(vector)
		{
		return this.x*vector.x + this.y*vector.y + this.z*vector.z;	
		}


function copyVector(vector)
		{
		this.x=vector.x;
		this.y=vector.y;
	 	this.z=vector.z;	
		}
		
function distanceFrom(vector) // across the surface of the earth
{
var d=this.dot(vector);
return d <= 1 ? 6378137.0*Math.acos(d) : 0;
}