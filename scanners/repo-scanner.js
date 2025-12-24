/**
 * Scanner de repository complet (Mode 1)
 */

import * as githubClient from '../api/github-client.js';
import * as gitlabClient from '../api/gitlab-client.js';
import { analyzeRepository } from '../analyzer/scorer.js';
import { detectAutoFormatting } from '../analyzer/formatter-detector.js';
import CONFIG from '../config/settings.js';

/**
 * Scanne un repository GitHub complet
 * @param {string} url - URL du repo GitHub
 * @param {Function} progressCallback - Callback pour progression
 * @returns {Promise<Object>} Résultats du scan
 */
export async function scanGitHubRepository(url, progressCallback = null) {
    try {
        // 1. Parser l'URL
        const repoInfo = githubClient.parseGitHubUrl(url);
        if (!repoInfo) {
            throw new Error('URL GitHub invalide');
        }

        const { owner, repo } = repoInfo;

        if (progressCallback) progressCallback({ stage: 'Récupération arborescence...', progress: 0 });

        // 2. Récupérer l'arborescence
        const tree = await githubClient.getRepositoryTree(owner, repo);

        // Limiter le nombre de fichiers
        const maxFiles = CONFIG.PERFORMANCE.maxFilesPerRepo;
        const filesToScan = tree.slice(0, maxFiles);

        if (progressCallback) {
            progressCallback({
                stage: 'Détection formatage auto...',
                progress: 10,
                totalFiles: filesToScan.length
            });
        }

        // 3. Détecter les formatters
        const configFiles = await githubClient.getConfigFiles(owner, repo);
        const formatterInfo = detectAutoFormatting(configFiles);

        if (progressCallback) {
            progressCallback({
                stage: 'Téléchargement fichiers...',
                progress: 20,
                formatterDetected: formatterInfo.hasFormatter
            });
        }

        // 4. Récupérer le contenu des fichiers
        const filesWithContent = await githubClient.getMultipleFileContents(owner, repo, filesToScan);

        if (progressCallback) {
            progressCallback({
                stage: 'Analyse en cours...',
                progress: 50,
                filesDownloaded: filesWithContent.length
            });
        }

        // 5. Analyser le repository
        const repoContext = {
            root: `${owner}/${repo}`,
            formatterDetected: formatterInfo,
            platform: 'github'
        };

        const results = analyzeRepository(filesWithContent, repoContext);

        if (progressCallback) {
            progressCallback({
                stage: 'Terminé',
                progress: 100
            });
        }

        return {
            ...results,
            repoInfo: {
                owner,
                repo,
                url,
                platform: 'github'
            },
            formatterInfo
        };

    } catch (error) {
        console.error('Erreur scan repository:', error);
        throw error;
    }
}

/**
 * Scanne un repository GitLab complet
 */
export async function scanGitLabRepository(url, progressCallback = null) {
    try {
        const repoInfo = gitlabClient.parseGitLabUrl(url);
        if (!repoInfo) {
            throw new Error('URL GitLab invalide');
        }

        const { projectId } = repoInfo;

        if (progressCallback) progressCallback({ stage: 'Récupération arborescence...', progress: 0 });

        const tree = await gitlabClient.getRepositoryTree(projectId);
        const maxFiles = CONFIG.PERFORMANCE.maxFilesPerRepo;
        const filesToScan = tree.slice(0, maxFiles);

        if (progressCallback) progressCallback({ stage: 'Téléchargement fichiers...', progress: 20 });

        const filesWithContent = await gitlabClient.getMultipleFileContents(projectId, filesToScan);

        if (progressCallback) progressCallback({ stage: 'Analyse en cours...', progress: 50 });

        const repoContext = {
            root: projectId,
            formatterDetected: { hasFormatter: false, formatWeightMultiplier: 1.0 },
            platform: 'gitlab'
        };

        const results = analyzeRepository(filesWithContent, repoContext);

        if (progressCallback) progressCallback({ stage: 'Terminé', progress: 100 });

        return {
            ...results,
            repoInfo: {
                projectId,
                url,
                platform: 'gitlab'
            }
        };

    } catch (error) {
        console.error('Erreur scan repository GitLab:', error);
        throw error;
    }
}

/**
 * Scanne automatiquement selon la plateforme
 */
export async function scanRepository(url, progressCallback = null) {
    if (url.includes('github.com')) {
        return scanGitHubRepository(url, progressCallback);
    } else if (url.includes('gitlab.com')) {
        return scanGitLabRepository(url, progressCallback);
    } else {
        throw new Error('Plateforme non supportée (GitHub ou GitLab uniquement)');
    }
}

export default {
    scanGitHubRepository,
    scanGitLabRepository,
    scanRepository
};
