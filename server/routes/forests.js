const express = require('express');
const router = express.Router();

const pool = require('../db');
const auth = require('../middleware/authMiddleware');

// GET forests (public)
router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM forests');

  const geojson = {
    type: "FeatureCollection",
    features: result.rows.map(f => ({
      type: "Feature",
      properties: {
        id: f.id,
        name: f.name,
        region: f.region,
        history: f.history,
        species: f.species,
        recommendation: f.recommendation
      },
      geometry: f.geometry
    }))
  };

  res.json(geojson);
});

// ADD forest (admin)
router.post('/', auth, async (req, res) => {
  const { name, region, history, species, recommendation, geometry } = req.body;

  await pool.query(
    `INSERT INTO forests (name, region, history, species, recommendation, geometry)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [name, region, history, species, recommendation, geometry]
  );

  res.json({ success: true });
});

// UPDATE forest
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { name, region, history, species, recommendation, geometry } = req.body;

  await pool.query(
    `UPDATE forests 
     SET name=$1, region=$2, history=$3, species=$4, recommendation=$5, geometry=$6
     WHERE id=$7`,
    [name, region, history, species, recommendation, geometry, id]
  );

  res.json({ success: true });
});

// DELETE forest
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;

  await pool.query('DELETE FROM forests WHERE id=$1', [id]);

  res.json({ success: true });
});

module.exports = router;