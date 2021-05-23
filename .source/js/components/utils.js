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
<?/*
function deleteEvent(element, types, callback) {
    if (element == null || typeof(element) == 'undefined') return;
    var elements = (isNodeList(element) ? element : [element]);
    var typesArr = types.split(',');
    for (var elI = 0; elI < elements.length; elI++) {
        var el = elements[elI];
        for (var typeI = 0; typeI < typesArr.length; typeI++) {
            var type = typesArr[typeI].replace(/ /g, '');
            if (el.removeEventListener) {
                el.removeEventListener(type, callback, false);
            } else if (el.detachEvent) { // ie
                el.detachEvent('on' + type, callback);
            } else {
                delete el['on' + type];
            }
        }
    }
}
*/?>
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
