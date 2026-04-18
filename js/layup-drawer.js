'use strict';

function LayupDrawer() {
    this.canvas = null;
    this.ctx = null;
    this.images = {};
}

LayupDrawer.prototype = {
    init : function (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        var self = this;
        function redraw() {
            if (self._lastLayup) {
                self.drawLayup(self._lastLayup);
            }
        }

        this.images.parallel = new Image();
        this.images.parallel.addEventListener('load', redraw);
        this.images.parallel.src = 'images/paralel-grain-0.jpg';

        this.images.perpendicular = new Image();
        this.images.perpendicular.addEventListener('load', redraw);
        this.images.perpendicular.src = 'images/perpendicular-grain-90.jpg';
    },

    drawLayerDivider : function (x, y, w) {
        var ctx = this.ctx;
        var r = 2.5;
        ctx.strokeStyle = '#76b82a';
        ctx.fillStyle = '#76b82a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + w, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x + w, y, r, 0, Math.PI * 2);
        ctx.fill();
    },

    drawAxes : function (opts) {
        var ctx = this.ctx;
        var slabLeft = opts.slabLeft;
        var slabBottom = opts.slabBottom;
        var slabW = opts.slabWidth;
        var yMaxMm = opts.yMaxMm;
        var mmToPxY = opts.mmToPxY;
        var xRangeMm = opts.xRangeMm;

        var yAxisX = slabLeft - 12;
        var yAxisTop = slabBottom - yMaxMm * mmToPxY;

        ctx.strokeStyle = '#999';
        ctx.fillStyle = '#666';
        ctx.lineWidth = 1;
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        ctx.beginPath();
        ctx.moveTo(yAxisX, slabBottom);
        ctx.lineTo(yAxisX, yAxisTop - 4);
        ctx.stroke();

        for (var yMm = 0; yMm <= yMaxMm; yMm += 60) {
            var ty = slabBottom - yMm * mmToPxY;
            ctx.beginPath();
            ctx.moveTo(yAxisX, ty);
            ctx.lineTo(yAxisX - 5, ty);
            ctx.stroke();
            ctx.fillText(String(yMm), yAxisX - 8, ty);
        }

        ctx.save();
        ctx.translate(yAxisX - 42, (slabBottom + yAxisTop) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = 'center';
        ctx.font = '12px Arial';
        ctx.fillText('Slab Thickness (mm)', 0, 0);
        ctx.restore();

        var xAxisY = slabBottom + 14;
        ctx.beginPath();
        ctx.moveTo(slabLeft, xAxisY);
        ctx.lineTo(slabLeft + slabW + 8, xAxisY);
        ctx.stroke();

        var mmPerPxX = xRangeMm / slabW;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.font = '11px Arial';
        for (var xMm = 0; xMm <= xRangeMm; xMm += 30) {
            var tx = slabLeft + xMm / mmPerPxX;
            ctx.beginPath();
            ctx.moveTo(tx, xAxisY);
            ctx.lineTo(tx, xAxisY + 5);
            ctx.stroke();
            ctx.fillText(String(xMm), tx, xAxisY + 8);
        }

        ctx.font = '12px Arial';
        ctx.fillText('Primary Direction', slabLeft + slabW / 2, xAxisY + 26);
    },

    drawLayup : function (layup) {
        if (!this.ctx) return;

        this._lastLayup = layup;

        var self = this;
        var layers = layup.layers;
        var marginLeft = 72;
        var marginBottom = 90;
        var marginTop = 24;
        var labelSpace = 120;
        var xRangeMm = 150;

        var totalMm = layers.reduce(function (sum, L) {
            return sum + L.thickness;
        }, 0);

        var slabHeightPx = this.canvas.height - marginBottom - marginTop;
        var mmToPxY = slabHeightPx / totalMm;
        var slabW = Math.max(120, this.canvas.width - marginLeft - labelSpace);
        var slabLeft = marginLeft;
        var slabBottom = this.canvas.height - marginBottom;
        var yMaxMm = Math.ceil(totalMm / 60) * 60;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawAxes({
            slabLeft : slabLeft,
            slabBottom : slabBottom,
            slabWidth : slabW,
            yMaxMm : yMaxMm,
            mmToPxY : mmToPxY,
            xRangeMm : xRangeMm
        });

        var y = slabBottom;
        var stackBottom = y;

        layers.slice().reverse().forEach(function (layer) {
            var h = layer.thickness * mmToPxY;
            y -= h;

            var img = layer.orientation === 0 ? self.images.parallel : self.images.perpendicular;

            if (img.complete && img.naturalWidth > 0) {
                self.ctx.drawImage(img, slabLeft, y, slabW, h);
            } else {
                self.ctx.fillStyle = '#d2b48c';
                self.ctx.fillRect(slabLeft, y, slabW, h);
            }

            self.drawLayerDivider(slabLeft, y, slabW);

            self.ctx.fillStyle = '#555';
            self.ctx.font = '12px Arial';
            self.ctx.textAlign = 'left';
            self.ctx.textBaseline = 'middle';
            self.ctx.fillText(
                layer.id + ': ' + layer.thickness + 'mm ' + layer.grade,
                slabLeft + slabW + 12,
                y + h / 2
            );
        });

        this.drawLayerDivider(slabLeft, stackBottom, slabW);
    }
};
