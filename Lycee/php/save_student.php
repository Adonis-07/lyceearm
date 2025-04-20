<?php
session_start();
var_dump($_SESSION);
header('Content-Type: application/json');

if (!isset($_SESSION['is_authenticated']) || $_SESSION['is_authenticated'] !== true) {
    echo json_encode(['success' => false, 'error' => 'Not authenticated']);
    exit();
}


require_once 'config.php';

class StudentValidator {
    private $data;
    private $errors = [];
    
    public function __construct($postData, $files) {
        $this->data = $postData;
        $this->files = $files;
    }
    
    public function validate() {
        // Required fields based on your database structure
        $requiredFields = [
            'massar_code' => 'Massar Code',
            'nom_prenom' => 'Full Name',
            'date_naissance' => 'Birth Date',
            'lieu_naissance' => 'Birth Place',
            'father_name' => 'Father\'s Name',
            'father_profession' => 'Father\'s Profession',
            'mother_name' => 'Mother\'s Name',
            'mother_profession' => 'Mother\'s Profession',
            'father_phone' => 'Father\'s Phone',
            'mother_phone' => 'Mother\'s Phone',
            'school_origin' => 'School of Origin',
            'school_address' => 'School Address',
            'emergency_contact' => 'Emergency Contact',
            'personal_phone' => 'Personal Phone',
            'classe' => 'Class'
        ];

        foreach ($requiredFields as $field => $label) {
            if (empty($this->data[$field])) {
                $this->errors[] = "$label is required";
            }
        }

        if (isset($this->data['massar_code']) && !empty($this->data['massar_code'])) {
            if (!preg_match('/^[A-Z0-9]{10}$/', $this->data['massar_code'])) {
                $this->errors[] = "Invalid Massar Code format. Must be 10 characters long and contain only letters and numbers.";
            }
        } else {
            $this->errors[] = "Massar Code is required.";
        }
        

        // Validate photo upload
        if (isset($this->files['photo']) && $this->files['photo']['error'] === UPLOAD_ERR_OK) {
            $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (!in_array($this->files['photo']['type'], $allowedTypes)) {
                $this->errors[] = "Invalid photo format. Only JPG, PNG, and GIF are allowed.";
            }
            if ($this->files['photo']['size'] > 5000000) { // 5MB limit
                $this->errors[] = "Photo size must be less than 5MB";
            }
        }

        return empty($this->errors);
    }
    
    public function getErrors() {
        return $this->errors;
    }
}

try {
    $database = Database::getInstance();
    $db = $database->getConnection();
    
    // Begin transaction
    $db->beginTransaction();

    // Create validator instance
    $validator = new StudentValidator($_POST, $_FILES);
    
    // Validate input
    if (!$validator->validate()) {
        throw new Exception(implode("\n", $validator->getErrors()));
    }

    // Handle photo upload
    $photoPath = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../uploads/photos/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileExtension = strtolower(pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION));
        $fileName = $_POST['massar_code'] . '_' . uniqid() . '.' . $fileExtension;
        $photoPath = $uploadDir . $fileName;

        if (!move_uploaded_file($_FILES['photo']['tmp_name'], $photoPath)) {
            throw new Exception('Failed to upload photo');
        }
    }

    // Check if student with same Massar code already exists
    $stmt = $db->prepare("SELECT massar_code FROM students WHERE massar_code = ?");
    $stmt->execute([$_POST['massar_code']]);
    if ($stmt->fetch()) {
        throw new Exception('A student with this Massar Code already exists');
    }

    // Insert main student record
    $stmt = $db->prepare("
        INSERT INTO students (
            photo_path, nom_prenom, massar_code, date_naissance, lieu_naissance,
            father_name, father_profession, mother_name, mother_profession,
            father_phone, mother_phone, identity_card_number, identity_card_expiry,
            school_origin, school_address, emergency_contact, personal_phone,
            lycee_card_number, lycee_card_expiry, passport_number, passport_date,
            driver_license_number, driver_license_date, brothers_number,
            sisters_number, military_relatives_number, entry_date, exam_date,
            exam_method, option_level, classe
        ) VALUES (
            :photo_path, :nom_prenom, :massar_code, :date_naissance, :lieu_naissance,
            :father_name, :father_profession, :mother_name, :mother_profession,
            :father_phone, :mother_phone, :identity_card_number, :identity_card_expiry,
            :school_origin, :school_address, :emergency_contact, :personal_phone,
            :lycee_card_number, :lycee_card_expiry, :passport_number, :passport_date,
            :driver_license_number, :driver_license_date, :brothers_number,
            :sisters_number, :military_relatives_number, :entry_date, :exam_date,
            :exam_method, :option_level, :classe
        )
    ");

    $stmt->execute([
        'photo_path' => $photoPath,
        'nom_prenom' => $_POST['nom_prenom'],
        'massar_code' => $_POST['massar_code'],
        'date_naissance' => $_POST['date_naissance'],
        'lieu_naissance' => $_POST['lieu_naissance'],
        'father_name' => $_POST['father_name'],
        'father_profession' => $_POST['father_profession'],
        'mother_name' => $_POST['mother_name'],
        'mother_profession' => $_POST['mother_profession'],
        'father_phone' => $_POST['father_phone'],
        'mother_phone' => $_POST['mother_phone'],
        'identity_card_number' => $_POST['identity_card_number'] ?? null,
        'identity_card_expiry' => $_POST['identity_card_expiry'] ?? null,
        'school_origin' => $_POST['school_origin'],
        'school_address' => $_POST['school_address'],
        'emergency_contact' => $_POST['emergency_contact'],
        'personal_phone' => $_POST['personal_phone'],
        'lycee_card_number' => $_POST['lycee_card_number'] ?? null,
        'lycee_card_expiry' => $_POST['lycee_card_expiry'] ?? null,
        'passport_number' => $_POST['passport_number'] ?? null,
        'passport_date' => $_POST['passport_date'] ?? null,
        'driver_license_number' => $_POST['driver_license_number'] ?? null,
        'driver_license_date' => $_POST['driver_license_date'] ?? null,
        'brothers_number' => $_POST['brothers_number'] ?? 0,
        'sisters_number' => $_POST['sisters_number'] ?? 0,
        'military_relatives_number' => $_POST['military_relatives_number'] ?? 0,
        'entry_date' => $_POST['entry_date'] ?? date('Y-m-d'),
        'exam_date' => $_POST['exam_date'] ?? null,
        'exam_method' => $_POST['exam_method'] ?? null,
        'option_level' => $_POST['option_level'] ?? null,
        'classe' => $_POST['classe']
    ]);

    // Handle siblings if provided
    if (isset($_POST['siblings']) && is_array($_POST['siblings'])) {
        $stmtSibling = $db->prepare("
            INSERT INTO siblings (massar_code, sibling_name, relation)
            VALUES (:massar_code, :sibling_name, :relation)
        ");
        
        foreach ($_POST['siblings'] as $sibling) {
            $stmtSibling->execute([
                'massar_code' => $_POST['massar_code'],
                'sibling_name' => $sibling['name'],
                'relation' => $sibling['relation']
            ]);
        }
    }

    // Handle military relatives if provided
    if (isset($_POST['military_relatives']) && is_array($_POST['military_relatives'])) {
        $stmtMilitary = $db->prepare("
            INSERT INTO military_relatives (massar_code, relative_name, rank)
            VALUES (:massar_code, :relative_name, :rank)
        ");
        
        foreach ($_POST['military_relatives'] as $relative) {
            $stmtMilitary->execute([
                'massar_code' => $_POST['massar_code'],
                'relative_name' => $relative['name'],
                'rank' => $relative['rank']
            ]);
        }
    }

    // Commit transaction
    $db->commit();

    echo json_encode([
        'success' => true,
        'massar_code' => $_POST['massar_code'],
        'message' => 'Student successfully added'
    ]);
} catch (Exception $e) {
    // Rollback transaction on error
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    
    // Delete uploaded photo if exists
    if (isset($photoPath) && file_exists($photoPath)) {
        unlink($photoPath);
    }
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}