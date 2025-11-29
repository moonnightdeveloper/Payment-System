<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    $stmt = $pdo->prepare("
        SELECT transaction_id, card_holder, 
               RIGHT(card_number, 4) as card_number, 
               amount, status, created_at 
        FROM transactions 
        ORDER BY created_at DESC 
        LIMIT 10
    ");
    
    $stmt->execute();
    $transactions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Mask card numbers for security
    foreach ($transactions as &$transaction) {
        $transaction['card_number'] = '****' . $transaction['card_number'];
    }
    
    echo json_encode($transactions);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to load transactions']);
}
?>