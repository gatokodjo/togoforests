const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '/login.html';
}

// FIX: get elements properly
const nameInput = document.getElementById("name");
const regionInput = document.getElementById("region");
const historyInput = document.getElementById("history");
const speciesInput = document.getElementById("species");
const recommendationInput = document.getElementById("recommendation");

let editId = null;

// LOAD
function loadForests() {
  fetch('/forests')
    .then(res => res.json())
    .then(data => {
      const tbody = document.querySelector("#forestTable tbody");
      tbody.innerHTML = "";

      data.forEach(f => {
        const row = `
          <tr>
            <td>${f.id}</td>
            <td>${f.name}</td>
            <td>${f.region}</td>
            <td>
              <button onclick='editForest(${JSON.stringify(f)})'>✏️</button>
              <button onclick='deleteForest(${f.id})'>🗑️</button>
            </td>
          </tr>
        `;
        tbody.innerHTML += row;
      });
    });
}

// SAVE
function saveForest() {
  const data = {
    name: nameInput.value,
    region: regionInput.value,
    history: historyInput.value,
    species: speciesInput.value,
    recommendation: recommendationInput.value,
    geometry: {
      type: "Polygon",
      coordinates: [[[0.6,8.7],[0.7,8.7],[0.7,8.8],[0.6,8.8],[0.6,8.7]]]
    }
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
    if (!res.ok) throw new Error("Unauthorized or error");
    return res.json();
  })
  .then(() => {
    alert("Saved!");
    editId = null;
    clearForm();
    loadForests();
  })
  .catch(err => {
    console.error(err);
    alert("Error saving forest");
  });
}

// EDIT
function editForest(f) {
  editId = f.id;
  nameInput.value = f.name;
  regionInput.value = f.region;
  historyInput.value = f.history;
  speciesInput.value = f.species;
  recommendationInput.value = f.recommendation;
}

// DELETE
function deleteForest(id) {
  if (!confirm("Delete this forest?")) return;

  fetch(`/forests/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': token }
  })
  .then(() => loadForests());
}

// CLEAR
function clearForm() {
  nameInput.value = "";
  regionInput.value = "";
  historyInput.value = "";
  speciesInput.value = "";
  recommendationInput.value = "";
}

loadForests();