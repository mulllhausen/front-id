<?php

if (!defined("processing_dir")) define("processing_dir", $argv[1]);
include_once(processing_dir."/config.php");

// querystring link - return the url of the file with a hash in the querystring
function qs_link($file_with_path)
{
    if (!file_exists(processing_dir.$file_with_path))
    {
        throw new Exception("file $file_with_path not found");
    }
    $hash = hash_file("sha256", processing_dir.$file_with_path); // hex
    $hash = urlsafe_b64encode($hash); // base 64
    $hash = substr($hash, 0, 6); // first 6 characters only
    // note that $hash would be different if generated by python's
    // urlsafe_b64encode(), but this does not matter. we just want a consistent
    // hash, and we are not using python in this project.
    return schema.domain."$file_with_path?hash=$hash";
}

function urlsafe_b64encode($data)
{
    return strtr(base64_encode($data), '+/', '-_');
}

// generate weak random text ([A-Za-z0-9]) of lenth $length with $centered_text
// in the middle
function random_b64($length, $centered_text = null)
{
    $text = ""; // init
    while (strlen($text) < $length)
    {
        $text .= base64_encode(hash("sha512", rand(0, 1000000)));
        $text = preg_replace("/[^A-Za-z0-9]/", "", $text);
    }
    $text = substr($text, 0, $length);
    if ($centered_text == null) return $text;

    $add_text_len = strlen(strip_tags($centered_text));
    $start_pos = ($length / 2) - ($add_text_len / 2);
    $text = substr_replace($text, $centered_text, $start_pos, $add_text_len);
    return $text;
}

function ld_json($file, $name)
{
    $ld_json = array
    (
        "@context" => "http://schema.org",
        "@type" => "WebSite",
        "datePublished" => date("Y-m-d"),
        "description" => site_description,
        //"image" => qs_link("/image/shattered-glass-matrix.png"),
        "inLanguage" => "English",
        "name" => $name,
        "url" => schema.domain."/$file"
    );
    return json_encode($ld_json);
}

// this function is called when a file does not want to appear in production
// directly. note that this will not prevent it from appearing in production
// when included or concatenated into another file
function file_not_in_production($file)
{
    global $argv;

    // exit the function here if file is allowed in production
    if (basename($argv[0]) != basename($file)) return;

    // prevents grep finding the functions.php file
    $hari = "HARI";
    $kari = "KARI";
    $info = "this file should not exist in production";
    die("$hari $kari ($info)");
}

?>
