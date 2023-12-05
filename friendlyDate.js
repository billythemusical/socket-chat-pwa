// makes the date from the form more readable
function friendlyDate(theDate) {
    // Convert the date to a more readable format and round to the nearest half hour
    const date = new Date(theDate);
    // date.setMinutes(Math.round(date.getMinutes() / 30) * 30);
    const dateString = date.toLocaleString('en-US', {
        weekday: 'short', // "Thu"
        month: 'short',   // "Dec"
        day: 'numeric',   // "14"
        hour: 'numeric',  // "12 PM"
        minute: 'numeric',
        second: 'numeric',
        hour12: true
    });
    return dateString;
}

module.exports = friendlyDate