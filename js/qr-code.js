class QRCodePayment {
    constructor() {
        this.currentQRData = null;
        this.init();
    }

    init() {
        this.setupTabSwitching();
        this.setupQROptions();
        this.setupEventListeners();
    }

    setupTabSwitching() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabs = document.querySelectorAll('.payment-tab');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Update active tab button
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show target tab
                tabs.forEach(tab => tab.classList.remove('active'));
                document.getElementById(`${targetTab}Tab`).classList.add('active');
            });
        });
    }

    setupQROptions() {
        const qrOptionButtons = document.querySelectorAll('.qr-option-btn');
        const qrSections = document.querySelectorAll('.qr-section');

        qrOptionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const option = button.getAttribute('data-option');
                
                // Update active option button
                qrOptionButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Show target section
                qrSections.forEach(section => section.classList.remove('active'));
                document.getElementById(`${option}QRSection`).classList.add('active');
            });
        });
    }

    setupEventListeners() {
        // Generate QR Code
        document.getElementById('generateQRBtn').addEventListener('click', () => {
            this.generateQRCode();
        });

        // Scanner controls
        document.getElementById('startScanner').addEventListener('click', () => {
            this.startScanner();
        });

        document.getElementById('stopScanner').addEventListener('click', () => {
            this.stopScanner();
        });

        // Process scanned payment
        document.getElementById('processScannedPayment').addEventListener('click', () => {
            this.processScannedPayment();
        });

        // QR Code actions
        document.getElementById('downloadQRBtn').addEventListener('click', () => {
            this.downloadQRCode();
        });

        document.getElementById('newQRBtn').addEventListener('click', () => {
            this.resetQRCode();
        });

        // Manual payment
        document.getElementById('processManualPayment').addEventListener('click', () => {
            this.processManualPayment();
        });
    }

    generateQRCode() {
        const amount = document.getElementById('qrAmount').value;
        const description = document.getElementById('qrDescription').value;

        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        // Create payment data
        const paymentData = {
            type: 'payment',
            amount: parseFloat(amount),
            description: description,
            currency: 'INR',
            timestamp: new Date().toISOString(),
            merchant: 'QR Payment System',
            upiId: '7609050022@byl',
            reference: 'PAY_' + Date.now()
        };

        this.currentQRData = paymentData;
        
        // Generate UPI payment string
        const upiString = this.generateUPIString(amount, description);
        this.renderQRCode(upiString);

        // Update display
        document.getElementById('qrAmountDisplay').textContent = parseFloat(amount).toFixed(2);
        document.getElementById('qrDescriptionDisplay').textContent = description || 'No description';
        
        // Show QR code container
        document.getElementById('qrCodeContainer').classList.remove('hidden');

        this.showNotification('QR Code generated successfully!', 'success');
    }

    generateUPIString(amount, description) {
        const upiId = '7609050022@byl';
        const payeeName = 'QR Payment System';
        
        // UPI URL format
        return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(description || 'Payment')}`;
    }

    renderQRCode(text) {
        const qrContainer = document.getElementById('qrCodeDisplay');
        qrContainer.innerHTML = '';
        
        try {
            const canvas = window.generateQRCode(text, { size: 300 });
            
            if (canvas) {
                // Add logo
                this.addQRLogo(canvas);
                qrContainer.appendChild(canvas);
            } else {
                throw new Error('Canvas not created');
            }
            
        } catch (error) {
            console.error('QR code generation error:', error);
            this.showNotification('Failed to generate QR code', 'error');
            
            // Fallback display
            qrContainer.innerHTML = `
                <div style="padding: 20px; text-align: center; border: 2px dashed #ddd; border-radius: 10px;">
                    <div style="font-size: 48px; margin-bottom: 10px;">📱</div>
                    <h3>Payment QR Code</h3>
                    <p><strong>Amount:</strong> ₹${this.currentQRData.amount}</p>
                    <p><strong>UPI ID:</strong> 7609050022@byl</p>
                    <p><strong>Description:</strong> ${this.currentQRData.description || 'No description'}</p>
                    <p style="margin-top: 10px; color: #666;">Scan with any UPI app</p>
                </div>
            `;
        }
    }

    addQRLogo(canvas) {
        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const logoSize = 40;

        // Draw logo background
        ctx.fillStyle = '#667eea';
        ctx.beginPath();
        ctx.arc(centerX, centerY, logoSize / 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw logo text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('₹', centerX, centerY);
    }

    startScanner() {
        this.showNotification('Scanner would start here. For demo, showing test data.', 'info');
        
        // Simulate scanning after 2 seconds
        setTimeout(() => {
            const testData = {
                type: 'payment',
                amount: 150.00,
                description: 'Test payment',
                merchant: 'Test Merchant',
                upiId: '7609050022@byl',
                reference: 'TEST_' + Date.now()
            };
            this.displayScannedPayment(testData);
        }, 2000);

        // Update UI
        document.getElementById('startScanner').classList.add('hidden');
        document.getElementById('stopScanner').classList.remove('hidden');
        
        document.getElementById('qrReader').innerHTML = `
            <div class="scanner-placeholder">
                <div class="scanner-icon">🔍</div>
                <p>Scanning for QR codes...</p>
                <div style="margin-top: 20px; padding: 10px; background: #e9ecef; border-radius: 5px;">
                    <small>Demo: Simulating QR scan</small>
                </div>
            </div>
        `;
    }

    stopScanner() {
        document.getElementById('startScanner').classList.remove('hidden');
        document.getElementById('stopScanner').classList.add('hidden');
        
        document.getElementById('qrReader').innerHTML = `
            <div class="scanner-placeholder">
                <div class="scanner-icon">📱</div>
                <p>Click "Start Scanner" to begin</p>
            </div>
        `;
        
        this.showNotification('Scanner stopped', 'info');
    }

    displayScannedPayment(paymentData) {
        const scannerResult = document.getElementById('scannerResult');
        const scannedDetails = document.getElementById('scannedDetails');

        scannedDetails.innerHTML = `
            <div class="scanned-detail">
                <strong>Amount:</strong> ₹${paymentData.amount.toFixed(2)}
            </div>
            <div class="scanned-detail">
                <strong>Description:</strong> ${paymentData.description || 'No description'}
            </div>
            <div class="scanned-detail">
                <strong>Merchant:</strong> ${paymentData.merchant}
            </div>
            <div class="scanned-detail">
                <strong>UPI ID:</strong> ${paymentData.upiId}
            </div>
            <div class="scanned-detail">
                <strong>Reference:</strong> ${paymentData.reference}
            </div>
        `;

        this.currentQRData = paymentData;
        scannerResult.classList.add('active');
    }

    async processScannedPayment() {
        if (!this.currentQRData) {
            this.showNotification('No payment data to process', 'error');
            return;
        }

        const processButton = document.getElementById('processScannedPayment');
        const originalText = processButton.innerHTML;
        
        try {
            processButton.disabled = true;
            processButton.innerHTML = 'Processing...';

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const success = Math.random() < 0.8;
            
            if (success) {
                this.showNotification('Payment processed successfully!', 'success');
                document.getElementById('scannerResult').classList.remove('active');
                this.currentQRData = null;
            } else {
                this.showNotification('Payment failed. Please try again.', 'error');
            }

        } catch (error) {
            this.showNotification('Payment error: ' + error.message, 'error');
        } finally {
            processButton.disabled = false;
            processButton.innerHTML = originalText;
        }
    }

    async processManualPayment() {
        const amount = document.getElementById('manualAmount').value;
        const description = document.getElementById('manualDescription').value;

        if (!amount || amount <= 0) {
            this.showNotification('Please enter a valid amount', 'error');
            return;
        }

        const processButton = document.getElementById('processManualPayment');
        const originalText = processButton.innerHTML;
        
        try {
            processButton.disabled = true;
            processButton.innerHTML = 'Processing...';

            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const success = Math.random() < 0.8;
            
            if (success) {
                this.showNotification(`Payment of ₹${amount} processed successfully!`, 'success');
                document.getElementById('manualAmount').value = '100.00';
                document.getElementById('manualDescription').value = '';
            } else {
                this.showNotification('Payment failed. Please try again.', 'error');
            }

        } catch (error) {
            this.showNotification('Payment error: ' + error.message, 'error');
        } finally {
            processButton.disabled = false;
            processButton.innerHTML = originalText;
        }
    }

    downloadQRCode() {
        const canvas = document.querySelector('#qrCodeDisplay canvas');
        if (!canvas) {
            this.showNotification('No QR code to download', 'error');
            return;
        }

        const link = document.createElement('a');
        link.download = `payment-qr-${this.currentQRData.amount}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        this.showNotification('QR Code downloaded!', 'success');
    }

    resetQRCode() {
        document.getElementById('qrCodeContainer').classList.add('hidden');
        document.getElementById('qrAmount').value = '100.00';
        document.getElementById('qrDescription').value = '';
        document.getElementById('qrCodeDisplay').innerHTML = '';
        this.currentQRData = null;
        this.showNotification('QR Code reset', 'info');
    }

    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.qrPayment = new QRCodePayment();
});