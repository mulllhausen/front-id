<?php

if (!defined("production_dir")) define("production_dir", $argv[1]);
include_once(production_dir."/config.php");

// querystring link - return the url of the file with a hash in the querystring
function qs_link($file_with_path)
{
    if (!file_exists(production_dir.$file_with_path))
    {
        throw new Exception("file $file_with_path not found");
    }
    $hash = hash_file("sha256", production_dir.$file_with_path); // hex
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
    // $file should be relative to the base directory
    $file = str_replace(production_dir."/", "", $file);
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

function require_once_and_explain($file)
{
    $comment_line = "/".str_repeat("*", 78)."/\n\n";
    $descr = " ".explode(".", basename($file))[0]." ";
    echo "\n".substr_replace($comment_line, $descr, 2, strlen($descr));
    require_once($file);
}
?>
