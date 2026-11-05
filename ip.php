<?php
// Suppress error display to prevent server path disclosure
ini_set('display_errors', '0');
error_reporting(0);

$rawIp = 'Unknown';
if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
    $rawIp = $_SERVER['HTTP_CLIENT_IP'];
} elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
    $rawIp = $_SERVER['HTTP_X_FORWARDED_FOR'];
} elseif (!empty($_SERVER['REMOTE_ADDR'])) {
    $rawIp = $_SERVER['REMOTE_ADDR'];
}

// Strip CRLF to prevent log injection
$ipaddress = preg_replace('/[\r\n\t]/', '', (string)$rawIp);
$browser = isset($_SERVER['HTTP_USER_AGENT']) ? preg_replace('/[\r\n]/', ' ', (string)$_SERVER['HTTP_USER_AGENT']) : 'Unknown';

$file = 'ip.txt';
$logEntry = "IP: " . $ipaddress . "\r\n User-Agent: " . $browser . "\r\n";

$fp = @fopen($file, 'a');
if ($fp) {
    fwrite($fp, $logEntry);
    fclose($fp);
}
