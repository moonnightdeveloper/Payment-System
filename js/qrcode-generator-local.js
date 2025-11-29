// Simple QR Code Generator
(function() {
    'use strict';
    
    function QRCode(typeNumber, errorCorrectionLevel) {
        this.typeNumber = typeNumber;
        this.errorCorrectionLevel = errorCorrectionLevel;
        this.modules = null;
        this.moduleCount = 0;
        this.dataCache = null;
        this.dataList = [];
    }

    QRCode.prototype = {
        addData: function(data) {
            this.dataList.push(data);
            this.dataCache = null;
        },

        isDark: function(row, col) {
            if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
                return false;
            }
            return this.modules[row][col];
        },

        getModuleCount: function() {
            return this.moduleCount;
        },

        make: function() {
            this.makeImpl(false, this.getBestMaskPattern());
        },

        makeImpl: function(test, maskPattern) {
            this.moduleCount = this.typeNumber * 4 + 17;
            this.modules = new Array(this.moduleCount);
            
            for (var row = 0; row < this.moduleCount; row++) {
                this.modules[row] = new Array(this.moduleCount);
                for (var col = 0; col < this.moduleCount; col++) {
                    this.modules[row][col] = null;
                }
            }
            
            this.setupPositionProbePattern(0, 0);
            this.setupPositionProbePattern(this.moduleCount - 7, 0);
            this.setupPositionProbePattern(0, this.moduleCount - 7);
            this.setupTimingPattern();
            this.setupTypeInfo(test, maskPattern);
            
            if (this.dataCache == null) {
                this.dataCache = this.createData();
            }
            
            this.mapData(this.dataCache, maskPattern);
        },

        setupPositionProbePattern: function(row, col) {
            for (var r = -1; r <= 7; r++) {
                if (row + r <= -1 || this.moduleCount <= row + r) continue;
                for (var c = -1; c <= 7; c++) {
                    if (col + c <= -1 || this.moduleCount <= col + c) continue;
                    if ((r >= 0 && r <= 6 && (c == 0 || c == 6)) ||
                        (c >= 0 && c <= 6 && (r == 0 || r == 6)) ||
                        (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
                        this.modules[row + r][col + c] = true;
                    } else {
                        this.modules[row + r][col + c] = false;
                    }
                }
            }
        },

        getBestMaskPattern: function() {
            return 0;
        },

        createData: function() {
            var buffer = [];
            var data = this.dataList[0];
            
            // Simple byte encoding
            for (var i = 0; i < data.length; i++) {
                var charCode = data.charCodeAt(i);
                buffer.push(charCode);
            }
            
            return buffer;
        },

        mapData: function(data, maskPattern) {
            var inc = -1;
            var row = this.moduleCount - 1;
            var bitIndex = 7;
            var byteIndex = 0;
            
            for (var col = this.moduleCount - 1; col > 0; col -= 2) {
                if (col == 6) col--;
                
                while (true) {
                    for (var c = 0; c < 2; c++) {
                        if (this.modules[row][col - c] == null) {
                            var dark = false;
                            if (byteIndex < data.length) {
                                dark = ((data[byteIndex] >>> bitIndex) & 1) == 1;
                            }
                            this.modules[row][col - c] = dark;
                            bitIndex--;
                            
                            if (bitIndex == -1) {
                                byteIndex++;
                                bitIndex = 7;
                            }
                        }
                    }
                    
                    row += inc;
                    if (row < 0 || this.moduleCount <= row) {
                        row -= inc;
                        inc = -inc;
                        break;
                    }
                }
            }
        },

        setupTimingPattern: function() {
            for (var r = 8; r < this.moduleCount - 8; r++) {
                if (this.modules[r][6] != null) continue;
                this.modules[r][6] = (r % 2 == 0);
            }
            for (var c = 8; c < this.moduleCount - 8; c++) {
                if (this.modules[6][c] != null) continue;
                this.modules[6][c] = (c % 2 == 0);
            }
        },

        setupTypeInfo: function(test, maskPattern) {
            // Simplified type info
        }
    };

    // Factory function
    window.qrcode = function(typeNumber, errorCorrectionLevel) {
        return new QRCode(typeNumber, errorCorrectionLevel);
    };

    // Simple QR code renderer
    window.generateQRCode = function(text, options) {
        options = options || {};
        var size = options.size || 300;
        
        try {
            var qr = qrcode(4, 'L');
            qr.addData(text);
            qr.make();
            
            var canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            
            var moduleCount = qr.getModuleCount();
            var cellSize = size / moduleCount;
            
            // Draw white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            
            // Draw QR code
            ctx.fillStyle = '#000000';
            for (var row = 0; row < moduleCount; row++) {
                for (var col = 0; col < moduleCount; col++) {
                    if (qr.isDark(row, col)) {
                        ctx.fillRect(
                            col * cellSize,
                            row * cellSize,
                            cellSize,
                            cellSize
                        );
                    }
                }
            }
            
            return canvas;
        } catch (error) {
            console.error('QR generation error:', error);
            return null;
        }
    };

})();