import mongoose from 'mongoose';

const reservationSchema = new mongoose.Schema({
  commentaire: String,
  date: String,
  etablissement: { type: mongoose.Schema.Types.ObjectId, ref: 'Etablissement' },
  horaire: String,
  activiteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
  nomActivite: String,
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  nbPersonnes: Number,
  reponse: String,
  statut: { type: String, enum: ['oui confirmé', 'non confirmé', 'refusé'], default: 'non confirmé' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // ✅
});

const Reservation = mongoose.model('Reservation', reservationSchema);
export default Reservation;