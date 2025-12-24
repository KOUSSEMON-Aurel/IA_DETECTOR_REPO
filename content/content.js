/**
 * Content script injecté dans les pages GitHub/GitLab
 */

console.log('🤖 Vibe Coding Detector activé');

// Détecter la plateforme
const isGitHub = window.location.hostname.includes('github.com');
const isGitLab = window.location.hostname.includes('gitlab.com');

if (!isGitHub && !isGitLab) {
    console.log('Page non supportée');
}

// Ajouter un bouton dans l'interface
function injectDetectorButton() {
    if (isGitHub) {
        injectGitHubButton();
    } else if (isGitLab) {
        injectGitLabButton();
    }
}

function injectGitHubButton() {
    // Attendre que la page soit chargée
    setTimeout(() => {
        const actionList = document.querySelector('.file-navigation .d-flex');

        if (actionList && !document.getElementById('vibe-detector-btn')) {
            const btn = document.createElement('button');
            btn.id = 'vibe-detector-btn';
            btn.className = 'btn btn-sm';
            btn.style.cssText = `
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        margin-left: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
      `;
            btn.innerHTML = `
        <span>🤖</span>
        <span>Scan IA</span>
      `;

            btn.addEventListener('click', () => {
                chrome.runtime.sendMessage({
                    action: 'scanCurrentRepo',
                    url: window.location.href
                });
            });

            actionList.appendChild(btn);
        }
    }, 1000);
}

function injectGitLabButton() {
    // Similaire pour GitLab
    setTimeout(() => {
        const navbar = document.querySelector('.tree-controls');

        if (navbar && !document.getElementById('vibe-detector-btn')) {
            const btn = document.createElement('button');
            btn.id = 'vibe-detector-btn';
            btn.className = 'btn btn-default btn-sm';
            btn.innerHTML = '🤖 Scan IA';

            btn.addEventListener('click', () => {
                chrome.runtime.sendMessage({
                    action: 'scanCurrentRepo',
                    url: window.location.href
                });
            });

            navbar.appendChild(btn);
        }
    }, 1000);
}

// Highlight des lignes suspectes (à implémenter)
function highlightSuspiciousLines(lineNumbers) {
    // TODO: Ajouter surlignage visuel dans le code source
}

// Initialisation
if (isGitHub || isGitLab) {
    injectDetectorButton();

    // Observer les changements de page (SPA)
    const observer = new MutationObserver(() => {
        if (!document.getElementById('vibe-detector-btn')) {
            injectDetectorButton();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Écouter les messages du background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'highlightLines') {
        highlightSuspiciousLines(request.lines);
        sendResponse({ success: true });
    }
});
