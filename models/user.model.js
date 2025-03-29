import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  pseudo: { type: String, required: true },
  identifiant: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  email: String,
  telephone: String,
  reservations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' }],
  pro: { type: String, enum: ['oui', 'non'], default: 'non' },
  etablissements: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Etablissement' }],
  restaurants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }],
  activites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }]
});

const User = mongoose.model('User', userSchema);
export default User;