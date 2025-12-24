
const fs = require('fs');

// Simple 1x1 transparent PNG buffer (base64 decoded)
// C'est suffisant pour que Chrome accepte le fichier, même s'il est moche
const PNG_HEADER = Buffer.from('89504e470d0a1a0a', 'hex');
const IHDR = Buffer.from('0000000d49484452000000010000000108060000001f15c489', 'hex');
const IDAT = Buffer.from('0000000a49444154789c63000100000500010d0axp', 'hex'); // Invalid checksum probably but often works, let's use a real valid one.

// Using a known valid 16x16 red square PNG base64
const ICON_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9wMHgwaCiR6lJkAAAAZdEVYdENvbW1lbnQAQ3JlYXRlZCB3aXRoIEdJTVBXgQ4XAAAAMklEQVQ4y2P8/5/hPwMDA8N/KjDMAEol48AEo2EwGg6j4QAiA8N/CjD//x8/HxISw8AAALzCGR7/k4p1AAAAAElFTkSuQmCC";

const ICON_BUFFER = Buffer.from(ICON_BASE64, 'base64');

// Ecrire les fichiers
console.log("Génération des icônes de secours...");

try {
    fs.writeFileSync('icons/icon-16.png', ICON_BUFFER);
    console.log("✅ icon-16.png créé");

    fs.writeFileSync('icons/icon-48.png', ICON_BUFFER);
    console.log("✅ icon-48.png créé");

    fs.writeFileSync('icons/icon-128.png', ICON_BUFFER);
    console.log("✅ icon-128.png créé");

} catch (e) {
    console.error("Erreur:", e);
}
