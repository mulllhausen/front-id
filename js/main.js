// todo - bomb out if any function is not supported

/* utils **********************************************************************/

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
    if (el == null) return; 
    var classList = el.className.split(/\s+/);
    classList.push(newClass);
    el.className = classList.join(' ');
}
function removeCSSClass(el, removeClass) {
    if (el == null) return; 
    var classList = el.className.split(/\s+/);
    var i = classList.indexOf(removeClass);
    if (i == -1) return; 
    classList.splice(i, 1); 
    el.className = classList.join(' ');
}
function getMonthName(monthNumber) {
    var date = new Date(2000, monthNumber, 1);
    return date.toLocaleString('default', { month: 'long' });
}

/* popup modal ****************************************************************/

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

/* edit profile pic ***********************************************************/

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
    tmpUploadedImageBase64 = ''; 
    hidePopup();
}
function changePicHandler() {
}
function cropPicHandler() {
}
function donePicHandler() {
    if (tmpUploadedImageBase64 == '') return hidePopup();

    var profile = fromLocalStorage('profile');
    if (profile == null) profile = {}; 
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

/* edit profile data **********************************************************/

addEvent(document, 'ready', function() {
    var profileObj = fromLocalStorage('profile');
    setProfileDataInGUI(profileObj);

    addEvent(
        document.getElementById('profileDataBirthYear'),
        'change',
        profileDataBirthdayChanged
    );
    addEvent(
        document.getElementById('profileDataBirthMonth'),
        'change',
        profileDataBirthdayChanged
    );
    addEvent(
        document.getElementById('profileDataBirthDay'),
        'change',
        profileDataBirthdayChanged
    );
    addEvent(
        document.getElementById('profileDataClearAll'),
        'click',
        profileDataClearAll
    );
    addEvent(
        document.getElementById('profileDataSave'),
        'click',
        profileDataSave
    );
    addEvent(
        document.getElementById('profileDataCancel'),
        'click',
        profileDataCancel
    );
});

var daysPerMonth = {"1":31,"2":28,"3":31,"4":30,"5":31,"6":30,"7":31,"8":31,"9":30,"10":31,"11":30,"12":31};
daysPerMonthLeapYear = jsonCopyObject(daysPerMonth);
daysPerMonthLeapYear['2'] = 29; 

function profileDataBirthdayChanged() {
// todo - hide invalid days when month selected (assume leap year unless year is selected)
// todo - hide invalid days when year and month selected

    var yearEl = document.getElementById('profileDataBirthYear');
    var monthEl = document.getElementById('profileDataBirthMonth');
    var dayEl = document.getElementById('profileDataBirthDay');

    var daysInSelectedMonth = 31; 
    if (monthEl.value != '') {
        daysInSelectedMonth = daysPerMonthLeapYear[monthEl.value];
        if (yearEl.value != '' && !isLeapYear(yearEl.value)) {
            daysInSelectedMonth = daysPerMonth[monthEl.value];
        }
    }
    for (var day = 28; day <= 31; day++) {
        dayEl.options[day.toString()].disabled = (day > daysInSelectedMonth);
    }

    var checkBirthDay = validDay(
        (dayEl.value == '')   ? null : parseInt(dayEl.value),
        (monthEl.value == '') ? null : parseInt(monthEl.value),
        (yearEl.value == '')  ? null : parseInt(yearEl.value)
    );
    var errorEl = document.getElementById('profileDataBirthdayError');
    if (checkBirthDay == true) {
        removeCSSClass(dayEl, 'invalid');
        errorEl.innerHTML = '';
        errorEl.style.display = 'none';
        return;
    }

    addCSSClass(dayEl, 'invalid');
    errorEl.innerHTML = checkBirthDay;
    errorEl.style.display = 'block';
}

function validDay(selectedDay, selectedMonth, selectedYear) {
    if (selectedMonth == null) return true;
    if (selectedDay == null) return true;
    var daysInSelectedMonth = daysPerMonthLeapYear[selectedMonth.toString()];
    if (selectedDay > daysInSelectedMonth) {
        if (selectedMonth == '02') return getMonthName(selectedMonth - 1) +
        ' has ' + daysInSelectedMonth + ' days at most';

        return getMonthName(selectedMonth - 1) + ' only has ' +
        daysInSelectedMonth + ' days';
    }
    if (selectedYear == null) return true;
    if (isLeapYear(selectedYear)) return true;
    daysInSelectedMonth = daysPerMonth[selectedMonth.toString()];
    if (selectedDay > daysInSelectedMonth) {
        return getMonthName(selectedMonth - 1) + ' only has ' +
        daysInSelectedMonth + ' days in non-leap-years';
    }

    return true;
}

function isLeapYear(year) {
    if ((year % 4) != 0) return false;
    if ((year % 400) == 0) return true;
    if ((year % 100) == 0) return false;
    return true;
}

function profileDataClearAll() {
    var profileObj = {};
    setProfileDataInGUI(profileObj);
}

function profileDataSave() {
    var profileObj = fromLocalStorage('profile');
    var profileDataFromGUI = getProfileDataFromGUI();
    for (var k in profileDataFromGUI) {
        profileObj[k] = profileDataFromGUI[k];
    }
    toLocalStorage('profile', profileObj);
}

function profileDataCancel() {
    var profileObj = fromLocalStorage('profile');
    setProfileDataInGUI(profileObj);
}

function getProfileDataFromGUI() {
    var profileObj = {};

    var profileDataName = trim(document.getElementById('profileDataName').value);
    if (profileDataName != '') profileObj.Name = profileDataName;

    var selectedMonth = document.getElementById('profileDataBirthMonth').value;
    if (selectedMonth < 10) selectedMonth = '0' + selectedMonth;
    var profileDataBirthday =
    document.getElementById('profileDataBirthYear').value + '-' +
    selectedMonth + '-' +
    document.getElementById('profileDataBirthDay').value;
    if (profileDataBirthday.length == 10) {
        profileObj.Birthday = profileDataBirthday;
    } else if (profileDataBirthday.length == 2) {
        profileObj.Birthday = null;
    }

    var profileDataCity = trim(document.getElementById('profileDataCity').value);
    if (profileDataCity != '') profileObj.City = profileDataCity;

    var profileDataCountry = trim(document.getElementById('profileDataCountry').value);
    if (profileDataCountry != '') profileObj.Country = profileDataCountry;

    return profileObj;
}

function setProfileDataInGUI(profileObj) {
    var name = ''; 

    if (profileObj.Name != null) name = profileObj.Name;
    document.getElementById('profileDataName').value = name;

    var birthday = ['', '', '']; 
    if (profileObj.Birthday != null) birthday = profileObj.Birthday.split('-');
    document.getElementById('profileDataBirthYear').value = birthday[0];
    document.getElementById('profileDataBirthMonth').value = birthday[1];
    document.getElementById('profileDataBirthDay').value = birthday[2];

    var city = ''; 
    if (profileObj.City != null) city = profileObj.City;
    document.getElementById('profileDataCity').value = city;

    var country = ''; 
    if (profileObj.Country != null) country = profileObj.Country;
    document.getElementById('profileDataCountry').value = country;
}
