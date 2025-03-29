import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  nom: String,
  ageMinimum: Number,
  choixActivite: [String],
  prix: String,
  horaires: String,
  activiteRestaurantId: String,
  medias: [{
    type: { type: String, enum: ['image', 'video'], required: true },
    url: { type: String, required: true }
  }],
  lienReservation: String,
  limitePersonnes: Number,
  presentation: String,
  typesActivite: [String],
  etablissement: { type: mongoose.Schema.Types.ObjectId, ref: 'Etablissement' }
});

const Activity = mongoose.model('Activity', activitySchema);
export default Activity;

