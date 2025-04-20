<?php
session_start();
$host = "127.0.0.1";
$user = "root"; // Change if needed
$pass = ""; // Change if your database has a password
$dbname = "highschool_db";

// Create connection
$conn = new mysqli($host, $user, $pass, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get input data
$username = $_POST['username'];
$password = $_POST['password'];

// SQL query to check user existence
$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // Verify password (assuming plain text storage)
    if ($password === $user['password']) {
        // Set authentication session
        $_SESSION['is_authenticated'] = true;
        $_SESSION['user'] = [
            'username' => $user['username'],
            'password' => $user['password'],
            'grade' => $user['grade'],
            'fonction' => $user['fonction']
        ];

        // Redirect to home page
        header("Location: home.html");
        exit();
    } else {
        echo "<script>alert('Mot de passe incorrect'); window.location.href='index.html';</script>";
    }
} else {
    echo "<script>alert('Utilisateur non trouvé'); window.location.href='index.html';</script>";
}

$stmt->close();
$conn->close();
