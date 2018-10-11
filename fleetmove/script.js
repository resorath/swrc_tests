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
		rotation: 150 + (180 * (shipdef.colour === 'lime')),
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

var previousShape;
stage.on("dragmove", function(evt){
    var pos = stage.getPointerPosition();
    var shape = layer.getIntersection(pos);
    console.log(previousShape);
    console.log(shape);
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

stage.on("dragstart", function(e){
        e.target.moveTo(tempLayer);
        console.log('Moving ' + e.target.name());
        layer.draw();
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

stage.on("dragenter", function(e){
    e.target.fill('green');
    console.log('dragenter ' + e.target.name());
    layer.draw();
});

stage.on("dragleave", function(e){
    e.target.fill('blue');
    console.log('dragleave ' + e.target.name());
    layer.draw();
});

stage.on("dragover", function(e){
    console.log('dragover ' + e.target.name());
    layer.draw();
});

stage.on("drop", function(e){
    e.target.fill('red');
    console.log('drop ' + e.target.name());
    layer.draw();
});

