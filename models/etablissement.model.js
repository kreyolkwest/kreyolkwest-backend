import mongoose from 'mongoose';

const etablissementSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  adresse: { type: String },
  email: { type: String },
  logo: { type: String }, // URL de l'image/logo
  personnesContact: [{ type: String }], // Liste de noms ou d'e-mails de contact
  telephone: { type: String }, // Téléphone unique

  // Gérant de l’établissement (utilisateur pro)
  gerant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Liste des activités associées à cet établissement
  activites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Activity'
  }]
}, {
  timestamps: true // pour createdAt / updatedAt
});

const Etablissement = mongoose.model('Etablissement', etablissementSchema);
export default Etablissement;