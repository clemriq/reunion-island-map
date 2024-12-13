// Chargement des données JSON
async function loadData() {
    const circuitsResponse = await fetch('../json/circuits.json');
    const lieuxResponse = await fetch('../json/lieux.json');
    const museesResponse = await fetch('../json/musees.json');

    const circuits = await circuitsResponse.json();
    const lieux = await lieuxResponse.json();
    const musees = await museesResponse.json();

    // Ajout d'un champ type pour chaque élément
    circuits.forEach(item => item.type = 'circuit');
    lieux.forEach(item => item.type = 'lieu');
    musees.forEach(item => item.type = 'musee');

    return { circuits, lieux, musees };
}

// Initialisation de la carte Leaflet
function initMap() {
    const map = L.map('map-container').setView([-21.115141, 55.536384], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    return map;
}

// Ajout des marqueurs sur la carte
function addMarkersToMap(map, data) {
    const iconColors = {
        'circuit': 'red',
        'lieu': 'blue',
        'musee': 'green'
    };

    data.forEach(item => {
        const latitude = item.latitude || item.location?.lat || item.coordonnees_geographiques?.lat;
        const longitude = item.longitude || item.location?.lon || item.coordonnees_geographiques?.lon;
        const nom = item.nom || item.nom_du_lieu_remarquable || item.nom_officiel_du_musee;
        const description = item.description || item.accroche || item.adresse;

        if (latitude && longitude) {
            const marker = L.marker([latitude, longitude], {
                icon: L.icon({
                    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColors[item.type]}.png`,
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.4/images/marker-shadow.png',
                    shadowSize: [41, 41]
                })
            }).addTo(map);

            marker.bindPopup(`<b>${nom}</b><br>${description}`);
            marker.on('click', () => {
                showDetails(item);
            });
            item.marker = marker; // Associer le marqueur à l'élément
        }
    });
}

// Filtrage des données
function filterData(data, keyword, types) {
    return data.filter(item => {
        const nom = item.nom || item.nom_du_lieu_remarquable || item.nom_officiel_du_musee;
        const matchesKeyword = nom.toLowerCase().includes(keyword.toLowerCase());
        const matchesType = types.includes('all') || types.includes(item.type);
        return matchesKeyword && matchesType;
    });
}

// Affichage des détails d'un élément
async function showDetails(item) {
    const detailsContainer = document.getElementById('details-container');
    detailsContainer.classList.remove('hidden'); // Afficher les détails
    const nom = item.nom || item.nom_du_lieu_remarquable || item.nom_officiel_du_musee;
    const description = item.description || item.accroche || item.adresse;
    const latitude = item.latitude || item.location?.lat || item.coordonnees_geographiques?.lat;
    const longitude = item.longitude || item.location?.lon || item.coordonnees_geographiques?.lon;

    // Convertir les coordonnées GPS en adresse
    const address = await getAddressFromCoordinates(latitude, longitude);

    detailsContainer.innerHTML = `
        <button id="close-details-button" class="absolute top-4 left-4 bg-red-600 text-white p-2 rounded-full shadow-lg flex items-center justify-center">
            <i class="fa-solid fa-times text-xl"></i>
        </button>
        <h2 class="text-xl font-bold mb-2 mt-12">${nom}</h2>
        <p class="mb-2">${description}</p>
        <p class="mb-2"><a href="https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}" target="_blank" class="text-blue-500 underline">Voir sur Google Maps</a></p>
        <p class="mb-2">Adresse: ${address}</p>
    `;
}

// Fonction pour obtenir l'adresse à partir des coordonnées GPS
async function getAddressFromCoordinates(lat, lon) {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`);
    const data = await response.json();
    return data.display_name;
}

// Fonction de recherche
function searchItems(data, query) {
    return data.filter(item => {
        const nom = item.nom || item.nom_du_lieu_remarquable || item.nom_officiel_du_musee;
        return nom.toLowerCase().includes(query.toLowerCase());
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const { circuits, lieux, musees } = await loadData();
    const allData = [...circuits, ...lieux, ...musees];

    const map = initMap();
    addMarkersToMap(map, allData);

    const itemList = document.getElementById('item-list');
    const searchInput = document.getElementById('search-input');
    const clearSearchButton = document.getElementById('clear-search-button');
    const filterContainer = document.getElementById('filter-container');
    const detailsContainer = document.getElementById('details-container');
    const closeDetailsButton = document.getElementById('close-details-button');

    function updateList(filteredData) {
        itemList.innerHTML = '';
        filteredData.sort((a, b) => {
            const nomA = (a.nom || a.nom_du_lieu_remarquable || a.nom_officiel_du_musee).toLowerCase();
            const nomB = (b.nom || b.nom_du_lieu_remarquable || b.nom_officiel_du_musee).toLowerCase();
            return nomA.localeCompare(nomB);
        }).forEach(item => {
            const listItem = document.createElement('li');
            const nom = item.nom || item.nom_du_lieu_remarquable || item.nom_officiel_du_musee;
            listItem.innerHTML = `<span class="font-bold">${nom}</span>`;
            listItem.classList.add(`text-${item.type}`, 'p-2', 'border', 'border-gray-300', 'rounded', 'hover:bg-gray-100', 'cursor-pointer');
            listItem.addEventListener('click', async () => {
                showDetails(item);
                map.flyTo([item.latitude || item.location?.lat || item.coordonnees_geographiques?.lat, item.longitude || item.location?.lon || item.coordonnees_geographiques?.lon], 15);
                item.marker.openPopup();
                updateMap(map, [item]); 
            });
            itemList.appendChild(listItem);
        });
    }

    function searchItems(data, query, filters) {
        return data.filter(item => {
            const nom = item.nom || item.nom_du_lieu_remarquable || item.nom_officiel_du_musee;
            const matchesQuery = nom.toLowerCase().includes(query.toLowerCase());
            const matchesFilter = filters.length === 0 || filters.includes(item.type);
            return matchesQuery && matchesFilter;
        });
    }

    function applyFilters() {
        const keyword = searchInput.value;
        const filters = Array.from(document.querySelectorAll('input[name="filter"]:checked')).map(checkbox => checkbox.value);
        const filteredData = searchItems(allData, keyword, filters);
        updateList(filteredData);
        updateMap(map, filteredData);
    }

    searchInput.addEventListener('input', applyFilters);
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        applyFilters();
    });

    filterContainer.addEventListener('change', applyFilters);

    // Initial update of the list
    updateList(allData);

    // Ajout du gestionnaire d'événement pour le bouton de centrage de la carte
    const centerMapButton = document.getElementById('center-map-button');
    centerMapButton.addEventListener('click', () => {
        map.closePopup(); // Fermer le popup en cours de consultation
        map.flyTo([-21.115141, 55.536384], 10);
    });

    // Ajout du gestionnaire d'événement pour le bouton de fermeture des détails
    detailsContainer.addEventListener('click', (event) => {
        if (event.target.id === 'close-details-button' || event.target.closest('#close-details-button')) {
            detailsContainer.classList.add('hidden'); // Fermer les détails
            map.closePopup(); // Fermer le popup en cours de consultation
            map.flyTo([-21.115141, 55.536384], 10); // Recentrer la carte
            applyFilters(); // Réappliquer les filtres
        }
    });
});

// Fonction pour mettre à jour la carte avec les marqueurs filtrés
function updateMap(map, filteredData) {
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    addMarkersToMap(map, filteredData);
}