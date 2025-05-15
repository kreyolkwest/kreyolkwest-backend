import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'

// ✅ Chargement des variables d'env
dotenv.config()

// ✅ Création du serveur
const app = express()

// ✅ Configuration CORS correcte
const allowedOrigins = [
  'https://www.kreyolkwest.com',
  'https://kreyolkwest-frontend.onrender.com',
  'http://localhost:5173', 
  'http://localhost:5004',
  'http://localhost:5013'
]

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true
}

app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// ✅ Middlewares globaux
app.use(express.json())

// ✅ Import des routes
import activityRoutes from './routes/activity.routes.js'
import restaurantRoutes from './routes/restaurant.routes.js'
import reservationRoutes from './routes/reservation.routes.js'
import etablissementRoutes from './routes/etablissement.routes.js'
import userRoutes from './routes/user.routes.js'

// ✅ Routes
app.use('/api/activities', activityRoutes)
app.use('/api/restaurants', restaurantRoutes)
app.use('/api/reservations', reservationRoutes)
app.use('/api/etablissements', etablissementRoutes)
app.use('/api/users', userRoutes)

app.get("/", (req, res) => {
  res.send("API KreyolKwest en ligne !")
})

// ✅ Connexion MongoDB + lancement du serveur
const PORT = process.env.PORT || 5004

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB')
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  })
  .catch(err => console.error('❌ MongoDB connection error:', err))