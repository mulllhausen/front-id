// todo - bomb out if any function is not supported

/* utils **********************************************************************/

NodeList.prototype.isNodeList = HTMLCollection.prototype.isNodeList = function () {
    return true;
};

function isNodeList(elements) {
    try {
        return (elements.isNodeList() === true);
    } catch (err) {
        return false;
    }
}
function addEvent(element, types, callback) {
    if (element == null || typeof(element) == 'undefined') return;
    var elements = (isNodeList(element) ? element : [element]);
    var typesArr = types.split(',');
    for (var elI = 0; elI < elements.length; elI++) {
        var el = elements[elI];
        for (var typeI = 0; typeI < typesArr.length; typeI++) {
            var type = typesArr[typeI].replace(/ /g, '');
            if (el.addEventListener) {
                el.addEventListener(type, callback, false);
            } else if (el.attachEvent) { // ie
                el.attachEvent('on' + type, callback);
            } else {
                el['on' + type] = callback;
            }
        }
    }
}
function triggerEvent(element, type) {
    if (element == null || typeof(element) == 'undefined') return;
    var elements = (isNodeList(element) ? element : [element]);
    for (var elI = 0; elI < elements.length; elI++) {
        var el = elements[elI];
        if ('createEvent' in document) {
            var evt = document.createEvent('HTMLEvents');
            evt.initEvent(type, false, true);
            el.dispatchEvent(evt);
        }
        else el.fireEvent('on' + type);
    }
}
function toLocalStorage(k,v) {
    localStorage.setItem(k, JSON.stringify(v));
}
function fromLocalStorage(k) {
    return JSON.parse(localStorage.getItem(k));
}

/* popup_modal ****************************************************************/

function showPopup(contentID) {
    var contentEl = document.getElementById(contentID);
    var contentHTML = contentEl.outerHTML;
    contentEl.parentNode.removeChild(contentEl);
    document.getElementById('popupModal').innerHTML = contentHTML;
    document.getElementById('popupModalBackground').style.display = 'inline-block';
}

function hidePopup() {
    var popup = document.getElementById('popupModal');
    var contentElCopy = popup.children[0].cloneNode(true);
    document.getElementById('modalHoldings').appendChild(contentElCopy);
    popup.innerHTML = '';
    document.getElementById('popupModalBackground').style.display = 'none';
}
addEvent(document, 'ready', function () {
    addEvent(document.getElementById('popupModalBackground'), 'click', hidePopup);
    addEvent(document.getElementById('popupModal'), 'click', function (event) {
        event.stopPropagation();
    });
});

/* edit_profile_pic ***********************************************************/

var tmpUploadedImageBase64 = '';
addEvent(document, 'ready', function () {
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
    tmpUploadedImageBase64 = '';    hidePopup();
}
function changePicHandler() {
}
function cropPicHandler() {
}
function donePicHandler() {
    if (tmpUploadedImageBase64 == '') return hidePopup();

    var profile = fromLocalStorage('profile');
    if (profile == null) profile = {};    profile.picB64 = tmpUploadedImageBase64;
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
        tmpUploadedImageBase64 = b64; 
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
