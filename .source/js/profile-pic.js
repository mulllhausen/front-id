<?php

if (!defined("processing_dir")) define("processing_dir", $argv[1]);
include_once(processing_dir."/functions.php");
file_not_in_production(__FILE__);

?>

addEvent(window, 'load', function () {
    addEvent(document.getElementById('logoClicker'), 'click', function () {
        showPopup('popupProfilePic');
    });
});
function uploadImage() {
}
