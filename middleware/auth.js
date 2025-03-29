import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'

const JWT_SECRET = process.env.JWT_SECRET || 'vraiment-tres-secret'

const requireAuth = async (req, res, next) => {
  try {
    // 🔒 Récupération du token depuis le header Authorization: "Bearer xxx"
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token requis' })
    }

    const token = authHeader.split(' ')[1] // ✅ ICI on définit bien `token`
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.id

    // Optionnel : peupler req.user (utile si tu veux vérifier si c'est un "pro")
    const user = await User.findById(decoded.id)
    if (!user) return res.status(401).json({ message: 'Utilisateur introuvable' })

    req.user = user

    next()
  } catch (err) {
    console.error('Token invalide', err)
    res.status(401).json({ message: 'Token invalide' })
  }
}

export default requireAuth