<?php
header('Content-Type: application/json');
require_once 'config.php';

try {
    $pdo = getDBConnection();
    
    // Get total transactions
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM transactions");
    $total = $stmt->fetchColumn();
    
    // Get success rate
    $stmt = $pdo->query("SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful
        FROM transactions");
    $rates = $stmt->fetch(PDO::FETCH_ASSOC);
    $successRate = $rates['total'] > 0 ? round(($rates['successful'] / $rates['total']) * 100) : 0;
    
    // Get total amount processed
    $stmt = $pdo->query("SELECT COALESCE(SUM(amount), 0) as total_amount FROM transactions WHERE status = 'success'");
    $totalAmount = $stmt->fetchColumn();
    
    echo json_encode([
        'total_transactions' => $total,
        'success_rate' => $successRate . '%',
        'total_amount' => '$' . number_format($totalAmount, 2)
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'total_transactions' => 0,
        'success_rate' => '0%',
        'total_amount' => '$0'
    ]);
}
?>