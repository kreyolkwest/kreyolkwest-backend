import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import crypto from 'crypto';
import User from '../models/user.model.js';
import Mailjet from 'node-mailjet'


const JWT_SECRET = process.env.JWT_SECRET || 'vraiment-tres-secret'




const mailjet = Mailjet.apiConnect(
  process.env.MJ_APIKEY_PUBLIC,
  process.env.MJ_APIKEY_PRIVATE
);

export const resetPasswordRequest = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé.' });

    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 1000 * 60 * 60; // 1h

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetUrl = `https://kreyolkwest.com/reset-password/${token}`; // Ou render URL si en dev

    const request = mailjet.post('send', { version: 'v3.1' }).request({
      Messages: [
        {
          From: {
            Email: 'reservation.kreyolkwest@hotmail.com',
            Name: 'KreyolKwest',
          },
          To: [
            {
              Email: user.email,
              Name: user.nom || 'Utilisateur',
            },
          ],
          Subject: 'Réinitialisation de votre mot de passe',
          TextPart: 'Voici votre lien de réinitialisation.',
          HTMLPart: `
            <h3>Réinitialisation de votre mot de passe</h3>
            <p>Bonjour ${user.nom || ''},</p>
            <p>Cliquez sur ce lien pour définir un nouveau mot de passe :</p>
            <a href="${resetUrl}">${resetUrl}</a>
            <p><small>Ce lien est valable pendant 1 heure.</small></p>
          `,
        },
      ],
    });

    request
      .then(() => {
        res.status(200).json({ message: 'Un email de réinitialisation a été envoyé.' });
      })
      .catch((err) => {
        console.error('❌ Erreur lors de l’envoi de l’email :', err.statusCode, err.message);
        res.status(500).json({ message: 'Erreur lors de l’envoi de l’email.' });
      });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { motDePasse } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // le token est encore valide
    });

    if (!user) {
      return res.status(400).json({ message: 'Token invalide ou expiré.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.motDePasse = await bcrypt.hash(motDePasse, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};


export const register = async (req, res) => {
  try {
    const { identifiant, motDePasse, pseudo, telephone, email } = req.body
    const existingUser = await User.findOne({ identifiant })
    if (existingUser) return res.status(400).json({ message: 'Identifiant déjà utilisé' })

    const hashed = await bcrypt.hash(motDePasse, 10)

    const newUser = await User.create({
      identifiant,
      motDePasse: hashed,
      pseudo,
      telephone,
      email
    })

    res.status(201).json({ message: 'Compte créé avec succès' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { identifiant, motDePasse } = req.body
    const user = await User.findOne({ identifiant })
    if (!user) return res.status(400).json({ message: 'Identifiant invalide' })

    const isValid = await bcrypt.compare(motDePasse, user.motDePasse)
    if (!isValid) return res.status(400).json({ message: 'Mot de passe incorrect' })

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
    res.json({ token, user: { id: user._id, pseudo: user.pseudo, email: user.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-motDePasse')
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}