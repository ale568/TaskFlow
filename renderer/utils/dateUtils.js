function formatDate(date, format) {
    if (!(date instanceof Date) || isNaN(date)) {
        throw new Error('Data non valida');
    }

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    } else if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
    } else {
        throw new Error('Formato non supportato');
    }
}

function dateInDays(start, end) {
    if (!(start instanceof Date) || isNaN(start) || !(end instanceof Date) || isNaN(end)) {
        throw new Error('Date non valide');
    }

    const oneDay = 24 * 60 * 60 * 1000; // hours * minutes * seconds * milliseconds
    const diffDays = Math.round(Math.abs((end - start) / oneDay));
    return diffDays;
}

function isFutureDate(date) {
    if (!(date instanceof Date) || isNaN(date)) {
        throw new Error('Data non valida');
    }
    return date > new Date();
}

function addDays(date, days) {
    if (!(date instanceof Date) || isNaN(date)) {
        throw new Error('Data non valida');
    }
    if (typeof days !== 'number' || !Number.isInteger(days)) {
        throw new Error('Numero di giorni non valido');
    }

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