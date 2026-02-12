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
    enum: ['checkbox', 'textInput', 'dateInput', 'dropdown', 'yesNo', 'numberInput'],
    default: 'checkbox',
  },
  options: [String], // For dropdown and yesNo types
  answer: mongoose.Schema.Types.Mixed, // String, Date, Boolean, or null
  completed: {
    type: Boolean,
    default: false,
  },
  timestamp: Date,
  updatedBy: {
    type: String, // User email who last modified this question
  },
  updatedAt: {
    type: Date, // When this question was last modified
  },
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
    dependsOn: String,
    skuLimits: mongoose.Schema.Types.Mixed,
    min: Number,
    max: Number,
  },
});

const migrationSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: [true, 'Client ID is required'],
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
    managementModule: {
      enabled: {
        type: Boolean,
        default: false,
      },
      createdAt: Date,
      createdBy: {
        type: String,
        lowercase: true,
        trim: true,
      },
      weeklyNotes: [
        {
          _id: {
            type: mongoose.Schema.Types.ObjectId,
            auto: true,
          },
          date: {
            type: Date,
            required: true,
            default: Date.now,
          },
          content: {
            type: String,
            required: true,
            trim: true,
          },
          createdBy: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          updatedAt: Date,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
migrationSchema.index({ clientId: 1 });
migrationSchema.index({ createdBy: 1 });
migrationSchema.index({ 'managementModule.enabled': 1, clientId: 1 });

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
