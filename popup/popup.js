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
        settingsAlert.innerHTML = errorMsg;
        settingsAlert.classList.remove('hidden');
    } else if (settingsAlert) {
        settingsAlert.classList.add('hidden');
        settingsAlert.innerHTML = '';
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
    fileTreeContainer.innerHTML = '<div class="loading-spinner"></div><div style="text-align:center; color: var(--text-secondary); margin-top: 10px;">Chargement de l\'arbre...</div>';

    try {
        const tree = await fetchRepoTree(url);
        renderFileTree(tree);
    } catch (error) {
        fileTreeContainer.innerHTML = `
    < div style = "color: var(--error-color); text-align: center; padding: 20px;" >
        <p>Erreur: ${error.message}</p>
                ${error.message.includes('403') ? '<p style="font-size: 12px; margin-top: 10px;">⚠️ Limite API atteinte. Réessayez plus tard ou configurez un token.</p>' : ''}
            </div >
    `;
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
        el.innerHTML = `
    < span > ${node.type === 'tree' ? '📁' : '📄'}</span >
        <span>${node.path}</span>
`;

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
    const state = {
        repoUrl: repoUrlInput.value,
        mode: currentMode,
        results: currentResults,
        timestamp: Date.now()
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
async function scanRepositoryMode(url) {
    const token = await getStoredToken();
    console.log('Mode Repo: Token présent ?', !!token);

    try {
        const results = await scanRepository(url, (progress) => {
            updateProgress(progress);
        }, { token });

        currentResults = results;
        displayResults(results);
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
    animateScoreGauge(results.score || 0);

    // Mettre à jour les infos
    // Mettre à jour les infos
    document.getElementById('score-number').innerText = results.score || 0;

    // Traduire le verdict
    const verdictMap = {
        '✅ Probablement code humain': 'verdict_human',
        '🤖 Très probablement généré par IA': 'verdict_ai_very',
        '⚠️ Probablement généré par IA': 'verdict_ai',
        '❓ Possiblement IA ou code mixte': 'verdict_mixed',
        '❓ Mix probable IA/Humain': 'verdict_mixed',
        '🤷 Incertain - pas assez de signaux': 'verdict_uncertain'
    };
    const translatedVerdict = t(verdictMap[results.verdict] || 'verdict_waiting');
    document.getElementById('verdict-text').innerText = translatedVerdict;

    document.getElementById('confidence-value').innerText = results.confidence || 0;
    document.getElementById('files-count').innerText = results.totalFiles || 1;

    // Stats
    if (results.summary) {
        document.getElementById('stat-human').innerText = results.summary.human || 0;
        document.getElementById('stat-uncertain').innerText = results.summary.uncertain || 0;
        document.getElementById('stat-ai').innerText = results.summary.aiLikely || 0;
    }

    // Hotspots removed from UI
    // if (results.hotspots) {
    //     displayHotspots(results.hotspots);
    // }

    // File tree
    if (results.results) {
        displayFileTree(results.results);
    }

    // Patterns
    if (results.patterns) {
        displayPatterns(results.patterns);
    }
}

function animateScoreGauge(score) {
    const circle = document.getElementById('score-circle');
    const circumference = 2 * Math.PI * 54; // r = 54
    const offset = circumference - (score / 100) * circumference;

    // Animation
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 100);
}

function displayHotspots(hotspots) {
    const hotspotsList = document.getElementById('hotspots-list');
    hotspotsList.innerHTML = '';

    hotspots.slice(0, 5).forEach(file => {
        const item = document.createElement('div');
        item.className = 'hotspot-item';

        // SVG File Icon (Same as tree view for consistency)
        const fileIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; color: var(--text-secondary); min-width: 14px;"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;

        item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
        <span class="hotspot-name" title="${file.path}" style="display: flex; align-items: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${fileIcon}
            ${file.path.split('/').pop()}
        </span>
        <span class="hotspot-score" style="font-weight: 700; color: ${getScoreColor(file.score)}; font-size: 12px;">${file.score}%</span>
      </div>
    `;
        hotspotsList.appendChild(item);
    });
}

function displayFileTree(files) {
    const fileTree = document.getElementById('file-tree');
    fileTree.innerHTML = '';

    files.slice(0, 20).forEach(file => {
        const item = document.createElement('div');
        item.className = 'tree-item'; // Use class for styling
        item.style.padding = '8px';
        item.style.borderBottom = '1px solid var(--border-color)';
        // SVG File Icon
        const fileIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; color: var(--text-secondary);"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg>`;

        item.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 12px; display: flex; align-items: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${fileIcon}
            <span title="${file.path}">${file.path}</span>
        </span>
        <span style="font-weight: 700; color: ${getScoreColor(file.score)}; font-size: 12px;">${file.score}%</span>
      </div>
    `;
        fileTree.appendChild(item);
    });
}

function displayPatterns(patterns) {
    const patternsList = document.getElementById('patterns-list');
    patternsList.innerHTML = '';

    // Grouper par catégorie
    const grouped = patterns.reduce((acc, p) => {
        if (!acc[p.category]) acc[p.category] = [];
        acc[p.category].push(p);
        return acc;
    }, {});

    Object.entries(grouped).forEach(([category, items]) => {
        const section = document.createElement('div');
        section.className = 'pattern-item';
        section.innerHTML = `
      <div class="pattern-name">${formatCategory(category)}</div>
      <div class="pattern-details">
        ${items.map(i => `• ${i.name} (×${i.count})`).join('<br>')}
      </div>
    `;
        patternsList.appendChild(section);
    });
}

function getScoreColor(score) {
    if (score < 30) return '#10b981';
    if (score < 60) return '#fbbf24';
    return '#ef4444';
}

function formatCategory(category) {
    const keyMap = {
        linguistic: 'cat_linguistic',
        code_structure: 'cat_structure',
        naming: 'cat_naming',
        error_handling: 'cat_error',
        documentation: 'cat_doc',
        special_chars: 'cat_special',
        vocabulary: 'cat_vocab',
        human_markers: 'cat_human'
    };
    return t(keyMap[category]) || category;
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

