var MCPI = MCPI || {};

MCPI.Model = function(options) {
    this.sampleSize = options.sampleSize;
    this.stepSize = options.stepSize;
    this.validateSampleAndStepSizes();
    this.counters = {
        inside: 0,
        outside: 0,
        total: 0
    };
    this.handlers = [];
};

MCPI.Model.prototype = {

    constructor: MCPI.Model,

    addRandomPoints: function(number) {
        var points = [];
        for (var i = 0; i < number; i++) {
            var randomPoint = MCPI.randomPoint();
            this.updateCounters(randomPoint);
            points.push(randomPoint);
        }
        this.trigger("pointsAdded", points);
    },

    bind: function(handler) {
        this.handlers.push(handler);
        if ("bound" in handler) {
            handler.bound.call(handler);
        }
    },

    calculatePi: function() {
        return (4.0 * this.counters.inside) / this.counters.total;
    },

    isFinished: function() {
        return this.model.counters.total >= this.model.sampleSize;
    },

    next: function() {
        this.addRandomPoints(this.stepSize);
    },

    reset: function() {
        this.counters.inside = 0;
        this.counters.outside = 0;
        this.counters.total = 0;
        this.trigger("reset");
    },

    trigger: function(event) {
        var args = Array.prototype.slice.call(arguments, 1);
        this.handlers.forEach(function(handler) {
            if (event in handler) {
                handler[event].apply(handler, args);
            }
        }, this);
    },

    updateCounters: function(point, num) {
        var side = MCPI.inside(point) ? "inside" : "outside";
        this.counters[side]++;
        this.counters.total++;
    },

    validateSampleAndStepSizes: function() {
        if (this.sampleSize % this.stepSize != 0) {
            throw new Error("The step size must be a multiple of the sample size.");
        }
    }

};
