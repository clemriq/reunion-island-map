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
function showDetails(item) {
    const detailsContainer = document.getElementById('details-container');
    let detailsHtml = '';

    if (item.type === 'circuit') {
        detailsHtml = `
            <h2>${item.nom}</h2>
            <p>Durée: ${item.duree_minutes_total} minutes</p>
            <p>Distance: ${item.distance_parcourue} km</p>
            <p>Difficulté: ${item.difficulte}</p>
            <p>Altitude min: ${item.altitude_min} m</p>
            <p>Altitude max: ${item.altitude_max} m</p>
            <p>Ouvert: ${item.is_ouvert}</p>
        `;
    } else if (item.type === 'lieu') {
        detailsHtml = `
            <h2>${item.nom_du_lieu_remarquable}</h2>
            <p>Commune: ${item.commune}</p>
            <p>Adresse: ${item.adresse || `Latitude: ${item.coordonnees_geographiques?.lat}, Longitude: ${item.coordonnees_geographiques?.lon}`}</p>
            <p>Accessible mobilité réduite: ${item.accessible_mobilite_reduite}</p>
        `;
    } else if (item.type === 'musee') {
        detailsHtml = `
            <h2>${item.nom_officiel_du_musee}</h2>
            <p>Adresse: ${item.adresse || `Latitude: ${item.latitude}, Longitude: ${item.longitude}`}</p>
            <p>Commune: ${item.commune}</p>
            <p>Téléphone: ${item.telephone}</p>
            <p>Site web: <a href="http://${item.url}" target="_blank">${item.url}</a></p>
        `;
    }

    detailsContainer.innerHTML = detailsHtml;
}

document.addEventListener('DOMContentLoaded', async () => {
    const { circuits, lieux, musees } = await loadData();
    const allData = [...circuits, ...lieux, ...musees];

    const map = initMap();
    addMarkersToMap(map, allData);

    const itemList = document.getElementById('item-list');
    allData.sort((a, b) => {
        const nomA = a.nom || a.nom_du_lieu_remarquable || a.nom_officiel_du_musee;
        const nomB = b.nom || b.nom_du_lieu_remarquable || b.nom_officiel_du_musee;
        return nomA.localeCompare(nomB);
    }).forEach(item => {
        const listItem = document.createElement('li');
        const nom = item.nom || item.nom_du_lieu_remarquable || item.nom_officiel_du_musee;
        listItem.textContent = nom;
        listItem.classList.add(`text-${item.type}`);
        listItem.addEventListener('click', () => {
            showDetails(item);
            map.setView([item.latitude || item.location?.lat || item.coordonnees_geographiques?.lat, item.longitude || item.location?.lon || item.coordonnees_geographiques?.lon], 15);
            item.marker.openPopup();
            updateMap(map, [item]); // Afficher uniquement ce marqueur
        });
        itemList.appendChild(listItem);
    });

    const searchInput = document.getElementById('search-input');
    const filterCheckboxes = document.querySelectorAll('#filter-container input[type="checkbox"]');

    function getSelectedFilters() {
        const selectedFilters = [];
        filterCheckboxes.forEach(checkbox => {
            if (checkbox.checked) {
                selectedFilters.push(checkbox.value);
            }
        });
        return selectedFilters;
    }

    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value;
        const selectedFilters = getSelectedFilters();
        const filteredData = filterData(allData, keyword, selectedFilters);
        updateList(filteredData);
        updateMap(map, filteredData);
    });

    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const keyword = searchInput.value;
            const selectedFilters = getSelectedFilters();
            const filteredData = filterData(allData, keyword, selectedFilters);
            updateList(filteredData);
            updateMap(map, filteredData);
        });
    });

    function updateList(data) {
        itemList.innerHTML = '';
        data.sort((a, b) => {
            const nomA = a.nom || a.nom_du_lieu_remarquable || a.nom_officiel_du_musee;
            const nomB = b.nom || b.nom_du_lieu_remarquable || b.nom_officiel_du_musee;
            return nomA.localeCompare(nomB);
        }).forEach(item => {
            const listItem = document.createElement('li');
            const nom = item.nom || item.nom_du_lieu_remarquable || item.nom_officiel_du_musee;
            listItem.textContent = nom;
            listItem.classList.add(`text-${item.type}`);
            listItem.addEventListener('click', () => {
                showDetails(item);
                map.setView([item.latitude || item.location?.lat || item.coordonnees_geographiques?.lat, item.longitude || item.location?.lon || item.coordonnees_geographiques?.lon], 15);
                item.marker.openPopup();
                updateMap(map, [item]); // Afficher uniquement ce marqueur
            });
            itemList.appendChild(listItem);
        });
    }

    function updateMap(map, data) {
        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        addMarkersToMap(map, data);
    }
});