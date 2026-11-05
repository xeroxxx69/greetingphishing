<?php
// Suppress error display to prevent server path disclosure in HTTP responses
ini_set('display_errors', '0');
error_reporting(0);

// Set security and JSON headers
header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

$date = date('dMYHis');

// Extract and sanitize raw input strings
$latRaw = isset($_POST['lat']) ? trim((string)$_POST['lat']) : '';
$lonRaw = isset($_POST['lon']) ? trim((string)$_POST['lon']) : '';
$accRaw = isset($_POST['acc']) ? trim((string)$_POST['acc']) : '';

// 1. Fix empty("0") bug: check for non-empty string rather than empty()
if ($latRaw !== '' && $lonRaw !== '') {

    // 2. Add numeric and geographic range validation
    if (!is_numeric($latRaw) || !is_numeric($lonRaw)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Coordinates must be valid numeric values']);
        exit();
    }

    $latVal = (float)$latRaw;
    $lonVal = (float)$lonRaw;

    if ($latVal < -90.0 || $latVal > 90.0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Latitude must be between -90 and 90 degrees']);
        exit();
    }

    if ($lonVal < -180.0 || $lonVal > 180.0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Longitude must be between -180 and 180 degrees']);
        exit();
    }

    // Validate accuracy if provided
    $accuracyFormatted = 'Unknown';
    if ($accRaw !== '') {
        if (is_numeric($accRaw) && (float)$accRaw >= 0) {
            $accuracyFormatted = sprintf('%.2f', (float)$accRaw) . ' meters';
        } else {
            $accuracyFormatted = 'Unknown';
        }
    }

    // 3. Prevent CRLF / Log Injection: format validated floats strictly
    $latFormatted = sprintf('%.6f', $latVal);
    $lonFormatted = sprintf('%.6f', $lonVal);

    $data = "Latitude: " . $latFormatted . "\r\n" .
            "Longitude: " . $lonFormatted . "\r\n" .
            "Accuracy: " . $accuracyFormatted . "\r\n" .
            "Google Maps: https://www.google.com/maps/place/" . $latFormatted . "," . $lonFormatted . "\r\n" .
            "Date: " . $date . "\r\n";

    // Create a unique filename with timestamp
    $file = 'location_' . $date . '.txt';

    try {
        // 4. Validate all file operations & write marker
        if (@file_put_contents("LocationLog.log", "Location captured\n", FILE_APPEND) === false) {
            throw new Exception("Could not write to LocationLog.log");
        }

        // Write timestamped location file
        $fpFile = @fopen($file, 'w');
        if (!$fpFile) {
            throw new Exception("Could not open " . $file . " for writing");
        }
        fwrite($fpFile, $data);
        fclose($fpFile);

        // Write current_location.txt with validated handle
        $fpCurrent = @fopen("current_location.txt", "w");
        if ($fpCurrent) {
            fwrite($fpCurrent, $data);
            fclose($fpCurrent);
        } else {
            throw new Exception("Could not open current_location.txt for writing");
        }

        // Append to master location file
        $masterFile = 'saved.locations.txt';
        if (!file_exists($masterFile)) {
            @touch($masterFile);
            @chmod($masterFile, 0666);
        }

        $fpMaster = @fopen($masterFile, 'a');
        if ($fpMaster) {
            fwrite($fpMaster, "\n=== New Location Captured ===\n" . $data . "\n");
            fclose($fpMaster);
        } else {
            throw new Exception("Could not open saved.locations.txt for appending");
        }

        // 5. Handle directory creation and file copying safely
        if (!is_dir('saved_locations')) {
            if (!@mkdir('saved_locations', 0755, true) && !is_dir('saved_locations')) {
                throw new Exception("Could not create saved_locations directory");
            }
        }

        if (!@copy($file, 'saved_locations/' . $file)) {
            // If copy fails, attempt fallback write into directory
            @file_put_contents('saved_locations/' . $file, $data);
        }

        // 6. Return consistent JSON success response
        http_response_code(200);
        echo json_encode(['status' => 'success', 'message' => 'Location data received']);

    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Could not save location data']);
    }

} else {
    // 6. Return consistent JSON error response for missing fields
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Location data missing or incomplete']);
}

exit();
