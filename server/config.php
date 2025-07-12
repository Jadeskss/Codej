<?php
// config.php - Database configuration
$host = 'localhost';
$dbname = 'codej_db';
$username = 'your_username';
$password = 'your_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

// Create table if not exists
$sql = "CREATE TABLE IF NOT EXISTS programs (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    language VARCHAR(50) NOT NULL,
    description TEXT,
    code LONGTEXT NOT NULL,
    url VARCHAR(500),
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

$pdo->exec($sql);
?>
