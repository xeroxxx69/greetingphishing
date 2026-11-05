<?php
// Simple debug logging script
ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

if (isset($_POST['message'])) {
    $message = (string)$_POST['message'];
    $date = date('Y-m-d H:i:s');
    
    // Filter out messages we don't want to show in the console
    $filtered_messages = [
        "Location data sent",
        "getLocation called",
        "Geolocation error",
        "Location permission denied"
    ];
    
    // Check if the message contains any of the filtered phrases
    $should_filter = false;
    foreach ($filtered_messages as $filtered_phrase) {
        if (strpos($message, $filtered_phrase) !== false) {
            $should_filter = true;
            break;
        }
    }
    
    // Only log essential location data (coordinates) but not the filtered messages
    if (!$should_filter && (
        strpos($message, 'Lat:') !== false || 
        strpos($message, 'Latitude:') !== false || 
        strpos($message, 'Position obtained') !== false
    )) {
        // Sanitize message to prevent log injection
        $sanitizedMessage = preg_replace('/[\r\n]/', ' ', $message);

        // Log to location_debug.log
        $location_log = @fopen("location_debug.log", "a");
        if ($location_log) {
            fwrite($location_log, "[$date] $sanitizedMessage\n");
            fclose($location_log);
        }
        
        // Also create a marker file for the shell script to detect
        @file_put_contents("LocationLog.log", "Location data captured\n", FILE_APPEND);
    }
    
    // Return success
    http_response_code(200);
    echo json_encode(['status' => 'success']);
} else {
    // Return error
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'No message provided']);
}
exit();
