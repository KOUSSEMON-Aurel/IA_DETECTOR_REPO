# Vibe Coding Detector 🤖

Extension Chrome/Firefox pour détecter le code généré par IA sur GitHub et GitLab.

## Fonctionnalités

### 3 Modes de Scan
- **📦 Mode Repository** : Scanne un repository complet
- **📄 Mode Fichier** : Analyse un fichier spécifique
- **📁 Mode Dossier** : Scanne un dossier et ses sous-dossiers

### Détection Multi-Dimensionnelle

L'extension analyse plus de **40 patterns** pour détecter le code IA :

#### Patterns Linguistiques
- Phrases typiques IA : "Let's", "Here's how", "First, we need to"
- Commentaires trop formels
- Vocabulaire académique : "utilize", "leverage", "ensure"

#### Structure du Code
- Wrapper functions inutiles
- Try-catch excessif
- Décomposition excessive en micro-fonctions
- Variables intermédiaires inutiles

#### Nommage
- Noms ultra-descriptifs (>30 caractères)
- Préfixes systématiques (is/has/handle)
- Verbosité excessive

#### Gestion d'Erreurs
- Messages d'erreur trop formels
- Validations excessives

#### Documentation
- JSDoc/docstrings complets pour fonctions triviales
- Commentaires redondants avec le code

#### Caractères Spéciaux & Emojis
- ✅❌⚠️ dans commentaires
- 🔧💡🚀📝 emojis courants IA
- Caractères Unicode décoratifs (│═→)

#### Contra-Indicators (Marqueurs Humains)
- Debug prints informels (`console.log('wtf')`)
- Commentaires sarcastiques
- Variables temp/tmp/foo
- Code commenté temporairement
- Fautes de frappe

### Gestion du Formatage Automatique

L'extension détecte si le projet utilise Prettier, ESLint, Black, etc. et ajuste automatiquement le poids des patterns affectés par le formatage pour éviter les faux positifs.

### Score de Confiance

Le système calcule un score de confiance basé sur :
- Nombre de patterns détectés
- Cohérence des patterns
- Présence de marqueurs humains
- Détection de formatage auto

## Installation

### Chrome
1. Téléchargez l'extension
2. Ouvrez `chrome://extensions`
3. Activez le "Mode développeur"
4. Cliquez sur "Charger l'extension non empaquetée"
5. Sélectionnez le dossier `IA_DETECTOR`

### Firefox
1. Ouvrez `about:debugging#/runtime/this-firefox`
2. Cliquez sur "Charger un module temporaire"
3. Sélectionnez le fichier `manifest.json`

## Utilisation

### Via le Popup
1. Cliquez sur l'icône de l'extension
2. Choisissez le mode de scan
3. Entrez l'URL du repository/fichier/dossier
4. Cliquez sur "Lancer le Scan"

### Via le Bouton GitHub/GitLab
1. Naviguez sur un repository GitHub ou GitLab
2. Cliquez sur le bouton "🤖 Scan IA" ajouté dans l'interface
3. Les résultats s'affichent dans le popup

## Interprétation des Scores

| Score | Verdict | Signification |
|-------|---------|---------------|
| 0-30% | ✅ Probablement humain | Code authentiquement écrit par un humain |
| 30-60% | ❓ Mix ou incertain | Code mixte ou patterns ambigus |
| 60-80% | ⚠️ Probablement IA | Forte probabilité de code généré |
| 80-100% | 🤖 Très probablement IA | Quasi-certitude de code IA |

## Technologies

- **Analyse** : JavaScript avec patterns regex et heuristiques
- **UI** : HTML/CSS moderne avec animations
- **API** : GitHub REST API v3, GitLab API v4
- **Extension** : Manifest V3 (Chrome/Firefox compatible)

## Langages Supportés

- ✅ JavaScript / TypeScript (avec patterns React)
- ✅ Python (avec detection PEP8, type hints, etc.)
- 🚧 Java, Go, Rust, PHP (à venir)

## Architecture

```
IA_DETECTOR/
├── analyzer/           # Système de détection
│   ├── patterns.js     # 40+ patterns
│   ├── scorer.js       # Scoring multi-dimensionnel
│   ├── formatter-detector.js
│   └── language-analyzers/
│       ├── javascript.js
│       └── python.js
├── scanners/          # Modes de scan
│   ├── repo-scanner.js
│   ├── file-scanner.js
│   └── folder-scanner.js
├── api/               # Clients API
│   ├── github-client.js
│   └── gitlab-client.js
├── popup/             # Interface
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── content/           # Injection dans pages
    └── content.js
```

## Développement

### Ajouter un Pattern

Éditez `analyzer/patterns.js` :

```javascript
{
  id: 'mon-pattern',
  name: "Description du pattern",
  weight: 8,
  category: PATTERN_CATEGORIES.LINGUISTIC,
  immuneToFormatting: true,
  detect: (code) => {
    // Logique de détection
    return countMatches(code, /pattern/g);
  }
}
```

### Ajouter un Langage

Créez `analyzer/language-analyzers/monlangage.js` :

```javascript
export const MON_LANGAGE_PATTERNS = [
  // Patterns spécifiques
];

export function analyzeMonLangage(code) {
  // Logique d'analyse
}
```

## Limitations

- Rate limiting API GitHub (60 req/h sans auth, 5000 avec token)
- Limitation à 1000 fichiers par repository pour performance
- Détection basée sur patterns (pas de ML)
- Fichiers > 1MB ignorés

## Roadmap

- [ ] Support de plus de langages
- [ ] Intégration GitLab self-hosted
- [ ] Export PDF des rapports
- [ ] Historique des scans
- [ ] Comparaison entre versions/commits
- [ ] API publique

## Licence

MIT

## Contribuer

Les contributions sont bienvenues ! Ouvrez une issue ou une pull request.

---

**Note** : Cet outil est conçu pour détecter les patterns typiques du code généré par IA. Il ne remplace pas une review humaine et peut avoir des faux positifs/négatifs.
