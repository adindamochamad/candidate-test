'use strict';

function LayupDrawer() {
    /**
     * Canvas element
     */
    this.canvas = null;
    this.ctx = null;
    this.images = {};
}

LayupDrawer.prototype = {
    /**
     * Configure the canvas
     *
     * @param {HTMLCanvasElement} canvas  Canvas element
     */
    init : function (canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Load images
        this.images.parallel = new Image();
        this.images.parallel.src = 'images/parallel-grain-0.jpg';
        
        this.images.perpendicular = new Image();
        this.images.perpendicular.src = 'images/perpendicular-grain-90.jpg';
    },

    /**
     * Draw a layup configuration on the canvas
     *
     * @param {Object} layup Layup object structure
     * @param {Number} length Layup length in mm
     */
    drawLayup : function (layup, length) {
        if (!this.ctx) return;

        const layers = layup.layers;
        const scale = 2; // 1mm = 2px
        const startX = 80;
        const drawWidth = length * 0.5; // Sesuaikan lebar gambar berdasarkan parameter length
        const canvasHeight = this.canvas.height;
        let currentY = canvasHeight - 100;

        // Bersihkan canvas sebelum menggambar
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Gambar dari layer paling bawah ke atas
        // Kita gunakan slice().reverse() agar tidak merubah data asli
        layers.slice().reverse().forEach((layer) => {
            const thicknessPx = layer.thickness * scale;
            currentY -= thicknessPx;

            // 1. Pilih gambar berdasarkan orientasi (0 horizontal, 90 vertikal)
            const img = (layer.orientation === 0) ? this.images.parallel : this.images.perpendicular;

            // 2. Gambar tekstur kayu
            if (img.complete) {
                this.ctx.drawImage(img, startX, currentY, drawWidth, thicknessPx);
            } else {
                this.ctx.fillStyle = '#d2b48c'; // Fallback warna kayu
                this.ctx.fillRect(startX, currentY, drawWidth, thicknessPx);
            }

            // 3. Gambar border hijau (CLT Style)
            this.ctx.strokeStyle = '#76b82a';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(startX, currentY, drawWidth, thicknessPx);

            // 4. Tambahkan label teks di sebelah kanan
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(
                layer.id + ': ' + layer.thickness + 'mm ' + layer.grade,
                startX + drawWidth + 15,
                currentY + (thicknessPx / 2) + 5
            );
        });

        this.drawAxes(startX, canvasHeight - 100, drawWidth);
    },

    /**
     * Fungsi tambahan untuk menggambar sumbu (Axes)
     */
    drawAxes : function (x, y, w) {
        this.ctx.strokeStyle = '#999';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + w + 50, y); // Garis X
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x, y - 250); // Garis Y
        this.ctx.stroke();
    }
};