// Initialize map
const map = L.map('map').setView([8.5, 1.2], 7);

// Base layer
// SATELLITE BASEMAP
L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles © Esri'
  }
).addTo(map);

// LABELS + BORDERS OVERLAY
L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '© OpenStreetMap',
    opacity: 0.35
  }
).addTo(map);

const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles © Esri'
  }
);

const osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '© OpenStreetMap'
  }
);

satellite.addTo(map);

L.control.layers({
  "Satellite": satellite,
  "OpenStreetMap": osm
}).addTo(map);

// Dropdown + info
const select = document.getElementById("forestSelect");
const info = document.getElementById("info");

let geoLayer;

// Load forests from backend
function loadForests() {
  fetch('/forests')
    .then(res => res.json())
    .then(data => {

      console.log("DATA FROM BACKEND:", data); // 🔍 debug

      // ❗ Check if empty
      if (!data.features || data.features.length === 0) {
        info.innerHTML = "<p>No forest data found</p>";
        return;
      }

      // CLEAR DROPDOWN
      select.innerHTML = '<option value="">-- Sélectionner une forêt --</option>';

      data.features.forEach((f, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = f.properties.name;
        select.appendChild(option);
      });

      // REMOVE OLD LAYER
      if (geoLayer) map.removeLayer(geoLayer);

      // ADD GEOJSON TO MAP
      geoLayer = L.geoJSON(data, {
        onEachFeature: (feature, layer) => {

          layer.on('click', () => {
            showInfo(feature);
          });

        }
      }).addTo(map);

      // SELECT EVENT
      select.onchange = function () {
        const feature = data.features[this.value];
        if (!feature) return;

        showInfo(feature);

        const bounds = L.geoJSON(feature).getBounds();
        map.fitBounds(bounds);
      };

    })
    .catch(err => {
      console.error("ERROR:", err);
    });
}

// SHOW INFO PANEL
function showInfo(feature) {
  info.innerHTML = `
    <h2>${feature.properties.name}</h2>
    <p><b>Région:</b> ${feature.properties.region}</p>
    <p><b>Histoire:</b> ${feature.properties.history}</p>
    <p><b>Espèces:</b> ${feature.properties.species}</p>
    <p><b>Recommandation:</b> ${feature.properties.recommendation}</p>
  `;
}

// Load on start
loadForests();