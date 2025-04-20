<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !isset($_POST['id'])) {
    echo json_encode(['success' => false, 'error' => 'Invalid request']);
    exit;
}

require_once 'config.php';
$database = new Database();
$db = $database->getConnection();

try {
    // First get the photo path to delete the file
    $stmt = $db->prepare("SELECT photo_path FROM students WHERE id = ?");
    $stmt->execute([$_POST['id']]);
    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    // Delete the photo file if it exists
    if ($student && $student['photo_path'] && file_exists($student['photo_path'])) {
        unlink($student['photo_path']);
    }

    // Delete the student record
    $stmt = $db->prepare("DELETE FROM students WHERE id = ?");
    $stmt->execute([$_POST['id']]);

    echo json_encode([
        'success' => true
    ]);
} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error'
    ]);
}
