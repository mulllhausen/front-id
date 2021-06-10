function trim(str) {
    return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
}
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
function toLocalStorage(k,v) {
    localStorage.setItem(k, JSON.stringify(v));
}
function fromLocalStorage(k) {
    return JSON.parse(localStorage.getItem(k));
}
function jsonCopyObject(obj) {
    return JSON.parse(JSON.stringify(obj));
}
function addCSSClass(el, newClass) {
    if (el == null) return;<?/* there is no element to add a class to */?>
    var classList = el.className.split(/\s+/);
    classList.push(newClass);
    el.className = classList.join(' ');
}
function removeCSSClass(el, removeClass) {
    if (el == null) return;<?/* there is no element to remove a class from */?>
    var classList = el.className.split(/\s+/);
    var i = classList.indexOf(removeClass);
    if (i == -1) return;<?/* not found */?>
    classList.splice(i, 1);<?/* remove 1 list item */?>
    el.className = classList.join(' ');
}
function getMonthName(monthNumber) {
<?
// note: 0 = January
?>
    var date = new Date(2000, monthNumber, 1);
    return date.toLocaleString('default', { month: 'long' });
}
