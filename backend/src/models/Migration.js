/**
 * Migration Model
 *
 * Represents a Tableau Cloud migration project with client info and questions.
 */

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  section: {
    type: String,
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  questionType: {
    type: String,
    enum: ['checkbox', 'textInput', 'dateInput', 'dropdown', 'yesNo'],
    default: 'checkbox',
  },
  options: [String], // For dropdown and yesNo types
  answer: mongoose.Schema.Types.Mixed, // String, Date, Boolean, or null
  completed: {
    type: Boolean,
    default: false,
  },
  timestamp: Date,
  order: {
    type: Number,
    required: true,
  },
  metadata: {
    isFullWidth: {
      type: Boolean,
      default: false,
    },
    hasConditionalInput: {
      type: Boolean,
      default: false,
    },
    hasConditionalDate: {
      type: Boolean,
      default: false,
    },
    conditionalText: String,
    conditionalDate: Date,
    infoTooltip: String,
  },
});

const migrationSchema = new mongoose.Schema(
  {
    clientEmail: {
      type: String,
      required: [true, 'Client email is required'],
      lowercase: true,
      trim: true,
    },
    clientInfo: {
      clientName: String,
      region: String,
      serverVersion: String,
      serverUrl: String,
      kickoffDate: Date,
      primaryContact: String,
      meetingCadence: String,
      goLiveDate: Date,
    },
    questions: [questionSchema],
    additionalNotes: {
      type: String,
      default: '',
    },
    createdBy: {
      type: String,
      required: [true, 'Creator email is required'],
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
migrationSchema.index({ clientEmail: 1 });
migrationSchema.index({ createdBy: 1 });

// Method to calculate progress
migrationSchema.methods.calculateProgress = function () {
  const totalQuestions = this.questions.length;
  const completedQuestions = this.questions.filter((q) => q.completed).length;

  return {
    total: totalQuestions,
    completed: completedQuestions,
    percentage: totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0,
  };
};

const Migration = mongoose.model('Migration', migrationSchema);

module.exports = Migration;
