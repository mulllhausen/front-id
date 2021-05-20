<?php
// this is a generic script for handling popups

if (!defined("processing_dir")) define("processing_dir", $argv[1]);
include_once(processing_dir."/functions.php");
file_not_in_production(__FILE__);

?>
function showPopup (popupID) {
    document.getElementById('popupProfilePic').style.display = 'inline-block';
}

function hidePopup (popupID) {
    document.getElementById('popupProfilePic').style.display = 'none';
}
