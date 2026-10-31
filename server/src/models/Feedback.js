const mongoose = require('mongoose');

// Feedback is stored exactly as typed. It is never turned into HTML on the server;
// the React client renders it as plain text, so any <script> in it is shown, not run.
const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    message: { type: String, required: true, maxlength: 500 },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

feedbackSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.user;
    return ret;
  },
});

module.exports = mongoose.model('Feedback', feedbackSchema);
