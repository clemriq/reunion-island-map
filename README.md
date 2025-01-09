# 🏕️ **Application de Tourisme - Réunion**

![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=leaflet&logoColor=white)
![Font Awesome](https://img.shields.io/badge/Font%20Awesome-339AF0?style=for-the-badge&logo=font-awesome&logoColor=white)

## ✨ **Description**
Explorez les richesses touristiques de l'île de La Réunion 🌍. Cette application propose une carte interactive basée sur Leaflet, avec la possibilité de :

- Découvrir des circuits, lieux emblématiques et musées.
- Rechercher et filtrer les informations facilement.
- Explorer les détails de chaque élément directement sur la carte.

## 🔍 **Table des Matières**
<details>
  <summary>Cliquer pour déplier</summary>

- [Fonctionnalités](#-fonctionnalit%C3%A9s)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Architecture](#-architecture)
- [Technologies](#%EF%B8%8F-technologies)
- [Contributions](#-contributions)
- [Licence](#%C2%A9-licence)
</details>

---

## 🎢 **Fonctionnalités**

- 🌐 Carte interactive Leaflet avec marqueurs personnalisés.
- 🔍 Recherche intuitive par mots-clés.
- 🔬 Filtrage basé sur les types d'attractions : circuits, lieux, musées.
- 🔔 Notification popup lors de la sélection d'une attraction.
- 📊 Détails affichés dynamiquement avec des liens vers Google Maps.

---

## 🚀 **Installation**

Suivez ces étapes pour configurer et exécuter le projet localement :

1. Clonez le dépôt Git :
   ```bash
   git clone https://github.com/clemriq/reunion-island-map.git
   ```

2. Installez les dépendances :
   - Aucun outil spécifique à installer (les librairies CDNs sont intégrées).

3. Assurez-vous que les fichiers JSON contenant les données (
`circuits.json`, `lieux.json`, `musees.json`) sont accessibles dans le dossier approprié.

4. Ouvrez le fichier `index.html` dans un navigateur web.

---

## 📖 **Utilisation**

- Entrez un mot-clé dans la barre de recherche pour trouver des circuits, lieux ou musées.
- Activez/désactivez les filtres ("Circuits", "Lieux", "Musées").
- Cliquez sur un marqueur ou un élément de la liste pour afficher les détails.
- Cliquez sur "Voir sur Google Maps" pour une navigation géolocalisée.

---

## 🏛️ **Architecture**

```text
project-folder
├── index.html        # Fichier principal de l'application
├── css/
│   └── style.css     # Styles personnalisés
├── js/
│   └── script.js    # Scripts JS de l'application
├── json/
│   ├── circuits.json
│   ├── lieux.json
│   └── musees.json
└── README.md      # Documentation
```

---

## ⚖️ **Technologies**

- HTML5, CSS3 (Tailwind CSS)
- JavaScript (API Fetch, DOM Manipulation)
- [Leaflet](https://leafletjs.com/) pour la carte interactive.
- [FontAwesome](https://fontawesome.com/) pour les icônes.

---

## 👤 **Auteur**
Ce projet a été réalisé par **Clément Riquet**
