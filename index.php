<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure Payment Gateway</title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <!-- Notification System -->
    <div id="notification" class="notification"></div>

    <div class="container">
        <header>
            <h1>Secure Payment Gateway</h1>
            <p>Multiple payment options available</p>

            <!-- Payment Method Tabs -->
            <div class="payment-method-tabs">
                <button class="tab-button active" data-tab="card">💳 Card Payment</button>
                <button class="tab-button" data-tab="qr">📱 QR Code</button>
            </div>

            <!-- Statistics Cards -->
            <!-- <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-number" id="totalTransactions">0</div>
                    <div class="stat-label">Total Transactions</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="successRate">0%</div>
                    <div class="stat-label">Success Rate</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number" id="totalAmount">$0</div>
                    <div class="stat-label">Total Processed</div>
                </div>
            </div> -->
        </header>

        <!-- Card Payment Tab -->
        <div id="cardTab" class="payment-tab active">
            <!-- Your existing card payment form -->
            <div class="payment-container">
                <form id="paymentForm" class="payment-form" method="POST">
                    <div class="form-group">
                        <label for="cardNumber">Card Number</label>
                        <input type="text" id="cardNumber" name="card_number" maxlength="19"
                            placeholder="1234 5678 9012 3456" required>
                        <div class="card-icons">
                            <span class="card-icon">💳</span>
                            <span class="card-type" id="cardType"></span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="cardHolder">Card Holder Name</label>
                        <input type="text" id="cardHolder" name="card_holder"
                            placeholder="John Doe" required>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label for="expiryMonth">Expiry Date</label>
                            <div class="expiry-row">
                                <select id="expiryMonth" name="expiry_month" required>
                                    <option value="">Month</option>
                                    <option value="01">01 - January</option>
                                    <option value="02">02 - February</option>
                                    <option value="03">03 - March</option>
                                    <option value="04">04 - April</option>
                                    <option value="05">05 - May</option>
                                    <option value="06">06 - June</option>
                                    <option value="07">07 - July</option>
                                    <option value="08">08 - August</option>
                                    <option value="09">09 - September</option>
                                    <option value="10">10 - October</option>
                                    <option value="11">11 - November</option>
                                    <option value="12">12 - December</option>
                                </select>
                                <select id="expiryYear" name="expiry_year" required>
                                    <option value="">Year</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="cvv">CVV</label>
                            <input type="text" id="cvv" name="cvv" maxlength="4"
                                placeholder="123" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="amount">Amount (IND)</label>
                        <input type="number" id="amount" name="amount" min="1" max="10000"
                            step="0.01" placeholder="100.00" required>
                    </div>

                    <button type="submit" class="pay-button" id="payButton">
                        <span class="button-text">Pay Now</span>
                        <div class="spinner hidden" id="spinner"></div>
                    </button>

                    <div class="security-notice">
                        <p>🔒 Your payment information is secure and encrypted</p>
                        <p style="font-size: 0.8rem; margin-top: 5px;">
                            Test Card: 4242 4242 4242 4242 | CVV: 123 | Any Future Date
                        </p>
                    </div>
                </form>

                <div id="responseMessage" class="response-message hidden"></div>
            </div>
        </div>

        <!-- QR Code Payment Tab -->
        <div id="qrTab" class="payment-tab">
            <div class="payment-container">
                <div class="qr-payment-section">
                    <div class="qr-options">
                        <button class="qr-option-btn active" data-option="generate">Generate QR Code</button>

                    </div>

                    <!-- Generate QR Code Section -->
                    <div id="generateQRSection" class="qr-section active">
                        <div class="form-group">
                            <label for="qrAmount">Amount (IND)</label>
                            <input type="number" id="qrAmount" name="qr_amount" min="1" max="10000"
                                step="0.01" placeholder="100.00" value="100.00">
                        </div>
                        <div class="form-group">
                            <label for="qrDescription">Description (Optional)</label>
                            <input type="text" id="qrDescription" name="qr_description"
                                placeholder="Payment for services">
                        </div>
                        <button id="generateQRBtn" class="pay-button">
                            Generate QR Code
                        </button>

                        <div id="qrCodeContainer" class="qr-code-container hidden">
                            <div class="qr-code-wrapper">
                                <div id="qrCodeDisplay"></div>
                            </div>
                            <div class="qr-code-info">
                                <h4>Scan to Pay MND</h4>
                                <p>Amount: $<span id="qrAmountDisplay">0.00</span></p>
                                <p id="qrDescriptionDisplay"></p>
                                <div class="scanned-detail">
                                    <strong>UPI ID:</strong> <span id="qrUpiIdDisplay">7609050022@byl</span>
                                </div>
                                <div class="qr-actions">
                                    <button id="downloadQRBtn" class="action-btn">Download QR</button>
                                    <button id="newQRBtn" class="action-btn">New QR</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Scan QR Code Section -->
                    <!-- <div id="scanQRSection" class="qr-section">
                        <div class="scanner-container">
                            <div id="qrReader" class="qr-reader">
                                <div class="scanner-placeholder">
                                    <div class="scanner-icon">📱</div>
                                    <p>Click "Start Scanner" to begin</p>
                                </div>
                            </div>
                            <div class="scanner-controls">
                                <button id="startScanner" class="action-btn primary">Start Scanner</button>
                                <button id="stopScanner" class="action-btn secondary hidden">Stop Scanner</button>
                            </div>
                            <div class="scanner-instructions">
                                <p>📱 Point your camera at a payment QR code</p>
                                <p>💡 Ensure good lighting for better scanning</p>
                                <p>📍 Allow camera permissions when prompted</p>
                            </div>
                            <div id="scannerResult" class="scanner-result hidden">
                                <h4>Scanned Payment Details</h4>
                                <div id="scannedDetails"></div>
                                <button id="processScannedPayment" class="pay-button">Process Payment</button>
                            </div>
                        </div>
                    </div> -->
                </div>
            </div>
        </div>

        <!-- Rest of your content -->
    </div>

    <!-- Load local QR code libraries first -->
    <script src="js/qrcode-generator-local.js"></script>
    <script src="js/html5-qrcode-local.js"></script>

    <!-- Try to load external libraries as fallback -->
    <script>
        // Load external libraries with fallback
        function loadExternalLibrary(src, onSuccess, onError) {
            const script = document.createElement('script');
            script.src = src;
            script.onload = onSuccess;
            script.onerror = onError;
            document.head.appendChild(script);
        }

        // Try to load external QR code generator
        if (typeof qrcode === 'undefined') {
            loadExternalLibrary(
                'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js',
                () => console.log('External QR generator loaded'),
                () => console.log('Using local QR generator')
            );
        }

        // Try to load external QR scanner
        if (typeof Html5Qrcode === 'undefined') {
            loadExternalLibrary(
                'https://unpkg.com/html5-qrcode@2.3.8/minified/html5-qrcode.min.js',
                () => {
                    console.log('External QR scanner loaded');
                    // Re-initialize if needed
                    if (window.qrPayment) {
                        window.qrPayment.init();
                    }
                },
                () => console.log('Using local QR scanner')
            );
        }
    </script>

    <script src="js/script.js"></script>
    <script src="js/qr-code.js"></script>
</body>

</html>