/**
 * Client Model
 *
 * Represents a client company/business that has migrations.
 * Multiple guest users can be associated with a single client.
 */

const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Client email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
clientSchema.index({ email: 1 });
clientSchema.index({ name: 1 });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
