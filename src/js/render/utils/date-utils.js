function getCurrentDateString() {
    const date = new Date()
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')

    return `${year}-${month}-${day}`
}

function parseDateToLocalString(dateString) {
    const dateParts = dateString.split('-')
    return new Date(
        dateParts[0],
        dateParts[1] - 1,
        dateParts[2]
    ).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    })
}

function parseDateTimeToLocalString(dateTimeString) {
    return parseDateToLocalString(dateTimeString.split(' ')[0])
}

export {
    getCurrentDateString,
    parseDateToLocalString,
    parseDateTimeToLocalString,
}
