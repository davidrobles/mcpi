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

MCPI.DashboardView = function(options) {
    this.model = options.model;
    this.controller = options.controller;
    this.elems = options.elems;
    this.addListeners();
};

MCPI.DashboardView.prototype = {

    constructor: MCPI.DashboardView,

    addListeners: function() {
        this.addStartResetListener();
        this.addSampleSizeListener();
    },

    addSampleSizeListener: function() {
        this.elems.sampleSize.addEventListener("change", function(event) {
            this.updateSampleSize();
        }.bind(this));
    },

    addStartResetListener: function() {
        this.elems.startButton.addEventListener("click", function() {
            if (this.elems.startButton.value === "start") {
                this.controller.startAnimation();
            } else if (this.elems.startButton.value === "stop") {
                this.controller.reset();
            }
        }.bind(this));
    },

    updateSampleSize: function() {
        this.model.sampleSize = parseInt(this.elems.sampleSize.value, 10);
        this.model.stepSize = this.model.sampleSize / 100;
    },

    // Model callbacks

    pointsAdded: function() {
        this.renderEquation();
        this.renderCounters();
        this.renderMeter();
    },

    // Controller callbacks

    bound: function() {
        this.updateSampleSize();
    },

    reset: function(model) {
        this.renderEquation();
        this.renderCounters();
        this.renderMeter();
        this.elems.startButton.className = "mcpiStartStop mcpiStart";
        this.elems.startButton.innerHTML = "START";
        this.elems.startButton.value = "start";
        this.elems.sampleSize.disabled = false;
    },

    start: function() {
        this.elems.sampleSize.disabled = true;
        this.elems.startButton.className = "mcpiStartStop mcpiStop";
        this.elems.startButton.innerHTML = "RESET";
        this.elems.startButton.value = "stop";
    },

    // Rendering

    renderMeter: function() {
        var numPoints = this.model.counters.total,
            sampleSize = this.model.sampleSize,
            completionPercentage = Math.round((numPoints / sampleSize) * 100);
        this.elems.meter.setAttribute("value", "" + completionPercentage);
    },

    renderCounters: function() {
        this.elems.insideCounter.innerHTML = this.model.counters.inside;
        this.elems.outsideCounter.innerHTML = this.model.counters.outside;
    },

    renderEquation: function() {
        var pi = this.model.calculatePi();
        if (this.model.counters.total == 0) {
            var math = MathJax.Hub.getAllJax(this.elems.equation.id)[0];
            MathJax.Hub.Queue(["Text",math,"\\pi \\approx 4 \\frac{" +
            "A_C}{A_S}"]);

        } else if (this.model.counters.total % 50 == 0) {
            var math = MathJax.Hub.getAllJax(this.elems.equation.id)[0];
            MathJax.Hub.Queue(["Text",math,"\\pi \\approx 4 \\frac{"
            + this.model.counters.inside + "}{" + this.model.counters.total
            + "} = " + pi.toFixed(4)]);
        }
    }

};

MCPI.CanvasView = function(options) {
    this.canvasEl = options.canvasEl;
    this.colors = options.colors;
    this.pointSize = options.pointSize;
    this.canvasEl.width = options.size;
    this.canvasEl.height = options.size;
    this.ctx = this.canvasEl.getContext("2d");
};

MCPI.CanvasView.prototype = {

    constructor: MCPI.CanvasView,

    // Model Callbacks

    bound: function() {
        this.renderReset();
    },

    pointsAdded: function(points) {
        var pointsGroup = {
            inside: [],
            outside: []
        };
        for (var i = 0; i < points.length; i++) {
            var point = points[i],
                circleSide = MCPI.inside(point) ? "inside" : "outside";
            pointsGroup[circleSide].push(point);
        }
        this.renderPoints(pointsGroup.inside, this.colors.inside);
        this.renderPoints(pointsGroup.outside, this.colors.outside);
    },

    reset: function() {
        this.renderReset();
    },

    // Rendering

    renderBackground: function() {
        this.ctx.fillStyle = this.colors.bg;
        this.ctx.fillRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    },

    renderBorder: function() {
        var borderSize = Math.round(this.canvasEl.width * 0.05);
        this.canvasEl.style.border = borderSize + "px solid " + this.colors.circle;
    },

    renderCircle: function() {
        var centerX = this.canvasEl.width / 2,
            centerY = this.canvasEl.height / 2,
            radius = this.canvasEl.width / 2;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2, false);
        this.ctx.fillStyle = this.colors.circle;
        this.ctx.fill();
        this.ctx.closePath();
    },

    renderPoint: function(point, color) {
        var centerX = this.canvasEl.width * ((point.x + 1) / 2),
            centerY = this.canvasEl.height * ((point.y + 1) / 2);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(centerX, centerY, this.pointSize, this.pointSize);
    },

    renderPoints: function(points, color) {
        for (var i = 0; i < points.length; i++) {
            var point = points[i],
                centerX = this.canvasEl.width * ((point.x + 1) / 2),
                centerY = this.canvasEl.height * ((point.y + 1) / 2);
            this.ctx.fillStyle = color;
            this.ctx.fillRect(centerX, centerY, this.pointSize, this.pointSize);
        }
    },

    renderReset: function() {
        this.renderBackground();
        this.renderBorder();
        this.renderCircle();
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