/**
 * Logique du popup
 */

import { scanRepository } from '../scanners/repo-scanner.js';
import * as githubClient from '../api/github-client.js'; // Import global pour accès à getFileContent etc
import { getRepoTree } from '../api/github-client.js'; // Gardé pour compatibilité existante
import { analyzeFile, analyzeRepository, getVerdict } from '../analyzer/scorer.js'; // Import des fonctions d'analyse réelles
import { initI18n, t, setLang, getCurrentLang } from './i18n.js';

// État de l'application
let currentMode = 'repo';
let currentResults = null;

// Éléments DOM
const urlInputSection = document.getElementById('url-input-section');
const loadingSection = document.getElementById('loading-section');
const resultsSection = document.getElementById('results-section');
const scanButton = document.getElementById('scan-button');
const repoUrlInput = document.getElementById('repo-url');

/**
 * Logique du File Picker - Variables
 */
// import { getRepoTree } from '../api/github-client.js'; // Déjà importé ou gérer l'import en haut du fichier si module

const browseBtn = document.getElementById('browse-btn');
const modal = document.getElementById('file-picker-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const fileTreeContainer = document.getElementById('file-tree-container');

/**
 * Gestion des Paramètres (Token) - Variables
 */
// Éléments DOM Settings Modal
const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const githubTokenInput = document.getElementById('github-token');
const modalLangSelect = document.getElementById('modal-lang-select');
const modalThemeToggle = document.getElementById('modal-theme-toggle');
const settingsAlert = document.getElementById('settings-alert');

// Initialisation
document.addEventListener('DOMContentLoaded', async () => {
    initModeSwitching();
    initScanButton();
    initTabs();
    initFilePicker();

    // Charger préférences
    await initPreferences();

    initSettings(); // Listeners

    // Charger état session
    await loadState();
});

/**
 * Initialisation des préférences (Thème + Langue)
 */
async function initPreferences() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['theme', 'lang'], (result) => {
            // Thème
            const theme = result.theme || 'dark'; // Default dark
            applyTheme(theme);

            // Langue
            if (result.lang) {
                setLang(result.lang);
            } else {
                initI18n(); // Auto-detect
            }

            resolve();
        });
    });
}

function initSettings() {
    if (!settingsBtn) return;

    settingsBtn.addEventListener('click', openSettings);

    if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);

    // Lang Change
    if (modalLangSelect) {
        modalLangSelect.addEventListener('change', (e) => {
            const newLang = e.target.value;
            setLang(newLang);
            chrome.storage.local.set({ lang: newLang });
        });
    }

    // Theme Toggle
    if (modalThemeToggle) {
        modalThemeToggle.addEventListener('click', toggleTheme);
    }

    if (settingsModal) {
        settingsModal.addEventListener('click', (e) => {
            if (e.target === settingsModal) closeSettings();
        });
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    applyTheme(newTheme);
    chrome.storage.local.set({ theme: newTheme });
    updateThemeUI(newTheme);
}

function applyTheme(theme) {
    if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
        document.body.removeAttribute('data-theme');
    }
}

function updateThemeUI(theme) {
    // Update button text/icons inside modal logic handles by CSS classes mostly
    // But we might want to change text? "Mode Sombre" vs "Mode Clair"?
    // The label says "Apparence", the button says "Mode Sombre".
    // If logic is "Switch to...", then:
    // Dark mode active -> Button shows Sun icon?
    // Let's rely on CSS show/hide we added earlier for .icon-sun/moon
    // Check popup.css lines 169+
}

function createFileIcon() {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.style.marginRight = "6px";
    svg.style.color = "var(--text-secondary)";

    // Path
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z");
    svg.appendChild(path);

    // Polyline
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", "13 2 13 9 20 9");
    svg.appendChild(polyline);

    return svg;
}

function openSettings(errorMsg = null) {
    // If called by event listener, errorMsg is an Event object
    if (errorMsg && typeof errorMsg !== 'string') {
        errorMsg = null;
    }

    // Sync inputs
    if (modalLangSelect) modalLangSelect.value = getCurrentLang();

    // ... existing token logic ...
    // Gestion du message d'erreur
    if (errorMsg && settingsAlert) {
        settingsAlert.textContent = errorMsg;
        settingsAlert.classList.remove('hidden');
    } else if (settingsAlert) {
        settingsAlert.classList.add('hidden');
        settingsAlert.textContent = '';
    }

    // Charger token actuel
    chrome.storage.local.get(['githubToken'], (result) => {
        if (result.githubToken && githubTokenInput) {
            githubTokenInput.value = result.githubToken;
        }
    });

    // Sauvegarder l'onglet précédent pour y revenir si besoin (UX optionnelle)
    settingsModal.classList.remove('hidden');
}

function closeSettings() {
    settingsModal.classList.add('hidden');
}

function saveSettings() {
    const token = githubTokenInput.value.trim();
    chrome.storage.local.set({ githubToken: token }, () => {
        alert('Paramètres sauvegardés !');
        closeSettings();
    });
}

/**
 * Récupère le token stocké
 */
async function getStoredToken() {
    return new Promise((resolve) => {
        chrome.storage.local.get(['githubToken'], (result) => {
            resolve(result.githubToken || null);
        });
    });
}

/**
 * Gestion des modes de scan
 */
function initModeSwitching() {
    const modeBtns = document.querySelectorAll('.mode-btn');

    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateUIForMode();
            saveState(); // Sauvegarder changement de mode
        });
    });
}

function updateUIForMode() {
    const placeholder = {
        repo: 'https://github.com/user/repo',
        file: 'URL du fichier GitHub',
        folder: 'https://github.com/user/repo/tree/main/src'
    };

    repoUrlInput.placeholder = placeholder[currentMode];

    // Gérer la visibilité du bouton Parcourir
    if (currentMode === 'file' || currentMode === 'folder') {
        browseBtn.style.display = 'flex';
        browseBtn.classList.remove('hidden');
    } else {
        browseBtn.style.display = 'none';
        browseBtn.classList.add('hidden');
    }

    // Mettre à jour visuellement les boutons de mode
    document.querySelectorAll('.mode-btn').forEach(btn => {
        if (btn.dataset.mode === currentMode) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

// Initialiser le picker
function initFilePicker() {
    browseBtn.addEventListener('click', openFilePicker);
    closeModalBtn.addEventListener('click', closeFilePicker);

    // Fermer si clic en dehors
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeFilePicker();
    });
}

async function openFilePicker() {
    const url = repoUrlInput.value.trim();
    if (!url) {
        alert("Veuillez d'abord entrer l'URL du dépôt");
        return;
    }

    modal.classList.remove('hidden');
    fileTreeContainer.innerHTML = '';
    const spinner = document.createElement('div');
    spinner.className = 'loading-spinner';
    const text = document.createElement('div');
    text.style.textAlign = 'center';
    text.style.color = 'var(--text-secondary)';
    text.style.marginTop = '10px';
    text.textContent = 'Chargement de l\'arbre...';
    fileTreeContainer.appendChild(spinner);
    fileTreeContainer.appendChild(text);

    try {
        const tree = await fetchRepoTree(url);
        renderFileTree(tree);
    } catch (error) {
        fileTreeContainer.innerHTML = '';
        const errDiv = document.createElement('div');
        errDiv.style.color = 'var(--error-color)';
        errDiv.style.textAlign = 'center';
        errDiv.style.padding = '20px';

        const p = document.createElement('p');
        p.textContent = `Erreur: ${error.message}`;
        errDiv.appendChild(p);

        if (error.message.includes('403')) {
            const subP = document.createElement('p');
            subP.style.fontSize = '12px';
            subP.style.marginTop = '10px';
            subP.textContent = '⚠️ Limite API atteinte. Réessayez plus tard ou configurez un token.';
            errDiv.appendChild(subP);
        }
        fileTreeContainer.appendChild(errDiv);
    }
}

function closeFilePicker() {
    modal.classList.add('hidden');
}

// Cache simple pour l'arbre
let cachedTree = null;
let cachedTreeUrl = null;

async function fetchRepoTree(url) {
    const repoBase = getRepoBase(url); // implémenté plus haut
    if (!repoBase) throw new Error("URL invalide");

    if (cachedTree && cachedTreeUrl === repoBase) {
        return cachedTree;
    }

    // Récupérer le token
    const token = await getStoredToken();

    // Appel à l'API (via github-client ou gitlab-client)
    const tree = await getRepoTree(url, token);

    cachedTree = tree;
    cachedTreeUrl = repoBase;
    return tree;
}

function renderFileTree(tree) {
    fileTreeContainer.innerHTML = '';

    // Trier: Dossiers d'abord, puis fichiers
    const sorted = tree.sort((a, b) => {
        if (a.type === b.type) return a.path.localeCompare(b.path);
        return a.type === 'tree' ? -1 : 1; // 'tree' comes before 'blob'
    });

    // Pour éviter d'afficher 10000 fichiers, on affiche juste la racine ou une structure simplifiée
    // Ici on affiche une liste plate filtrable pour simplifier l'UX dans un premier temps

    const list = document.createElement('div');

    // Input de filtre
    const filterInput = document.createElement('input');
    filterInput.type = 'text';
    filterInput.placeholder = 'Filtrer...';
    filterInput.style.width = '100%';
    filterInput.style.marginBottom = '10px';
    filterInput.style.padding = '8px';
    filterInput.style.background = 'var(--bg-secondary)';
    filterInput.style.border = '1px solid var(--border-color)';
    filterInput.style.color = 'var(--text-primary)';
    filterInput.style.borderRadius = '6px';

    filterInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const items = list.querySelectorAll('.tree-item');
        items.forEach(item => {
            const path = item.dataset.path.toLowerCase();
            item.style.display = path.includes(term) ? 'flex' : 'none';
        });
    });

    fileTreeContainer.appendChild(filterInput);
    fileTreeContainer.appendChild(list);

    sorted.forEach(node => {
        // Filtrer selon le mode
        if (currentMode === 'folder' && node.type !== 'tree') return;

        const el = document.createElement('div');
        el.className = `tree - item ${node.type === 'tree' ? 'folder' : 'file'} `;
        el.dataset.path = node.path;
        const iconSpan = document.createElement('span');
        iconSpan.textContent = node.type === 'tree' ? '📁' : '📄';

        const pathSpan = document.createElement('span');
        pathSpan.textContent = node.path;

        el.appendChild(iconSpan);
        el.appendChild(pathSpan);

        el.addEventListener('click', () => {
            selectPath(node.path);
        });

        list.appendChild(el);
    });
}

function selectPath(path) {
    // Reconstruire l'URL complète
    // Base: github.com/user/repo
    const repoBase = getRepoBase(repoUrlInput.value);
    const platform = repoUrlInput.value.includes('gitlab.com') ? 'gitlab.com' : 'github.com';

    let newUrl = '';
    if (currentMode === 'file') {
        newUrl = `https://${platform}/${repoBase}/blob/main/${path}`; // "main" est une supposition, idéalement on garde la branche
    } else {
        newUrl = `https://${platform}/${repoBase}/tree/main/${path}`;
    }

    repoUrlInput.value = newUrl;
    saveState();
    closeFilePicker();
}


/**
 * Charge l'état sauvegardé ou initialise depuis l'onglet actuel
 */
async function loadState() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentTabUrl = tab ? tab.url : '';

        // Récupérer l'état stocké
        const stored = await chrome.storage.local.get(['vibeState']);
        const state = stored.vibeState;

        // Est-ce qu'on est toujours sur le même repo ?
        // On extrait la base du repo (github.com/user/repo) pour comparer
        const currentRepoBase = getRepoBase(currentTabUrl);
        const storedRepoBase = state ? getRepoBase(state.repoUrl) : null;

        if (state) {
            const isSameRepo = currentRepoBase && storedRepoBase && currentRepoBase === storedRepoBase;
            const isRecent = (Date.now() - (state.timestamp || 0)) < 24 * 60 * 60 * 1000; // 24h

            if (isSameRepo || (isRecent && !currentRepoBase)) {
                console.log('🔄 Restauration de la session précédente');


                // 1. Restaurer URL et Mode
                repoUrlInput.value = state.repoUrl || currentTabUrl;
                currentMode = state.mode || 'repo';
                updateUIForMode();

                // Restaurer Deep Scan
                const deepScanCheckbox = document.getElementById('deep-scan-checkbox');
                if (state.isDeepScan && deepScanCheckbox) {
                    deepScanCheckbox.checked = true;
                }

                // 2. Restaurer Résultats
                if (state.results) {
                    currentResults = state.results;
                    displayResults(currentResults);
                }
            } else {
                console.log('🆕 Nouvelle session détectée');
                // Nouvelle session : on prend l'URL de l'onglet
                if (currentTabUrl && (currentTabUrl.includes('github.com') || currentTabUrl.includes('gitlab.com'))) {
                    repoUrlInput.value = currentTabUrl;
                }
                // Reset mode par défaut
                currentMode = 'repo';
                updateUIForMode();
            }
        }
    } catch (error) {
        console.error('Erreur chargement état:', error);
    }
}

/**
 * Sauvegarde l'état actuel
 */
function saveState() {
    const deepScanCheckbox = document.getElementById('deep-scan-checkbox');
    const state = {
        repoUrl: repoUrlInput.value,
        mode: currentMode,
        results: currentResults,
        timestamp: Date.now(),
        isDeepScan: deepScanCheckbox ? deepScanCheckbox.checked : false
    };
    chrome.storage.local.set({ vibeState: state });
}

/**
 * Extrait la base du repo (user/repo) pour comparaison
 */
function getRepoBase(url) {
    if (!url) return null;
    const match = url.match(/github\.com\/([^\/]+\/[^\/]+)/) || url.match(/gitlab\.com\/([^\/]+\/[^\/]+)/);
    return match ? match[1] : null;
}


/**
 * Bouton de scan
 */
function initScanButton() {
    // Sauvegarder l'URL quand on tape
    repoUrlInput.addEventListener('input', () => saveState());

    scanButton.addEventListener('click', async () => {
        const url = repoUrlInput.value.trim();

        if (!url) {
            alert('Veuillez entrer une URL');
            return;
        }

        // Lancer le scan selon le mode
        try {
            showLoading();

            if (currentMode === 'repo') {
                await scanRepositoryMode(url);
            } else if (currentMode === 'file') {
                await scanFileMode(url);
            } else if (currentMode === 'folder') {
                await scanFolderMode(url);
            }

        } catch (error) {
            hideLoading();
            alert(`Erreur: ${error.message}`);
            console.error('Erreur scan:', error);
        }
    });
}

/**
 * Mode Repository
 */
/**
 * Mode Repository
 */
async function scanRepositoryMode(url) {
    // 0. Vérifier historique
    const previousScan = await checkHistory(url);
    if (previousScan) {
        const date = new Date(previousScan.timestamp).toLocaleTimeString();
        if (confirm(`Ce dépôt a déjà été scanné à ${date}. Voulez-vous recharger les résultats précédents ?`)) {
            currentResults = previousScan.results;
            displayResults(currentResults);
            saveState();
            return;
        }
    }

    const token = await getStoredToken();
    console.log('Mode Repo: Token présent ?', !!token);

    // V3: Check Deep Scan
    const deepScanCheckbox = document.getElementById('deep-scan-checkbox');
    const isDeepScan = deepScanCheckbox && deepScanCheckbox.checked;

    if (isDeepScan && !token) {
        alert("Deep Scan nécessite un Token GitHub configuré !");
        // On continue en mode normal ou on stop ? Stop pour forcer le token.
        return;
    }

    try {
        // 1. Parser URL
        const repoInfo = githubClient.parseGitHubUrl(url);
        if (!repoInfo) throw new Error("URL GitHub invalide");

        // 2. Récupérer les fichiers (Logique extraite de repo-scanner pour être partagée)
        updateProgress({ stage: 'Récupération fichiers...', progress: 10 });

        // On utilise githubClient directement pour avoir les fichiers "bruts"
        const tree = await githubClient.getRepositoryTree(repoInfo.owner, repoInfo.repo, token);
        const maxFiles = 50; // Limite par défaut
        const filesToScan = tree.slice(0, maxFiles);

        updateProgress({ stage: `Téléchargement ${filesToScan.length} fichiers...`, progress: 30 });

        const filesWithContent = await githubClient.getMultipleFileContents(repoInfo.owner, repoInfo.repo, filesToScan, token);

        let results;

        if (isDeepScan) {
            // 3a. Mode V3 Deep Scan
            const MasterDetector = (await import('../analyzer/MasterDetector.js')).default;
            const detector = new MasterDetector();
            updateProgress({ stage: 'Deep Scan (Git History + Content)...', progress: 50 });

            const report = await detector.analyzeRepository(
                repoInfo.owner,
                repoInfo.repo,
                token,
                filesWithContent, // MasterDetector attend {path, content}
                { deepScan: true }
            );

            // Mapper le rapport V3 vers le format attendu par displayResults (V2)
            results = {
                score: report.summary.globalScore,
                confidence: report.summary.confidence, // 'high', 'medium', 'low' -> map to % ? Non, displayResults attend un nombre pour V2?
                // displayResults V2 fait: document.getElementById('confidence-value').innerText = results.confidence || 0;
                // V3 return string. On va adapter.
                verdict: report.summary.verdict,
                summary: {
                    human: report.distribution.clean, // mapping approximatif pour affichage
                    uncertain: report.distribution.questionable,
                    aiLikely: report.distribution.suspicious
                },
                results: report.files.suspicious.concat(report.files.clean).map(f => ({
                    path: f.path,
                    score: f.finalScore,
                    lineCount: f.lineCount,
                    breakdown: f.breakdown // Pass breakdown for UI stats
                })),
                patterns: report.topPatterns, // V3 patterns
                totalFiles: report.summary.fileCount,
                temporal: report.temporal // Garder pour l'onglet temporal
            };

            // Hack pour confiance V2 (number) vs V3 (string)
            results.confidence = report.summary.confidence === 'high' ? 90 : report.summary.confidence === 'medium' ? 60 : 30;

        } else {
            // 3b. Mode V2 Standard
            updateProgress({ stage: 'Analyse Standard...', progress: 50 });
            // On réutilise la logique V2 via scorer
            const repoContext = { root: `${repoInfo.owner}/${repoInfo.repo}`, platform: 'github' };
            results = analyzeRepository(filesWithContent, repoContext);

            // Ajouter métadonnées manquantes pour V2 display
            results.totalFiles = filesWithContent.length;
        }

        currentResults = results;
        displayResults(results);

        // Ajouter à l'historique
        addToHistory(url, results);

        saveState();


    } catch (error) {
        console.error('Erreur scan:', error);
        hideLoading();

        if (error.message.includes('403') || error.message.includes('rate limit')) {
            openSettings("⚠️ <strong>Limite GitHub atteinte !</strong><br>Ajoutez un Token pour scanner ce dépôt volumineux (5000 req/h).");
        } else if (error.message.includes('404')) {
            alert("Erreur 404 : Dépôt introuvable ou privé. Vérifiez l'URL et votre Token.");
        } else {
            alert(`Erreur lors du scan : ${error.message}`);
        }
    }
}

/**
 * Gestion de l'historique des scans
 */
/**
 * Gestion de l'historique des scans
 */
async function checkHistory(url) {
    const key = getRepoBase(url) || url;
    return new Promise((resolve) => {
        chrome.storage.local.get(['scanHistory'], (result) => {
            const history = result.scanHistory || {};
            if (history[key]) {
                const entry = history[key];
                // Expiration 24h
                if (Date.now() - entry.timestamp < 24 * 60 * 60 * 1000) {
                    resolve(entry);
                } else {
                    delete history[key];
                    chrome.storage.local.set({ scanHistory: history });
                    resolve(null);
                }
            } else {
                resolve(null);
            }
        });
    });
}

async function addToHistory(url, results) {
    const key = getRepoBase(url) || url;
    chrome.storage.local.get(['scanHistory'], (r) => {
        const history = r.scanHistory || {};
        history[key] = {
            timestamp: Date.now(),
            results: results
        };
        chrome.storage.local.set({ scanHistory: history });
    });
}



/**
 * Mode File (Réel)
 */
async function scanFileMode(url) {
    const token = await getStoredToken();
    const repoInfo = parseGitHubUrlWithFile(url);

    if (!repoInfo || !repoInfo.path) {
        alert("URL de fichier invalide. Utilisez le format: github.com/user/repo/blob/main/path/to/file");
        return;
    }

    try {
        showLoading();
        updateProgress({ stage: 'Téléchargement fichier...', progress: 30 });

        // 1. Récupérer contenu
        // Note: On doit importer getFileContent de github-client si pas déjà fait dans popup.js
        // Mais github-client est importé comme module 'getRepoTree'. Il faut ajuster les imports en haut.
        // Supposons qu'on a accès à githubClient

        // Hack temporaire si imports manquants: on utilise repo-scanner qui a tout
        // Mais mieux : on complète l'import en haut (voir étape suivante)

        const content = await githubClient.getFileContent(repoInfo.owner, repoInfo.repo, repoInfo.path, token);

        if (!content) throw new Error("Impossible de lire le fichier (404 ou vide)");

        updateProgress({ stage: 'Analyse...', progress: 60 });

        // 2. Analyser
        const results = analyzeFile(content, { platform: 'github' });

        updateProgress({ stage: 'Terminé', progress: 100 });

        // Adapter format résultats pour displayResults
        const formattedResults = {
            score: results.score,
            confidence: results.confidence,
            verdict: results.verdict,
            summary: {
                human: 0, // Pas pertinent pour un seul fichier
                uncertain: 0,
                aiLikely: 0
            },
            patterns: results.patterns,
            details: results.details,
            totalFiles: 1
        };

        currentResults = formattedResults;
        displayResults(formattedResults);
        saveState();

    } catch (error) {
        console.error(error);
        alert("Erreur scan fichier: " + error.message);
        hideLoading();
    }
}

/**
 * Mode Folder (Réel)
 */
async function scanFolderMode(url) {
    const token = await getStoredToken();
    const repoInfo = parseGitHubUrlWithFile(url); // Gère aussi les tree/x/folder

    if (!repoInfo || !repoInfo.path) {
        alert("URL de dossier invalide. Utilisez le format: github.com/user/repo/tree/main/folder");
        return;
    }

    try {
        showLoading();

        // On réutilise scanGitHubRepository mais on filtre ? 
        // C'est plus simple de réimplémenter une logique légère ici pour le dossier

        updateProgress({ stage: 'Analyse arborescence...', progress: 10 });

        const tree = await getRepoTree(`https://github.com/${repoInfo.owner}/${repoInfo.repo}`, token);

        // Filtrer fichiers du dossier
        const folderFiles = tree.filter(f => f.path.startsWith(repoInfo.path));

        if (folderFiles.length === 0) {
            throw new Error("Dossier vide ou introuvable");
        }

        updateProgress({ stage: `Téléchargement ${folderFiles.length} fichiers...`, progress: 30 });

        // Télécharger contenu (limité à 20 fichiers pour perf dossier ?)
        const maxFiles = 50;
        const limitedFiles = folderFiles.slice(0, maxFiles);

        const filesWithContent = await githubClient.getMultipleFileContents(repoInfo.owner, repoInfo.repo, limitedFiles, token);

        updateProgress({ stage: 'Analyse...', progress: 70 });

        const results = analyzeRepository(filesWithContent, { root: repoInfo.repo });

        updateProgress({ stage: 'Terminé', progress: 100 });

        const final = {
            score: results.score, // Corrigé précédemment (était globalScore)
            confidence: results.confidence,
            verdict: getVerdict(results.score, results.confidence), // Besoin import getVerdict ou le récupérer de results si dispo
            summary: results.summary || {},
            patterns: [], // Agrégation complexe, on laisse vide ou on prend le top
            results: results.results, // Pour le file tree
            totalFiles: filesWithContent.length
        };

        currentResults = final;
        displayResults(final);
        saveState();

    } catch (error) {
        console.error(error);
        if (error.message.includes('403')) {
            openSettings("⚠️ Limite atteinte pour ce dossier.");
        } else {
            alert("Erreur scan dossier: " + error.message);
        }
        hideLoading();
    }
}

// Helper pour parser URL fichier/dossier
function parseGitHubUrlWithFile(url) {
    // Match github.com/user/repo/blob/branch/path...
    // ou github.com/user/repo/tree/branch/path...
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/(blob|tree)\/[^\/]+\/(.+)/);
    if (match) {
        return {
            owner: match[1],
            repo: match[2],
            type: match[3],
            path: match[4]
        };
    }
    return null;
}


/**
 * Affichage
 */
function showLoading() {
    urlInputSection.classList.add('hidden');
    loadingSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    // Avertissement fermeture
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        // On ne remplace pas le texte de stage, on ajoute un petit warning visuel si pas déjà présent
        // (Simplifié: on compte sur le message d'erreur si ça coupe)
    }
}

function hideLoading() {
    loadingSection.classList.add('hidden');
    urlInputSection.classList.remove('hidden');
}

function updateProgress(progress) {
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const loadingText = document.getElementById('loading-text');

    if (progress.progress !== undefined) {
        if (progressFill) progressFill.style.width = `${progress.progress}%`;
        if (progressPercentage) progressPercentage.innerText = `${progress.progress}%`;
    }

    if (progress.stage && loadingText) {
        loadingText.innerText = progress.stage;
    }
}

function displayResults(results) {
    hideLoading();
    resultsSection.classList.remove('hidden');

    // Animer la jauge
    animateScore(results.score || 0);

    // Mettre à jour les infos
    // Mettre à jour les infos
    document.getElementById('score-number').innerText = results.score || 0;

    // Traduire le verdict
    // Traduire le verdict
    const verdictMap = {
        // V2 Strings
        '✅ Probablement code humain': 'verdict_human',
        '🤖 Très probablement généré par IA': 'verdict_ai_very',
        '⚠️ Probablement généré par IA': 'verdict_ai',
        'clean': t('verdict_clean'),
        'suspicious': t('verdict_suspicious'),
        'uncertain': t('verdict_uncertain'),
        'likely_ai': t('verdict_ai'),
        // V3 verdicts
        '🤖 IA Quasi-Certaine': t('verdict_ai_very'),
        '⚠️ Probablement IA': t('verdict_ai'),
        '❓ Code Mixte': t('verdict_mixed'),
        '✅ Probablement Humain': t('verdict_human'),
        '✅ Code Humain': t('verdict_human')
    };
    const translatedVerdict = verdictMap[results.verdict] || results.verdict;
    document.getElementById('verdict-text').innerText = translatedVerdict;

    // Confidence & Details (Header Stats)
    const confidenceText = typeof results.confidence === 'number'
        ? (results.confidence > 80 ? 'Élevée' : results.confidence > 50 ? 'Moyenne' : 'Faible')
        : (results.confidence === 'high' ? 'Élevée' : results.confidence === 'medium' ? 'Moyenne' : 'Faible');

    document.getElementById('confidence-value').innerText = confidenceText;
    document.getElementById('files-count').innerText = results.totalFiles || 0;

    // Distribution Stats (Overview Tab)
    // On recalcule ou on utilise le summary s'il existe
    let dSuspicious = 0, dQuestionable = 0, dClean = 0;

    // Si V3 summary dispo
    if (results.summary && results.summary.human !== undefined) {
        dClean = results.summary.human;
        dQuestionable = results.summary.uncertain;
        dSuspicious = results.summary.aiLikely;
    } else if (results.results) {
        // Fallback calcul manuel depuis la liste
        results.results.forEach(f => {
            if (f.score >= 65) dSuspicious++;
            else if (f.score >= 30) dQuestionable++;
            else dClean++;
        });
    }

    document.getElementById('stat-human').innerText = dClean;
    document.getElementById('stat-uncertain').innerText = dQuestionable;
    document.getElementById('stat-ai').innerText = dSuspicious;

    // Update Temporal Tab Visibility & Content
    const tabTemporalBtn = document.getElementById('tab-temporal-btn');
    const temporalContent = document.getElementById('temporal-content');

    if (tabTemporalBtn && temporalContent) {
        if (results.temporal && (results.temporal.score > 0 || results.temporal.details || results.temporal.error || results.temporal.reason)) {
            tabTemporalBtn.style.display = 'block';
            const tData = results.temporal;

            let innerContent = '';

            if (tData.error) {
                innerContent = `<div style="padding:15px; color:var(--error-color);">❌ Erreur analyse: ${tData.error}</div>`;
            } else if (tData.reason) {
                innerContent = `<div style="padding:15px; color:var(--text-secondary);">ℹ️ ${tData.reason}</div>`;
            } else {
                // GRID LAYOUT FOR TEMPORAL STATS
                // GRID LAYOUT FOR TEMPORAL STATS
                const details = tData.details || {};
                const gridStats = `
                    <div class="temporal-grid">
                        <div class="stat-box">
                            <span class="label">total<br>Commits</span>
                            <span class="value">${details.totalCommits || 0}</span>
                        </div>
                        <div class="stat-box">
                            <span class="label">time<br>Span</span>
                            <span class="value">${details.timeSpan ? details.timeSpan.replace(' days', ' jours') : 'N/A'}</span>
                        </div>
                        <div class="stat-box">
                            <span class="label">avg<br>Commits/Day</span>
                            <span class="value">${details.avgCommitsPerDay || 0}</span>
                        </div>
                        <div class="stat-box">
                            <span class="label">most<br>Active Hours</span>
                            <span class="value date" style="font-size:1.1em">
                                ${details.mostActiveHours || 'N/A'}
                            </span>
                        </div>
                    </div>
                 `;

                // SCORE BANNER
                const scoreColor = getScoreColor(tData.score);
                const scoreBanner = `
                    <div class="temporal-banner" style="border-color: ${scoreColor}40; background: linear-gradient(90deg, ${scoreColor}10 0%, transparent 100%);">
                        <div class="icon-warning" style="color: ${scoreColor}">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                        </div>
                        <div class="content">
                            <div class="title" style="color: ${scoreColor}">Temporal Score: ${tData.score}/100</div>
                            <div class="desc">L'analyse de l'historique Git révèle des patterns suspects.</div>
                             ${tData.breakdown ? `<ul class="reasons">
                                <li>Régularité: ${tData.breakdown.commitTiming}/100</li>
                                <li>Style Drift: ${tData.breakdown.styleDrift}/100</li>
                             </ul>` : ''}
                        </div>
                    </div>
                 `;
                innerContent = gridStats + scoreBanner;
            }
            temporalContent.innerHTML = innerContent;
        } else {
            tabTemporalBtn.style.display = 'none';
        }
    }

    // Update Files Tab (Categorized Lists)
    const fileTree = document.getElementById('file-tree');
    if (fileTree && results.results) {
        // Separer les fichiers
        const suspiciousFiles = [];
        const questionableFiles = [];
        const cleanFiles = [];

        results.results.forEach(f => {
            if (f.score >= 65) suspiciousFiles.push(f);
            else if (f.score >= 30) questionableFiles.push(f);
            else cleanFiles.push(f);
        });

        // Sort by score desc
        suspiciousFiles.sort((a, b) => b.score - a.score);
        questionableFiles.sort((a, b) => b.score - a.score);
        cleanFiles.sort((a, b) => a.score - b.score);

        let html = '';

        if (suspiciousFiles.length > 0) {
            html += generateFileCategoryBlock('🚨 Suspicious Files', suspiciousFiles, 'suspicious');
        }
        if (questionableFiles.length > 0) {
            html += generateFileCategoryBlock('⚠️ Questionable Files', questionableFiles, 'questionable');
        }
        if (cleanFiles.length > 0) {
            html += generateFileCategoryBlock('✅ Clean Files', cleanFiles, 'clean');
        }

        if (html === '') html = '<div style="padding:20px; text-align:center;">Aucun fichier analysé.</div>';

        fileTree.innerHTML = html;

        // Re-attach listeners for file clicks
        document.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', () => {
                const path = item.dataset.path;
                const fileData = results.results.find(f => f.path === path);
                if (fileData) showFileDetails(fileData);
            });
        });
    }

    results = {
        score: report.summary.globalScore,
        confidence: report.summary.confidence === 'high' ? 90 : report.summary.confidence === 'medium' ? 60 : 30, // Hack
        verdict: report.summary.verdict,
        summary: {
            human: report.distribution.clean,
            uncertain: report.distribution.questionable,
            aiLikely: report.distribution.suspicious
        },
        results: report.files.suspicious.concat(report.files.clean).map(f => ({
            path: f.path,
            score: f.finalScore,
            lineCount: f.lineCount,
            breakdown: f.breakdown // Pass breakdown for UI stats
        })),
        patterns: report.topPatterns,
        totalFiles: report.summary.fileCount,
        temporal: report.temporal
    };

    // ... (rest of function until displayResults)

    // ... inside displayResults ...

    // Update Patterns Tab (Dimensions Breakdown)
    const patternsList = document.getElementById('patterns-list');
    if (patternsList && results.results) {
        // Compute Dimensions stats
        const files = results.results;
        const totalFiles = files.length || 1;

        // Helper to compute avg and coverage
        const computeDim = (key, threshold = 40) => {
            const sum = files.reduce((acc, f) => acc + (f.breakdown?.[key] || 0), 0);
            const affected = files.filter(f => (f.breakdown?.[key] || 0) > threshold).length;
            return {
                avg: Math.round(sum / totalFiles),
                percentage: Math.round((affected / totalFiles) * 100)
            };
        };

        const dims = [
            { id: 'temporal', label: 'Analyse Temporelle' },
            { id: 'linguistic', label: 'Patterns Linguistiques', key: 'linguistic' }, // Maps to v2 linguistic + semantic
            { id: 'naming', label: 'Nommage des Variables', key: 'naming' },
            { id: 'structure', label: 'Structure du Code', key: 'structure' }, // formatting + structure
            { id: 'documentation', label: 'Sur-documentation', key: 'documentation' }
        ];

        let pHtml = '<div class="patterns-grid">';

        dims.forEach(d => {
            let value = 0;
            let percentage = 0;

            if (d.id === 'temporal') {
                if (results.temporal) {
                    value = results.temporal.score || 0;
                    percentage = value; // Use score as progress
                }
            } else {
                const stats = computeDim(d.key);
                value = stats.avg;
                percentage = stats.percentage;
            }

            // Icon SVG (Barcode style generic)
            const iconSvg = `<svg viewBox="0 0 24 24" fill="none" class="pattern-icon" stroke="currentColor" stroke-width="2"><path d="M4 6h1v12H4zm5 0h2v12H9zm5 0h2v12h-2zm5 0h1v12h-1z"/></svg>`;

            pHtml += `
                <div class="pattern-card">
                    <div class="pattern-header">
                        ${iconSvg}
                        <span class="pattern-title">${d.label}</span>
                    </div>
                    <div class="pattern-value">${value}</div>
                    <div class="pattern-meta">Detected in ${percentage}% of files (Imp.)</div>
                    <div class="progress-bg">
                        <div class="progress-bar" style="width: ${percentage}%"></div>
                    </div>
                </div>
             `;
        });

        pHtml += '</div>';
        patternsList.innerHTML = pHtml;
    }

}

function generateFileCategoryBlock(title, files, type) {
    const icon = type === 'suspicious' ? '🚨' : type === 'questionable' ? '⚠️' : '✅';
    // Mapping type to class name
    const typeClass = type; // suspicious, questionable, clean
    const scoreColorClass = `text-${type}`;

    let html = `
        <div class="file-category">
            <div class="category-header ${typeClass}">
                <span class="icon">${icon}</span>
                <span class="title">${title}</span>
                <span class="count" style="opacity:0.6; font-size:0.9em; margin-left:auto;">(${files.length})</span>
            </div>
            <div class="file-list">
    `;

    files.forEach(f => {
        html += `
            <div class="file-item ${typeClass}" data-path="${f.path}">
                <div class="file-info">
                    <div class="name">${f.path}</div>
                    <div class="meta">
                        <span>JavaScript</span>
                        <span>•</span>
                        <span>${f.lineCount || '?'} lines</span>
                    </div>
                </div>
                <div class="file-score">
                    <span class="val ${scoreColorClass}">${f.score}</span>
                    <span class="lbl">AI Score</span>
                </div>
            </div>
        `;
    });

    html += `</div></div>`;
    return html;
}

function getScoreColor(score) {
    if (score >= 80) return '#ef4444';
    if (score >= 60) return '#f97316';
    if (score >= 40) return '#eab308';
    return '#22c55e';
}

function showFileDetails(fileData) {
    // Reuse existing logic or simple alert for now if V2 detail view isn't easily accessible
    // Ideally we inject a modal or detail view
    // For now let's just log key info in a nicely formatted alert or console
    let msg = `Fichier: ${fileData.path}\nScore: ${fileData.score}\n\nDétails:\n`;
    const details = fileData.breakdown || {};
    for (let [k, v] of Object.entries(details)) {
        msg += `- ${k}: ${v}\n`;
    }
    alert(msg);
}

function animateScore(score) { // Renamed from animateScoreGauge to match call in displayResults
    const circle = document.getElementById('score-circle');
    const circumference = 2 * Math.PI * 54; // r = 54
    const offset = circumference - (score / 100) * circumference;

    // Animation
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);
}



/**
 * Gestion des onglets
 */
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Désactiver tous les onglets
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

            // Activer l'onglet sélectionné
            btn.classList.add('active');
            document.getElementById(`tab-${targetTab}`).classList.add('active');
        });
    });
}
// Fin du fichier

