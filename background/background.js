/**
 * Background service worker
 */

console.log('Vibe Coding Detector - Background Script chargé');

// Écouter les messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scanCurrentRepo') {
        // Ouvrir le popup avec l'URL
        try {
            browser.browserAction.openPopup();
        } catch (e) {
            // Fallback
            console.warn("OpenPopup not supported", e);
        }

        // Envoyer l'URL au popup
        chrome.runtime.sendMessage({
            action: 'fillUrl',
            url: request.url
        });
    }

    return true;
});

// Installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Extension Vibe Coding Detector installée !');

        // Ouvrir la page de bienvenue
        chrome.tabs.create({
            url: 'https://github.com'
        });
    }
});
