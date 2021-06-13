// todo - bomb out if any function is not supported
<?php

if (!defined("production_dir")) define("production_dir", $argv[1]);
require_once(production_dir."/config.php");
require_once(production_dir."/functions.php");

require_once_and_explain(production_dir."/js/components/utils.js");
require_once_and_explain(production_dir."/js/components/popup_modal.js");
require_once_and_explain(production_dir."/js/components/edit_profile_pic.js");
require_once_and_explain(production_dir."/js/components/profile_data.js");

?>
