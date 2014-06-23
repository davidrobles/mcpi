var MCPI = MCPI || {};

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
