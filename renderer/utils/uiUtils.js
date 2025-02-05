/**
 * Aggiorna dinamicamente il testo di un elemento dato il suo id.
 * @param {string} id - L'id dell'elemento.
 * @param {string} text - Il nuovo testo da impostare.
 */
function updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Aggiunge o rimuove una classe CSS da un elemento dato il suo id.
 * @param {string} id - L'id dell'elemento.
 * @param {string} className - Il nome della classe CSS da aggiungere o rimuovere.
 */
function toggleClass(id, className) {
    const element = document.getElementById(id);
    if (element) {
        element.classList.toggle(className);
    }
}

/**
 * Crea un elemento di notifica UI con classe .notification.
 * @param {string} message - Il messaggio della notifica.
 */
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
}

/**
 * Associa un evento click a un elemento dato il suo id.
 * @param {string} id - L'id dell'elemento.
 * @param {Function} callback - La funzione di callback da eseguire al click.
 */
function bindClickEvent(id, callback) {
    const element = document.getElementById(id);
    if (element) {
        element.addEventListener('click', callback);
    }
}

module.exports = {
    updateElementText,
    toggleClass,
    showNotification,
    bindClickEvent
};