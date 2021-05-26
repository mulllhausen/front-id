<?php

if (!defined("processing_dir")) define("processing_dir", $argv[1]);
require_once(processing_dir."/config.php");

?>
function popupEditProfilePic() {
    showPopup('editProfilePic');
    document.getElementById('editProfilePicUpload').innerHTML =
    'click here to upload or drag and drop';
}
addEvent(document, 'ready', function () {
<? if (build_for == "dev") { ?>
    var clickOverlay = document.getElementById('profilePicClicker');
    addEvent(clickOverlay, 'click', popupEditProfilePic);
<? } ?>
    var hexagonSVGEl = document.getElementById('hexagonProfilePic');
    addEvent(hexagonSVGEl, 'load', function () {
        var svgDoc = hexagonSVGEl.contentDocument;
        if (svgDoc == null) return;
        var clickArea = svgDoc.getElementById('profilePicClicker');
        addEvent(clickArea, 'click', popupEditProfilePic);
    });
});
