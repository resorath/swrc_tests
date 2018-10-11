'use strict';
var swidth = window.innerWidth;
var sheight = window.innerHeight;

var planets = [];
var ships = [];
var arrows = [];

var stage = new Konva.Stage({
    container: 'container',
    width: swidth,
    height: sheight
});

var layer = new Konva.Layer();

// define planets
var planetdefs = [
	[ swidth * 0.3, sheight * 0.2, 'red' ], 
	[ swidth * 0.2, sheight * 0.45, 'red' ], 
	[ swidth * 0.3, sheight * 0.7, 'red' ], 
	[ swidth * 0.7, sheight * 0.2, 'lime' ], 
	[ swidth * 0.8, sheight * 0.45, 'lime' ], 
	[ swidth * 0.7, sheight * 0.7, 'lime' ]
]

// define ships
var shipdefs = [
	{ planet: 0, colour: 'red' },
	{ planet: 5, colour: 'lime' }

]


// set up planets
planetdefs.forEach(function(planetdef)
{
	var planet = new Konva.Circle({
		x: planetdef[0],
		y: planetdef[1],
		radius: 70 * (Math.min(swidth / 1024, 1)),
		fill: planetdef[2],
		stroke: '#CCCCCC',
		strokeWidth: 4
	});

	layer.add(planet);

	planets.push(planet);

});

// set up ships
shipdefs.forEach(function(shipdef)
{
	var ship = new Konva.Wedge({
		x: planets[shipdef.planet].x() + (planets[shipdef.planet].radius() * 1.2),
		y: planets[shipdef.planet].y() + (planets[shipdef.planet].radius() * 1.2),
		radius: 70 * (Math.min(swidth / 1024, 1)),
		angle: 60,
		fill:  shipdef.colour,
		stroke: 'black',
		strokeWidth: 5,
		rotation: 150,
		draggable: (shipdef.colour == 'lime')
	})

	layer.add(ship);

	ships.push(ship);

});

function drawArrow(planet1, planet2, colour)
{
	var arrow = new Konva.Arrow({
	  points: [planets[0].x() + (planets[0].radius() * 1.2) , planets[0].y() + (planets[0].radius() * 1.2), planets[5].x() - (planets[5].radius() * 1.2) , planets[5].y() - (planets[5].radius() * 1.2)],
	  pointerLength: 20,
	  pointerWidth : 20,
	  fill: 'black',
	  stroke: colour,
	  strokeWidth: 4
	});

	arrows.push(arrow);

	layer.add(arrow);
}

stage.add(layer);
