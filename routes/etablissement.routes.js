import express from 'express';
import Etablissement from '../models/etablissement.model.js';

const etablissementRoutes = express.Router();

// GET all établissements
etablissementRoutes.get('/', async (req, res) => {
  try {
    const etablissements = await Etablissement.find();
    res.json(etablissements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new établissement
etablissementRoutes.post('/', async (req, res) => {
  try {
    const newEtab = new Etablissement(req.body);
    const savedEtab = await newEtab.save();
    res.status(201).json(savedEtab);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET one établissement
etablissementRoutes.get('/:id', async (req, res) => {
  try {
    const etab = await Etablissement.findById(req.params.id);
    if (!etab) return res.status(404).json({ message: 'Etablissement not found' });
    res.json(etab);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update an établissement
etablissementRoutes.put('/:id', async (req, res) => {
  try {
    const updatedEtab = await Etablissement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEtab);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE an établissement
etablissementRoutes.delete('/:id', async (req, res) => {
  try {
    await Etablissement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Etablissement deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET établissements gérés par un utilisateur pro


etablissementRoutes.get('/by-user/:id', async (req, res) => {
  try {
    const etablissements = await Etablissement.find({ gerant: req.params.id });
    res.json(etablissements);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default etablissementRoutes;