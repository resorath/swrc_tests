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

function getPlanetFromShip(ship)
{
	var rval;
	shipdefs.forEach(function(shipdef)
	{
		if(shipdef.colour == ship)
		{
			rval = shipdef.planet;
			return;
		}
	})

	return rval;
}


// set up planets
var i = 0;
planetdefs.forEach(function(planetdef)
{
	var planet = new Konva.Circle({
		x: planetdef[0],
		y: planetdef[1],
		radius: 70 * (Math.min(swidth / 1024, 1)),
		fill: planetdef[2],
		stroke: '#CCCCCC',
		strokeWidth: 4,
		type: "planet",
		name: "planet " + i++
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
		rotation: 150 + (180 * (shipdef.colour === 'lime')),
		draggable: (shipdef.colour == 'lime'),
		type: "ship",
		name: shipdef.colour + " ship"
	})

	layer.add(ship);

	ships.push(ship);

});

function drawArrow(planet1, planet2, colour)
{
	var arrow = new Konva.Arrow({
	  points: [planets[planet1].x() , planets[planet1].y(), planets[planet2].x(), planets[planet2].y()],
	  pointerLength: 20,
	  pointerWidth : 20,
	  fill: 'black',
	  stroke: colour,
	  strokeWidth: 4,
	  name: colour + " line"
	});

	arrows.push(arrow);

	layer.add(arrow);
}


stage.add(layer);

// event firing
var previousShape;
stage.on("dragmove", function(evt){
    var pos = stage.getPointerPosition();
    var shape = layer.getIntersection(pos);
    if (previousShape && shape) {
        if (previousShape !== shape) {
            // leave from old targer
            previousShape.fire('dragleave', {
                type : 'dragleave',
                target : previousShape,
                evt : evt.evt
            }, true);

            // enter new targer
            shape.fire('dragenter', {
                type : 'dragenter',
                target : shape,
                evt : evt.evt
            }, true);
            previousShape = shape;
        } else {
            previousShape.fire('dragover', {
                type : 'dragover',
                target : previousShape,
                evt : evt.evt
            }, true);
        }
    } else if (!previousShape && shape) {
        previousShape = shape;
        shape.fire('dragenter', {
            type : 'dragenter',
            target : shape,
            evt : evt.evt
        }, true);
    } else if (previousShape && !shape) {
        previousShape.fire('dragleave', {
            type : 'dragleave',
            target : previousShape,
            evt : evt.evt
        }, true);
        previousShape = undefined;
    }
});

var tempLayer = new Konva.Layer();
stage.add(tempLayer);

var selectedship;

stage.on("dragstart", function(e){
        e.target.moveTo(tempLayer);
        console.log('Moving ' + e.target.name());
        layer.draw();

        selectedship = e.target;
    });

stage.on("dragend", function(e){
        var pos = stage.getPointerPosition();
        var shape = layer.getIntersection(pos);
        if (shape) {
            previousShape.fire('drop', {
                type : 'drop',
                target : previousShape,
                evt : e.evt
            }, true);
        }
        previousShape = undefined;
        e.target.moveTo(layer);
        layer.draw();
        tempLayer.draw();
    });

var oldcolour;

stage.on("dragenter", function(e){
	console.log(e.target);
	if(!e.target.name().includes("planet"))
		return;

	oldcolour = e.target.fill();
    e.target.fill('white');
    console.log('dragenter ' + e.target.name());
    layer.draw();
});

stage.on("dragleave", function(e){
	if(!e.target.name().includes("planet"))
		return;

    e.target.fill(oldcolour);
    console.log('dragleave ' + e.target.name());
    layer.draw();
});

stage.on("dragover", function(e){
	if(!e.target.name().includes("planet"))
		return;

    console.log('dragover ' + e.target.name());
    layer.draw();
});

stage.on("drop", function(e){
	if(!e.target.name().includes("planet"))
		return;

    e.target.fill(oldcolour);
    console.log('drop ' + e.target.name());
    layer.draw();

    executeMove(selectedship, getPlanetFromShip(selectedship.fill()), e.target.name().split(' ')[1]);
});

function snapship(ship, planet)
{
    
}

function executeMove(targetship, targetplanet, destinationplanet)
{
	if(targetplanet == destinationplanet)
		snapship(targetship, targetplanet);

	drawArrow(targetplanet, destinationplanet, targetship.fill());
	console.log("execute move " + targetship + " " + targetplanet + " " + destinationplanet);
}
