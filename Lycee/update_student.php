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
    // Handle file upload if new photo
    $photoPath = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/photos/';
        $fileExtension = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '.' . $fileExtension;
        $photoPath = $uploadDir . $fileName;
        
        if (!move_uploaded_file($_FILES['photo']['tmp_name'], $photoPath)) {
            throw new Exception('Failed to upload photo');
        }
    }

    $updateFields = [];
    $params = [];

    // Build dynamic update query based on provided fields
    foreach ($_POST as $key => $value) {
        if ($key !== 'id') {
            $updateFields[] = "`$key` = ?";
            $params[] = $value;
        }
    }

    if ($photoPath) {
        $updateFields[] = "photo_path = ?";
        $params[] = $photoPath;
    }

    $params[] = $_POST['id']; // Add ID for WHERE clause

    $sql = "UPDATE students SET " . implode(", ", $updateFields) . " WHERE id = ?";
    $stmt = $db->prepare($sql);
    $stmt->execute($params);

    echo json_encode([
        'success' => true
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
