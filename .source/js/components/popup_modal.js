function showPopup(contentID) {
<?
// copy the content from the holding area into the popup and delete it from the
// holding area, so that ids are not duplicated, and all events for elements are
// destroyed
?>
    var contentEl = document.getElementById(contentID);
    var contentHTML = contentEl.outerHTML;
    contentEl.parentNode.removeChild(contentEl);<?/* delete element */?>

    document.getElementById('popupModal').innerHTML = contentHTML;
    document.getElementById('popupModalBackground').style.display = 'inline-block';
}

function hidePopup() {
<?
// copy the content from the popup into the holding area and delete it from the
// popup, so that ids are not duplicated, and all events for elements are
// destroyed
?>
    var popup = document.getElementById('popupModal');
    var contentElCopy = popup.children[0].cloneNode(true);
    document.getElementById('modalHoldings').appendChild(contentElCopy);
    popup.innerHTML = '';
    document.getElementById('popupModalBackground').style.display = 'none';
}
addEvent(document, 'ready', function () {
    addEvent(document.getElementById('popupModalBackground'), 'click', hidePopup);
    addEvent(document.getElementById('popupModal'), 'click', function (event) {
<?
// clicking the popup should not close the popup
?>
        event.stopPropagation();
    });
});
