// todo - bomb out if any function is not supported
<?php

if (!defined("processing_dir")) define("processing_dir", $argv[1]);
include_once(processing_dir."/config.php");
include_once(processing_dir."/functions.php");

include_once_and_explain(processing_dir."/js/components/utils.js");
include_once_and_explain(processing_dir."/js/components/popup_modal.js");
include_once_and_explain(processing_dir."/js/components/hexagon_profile_pic.js");

?>
