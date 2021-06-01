<?php

if (!defined("processing_dir")) define("processing_dir", $argv[1]);
require_once(processing_dir."/config.php");

// catch upload
// convert to base64 blob
// set as <img> content
// only save blob to localstorage if they click ok
?>
var tmpUploadedImageBase64 = '';<?/* init */?>

addEvent(document, 'ready', function () {
<? if (build_for == "dev") { ?>
    addEvent(
        document.getElementById('profilePicClicker'),
        'click',
        popupEditProfilePic
    );
<? } ?>
    addEvent(
        document.getElementById('hexagonProfilePic'),
        'load',
        addSVGClickEvent
    );
});

function addSVGClickEvent() {
    var svgDoc = document.getElementById('hexagonProfilePic').contentDocument;
    if (svgDoc == null) return;
    var clickArea = svgDoc.getElementById('profilePicClicker');
    addEvent(clickArea, 'click', popupEditProfilePic);
}

function popupEditProfilePic() {
    showPopup('editProfilePic');
    var img = document.getElementById('editProfilePicUploadedImg');
    var profile = fromLocalStorage('profile');
    if (profile != null && profile.hasOwnProperty('picB64')) {
        img.src = profile.picB64;
    }
    addEvent(img, 'load', freeImgMemory);
    addEvent(
        document.getElementById('editProfilePicUpload'),
        'change',
        picUploadHandler
    );
    addEvent(
        document.getElementById('editProfilePicChange'),
        'click',
        changePicHandler
    );
    addEvent(
        document.getElementById('editProfilePicCrop'),
        'click',
        cropPicHandler
    );
    addEvent(
        document.getElementById('editProfilePicDone'),
        'click',
        donePicHandler
    );
    addEvent(
        document.getElementById('editProfilePicCancel'),
        'click',
        cancelPicHandler
    );
}

function cancelPicHandler() {
    tmpUploadedImageBase64 = '';<?/* reset global */?>
    hidePopup();
}
function changePicHandler() {
}
function cropPicHandler() {
}
function donePicHandler() {
    if (tmpUploadedImageBase64 == '') return hidePopup();

    var profile = fromLocalStorage('profile');
    if (profile == null) profile = {};<?/* init global */?>
    profile.picB64 = tmpUploadedImageBase64;
    toLocalStorage('profile', profile);
    hidePopup();
}

function freeImgMemory() {
    URL.revokeObjectURL(this.src);
}

function picUploadHandler() {
    if (!this.files) return displayUploadedImg('hide');
    if (this.files.length == 0) return displayUploadedImg('hide');
    var uploadedFile = this.files[0];

    file2Base64(uploadedFile).then(function (b64) {
        document.getElementById('editProfilePicUploadedImg').src = b64;
        displayUploadedImg('show');
        tmpUploadedImageBase64 = b64;<?/* update global */?> 
        toggleEditMode('crop');
    });
}

function file2Base64(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            resolve(reader.result);
        };
        reader.onerror = function (error) {
            reject(error);
        };
    });
}

function displayUploadedImg(status) {
    var svg = document.getElementById('editProfilePicDude');
    var img = document.getElementById('editProfilePicUploadedImg');
    var label = document.querySelector('#editProfilePicUpload + label');
    switch (status) {
        case 'show':
            img.style.display = 'block';
            svg.style.display = 'none';
            label.style.display = 'none';
            break;
        case 'hide':
            img.style.display = 'none';
            svg.style.display = 'inline-block';
            label.style.display = 'block';
            break;
    }
}

function toggleEditMode(mode) {
    var btnChange = document.getElementById('editProfilePicChange');
    var btnCrop = document.getElementById('editProfilePicCrop');
    switch (mode) {
        case 'change':
            btnCrop.style.display = 'none';
            btnChange.style.display = 'inline-block';
            break;
        case 'crop':
            btnCrop.style.display = 'inline-block';
            btnChange.style.display = 'none';
            break;
    }
}
