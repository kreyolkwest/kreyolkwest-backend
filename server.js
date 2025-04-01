import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';


// Import des routes
import  activityRoutes from './routes/activity.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import etablissementRoutes from './routes/etablissement.routes.js';
import userRoutes from './routes/user.routes.js';



const allowedOrigins = [
  'https://www.kreyolkwest.com',
  'https://kreyolkwest-frontend.onrender.com' // facultatif pour test
]


dotenv.config();
//require("dotenv").config();
//const express = require("express");
//const cors = require("cors");

//import cors from 'cors'



const app = express();
//app.use(cors());

app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      'https://www.kreyolkwest.com',
      'https://kreyolkwest-frontend.onrender.com',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.options('*', cors()); // Autorise les requêtes préliminaires (preflight)

app.use(express.json());


app.use('/api/activities', activityRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/etablissements', etablissementRoutes);
app.use('/api/users', userRoutes);







app.get("/", (req, res) => {
    res.send("API KreyolKwest en ligne !");
});

const PORT = process.env.PORT || 5004;
//app.listen(PORT, () => console.log(`Serveur en ligne sur le port ${PORT}`));



// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI)

  .then(() => {
    
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${process.env.PORT}`);
    });
  })
  
  .catch(err => console.error('❌ MongoDB connection error:', err));