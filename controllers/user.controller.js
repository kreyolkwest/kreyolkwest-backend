import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const JWT_SECRET = process.env.JWT_SECRET || 'vraiment-tres-secret'

export const register = async (req, res) => {
  try {
    const { identifiant, motDePasse, pseudo, telephone, email } = req.body
    const existingUser = await User.findOne({ identifiant })
    if (existingUser) return res.status(400).json({ message: 'Identifiant déjà utilisé' })

    const hashed = await bcrypt.hash(motDePasse, 10)

    const newUser = await User.create({
      identifiant,
      motDePasse: hashed,
      pseudo,
      telephone,
      email
    })

    res.status(201).json({ message: 'Compte créé avec succès' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { identifiant, motDePasse } = req.body
    const user = await User.findOne({ identifiant })
    if (!user) return res.status(400).json({ message: 'Identifiant invalide' })

    const isValid = await bcrypt.compare(motDePasse, user.motDePasse)
    if (!isValid) return res.status(400).json({ message: 'Mot de passe incorrect' })

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, pseudo: user.pseudo, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-motDePasse')
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}