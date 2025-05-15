import express from 'express';
import Reservation from '../models/reservation.model.js';
import requireAuth from '../middleware/auth.js';
import Mailjet from 'node-mailjet';
import Etablissement from '../models/etablissement.model.js'
import User from '../models/user.model.js'
import dotenv from 'dotenv';
dotenv.config();


const reservationRoutes = express.Router();


// ✅ Valider une réservation sans auth (via lien unique)
reservationRoutes.put('/public/:id/confirm', async (req, res) => {
  try {
    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      { statut: 'oui confirmé' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Réservation introuvable' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ❌ Pareil pour refus
reservationRoutes.put('/public/:id/refuse', async (req, res) => {
  try {
    const updated = await Reservation.findByIdAndUpdate(
      req.params.id,
      { statut: 'refusé' },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Réservation introuvable' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET réservations de l'utilisateur connecté
reservationRoutes.get('/me', requireAuth, async (req, res) => {
  try {
    
    const reservations = await Reservation.find({ user: req.userId }).sort({ date: -1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});




    
// ✅ POST une nouvelle réservation
reservationRoutes.post('/', requireAuth, async (req, res) => {
  try {
    //console.log('test');
    const newReservation = new Reservation({
      ...req.body,
      user: req.userId
    })
    
    const savedReservation = await newReservation.save()

    // 🔍 Récupérer le mail du gérant concerné
    const etab = await Etablissement.findById(savedReservation.etablissement).populate('gerant')
    const gerantEmail = etab?.gerant?.email
    const lien = `http://localhost:5173/pro`
    console.log('🧑‍💼 ID du gérant (User) :', etab.gerant._id);
    console.log('📧 Email du gérant :', etab.gerant.email);



  const mailjet = Mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC,
      process.env.MJ_APIKEY_PRIVATE
    );
    
    // Dans ta route POST après avoir récupéré l'email du gérant :
    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'reservation.kreyolkwest@hotmail.com', // <-- Adresse d’envoi vérifiée dans Mailjet
            Name: 'KreyolKwest',
          },
          To: [
            {
              Email: etab.gerant.email, // <-- Email récupéré depuis le modèle Etablissement
              Name: 'Gérant',
            },
          ],
          Subject: `Nouvelle réservation reçue pour ${savedReservation._date}`,
          TextPart: 'Vous avez reçu une nouvelle réservation sur KreyolKwest.',
          HTMLPart: `<h3>Nouvelle réservation reçue</h3>
                     <p>Consultez et gérez cette réservation ici : 
                     <a href="http://localhost:5173/validation/${savedReservation._id}">
                      Valider ou refuser la réservation</a>
                      Sinon, connectez-vous à votre espace pro : <a href="${lien}">Espace Pro</a>
                      </p>`,
        },
      ],
    });
    
    request
      .then(result => {
        console.log('✅ Email envoyé :', result.body);
      })
      .catch(err => {
        console.error('❌ Erreur lors de l’envoi de l’email :', err.statusCode, err.message);
      });
    

    res.status(201).json(savedReservation)
    console.log('test mail reussi')
    
  } catch (err) {
    res.status(400).json({ message: err.message })
    console.log('test mail fail')
  }
})







// ✅ PUT : mise à jour autorisée pour le client ou un pro
reservationRoutes.put('/:id', requireAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable' });

    const isOwner = reservation.user.toString() === req.userId;
    const isPro = req.user?.pro === 'oui';

    if (!isOwner && !isPro) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const updated = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ DELETE : uniquement par le client
reservationRoutes.delete('/:id', requireAuth, async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable' });
    if (reservation.user.toString() !== req.userId) return res.status(403).json({ message: 'Non autorisé' });

    await Reservation.findByIdAndDelete(req.params.id);
    res.json({ message: 'Réservation annulée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ GET toutes les réservations
reservationRoutes.get('/', requireAuth, async (req, res) => {
  try {
    // Filtrage si user pro + query etabId
    if (req.user?.pro === 'oui' && req.query.etabId) {
      const etabIds = req.query.etabId.split(',').map(id => id.trim());
      const reservations = await Reservation.find({ etablissement: { $in: etabIds } });
      return res.json(reservations);
    }

    // Si pas pro ou admin → retourne tout (ex: pour admin panel)
    const reservations = await Reservation.find();
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

reservationRoutes.get('/by-etabs', requireAuth, async (req, res) => {
  try {
    if (!req.user.pro || req.user.pro !== 'oui') {
      return res.status(403).json({ message: "Accès réservé aux utilisateurs pro" })
    }

    const etabIds = req.query.ids?.split(',').filter(id => id.length > 0)
    if (!etabIds || etabIds.length === 0) {
      return res.status(400).json({ message: "Aucun ID d'établissement fourni" })
    }

    const reservations = await Reservation.find({ etablissement: { $in: etabIds } })
    res.json(reservations)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ✅ GET par ID
reservationRoutes.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ message: 'Réservation introuvable' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



export default reservationRoutes;