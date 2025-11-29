<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'payment_gateway');

// Payment gateway settings
define('MERCHANT_ID', 'TEST_MERCHANT_001');
define('SECRET_KEY', 'test_secret_key_123');
define('CURRENCY', 'IND');

// Create database connection
function getDBConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}

// Generate unique transaction ID
function generateTransactionID() {
    return 'TXN_' . time() . '_' . rand(1000, 9999);
}

// Validate card number using Luhn algorithm
function validateCardNumber($number) {
    $number = preg_replace('/\D/', '', $number);
    $sum = 0;
    $reverse = strrev($number);
    
    for ($i = 0; $i < strlen($reverse); $i++) {
        $digit = intval($reverse[$i]);
        if ($i % 2 == 1) {
            $digit *= 2;
            if ($digit > 9) {
                $digit -= 9;
            }
        }
        $sum += $digit;
    }
    
    return $sum % 10 == 0;
}

// Mask card number for display
function maskCardNumber($cardNumber) {
    return '**** **** **** ' . substr($cardNumber, -4);
}
?>