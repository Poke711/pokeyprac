// js/utils.js


export function correctXCamTime(value) {
    if (isNaN(value) || value <= 0) return "0.00";

    const valueStr = value.toString();
    const parts = valueStr.split('.');
    
    const secondsPart = parseInt(parts[0], 10);
    let hundredthsPart = 0;

    if (parts.length > 1) {
        // Pad with '0' to handle cases like "12.5" -> "50"
        const hundredthsStr = parts[1].padEnd(2, '0').substring(0, 2);
        hundredthsPart = parseInt(hundredthsStr, 10);
    }

    // This is now a guaranteed-precise integer representation of the time.
    const valueInHundredths = (secondsPart * 100) + hundredthsPart;
    // --- END OF FIX ---

    const FRAME_IN_HUNDREDTHS = 3;
    
    // The rest of the logic is now reliable because the input is precise.
    const frames = Math.floor(valueInHundredths / FRAME_IN_HUNDREDTHS);
    let snappedHundredths = frames * FRAME_IN_HUNDREDTHS;
    
    if (snappedHundredths % 10 === 9) {
        snappedHundredths += 1;
    }
    
    return (snappedHundredths / 100).toFixed(2);
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