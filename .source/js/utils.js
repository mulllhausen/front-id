<?php

if (!defined("processing_dir")) define("processing_dir", $argv[1]);
include_once(processing_dir."/functions.php");
file_not_in_production(__FILE__);

?>
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
