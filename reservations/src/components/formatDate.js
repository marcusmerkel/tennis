function formatDate(date) {
    let d = new Date(date);
    let month = String(d.getMonth() + 1);
    let day = String(d.getDate());
    let year = String(d.getFullYear());

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

export default formatDate;