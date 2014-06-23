var MCPI = MCPI || {};

MCPI.inside = function(point) {
    return (Math.pow(point.x, 2) + Math.pow(point.y, 2)) < 1;
};

MCPI.randomPoint = function() {
    return {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1
    };
};
