var MCPI = MCPI || {};

MCPI.DashboardView = function(options) {
    this.model = options.model;
    this.controller = options.controller;
    this.meter = options.meter;
    this.counters = {
        inside: options.counters.inside,
        outside: options.counters.outside
    };
    this.equation = options.equation;
    this.sampleSize = options.sampleSize;
    this.startButton = options.startButton;
    this.addListeners();
};

MCPI.DashboardView.prototype = {

    constructor: MCPI.DashboardView,

    addListeners: function() {
        this.addStartResetListener();
        this.addSampleSizeListener();
    },

    addSampleSizeListener: function() {
        this.sampleSize.addEventListener("change", function(event) {
            this.updateSampleSize();
        }.bind(this));
    },

    addStartResetListener: function() {
        this.startButton.addEventListener("click", function() {
            if (this.startButton.value === "start") {
                this.controller.startAnimation();
            } else if (this.startButton.value === "stop") {
                this.controller.reset();
            }
        }.bind(this));
    },

    updateSampleSize: function() {
        this.controller.sampleSize = parseInt(this.sampleSize.value, 10);
        this.controller.stepSize = this.controller.sampleSize / 100;
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
        this.startButton.className = "mcpiStartStop mcpiStart";
        this.startButton.innerHTML = "START";
        this.startButton.value = "start";
        this.sampleSize.disabled = false;
    },

    start: function() {
        this.sampleSize.disabled = true;
        this.startButton.className = "mcpiStartStop mcpiStop";
        this.startButton.innerHTML = "RESET";
        this.startButton.value = "stop";
    },

    // Rendering

    renderMeter: function() {
        var numPoints = this.model.counters.total;
        var sampleSize = parseInt(this.sampleSize.value, 10);
        var completionPercentage = Math.round((numPoints / sampleSize) * 100);
        this.meter.setAttribute("value", "" + completionPercentage);
    },

    renderCounters: function() {
        this.counters.inside.innerHTML = this.model.counters.inside;
        this.counters.outside.innerHTML = this.model.counters.outside;
    },

    renderEquation: function() {
        var pi = this.model.calculatePi();
        if (this.model.counters.total == 0) {
            var math = MathJax.Hub.getAllJax(this.equation.id)[0];
            MathJax.Hub.Queue(["Text",math,"\\pi \\approx 4 \\frac{" +
                "A_C}{A_S}"]);

        } else if (this.model.counters.total % 50 == 0) {
            var math = MathJax.Hub.getAllJax(this.equation.id)[0];
            MathJax.Hub.Queue(["Text",math,"\\pi \\approx 4 \\frac{"
                + this.model.counters.inside + "}{" + this.model.counters.total
                + "} = " + pi.toFixed(4)]);
        }
    }

};
