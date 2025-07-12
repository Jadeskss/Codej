<?php
// api.php - REST API for Codej
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            getProgram($_GET['id']);
        } else {
            getAllPrograms();
        }
        break;
        
    case 'POST':
        createProgram($input);
        break;
        
    case 'PUT':
        if (isset($_GET['id'])) {
            updateProgram($_GET['id'], $input);
        }
        break;
        
    case 'DELETE':
        if (isset($_GET['id'])) {
            deleteProgram($_GET['id']);
        }
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}

function getAllPrograms() {
    global $pdo;
    
    try {
        $stmt = $pdo->query("SELECT * FROM programs ORDER BY created_at DESC");
        $programs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Decode JSON tags
        foreach ($programs as &$program) {
            $program['tags'] = json_decode($program['tags'], true) ?: [];
        }
        
        echo json_encode(['success' => true, 'data' => $programs]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function getProgram($id) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM programs WHERE id = ?");
        $stmt->execute([$id]);
        $program = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($program) {
            $program['tags'] = json_decode($program['tags'], true) ?: [];
            echo json_encode(['success' => true, 'data' => $program]);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Program not found']);
        }
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function createProgram($data) {
    global $pdo;
    
    try {
        $id = uniqid(time());
        $stmt = $pdo->prepare("
            INSERT INTO programs (id, title, language, description, code, url, tags) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $id,
            $data['title'],
            $data['language'],
            $data['description'],
            $data['code'],
            $data['url'],
            json_encode($data['tags'])
        ]);
        
        echo json_encode(['success' => true, 'id' => $id]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function updateProgram($id, $data) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("
            UPDATE programs 
            SET title = ?, language = ?, description = ?, code = ?, url = ?, tags = ? 
            WHERE id = ?
        ");
        
        $stmt->execute([
            $data['title'],
            $data['language'],
            $data['description'],
            $data['code'],
            $data['url'],
            json_encode($data['tags']),
            $id
        ]);
        
        echo json_encode(['success' => true]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function deleteProgram($id) {
    global $pdo;
    
    try {
        $stmt = $pdo->prepare("DELETE FROM programs WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    } catch(Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
?>
