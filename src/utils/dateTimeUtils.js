function isValidDateFormat(dateString) {
    const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
    return regex.test(dateString);
};

function isValidTimeFormat(timeString) {
    const regex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(timeString);
};

module.exports = { isValidDateFormat, isValidTimeFormat };
