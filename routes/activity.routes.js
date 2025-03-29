import express from 'express';
import Activity from '../models/activity.model.js';

const activityRoutes = express.Router();

activityRoutes.get('/', async (req, res) => {
  try {
    const items = await Activity.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

activityRoutes.post('/', async (req, res) => {
  try {
    const newItem = new Activity(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

activityRoutes.get('/:id', async (req, res) => {
  try {
    const item = await Activity.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Activity not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

activityRoutes.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

activityRoutes.delete('/:id', async (req, res) => {
  try {
    await Activity.findByIdAndDelete(req.params.id);
    res.json({ message: 'Activity deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default activityRoutes;