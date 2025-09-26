// js/utils.js

// Returns an object with total hundredths, or null if invalid.
function parseTimeToParts(timeStr) {
    if (typeof timeStr !== 'string' || !timeStr.trim()) {
        return null;
    }
    const sanitizedStr = timeStr.trim();
    let minutes = 0;
    let seconds = 0;
    let hundredths = 0;

    const parts = sanitizedStr.split(':');
    let secondsPart;

    if (parts.length > 2) return null; // Invalid format e.g., "1:2:3"

    if (parts.length === 2) {
        minutes = parseInt(parts[0], 10);
        secondsPart = parts[1];
    } else {
        secondsPart = parts[0];
    }

    const secParts = secondsPart.split('.');
    if (secParts.length > 2) return null; // Invalid format e.g., "50.3.3"

    seconds = parseInt(secParts[0], 10);
    if (secParts.length === 2) {
        // Pad the hundredths to ensure "5.3" becomes 5.30
        hundredths = parseInt(secParts[1].padEnd(2, '0').substring(0, 2), 10);
    }
    
    if (isNaN(minutes) || isNaN(seconds) || isNaN(hundredths)) {
        return null;
    }

    const totalHundredths = (minutes * 60 * 100) + (seconds * 100) + hundredths;
    return { totalHundredths };
}

function formatHundredthsToTime(totalHundredths) {
    if (isNaN(totalHundredths) || totalHundredths < 0) {
        return '0.00';
    }

    const minutes = Math.floor(totalHundredths / 6000);
    const remainingHundredths = totalHundredths % 6000;
    const seconds = Math.floor(remainingHundredths / 100);
    const hundredths = remainingHundredths % 100;

    const secondsStr = String(seconds).padStart(2, '0');
    const hundredthsStr = String(hundredths).padStart(2, '0');

    if (minutes > 0) {
        return `${minutes}:${secondsStr}.${hundredthsStr}`;
    } else {
        // For values under a minute, just show seconds.
        return `${seconds}.${hundredthsStr}`;
    }
}


export function correctXCamTime(value) {
    const parts = parseTimeToParts(value);
    if (!parts) {
        return '0.00';
    }

    let totalHundredths = parts.totalHundredths;
    const lastDigit = totalHundredths % 10;
    let newLastDigit = lastDigit;

    if ([1, 2, 9].includes(lastDigit)) newLastDigit = 0;
    else if (lastDigit === 4) newLastDigit = 3;
    else if ([5, 7, 8].includes(lastDigit)) newLastDigit = 6;

    const newTotalHundredths = (totalHundredths - lastDigit) + newLastDigit;
    
    return formatHundredthsToTime(newTotalHundredths);
}


export function isLocalStorageAvailable() {
    try {
        const storage = window.localStorage;
        const x = '__storage_test__';
        storage.setItem(x, x);
        storage.removeItem(x);
        return true;
    } catch (e) {
        return false;
    }
}

export function showSuccessPopup(message) {
    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.textContent = message;
    document.body.appendChild(popup);
    setTimeout(() => popup.classList.add('show'), 10);
    setTimeout(() => {
        popup.classList.remove('show');
        popup.addEventListener('transitionend', () => popup.remove());
    }, 3000);
}

export { parseTimeToParts, formatHundredthsToTime };