/**
 * Client API GitLab
 */

import CONFIG from '../config/settings.js';

const GITLAB_API_BASE = 'https://gitlab.com/api/v4';

/**
 * Parse l'URL GitLab
 */
export function parseGitLabUrl(url) {
    const match = url.match(/gitlab\.com\/([^\/]+\/[^\/]+)/);
    if (!match) return null;

    // Encoder le project path
    const projectPath = match[1].replace(/\.git$/, '');
    const projectId = encodeURIComponent(projectPath);

    return {
        projectPath,
        projectId
    };
}

/**
 * Récupère l'arborescence du repository
 */
export async function getRepositoryTree(projectId, token = null) {
    try {
        const url = `${GITLAB_API_BASE}/projects/${projectId}/repository/tree?recursive=true&per_page=100`;
        const headers = {};

        if (token) {
            headers['PRIVATE-TOKEN'] = token;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`GitLab API error: ${response.status}`);
        }

        const data = await response.json();

        // Filtrer les fichiers
        const files = data
            .filter(item => item.type === 'blob')
            .filter(item => !isExcluded(item.path))
            .filter(item => isSupportedFile(item.path));

        return files;

    } catch (error) {
        console.error('Erreur récupération arborescence GitLab:', error);
        throw error;
    }
}

/**
 * Récupère le contenu d'un fichier
 */
export async function getFileContent(projectId, path, ref = 'main', token = null) {
    try {
        const encodedPath = encodeURIComponent(path);
        const url = `${GITLAB_API_BASE}/projects/${projectId}/repository/files/${encodedPath}/raw?ref=${ref}`;
        const headers = {};

        if (token) {
            headers['PRIVATE-TOKEN'] = token;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            throw new Error(`Erreur récupération fichier: ${response.status}`);
        }

        return await response.text();

    } catch (error) {
        console.error(`Erreur lecture ${path}:`, error);
        return null;
    }
}

/**
 * Récupère plusieurs fichiers
 */
export async function getMultipleFileContents(projectId, files, token = null) {
    const maxConcurrent = CONFIG.PERFORMANCE.maxConcurrentScans;
    const results = [];

    for (let i = 0; i < files.length; i += maxConcurrent) {
        const batch = files.slice(i, i + maxConcurrent);

        const batchResults = await Promise.all(
            batch.map(async file => {
                const content = await getFileContent(projectId, file.path, 'main', token);
                return {
                    path: file.path,
                    content
                };
            })
        );

        results.push(...batchResults);

        if (i + maxConcurrent < files.length) {
            await sleep(200);
        }
    }

    return results.filter(r => r.content !== null);
}

function isExcluded(path) {
    const exclusions = CONFIG.EXCLUSIONS;
    return exclusions.some(pattern => {
        if (pattern.includes('*')) {
            const regex = new RegExp(pattern.replace(/\*/g, '.*'));
            return regex.test(path);
        }
        return path.includes(pattern);
    });
}

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
    parseGitLabUrl,
    getRepositoryTree,
    getFileContent,
    getMultipleFileContents
};
