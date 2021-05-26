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

/* popup_modal ****************************************************************/

function showPopup(contentID) {
    var contentElCopy = document.getElementById(contentID).cloneNode(true);
    document.getElementById('popupModal').appendChild(contentElCopy);
    document.getElementById('popupModalBackground').style.display = 'inline-block';
}

function hidePopup() {
    document.getElementById('popupModal').innerHTML = '';
    document.getElementById('popupModalBackground').style.display = 'none';
}
addEvent(document, 'ready', function () {
    addEvent(document.getElementById('popupModalBackground'), 'click', hidePopup);
    addEvent(document.getElementById('popupModal'), 'click', function (event) {
        event.stopPropagation();
    });
});

/* edit_profile_pic ***********************************************************/

function popupEditProfilePic() {
    showPopup('editProfilePic');
    document.getElementById('editProfilePicUpload').innerHTML =
    'click here to upload or drag and drop';
}
addEvent(document, 'ready', function () {
    var hexagonSVGEl = document.getElementById('hexagonProfilePic');
    addEvent(hexagonSVGEl, 'load', function () {
        var svgDoc = hexagonSVGEl.contentDocument;
        if (svgDoc == null) return;
        var clickArea = svgDoc.getElementById('profilePicClicker');
        addEvent(clickArea, 'click', popupEditProfilePic);
    });
});
