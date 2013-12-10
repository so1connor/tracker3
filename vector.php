<?php
class Vector
	{
	public $x=0;
	public $y=0;
	public $z=0;

	function fromLatLng($lat, $long)
		{
		$rad=pi()/180.0;
		$lat=$lat*$rad;
		$long=$long*$rad;
		$this->z=sin($lat);
		$r=cos($lat);
		$this->x=$r*sin($long);
		$this->y=$r*cos($long);
		}
		
	function copyVector($vector)
		{
		$this->x=$vector->x;
		$this->y=$vector->y;
		$this->z=$vector->z;
		}
			
	function printVector()
		{
		echo $this->x." ".$this->y." ".$this->z."<br>";
		}
		
	function dot($vector)
		{
		return $this->x*$vector->x + $this->y*$vector->y + $this->z*$vector->z;	
		}
	}

function earthArcDistance($vector0, $vector1)
{
$dot=$vector0->dot($vector1);
return $dot <= 1 ? 6378137.0*acos($dot) : 0;
}

 ?>
