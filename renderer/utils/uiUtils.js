/**
 * Aggiorna dinamicamente il testo di un elemento dato il suo id.
 * @param {string} id - L'id dell'elemento.
 * @param {string} text - Il nuovo testo da impostare.
 */
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id "${id}" not found.`);
        return;
    }
    if (text === null || text === undefined) {
        console.error('Text cannot be null or undefined.');
        return;
    }
    element.textContent = text;
}

/**
 * Aggiunge o rimuove una classe CSS da un elemento dato il suo id.
 * @param {string} id - L'id dell'elemento.
 * @param {string} className - Il nome della classe CSS da aggiungere o rimuovere.
 * @throws {Error} Se l'elemento non esiste.
 */
function toggleClass(id, className) {
    const element = document.getElementById(id);
    if (!element) {
        throw new Error(`Element with id "${id}" not found.`);
    }
    element.classList.toggle(className);
}

/**
 * Crea un elemento di notifica UI con classe .notification.
 * @param {string} message - Il messaggio della notifica.
 */
function showNotification(message) {
    if (!message) {
        console.error('Message cannot be empty or null.');
        return;
    }
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000); // Rimuove la notifica dopo 3 secondi
}

/**
 * Associa un evento click a un elemento dato il suo id.
 * @param {string} id - L'id dell'elemento.
 * @param {Function} callback - La funzione di callback da eseguire al click.
 */
function bindClickEvent(id, callback) {
    const element = document.getElementById(id);
    if (!element) {
        console.error(`Element with id "${id}" not found.`);
        return;
    }
    if (typeof callback !== 'function') {
        console.error('Callback must be a function.');
        return;
    }
    element.addEventListener('click', callback);
}

module.exports = {
    updateElementText,
    toggleClass,
    showNotification,
    bindClickEvent
};