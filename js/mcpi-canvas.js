var MCPI = MCPI || {};

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
