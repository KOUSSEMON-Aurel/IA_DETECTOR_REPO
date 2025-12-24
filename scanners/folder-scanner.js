/**
 * Scanner de dossier unique (Mode 3)
 */

import { analyzeRepository } from '../analyzer/scorer.js';

/**
 * Scanne un dossier spécifique
 * @param {Array} allFiles - Tous les fichiers du repo
 * @param {string} folderPath - Chemin du dossier à scanner
 * @param {Object} context - Contexte
 * @returns {Object} Résultats du dossier
 */
export function scanFolder(allFiles, folderPath, context = {}) {
    try {
        // Filtrer les fichiers du dossier
        const folderFiles = allFiles.filter(file =>
            file.path.startsWith(folderPath + '/') || file.path === folderPath
        );

        if (folderFiles.length === 0) {
            throw new Error(`Aucun fichier trouvé dans ${folderPath}`);
        }

        // Analyser les fichiers du dossier
        const results = analyzeRepository(folderFiles, context);

        // Grouper par sous-dossiers directs
        const subfolders = groupBySubfolders(folderFiles, folderPath);

        return {
            ...results,
            folderPath,
            subfolders,
            fileCount: folderFiles.length,
            depth: folderPath.split('/').length
        };

    } catch (error) {
        console.error('Erreur scan dossier:', error);
        throw error;
    }
}

/**
 * Groupe les fichiers par sous-dossiers directs
 */
function groupBySubfolders(files, basePath) {
    const subfolderMap = {};

    files.forEach(file => {
        const relativePath = file.path.substring(basePath.length + 1);
        const parts = relativePath.split('/');

        if (parts.length === 1) {
            // Fichier directement dans le dossier
            if (!subfolderMap['_files']) {
                subfolderMap['_files'] = [];
            }
            subfolderMap['_files'].push(file);
        } else {
            // Fichier dans un sous-dossier
            const subfolder = parts[0];
            if (!subfolderMap[subfolder]) {
                subfolderMap[subfolder] = [];
            }
            subfolderMap[subfolder].push(file);
        }
    });

    // Calculer les scores par sous-dossier
    const subfolders = Object.entries(subfolderMap).map(([name, files]) => {
        const scores = files.map(f => f.score || 0);
        const avgScore = scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;

        return {
            name,
            path: name === '_files' ? basePath : `${basePath}/${name}`,
            fileCount: files.length,
            averageScore: Math.round(avgScore),
            files: files.map(f => ({
                name: f.path.split('/').pop(),
                path: f.path,
                score: f.score || 0
            }))
        };
    });

    return subfolders.sort((a, b) => b.averageScore - a.averageScore);
}

/**
 * Compare plusieurs dossiers
 */
export function compareFolders(allFiles, folderPaths, context = {}) {
    const comparisons = folderPaths.map(path => {
        try {
            return scanFolder(allFiles, path, context);
        } catch (error) {
            return {
                folderPath: path,
                error: error.message
            };
        }
    });

    // Trier par score décroissant
    const sorted = comparisons
        .filter(c => !c.error)
        .sort((a, b) => b.globalScore - a.globalScore);

    return {
        comparisons: sorted,
        summary: {
            mostSuspicious: sorted[0],
            leastSuspicious: sorted[sorted.length - 1],
            averageScore: Math.round(
                sorted.reduce((sum, c) => sum + c.globalScore, 0) / sorted.length
            )
        }
    };
}

export default {
    scanFolder,
    groupBySubfolders,
    compareFolders
};
