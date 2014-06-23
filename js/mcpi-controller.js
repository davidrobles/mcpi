var MCPI = MCPI || {};

MCPI.Controller = function(options) {
    this.model = options.model;
    this.play = false;
    this.handlers = [];
};

MCPI.Controller.prototype = {

    constructor: MCPI.Controller,

    bind: function(handler) {
        this.handlers.push(handler);
        if ("bound" in handler) {
            handler.bound.call(handler);
        }
    },

    loop: function() {
        this.startAnimation();
        this.looping = true;
    },

    next: function() {
        if (this.play && this.model.counters.total < this.model.sampleSize) {
            this.model.next();
            window.requestNextAnimationFrame(function() {
                this.next();
            }.bind(this));
        } else if (this.looping) {
            this.reset();
            this.startAnimation();
        }
    },

    reset: function() {
        this.play = false;
        this.model.reset();
    },

    startAnimation: function() {
        this.model.reset();
        this.play = true;
        this.trigger("start");
        window.requestNextAnimationFrame(function() {
            this.next();
        }.bind(this));
    },

    start: function() {
        this.model.reset();
        this.play = true;
        this.trigger("start");
        while (this.model.counters.total < this.model.sampleSize) {
            this.model.addRandomPoints(this.model.stepSize);
        }
    },

    trigger: function(event) {
        var args = Array.prototype.slice.call(arguments, 1);
        this.handlers.forEach(function(handler) {
            if (event in handler) {
                handler[event].apply(handler, [this].concat(args));
            }
        }, this);
    }

};

window.requestNextAnimationFrame = (function () {
    return window.requestAnimationFrame       ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame    ||
           window.msRequestAnimationFrame     ||
           function (callback, element) {
               var self = this,
                   start,
                   finish;
               window.setTimeout(function() {
                   start = +new Date();
                   callback(start);
                   finish = +new Date();
                   self.timeout = 1000 / 60 - (finish - start);
               }, self.timeout);
           };
}());
