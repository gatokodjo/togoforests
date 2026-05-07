const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

// FORM ELEMENTS
const nameInput = document.getElementById("name");
const regionInput = document.getElementById("region");
const historyInput = document.getElementById("history");
const speciesInput = document.getElementById("species");
const recommendationInput = document.getElementById("recommendation");

let editId = null;
let drawnGeometry = null;

// =======================
// MAP
// =======================

const map = L.map('map').setView([8.5, 1.2], 7);

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

// DRAW GROUP
const drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// DRAW CONTROL
const drawControl = new L.Control.Draw({
  draw: {
    polygon: true,
    rectangle: true,
    circle: false,
    marker: false,
    polyline: false,
    circlemarker: false
  },
  edit: {
    featureGroup: drawnItems
  }
});

map.addControl(drawControl);

// WHEN DRAWING CREATED
map.on(L.Draw.Event.CREATED, function (event) {

  drawnItems.clearLayers();

  const layer = event.layer;
  drawnItems.addLayer(layer);

  // SAVE GEOJSON
  drawnGeometry = layer.toGeoJSON().geometry;

  console.log("DRAWN GEOMETRY:", drawnGeometry);
});

// =======================
// LOAD FORESTS
// =======================

function loadForests() {

  fetch('/forests')
    .then(res => res.json())
    .then(data => {

      const tbody = document.querySelector("#forestTable tbody");
      tbody.innerHTML = "";

      data.features.forEach(feature => {

        const f = feature.properties;

        const row = `
          <tr>
            <td>${f.id}</td>
            <td>${f.name}</td>
            <td>${f.region}</td>
            <td>
              <button onclick='editForest(${JSON.stringify(feature)})'>✏️</button>
              <button onclick='deleteForest(${f.id})'>🗑️</button>
            </td>
          </tr>
        `;

        tbody.innerHTML += row;

      });

    });

}

loadForests();

// =======================
// SAVE FOREST
// =======================

function saveForest() {

  if (!drawnGeometry) {
    alert("Dessinez une forêt sur la carte");
    return;
  }

  const data = {
    name: nameInput.value,
    region: regionInput.value,
    history: historyInput.value,
    species: speciesInput.value,
    recommendation: recommendationInput.value,
    geometry: drawnGeometry
  };

  const method = editId ? 'PUT' : 'POST';
  const url = editId ? `/forests/${editId}` : '/forests';

  fetch(url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token
    },
    body: JSON.stringify(data)
  })
  .then(res => {
    if (!res.ok) throw new Error("Error saving");
    return res.json();
  })
  .then(() => {

    alert("Forêt enregistrée");

    clearForm();

    drawnItems.clearLayers();

    drawnGeometry = null;

    loadForests();

  })
  .catch(err => {
    console.error(err);
    alert("Erreur");
  });

}

// =======================
// EDIT
// =======================

function editForest(feature) {

  const f = feature.properties;

  editId = f.id;

  nameInput.value = f.name;
  regionInput.value = f.region;
  historyInput.value = f.history;
  speciesInput.value = f.species;
  recommendationInput.value = f.recommendation;

  drawnItems.clearLayers();

  const layer = L.geoJSON(feature);

  layer.eachLayer(l => {
    drawnItems.addLayer(l);
  });

  drawnGeometry = feature.geometry;

}

// =======================
// DELETE
// =======================

function deleteForest(id) {

  if (!confirm("Supprimer cette forêt ?")) return;

  fetch(`/forests/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': token
    }
  })
  .then(() => {
    loadForests();
  });

}

// =======================
// CLEAR
// =======================

function clearForm() {

  editId = null;

  nameInput.value = "";
  regionInput.value = "";
  historyInput.value = "";
  speciesInput.value = "";
  recommendationInput.value = "";

}