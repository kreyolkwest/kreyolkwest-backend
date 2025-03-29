import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from './models/user.model.js';
import Activity from './models/activity.model.js';
import Restaurant from './models/restaurant.model.js';
import Reservation from './models/reservation.model.js';
import Etablissement from './models/etablissement.model.js';

const MONGO_URI = process.env.MONGO_URI;

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear collections
    await User.deleteMany();
    await Activity.deleteMany();
    await Restaurant.deleteMany();
    await Reservation.deleteMany();
    await Etablissement.deleteMany();

    // Créer un établissement
    const etab = await Etablissement.create({
      nom: "Martinique Aventures",
      adresse: "Route de la Montagne, Fort-de-France",
      email: "contact@aventures-mq.com",
      logo: "https://example.com/logo.png",
      personnesContact: ["Jean Dupont"],
      telephone: "+596696001122",
      activites: []
    });

    // Activité principale
    const activity = await Activity.create({
      nom: "Balade en quad",
      ageMinimum: 16,
      choixActivite: ["Parcours forêt - 30 min", "Circuit montagne - 1h"],
      prix: "€€",
      horaires: "9h-18h",
      activiteRestaurantId: "ARQ123",
      images: ["https://example.com/quad1.jpg", "https://example.com/quad2.jpg"],
      lienReservation: "https://booking.example.com/quad",
      limitePersonnes: 10,
      presentation: "Une activité tout-terrain en pleine nature.",
      typesActivite: ["quad", "terre"],
      etablissement: etab._id
    });

    // Ajouter activité à l’établissement
    etab.activites.push(activity._id);

    // ➕ Trois autres activités
    const activitiesToAdd = [
      {
        nom: "Kayak Mangrove",
        ageMinimum: 10,
        choixActivite: ["Balade 1h", "Balade 2h avec guide"],
        prix: "€",
        horaires: "8h-17h",
        activiteRestaurantId: "AKM789",
        images: ["https://example.com/kayak1.jpg"],
        lienReservation: "https://booking.example.com/kayak",
        limitePersonnes: 6,
        presentation: "Explorez la mangrove de Martinique en toute sérénité.",
        typesActivite: ["kayak", "mer"],
        etablissement: etab._id
      },
      {
        nom: "Randonnée au volcan",
        ageMinimum: 12,
        choixActivite: ["Circuit Matinée", "Circuit Journée complète"],
        prix: "€€",
        horaires: "6h-15h",
        activiteRestaurantId: "ARD987",
        images: ["https://example.com/rando1.jpg"],
        lienReservation: "https://booking.example.com/volcan",
        limitePersonnes: 15,
        presentation: "Randonnée encadrée sur les pentes de la Montagne Pelée.",
        typesActivite: ["randonnee", "terre"],
        etablissement: etab._id
      },
      {
        nom: "Plongée aux Anses-d’Arlet",
        ageMinimum: 14,
        choixActivite: ["Baptême", "Exploration confirmée"],
        prix: "€€€",
        horaires: "9h-18h",
        activiteRestaurantId: "APL321",
        images: ["https://example.com/plongee1.jpg"],
        lienReservation: "https://booking.example.com/plongee",
        limitePersonnes: 8,
        presentation: "Découvrez les fonds marins martiniquais avec des pros.",
        typesActivite: ["plongee", "mer"],
        etablissement: etab._id
      }
    ];

    const createdActivities = await Activity.insertMany(activitiesToAdd);
    etab.activites.push(...createdActivities.map(act => act._id));

    await etab.save();

    // Restaurant principal
    const restaurant = await Restaurant.create({
      nom: "Le Ti Boucan",
      adresse: "Plage des Salines, Sainte-Anne",
      carte: "https://example.com/carte.jpg",
      horaires: "12h-22h",
      activiteRestaurantId: "RTB456",
      images: ["https://example.com/ti-boucan1.jpg", "https://example.com/ti-boucan2.jpg"],
      lienReservation: "https://booking.example.com/ti-boucan",
      limitePersonnes: 20,
      personnesContact: ["Marie-Claire"],
      presentation: "Restaurant en bord de plage avec spécialités créoles.",
      telephone: "+596696223344",
      categorieActivite: ["restaurant", "vue mer"],
      etablissement: etab._id
    });

    // ➕ Deux autres restaurants
    const otherRestaurants = [
      {
        nom: "La Table Créole",
        adresse: "Rue de la Liberté, Fort-de-France",
        carte: "https://example.com/table-creole-carte.jpg",
        horaires: "11h30-23h",
        activiteRestaurantId: "RTC789",
        images: ["https://example.com/table-creole1.jpg"],
        lienReservation: "https://booking.example.com/table-creole",
        limitePersonnes: 25,
        personnesContact: ["Lucien Bellemare"],
        presentation: "Cuisine traditionnelle et familiale dans un cadre chaleureux.",
        telephone: "+596696334455",
        categorieActivite: ["restaurant", "créole"],
        etablissement: etab._id
      },
      {
        nom: "Oasis Beach Grill",
        adresse: "Anse Mitan, Les Trois-Îlets",
        carte: "https://example.com/oasis-carte.jpg",
        horaires: "10h-23h",
        activiteRestaurantId: "ROG321",
        images: ["https://example.com/oasis1.jpg"],
        lienReservation: "https://booking.example.com/oasis",
        limitePersonnes: 30,
        personnesContact: ["Karine Joseph"],
        presentation: "Restaurant les pieds dans le sable avec grillades & cocktails.",
        telephone: "+596696778899",
        categorieActivite: ["restaurant", "plage"],
        etablissement: etab._id
      }
    ];

    await Restaurant.insertMany(otherRestaurants);

    // Créer un utilisateur
    const user = await User.create({
      pseudo: "xavha",
      identifiant: "xavha01",
      motDePasse: "securepass",
      telephone: "+596696000000",
      email: "xavha@example.com",
      reservations: []
    });

    // Créer une réservation
    const reservation = await Reservation.create({
      commentaire: "Merci pour cette belle activité !",
      date: "2025-04-10",
      etablissement: etab._id,
      horaire: "10h00",
      activiteId: activity._id,
      nomActivite: activity.nom,
      restaurant: restaurant._id,
      nombrePersonnes: 2,
      reponse: "Confirmé",
      statut: "oui",
      userName: user.pseudo,
      user: user._id // ✅
    });

    user.reservations.push(reservation._id);
    await user.save();

    console.log('✅ Seed data inserted successfully');
    process.exit();
  } catch (err) {
    console.error('❌ Error seeding data:', err);
    process.exit(1);
  }
};

seed();