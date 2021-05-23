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
<?
// clicking the popup should not close the popup
?>
        event.stopPropagation();
    });
});
