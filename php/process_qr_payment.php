<?php
header('Content-Type: application/json');
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validate QR payment data
    if (!validateQRPaymentData($input)) {
        throw new Exception('Invalid QR payment data');
    }

    $pdo = getDBConnection();
    
    // Generate transaction ID
    $transactionId = generateTransactionID();
    
    // Simulate QR payment processing
    $status = processQRPaymentSimulation($input);
    
    // Store QR payment in database
    $stmt = $pdo->prepare("
        INSERT INTO transactions 
        (transaction_id, card_number, card_holder, expiry_month, expiry_year, cvv, amount, status, payment_method) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'qr_code')
    ");
    
    // For QR payments, we don't have card details, so we use placeholder values
    $stmt->execute([
        $transactionId,
        'QR_CODE',
        'QR Payment User',
        '01',
        date('Y') + 1,
        '000',
        $input['amount'],
        $status
    ]);
    
    // Prepare response
    $response = [
        'success' => $status === 'success',
        'message' => $status === 'success' 
            ? "QR Payment processed successfully! Transaction ID: $transactionId" 
            : 'QR Payment failed',
        'transaction_id' => $transactionId,
        'status' => $status
    ];
    
    echo json_encode($response);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

function validateQRPaymentData($input) {
    if (!isset($input['type']) || $input['type'] !== 'payment') {
        return false;
    }
    
    if (!isset($input['amount']) || !is_numeric($input['amount']) || $input['amount'] <= 0) {
        return false;
    }
    
    if (!isset($input['currency']) || $input['currency'] !== 'IND') {
        return false;
    }
    
    return true;
}

function processQRPaymentSimulation($input) {
    // Simulate QR payment processing - higher success rate for QR payments
    $random = rand(1, 10);
    
    // 90% success rate for QR payments, 10% failure
    return $random <= 9 ? 'success' : 'failed';
}
?>