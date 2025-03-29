import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema({
  nom: String,
  adresse: String,
  carte: String, // URL image carte
  horaires: String,
  activiteRestaurantId: String,
  images: [String],
  lienReservation: String,
  limitePersonnes: Number,
  personnesContact: [String],
  presentation: String,
  telephone: String,
  categorieActivite: [String],
  etablissement: { type: mongoose.Schema.Types.ObjectId, ref: 'Etablissement' },

  // 🆕 Nouveau champ pour les jours d'ouverture
  joursOuverture: [String]
});

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
export default Restaurant;