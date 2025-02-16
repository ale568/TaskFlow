function formatDate(date, format) {
    if (!date) return null;
    
    // Se la data è una stringa, proviamo a convertirla
    if (typeof date === 'string') {
        date = new Date(date);
    }

    if (!(date instanceof Date) || isNaN(date)) {
        return null;
    }

    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);

    if (format === 'YYYY-MM-DD') {
        return `${year}-${month}-${day}`;
    } else if (format === 'DD/MM/YYYY') {
        return `${day}/${month}/${year}`;
    } else if (format === 'MM/DD/YYYY') {
        return `${month}/${day}/${year}`;
    } else {
        return null; // Restituisce null invece di lanciare un errore
    }
}

function dateInDays(start, end) {
    if (!start || !end) return 0;

    if (typeof start === 'string') start = new Date(start);
    if (typeof end === 'string') end = new Date(end);

    if (!(start instanceof Date) || isNaN(start) || !(end instanceof Date) || isNaN(end)) {
        return 0;
    }

    const oneDay = 24 * 60 * 60 * 1000; // ore * minuti * secondi * millisecondi
    const diffDays = Math.round((end - start) / oneDay);
    return diffDays;
}

function isFutureDate(date) {
    if (!date) return false;

    if (typeof date === 'string') date = new Date(date);

    if (!(date instanceof Date) || isNaN(date)) {
        return false;
    }
    return date > new Date();
}

function addDays(date, days) {
    if (!date || typeof days !== 'number' || !Number.isInteger(days)) return null;

    if (typeof date === 'string') date = new Date(date);

    if (!(date instanceof Date) || isNaN(date)) {
        return null;
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
