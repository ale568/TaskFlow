/**
 * Aggiorna dinamicamente il testo di un elemento dato il suo id.
 * @param {string} elementId - L'id dell'elemento.
 * @param {string} newText - Il nuovo testo da impostare.
 */
function updateElementText(elementId, newText) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found.`);
        return;
    }
    element.textContent = newText ?? '';
}

/**
 * Aggiunge o rimuove una classe CSS da un elemento dato il suo id.
 * @param {string} elementId - L'id dell'elemento.
 * @param {string} className - Il nome della classe CSS da aggiungere o rimuovere.
 * @throws {Error} Se l'elemento non esiste.
 */
function toggleClass(elementId, className) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id "${elementId}" not found.`);
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
        if (notification.parentNode) {
            document.body.removeChild(notification);
        }
    }, 3000); // Rimuove la notifica dopo 3 secondi
}

/**
 * Associa un evento click a un elemento dato il suo id.
 * @param {string} elementId - L'id dell'elemento.
 * @param {Function} callback - La funzione di callback da eseguire al click.
 * @throws {Error} Se l'elemento non esiste o callback non è una funzione.
 */
function bindClickEvent(elementId, callback) {
    const element = document.getElementById(elementId);
    if (!element) {
        throw new Error(`Element with id "${elementId}" not found.`);
    }
    if (typeof callback !== 'function') {
        throw new Error('Callback must be a function.');
    }
    element.addEventListener('click', callback);
}

module.exports = {
    updateElementText,
    toggleClass,
    showNotification,
    bindClickEvent
};