function formatDate(date, format) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    } else if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
    } else {
        throw new Error('Formato non supportato');
    }
}

function dateInDays(start, end) {
    const oneDay = 24 * 60 * 60 * 1000; // ore * minuti * secondi * millisecondi
    const diffDays = Math.round(Math.abs((end - start) / oneDay));
    return diffDays;
}

function isFutureDate(date) {
    return date > new Date();
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

module.exports = {
    formatDate,
    dateInDays,
    isFutureDate,
    addDays
};