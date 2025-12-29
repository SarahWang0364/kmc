const mongoose = require('mongoose');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  // Role fields - support dual roles (teacher+admin)
  isStudent: {
    type: Boolean,
    default: false
  },
  isTeacher: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  // Password management
  initialPassword: {
    type: String  // Temporary field for initial password verification
  },
  initialPasswordUsed: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  // Student-specific fields
  school: {
    type: String
  },
  year: {
    type: String,
    enum: ['Y6', 'Y7', 'Y8', 'Y9', 'Y10', 'Y11', 'Y12', 'Y12 3U', 'Y12 4U']
  },
  startingTerm: {
    type: String
  },
  notes: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Auto-increment name if duplicate (e.g., "John", "John 1", "John 2")
userSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('name')) {
    const baseName = this.name.replace(/ \d+$/, ''); // Remove existing number suffix
    const existingUsers = await mongoose.model('User').find({
      name: new RegExp(`^${baseName}( \\d+)?$`),
      _id: { $ne: this._id }
    }).sort({ name: 1 });

    if (existingUsers.length > 0) {
      // Find the highest suffix number
      let maxSuffix = 0;
      existingUsers.forEach(user => {
        const match = user.name.match(/ (\d+)$/);
        if (match) {
          maxSuffix = Math.max(maxSuffix, parseInt(match[1]));
        }
      });

      // If base name exists without suffix, start from 1
      const hasBaseName = existingUsers.some(user => user.name === baseName);
      if (hasBaseName) {
        this.name = `${baseName} ${maxSuffix + 1}`;
      } else {
        this.name = baseName;
      }
    }
  }
  next();
});

// Password is stored in plaintext (DEVELOPMENT ONLY - NOT SECURE!)
// Pre-save hook removed - passwords are no longer hashed

// Method to compare passwords (plaintext comparison - NOT SECURE!)
userSchema.methods.matchPassword = async function(enteredPassword) {
  return enteredPassword === this.password;
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Generate random initial password
userSchema.statics.generateInitialPassword = function() {
  return crypto.randomBytes(4).toString('hex'); // 8 character password
};

const User = mongoose.model('User', userSchema);

module.exports = User;
