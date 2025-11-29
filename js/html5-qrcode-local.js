// Simplified HTML5 QR Code Scanner for local use
class Html5QrcodeLocal {
    constructor(elementId) {
        this.elementId = elementId;
        this.scanner = null;
        this.isScanning = false;
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasContext = null;
        this.onResultCallback = null;
    }

    async start(cameraConfig, scannerConfig, onResult, onError) {
        try {
            this.onResultCallback = onResult;
            
            // Create video element
            this.videoElement = document.createElement('video');
            this.videoElement.setAttribute('playsinline', '');
            this.videoElement.style.width = '100%';
            this.videoElement.style.height = '100%';
            
            // Create canvas for QR code detection
            this.canvasElement = document.createElement('canvas');
            this.canvasContext = this.canvasElement.getContext('2d');
            
            // Get the container
            const container = document.getElementById(this.elementId);
            container.innerHTML = '';
            container.appendChild(this.videoElement);
            
            // Get camera stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: cameraConfig.facingMode }
            });
            
            this.videoElement.srcObject = stream;
            await this.videoElement.play();
            
            this.isScanning = true;
            this.scanFrame();
            
            return Promise.resolve();
            
        } catch (error) {
            if (onError) onError(error.message);
            return Promise.reject(error);
        }
    }

    scanFrame() {
        if (!this.isScanning) return;
        
        if (this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA) {
            this.canvasElement.width = this.videoElement.videoWidth;
            this.canvasElement.height = this.videoElement.videoHeight;
            
            this.canvasContext.drawImage(
                this.videoElement, 
                0, 0, 
                this.canvasElement.width, 
                this.canvasElement.height
            );
            
            // Simulate QR code detection (in real implementation, use jsQR library)
            this.simulateQRDetection();
        }
        
        requestAnimationFrame(() => this.scanFrame());
    }

    simulateQRDetection() {
        // Simulate random QR code detection for demo purposes
        // In a real implementation, you would use jsQR library here
        if (Math.random() < 0.01) { // 1% chance per frame to simulate detection
            const demoQRData = {
                type: 'payment',
                amount: 100.00,
                description: 'Demo Payment',
                currency: 'IND',
                timestamp: new Date().toISOString(),
                merchant: 'Demo Merchant',
                reference: 'DEMO_' + Date.now()
            };
            
            if (this.onResultCallback) {
                this.onResultCallback(JSON.stringify(demoQRData));
            }
        }
    }

    async stop() {
        this.isScanning = false;
        
        if (this.videoElement && this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        
        const container = document.getElementById(this.elementId);
        if (container) {
            container.innerHTML = '';
        }
        
        return Promise.resolve();
    }

    clear() {
        // Cleanup
        this.videoElement = null;
        this.canvasElement = null;
        this.canvasContext = null;
        this.onResultCallback = null;
    }
}

// Global variable for compatibility
window.Html5Qrcode = Html5QrcodeLocal;