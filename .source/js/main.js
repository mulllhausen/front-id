// todo - bomb out if any function is not supported
<?php

if (!defined("processing_dir")) define("processing_dir", $argv[1]);
require_once(processing_dir."/config.php");
require_once(processing_dir."/functions.php");

require_once_and_explain(processing_dir."/js/components/utils.js");
require_once_and_explain(processing_dir."/js/components/popup_modal.js");
require_once_and_explain(processing_dir."/js/components/edit_profile_pic.js");

?>
