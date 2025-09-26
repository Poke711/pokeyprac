// js/utils.js


export function correctXCamTime(value) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
        return '0.00';
    }

    // Work with integers to avoid floating-point math errors
    const hundredths = Math.round(numValue * 100);
    const lastDigit = hundredths % 10;
    let newLastDigit = lastDigit; // Default to no change

    // Apply the custom rounding map
    // 1, 2, 9 round to 0
    if ([1, 2, 9].includes(lastDigit)) {
        newLastDigit = 0;
    // 4 rounds to 3
    } else if (lastDigit === 4) {
        newLastDigit = 3;
    // 5, 7, 8 round to 6
    } else if ([5, 7, 8].includes(lastDigit)) {
        newLastDigit = 6;
    }
    // Digits 0, 3, and 6 are left untouched

    // Calculate the new value
    const newHundredths = (hundredths - lastDigit) + newLastDigit;
    
    return (newHundredths / 100).toFixed(2);
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