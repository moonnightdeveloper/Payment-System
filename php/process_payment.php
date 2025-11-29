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
    
    // Validate input data
    if (!validateInput($input)) {
        throw new Exception('Invalid input data');
    }

    $pdo = getDBConnection();
    
    // Generate transaction ID
    $transactionId = generateTransactionID();
    
    // Validate card using Luhn algorithm
    if (!validateCardNumber($input['card_number'])) {
        throw new Exception('Invalid card number');
    }
    
    // Check expiry date
    if (!validateExpiryDate($input['expiry_month'], $input['expiry_year'])) {
        throw new Exception('Card has expired');
    }
    
    // Simulate payment processing
    $status = processPaymentSimulation($input);
    
    // Store transaction in database
    $stmt = $pdo->prepare("
        INSERT INTO transactions 
        (transaction_id, card_number, card_holder, expiry_month, expiry_year, cvv, amount, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $transactionId,
        $input['card_number'],
        $input['card_holder'],
        $input['expiry_month'],
        $input['expiry_year'],
        $input['cvv'],
        $input['amount'],
        $status
    ]);
    
    // Prepare response
    $response = [
        'success' => $status === 'success',
        'message' => $status === 'success' 
            ? "Payment processed successfully! Transaction ID: $transactionId" 
            : 'Payment failed: Insufficient funds',
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

function validateInput($input) {
    $required = ['card_number', 'card_holder', 'expiry_month', 'expiry_year', 'cvv', 'amount'];
    
    foreach ($required as $field) {
        if (empty($input[$field])) {
            return false;
        }
    }
    
    // Basic card number validation
    if (strlen($input['card_number']) < 13 || strlen($input['card_number']) > 19) {
        return false;
    }
    
    // CVV validation
    if (strlen($input['cvv']) < 3 || strlen($input['cvv']) > 4) {
        return false;
    }
    
    // Amount validation
    if (!is_numeric($input['amount']) || $input['amount'] <= 0) {
        return false;
    }
    
    return true;
}

function validateExpiryDate($month, $year) {
    $currentYear = date('Y');
    $currentMonth = date('m');
    
    if ($year < $currentYear) {
        return false;
    }
    
    if ($year == $currentYear && $month < $currentMonth) {
        return false;
    }
    
    return true;
}

function processPaymentSimulation($input) {
    // Simulate various payment scenarios
    $random = rand(1, 10);
    
    // 70% success rate, 20% insufficient funds, 10% system error
    if ($random <= 7) {
        return 'success';
    } elseif ($random <= 9) {
        return 'failed'; // Insufficient funds
    } else {
        throw new Exception('Payment system temporarily unavailable');
    }
}
?>