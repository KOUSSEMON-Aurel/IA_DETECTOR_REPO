/**
 * Client API GitHub pour récupérer fichiers et arborescence
 */

import CONFIG from '../config/settings.js';

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Parse l'URL GitHub pour extraire owner et repo
 */
export function parseGitHubUrl(url) {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, '')
    };
}

/**
 * Récupère l'arbre complet du dépôt (fichiers et dossiers)
 * @param {string} url - URL du dépôt
 * @param {string} token - Token optionnel pour augmenter rate limit
 * @returns {Promise<Array>} Liste des fichiers
 */
export async function getRepoTree(url, token = null) {
    const { owner, repo } = parseGitHubUrl(url);
    if (!owner || !repo) {
        throw new Error('Invalid GitHub URL provided.');
    }
    // On veut les dossiers pour le File Picker
    return getRepositoryTree(owner, repo, token, true);
}

/**
 * Récupère l'arborescence complète d'un repository
 * @param {string} owner - Propriétaire du repo
 * @param {string} repo - Nom du repo
 * @param {string} token - Token optionnel pour augmenter rate limit
 * @param {boolean} includeFolders - Si true, inclut les dossiers dans le résultat
 * @returns {Promise<Array>} Liste des fichiers
 */
export async function getRepositoryTree(owner, repo, token = null, includeFolders = false) {
    try {
        // 1. Obtenir le SHA du commit principal
        const defaultBranch = await getDefaultBranch(owner, repo, token);

        // 2. Récupérer l'arbre complet
        const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
        const headers = {
            'Accept': 'application/vnd.github.v3+json'
        };

        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        // Filtrer
        const nodes = data.tree.filter(item => {
            // Si c'est un dossier
            if (item.type === 'tree') {
                return includeFolders; // Garder seulement si demandé
            }
            // Si c'est un fichier (blob)
            if (item.type === 'blob') {
                // Appliquer les filtres d'exclusion et de support
                return !isExcluded(item.path) && isSupportedFile(item.path);
            }
            return false;
        });

        return nodes;

    } catch (error) {
        console.error('Erreur récupération arborescence GitHub:', error);
        throw error;
    }
}

/**
 * Récupère le contenu d'un fichier
 */
export async function getFileContent(owner, repo, path, token = null) {
    try {
        const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}/contents/${path}`;
        const headers = {
            'Accept': 'application/vnd.github.v3.raw'
        };

        if (token) {
            headers['Authorization'] = `token ${token}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            if (response.status === 404) return null; // Fichier non trouvé = pas une erreur critique
            throw new Error(`Erreur récupération fichier: ${response.status}`);
        }

        return await response.text();

    } catch (error) {
        if (!error.message.includes('404')) {
            console.error(`Erreur lecture ${path}:`, error);
        }
        return null;
    }
}

/**
 * Récupère le contenu de plusieurs fichiers en parallèle
 */
export async function getMultipleFileContents(owner, repo, files, token = null) {
    const maxConcurrent = CONFIG.PERFORMANCE.maxConcurrentScans;
    const results = [];

    // Limiter la concurrence pour éviter rate limiting
    for (let i = 0; i < files.length; i += maxConcurrent) {
        const batch = files.slice(i, i + maxConcurrent);

        const batchResults = await Promise.all(
            batch.map(async file => {
                const content = await getFileContent(owner, repo, file.path, token);
                return {
                    path: file.path,
                    content,
                    size: file.size
                };
            })
        );

        results.push(...batchResults);

        // Petit délai entre les batches pour respecter rate limit
        if (i + maxConcurrent < files.length) {
            await sleep(200);
        }
    }

    return results.filter(r => r.content !== null);
}

/**
 * Obtient la branche par défaut
 */
async function getDefaultBranch(owner, repo, token) {
    const url = `${GITHUB_API_BASE}/repos/${owner}/${repo}`;
    const headers = {
        'Accept': 'application/vnd.github.v3+json'
    };

    if (token) {
        headers['Authorization'] = `token ${token}`;
    }

    const response = await fetch(url, { headers });
    const data = await response.json();

    return data.default_branch || 'main';
}

/**
 * Vérifie si un fichier doit être exclu
 */
function isExcluded(path) {
    const exclusions = CONFIG.EXCLUSIONS;

    return exclusions.some(pattern => {
        if (pattern.includes('*')) {
            // Glob pattern
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(path);
        }
        return path.includes(pattern);
    });
}

/**
 * Vérifie si un fichier est supporté
 */
function isSupportedFile(path) {
    const languages = CONFIG.SUPPORTED_LANGUAGES;

    for (const lang of Object.values(languages)) {
        if (!lang.enabled) continue;

        for (const ext of lang.extensions) {
            if (path.endsWith(ext)) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Récupère les fichiers de configuration (pour détecter formatters)
 */
export async function getConfigFiles(owner, repo, token = null) {
    const configs = CONFIG.FORMATTER_CONFIGS;
    const foundConfigs = [];

    for (const configFile of configs) {
        try {
            const content = await getFileContent(owner, repo, configFile, token);
            if (content) {
                foundConfigs.push(configFile);
            }
        } catch (error) {
            // Fichier n'existe pas, continuer
        }
    }

    return foundConfigs;
}

/**
 * Utilitaire : sleep
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
    parseGitHubUrl,
    getRepositoryTree,
    getFileContent,
    getMultipleFileContents,
    getConfigFiles
};
