import express from 'express';
import User from '../models/user.model.js';
import { register, login, getProfile } from '../controllers/user.controller.js';
import requireAuth from '../middleware/auth.js';

const userRoutes = express.Router();

// 🔐 Inscription
userRoutes.post('/register', register);

// 🔐 Connexion
userRoutes.post('/login', login);

// 🔐 Récupérer le profil de l'utilisateur connecté
userRoutes.get('/me', requireAuth, getProfile);

// 🔐 Mettre à jour un utilisateur
userRoutes.put('/:id', requireAuth, async (req, res) => {
  try {
    const { pseudo, email, identifiant, motDePasse } = req.body;
    const updates = {};

    if (pseudo) updates.pseudo = pseudo;
    if (email) updates.email = email;
    if (identifiant) updates.identifiant = identifiant;
    if (motDePasse) {
      const bcrypt = await import('bcrypt');
      const hashed = await bcrypt.default.hash(motDePasse, 10);
      updates.motDePasse = hashed;
    }

    const updated = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// 🔐 Supprimer un utilisateur
userRoutes.delete('/:id', requireAuth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Liste de tous les utilisateurs (si besoin admin)
userRoutes.get('/', async (req, res) => {
  try {
    const users = await User.find().populate('reservations');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔐 Obtenir un utilisateur par ID
userRoutes.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('reservations');
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

userRoutes.post('/reset-password-request', resetPasswordRequest);

userRoutes.post('/reset-password/:token', resetPassword);

export default userRoutes;