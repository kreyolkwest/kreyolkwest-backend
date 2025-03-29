import express from 'express';
import Restaurant from '../models/restaurant.model.js';

const restaurantRoutes = express.Router();

// GET all restaurants
restaurantRoutes.get('/', async (req, res) => {
  try {
    const items = await Restaurant.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST a new restaurant
restaurantRoutes.post('/', async (req, res) => {
  try {
    const newItem = new Restaurant(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ GET restaurants par établissements (pour interface pro)
restaurantRoutes.get('/by-etabs', async (req, res) => {
  try {
    const ids = req.query.ids?.split(',') || [];

    if (!ids.length) {
      return res.status(400).json({ message: 'Aucun ID fourni' });
    }

    const restos = await Restaurant.find({ etablissement: { $in: ids } });
    res.json(restos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET a restaurant by ID
restaurantRoutes.get('/:id', async (req, res) => {
  try {
    const item = await Restaurant.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Restaurant not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update a restaurant
restaurantRoutes.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Restaurant.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a restaurant
restaurantRoutes.delete('/:id', async (req, res) => {
  try {
    await Restaurant.findByIdAndDelete(req.params.id);
    res.json({ message: 'Restaurant deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default restaurantRoutes;