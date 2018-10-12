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
		name: "planet " + i
	});

	layer.add(planet);

	planets.push({
		type: "planet",
		name: i,
		team: planetdef[2],
		shape: planet
	});

	i++
});

// set up ships
i = 0;
shipdefs.forEach(function(shipdef)
{
	var ship = new Konva.Wedge({
		x: planets[shipdef.planet].shape.x() + (planets[shipdef.planet].shape.radius() * 1.2),
		y: planets[shipdef.planet].shape.y() + (planets[shipdef.planet].shape.radius() * 1.2),
		radius: 70 * (Math.min(swidth / 1024, 1)),
		angle: 60,
		fill:  shipdef.colour,
		stroke: 'black',
		strokeWidth: 5,
		rotation: 150 + (180 * (shipdef.colour === 'lime')),
		draggable: (shipdef.colour == 'lime'),
		name: "ship " + i
	})

	layer.add(ship);

	ships.push({
		type: "ship",
		name: i,
		team: shipdef.colour,
		planet: planets[shipdef.planet],
		planettransit: undefined,
		shape: ship
	});

	i++

});

i = 0;
function drawArrow(planet1, planet2, colour)
{
	var arrow = new Konva.Arrow({
	  points: [planet1.shape.x() , planet1.shape.y(), planet2.shape.x(), planet2.shape.y()],
	  pointerLength: 20,
	  pointerWidth : 20,
	  fill: colour,
	  stroke: 'black',
	  strokeWidth: 4,
	  name: colour + " line"
	});

	var arrowobj = {
		type: "arrow",
		name: i,
		team: colour,
		sourceplanet: planet1,
		destinationplanet: planet2,
		shape: arrow
	};

	arrows.push(arrowobj);

	layer.add(arrow);

	return arrowobj;
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

    var ship = shipFromShape(selectedship);
    var destinationplanet = planetFromShape(e.target);

    executeMove(ship, ship.planet, destinationplanet);
});

function shipFromShape(shape)
{
	var r;
	ships.forEach(function(ship)
	{
		if(ship.shape == shape)
		{
			r = ship;
			return;
		}
	})
	return r;

}

function planetFromShape(shape)
{
	var r;
	planets.forEach(function(planet)
	{
		if(planet.shape == shape)
		{
			r = planet;
			return;
		}
	})
	return r;
}

function arrowFromPlanets(source, destination)
{
	var r = undefined;
	arrows.forEach(function(arrow)
	{
		if(arrow.sourceplanet == source && arrow.destinationplanet == destination)
		{
			r = arrow;
			return;
		}
	});
	return r;
}

function executeMove(targetship, targetplanet, destinationplanet)
{
	if(targetplanet == destinationplanet)
		return putShipOnPlanet(targetship, targetplanet);

	console.log("execute move " + targetship + " " + targetplanet + " " + destinationplanet);


	var arrow = arrowFromPlanets(targetplanet, destinationplanet);

	if(arrow === undefined)
		arrow = drawArrow(targetplanet, destinationplanet, targetship.shape.fill());

	putShipOnArrow(targetship, arrow, 10)

	layer.draw();
}

function putShipOnPlanet(ship, planet)
{
	ship.shape.x(planet.shape.x() + (planet.shape.radius() * 1.2));
	ship.shape.y(planet.shape.y() + (planet.shape.radius() * 1.2));
}

function putShipOnArrow(ship, arrow, progress)
{
	var newshiploc = intercept(arrow, 50);

	ship.shape.x(newshiploc.x);
	ship.shape.y(newshiploc.y);

	var points = arrow.shape.points();
	var rot = (Math.atan2(points[3] - points[1], points[2] - points[0]) * 180 / Math.PI) - (ship.shape.angle() / 2) + 180;
	console.log(rot);
	ship.shape.setRotation(rot);

}

function intercept(arrow, progress)
{
	var points = arrow.shape.points();

	var distance = lineDistance({x:points[0], y:[points[1]]}, {x:points[2], y:[points[3]]})

	var x1 = points[0];
	var y1 = points[1];

	var x2 = points[2];
	var y2 = points[3];

	// Determine line lengths
	var xlen = x2 - x1;
	var ylen = y2 - y1;

	// Determine hypotenuse length
	var hlen = Math.sqrt(Math.pow(xlen,2) + Math.pow(ylen,2));

	// The variable identifying the length of the `shortened` line.
	// In this case 50 units.
	var smallerLen = distance * (progress/100);

	// Determine the ratio between they shortened value and the full hypotenuse.
	var ratio = smallerLen / hlen;

	var smallerXLen = xlen * ratio;
	var smallerYLen = ylen * ratio;

	// The new X point is the starting x plus the smaller x length.
	var smallerX = x1 + smallerXLen;

	// Same goes for the new Y.
	var smallerY = y1 + smallerYLen;

	return {x: smallerX, y: smallerY};

}


function lineDistance( point1, point2 ){
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt( xs + ys );
}