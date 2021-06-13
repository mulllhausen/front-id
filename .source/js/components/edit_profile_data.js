<?
// the purpose of these functions is to assist the user to get their own
// information correct. incorrect data is prevented from being entered via the
// gui. but since this is a front-end only website, enforcing validation rules
// to the localStorage object is not possible. the user could manually edit
// their own profile object in localStorage to set their birthday to
// 'abracadabra' if they want to. that is ok - it just means that other websites
// must validate any data they get from frontID via the API - they always should
// validate all user input anyway so this is no imposition.
?>
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

<?
$days_per_month_dict = [];
$non_leap_year = 2001;
for ($month = 1; $month <= 12; $month++)
{
    $days_per_month_dict[$month] =
    cal_days_in_month(CAL_GREGORIAN, $month, $non_leap_year);
}
?>
var daysPerMonth = <? echo json_encode($days_per_month_dict); ?>;
daysPerMonthLeapYear = jsonCopyObject(daysPerMonth);
daysPerMonthLeapYear['2'] = 29;<?/* february - 29 days */?> 

function profileDataBirthdayChanged() {
// todo - hide invalid days when month selected (assume leap year unless year is selected)
// todo - hide invalid days when year and month selected

    var yearEl = document.getElementById('profileDataBirthYear');
    var monthEl = document.getElementById('profileDataBirthMonth');
    var dayEl = document.getElementById('profileDataBirthDay');

    var daysInSelectedMonth = 31;<?/* start optimistic */?> 
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
<?
// check valid day of month, taking into account leap year
?>
<?
// if no month is selected then any day is valid
?>
    if (selectedMonth == null) return true;
<?
// if no day is selected then the day cannot be invalid
?>
    if (selectedDay == null) return true;
<?
// first check against the maximum number of days per month. this occurs in a
// leap year
?>
    var daysInSelectedMonth = daysPerMonthLeapYear[selectedMonth.toString()];
    if (selectedDay > daysInSelectedMonth) {
        if (selectedMonth == '02') return getMonthName(selectedMonth - 1) +
        ' has ' + daysInSelectedMonth + ' days at most';

        return getMonthName(selectedMonth - 1) + ' only has ' +
        daysInSelectedMonth + ' days';
    }
<?
// if no year was selected then we have already finished all our validation,
// since we validated for a leap-year, and for all we know this could be a leap-
// year
?>
    if (selectedYear == null) return true;
<?
// if a leap-year was selected then we have already finished all our validation
?>
    if (isLeapYear(selectedYear)) return true;
<?
// validate for non-leap-years. only february could fail this test, since all
// other months have the same number of days regardless of leap-year
?>
    daysInSelectedMonth = daysPerMonth[selectedMonth.toString()];
    if (selectedDay > daysInSelectedMonth) {
        return getMonthName(selectedMonth - 1) + ' only has ' +
        daysInSelectedMonth + ' days in non-leap-years';
    }

    return true;
}

function isLeapYear(year) {
<?
// timeanddate.com/date/leapyear.html#rules
// - the year must be evenly divisible by 4
// - if the year can also be evenly divided by 100, it is not a leap year unless
// - the year is also evenly divisible by 400 - then it is a leap year

// note that only max_human_age years, counting back from the present, need be
// validated. so no need to validate negative numbers.
?>
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
    var name = '';<?/* init */?> 

    if (profileObj.Name != null) name = profileObj.Name;
    document.getElementById('profileDataName').value = name;

    var birthday = ['', '', ''];<?/* init */?> 
    if (profileObj.Birthday != null) birthday = profileObj.Birthday.split('-');
    document.getElementById('profileDataBirthYear').value = birthday[0];
    document.getElementById('profileDataBirthMonth').value = birthday[1];
    document.getElementById('profileDataBirthDay').value = birthday[2];

    var city = '';<?/* init */?> 
    if (profileObj.City != null) city = profileObj.City;
    document.getElementById('profileDataCity').value = city;

    var country = '';<?/* init */?> 
    if (profileObj.Country != null) country = profileObj.Country;
    document.getElementById('profileDataCountry').value = country;
}
