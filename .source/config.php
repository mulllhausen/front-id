<?php

// get all the variables out of config.sh and define() them in php

if (!defined("production_dir")) define("production_dir", $argv[1]);
$f = fopen(production_dir."/config.sh", "r");
if (!$f) throw new Exception("unable to open config file");

while (($line = fgets($f)) !== false)
{
    $line = trim($line);
    if ($line == "" || $line[0] == "#") continue;
    list($key, $value) = explode("=", $line);
    $key = trim($key);
    if ($key == "") continue;

    // get rid of any comments on the line
    if (stripos($value, "#")) list($value, $ignore) = explode("#", $value);

    $value = trim($value);

    // if its a string, then get rid of the quotes
    if ($value[0] == '"') $value = substr($value, 1);
    if ($value[-1] == '"') $value = substr($value, 0, -1);
    if (!defined($key)) define($key, $value);
}
fclose($f);

?>
