const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: [200, 'Task title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Task description cannot exceed 1000 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  category: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    color: {
      type: String,
      required: true,
      match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Color must be a valid hex color']
    },
    icon: {
      type: String,
      default: 'fas fa-tasks'
    }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  dueDate: {
    type: Date,
    index: true
  },
  completedAt: {
    type: Date
  },
  estimatedTime: {
    type: Number, // in minutes
    min: [1, 'Estimated time must be at least 1 minute'],
    max: [10080, 'Estimated time cannot exceed 1 week (10080 minutes)']
  },
  actualTime: {
    type: Number, // in minutes
    min: [0, 'Actual time cannot be negative']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  recurring: {
    isRecurring: {
      type: Boolean,
      default: false
    },
    pattern: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly'],
      required: function() {
        return this.recurring.isRecurring;
      }
    },
    interval: {
      type: Number,
      min: 1,
      default: 1,
      required: function() {
        return this.recurring.isRecurring;
      }
    },
    daysOfWeek: [{
      type: Number,
      min: 0,
      max: 6
    }], // 0 = Sunday, 6 = Saturday
    endDate: Date,
    nextDueDate: Date
  },
  subtasks: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Subtask title cannot exceed 200 characters']
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    order: {
      type: Number,
      default: 0
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    mimetype: String,
    size: Number,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  reminders: [{
    datetime: {
      type: Date,
      required: true
    },
    message: {
      type: String,
      trim: true,
      maxlength: [200, 'Reminder message cannot exceed 200 characters']
    },
    sent: {
      type: Boolean,
      default: false
    }
  }],
  order: {
    type: Number,
    default: 0
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isFavorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.status === 'completed') return false;
  return new Date() > this.dueDate;
});

// Virtual for progress percentage (based on subtasks)
taskSchema.virtual('progress').get(function() {
  if (this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  
  const completedSubtasks = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const today = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for time tracking
taskSchema.virtual('timeVariance').get(function() {
  if (!this.estimatedTime || !this.actualTime) return null;
  return this.actualTime - this.estimatedTime;
});

// Indexes for better query performance
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, 'category.name': 1 });
taskSchema.index({ userId: 1, createdAt: -1 });
taskSchema.index({ tags: 1 });
taskSchema.index({ 'recurring.nextDueDate': 1 });

// Pre-save middleware
taskSchema.pre('save', function(next) {
  // Set completedAt when task is marked as completed
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // Clear completedAt if task is not completed
  if (this.isModified('status') && this.status !== 'completed' && this.completedAt) {
    this.completedAt = undefined;
  }
  
  // Handle recurring task logic
  if (this.recurring.isRecurring && this.status === 'completed' && !this.recurring.nextDueDate) {
    this.calculateNextDueDate();
  }
  
  next();
});

// Method to calculate next due date for recurring tasks
taskSchema.methods.calculateNextDueDate = function() {
  if (!this.recurring.isRecurring || !this.dueDate) return;
  
  const currentDue = new Date(this.dueDate);
  let nextDue = new Date(currentDue);
  
  switch (this.recurring.pattern) {
    case 'daily':
      nextDue.setDate(nextDue.getDate() + this.recurring.interval);
      break;
    case 'weekly':
      if (this.recurring.daysOfWeek && this.recurring.daysOfWeek.length > 0) {
        // Find next occurrence based on days of week
        const today = new Date();
        const currentDay = today.getDay();
        const sortedDays = this.recurring.daysOfWeek.sort((a, b) => a - b);
        
        let nextDay = sortedDays.find(day => day > currentDay);
        if (!nextDay) nextDay = sortedDays[0]; // Wrap to next week
        
        const daysToAdd = nextDay > currentDay ? 
          nextDay - currentDay : 
          (7 - currentDay) + nextDay;
        
        nextDue = new Date(today);
        nextDue.setDate(nextDue.getDate() + daysToAdd);
      } else {
        nextDue.setDate(nextDue.getDate() + (7 * this.recurring.interval));
      }
      break;
    case 'monthly':
      nextDue.setMonth(nextDue.getMonth() + this.recurring.interval);
      break;
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + this.recurring.interval);
      break;
  }
  
  // Check if we've passed the end date
  if (this.recurring.endDate && nextDue > this.recurring.endDate) {
    this.recurring.isRecurring = false;
    this.recurring.nextDueDate = undefined;
  } else {
    this.recurring.nextDueDate = nextDue;
  }
};

// Method to create next instance of recurring task
taskSchema.methods.createNextInstance = async function() {
  if (!this.recurring.isRecurring || !this.recurring.nextDueDate) return null;
  
  const TaskModel = this.constructor;
  const nextTask = new TaskModel({
    title: this.title,
    description: this.description,
    userId: this.userId,
    category: this.category,
    priority: this.priority,
    dueDate: this.recurring.nextDueDate,
    estimatedTime: this.estimatedTime,
    tags: this.tags,
    recurring: {
      ...this.recurring.toObject(),
      nextDueDate: undefined
    },
    subtasks: this.subtasks.map(subtask => ({
      title: subtask.title,
      completed: false,
      order: subtask.order
    }))
  });
  
  // Calculate next due date for the new task
  nextTask.calculateNextDueDate();
  
  return nextTask.save();
};

// Static method to get user's task statistics
taskSchema.statics.getUserStats = async function(userId, startDate, endDate) {
  const match = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (startDate || endDate) {
    match.createdAt = {};
    if (startDate) match.createdAt.$gte = new Date(startDate);
    if (endDate) match.createdAt.$lte = new Date(endDate);
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const stats = await this.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        overdue: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $ne: ['$status', 'completed'] },
                  { $lt: ['$dueDate', new Date()] },
                  { $ne: ['$dueDate', null] }
                ]
              },
              1,
              0
            ]
          }
        },
        completedToday: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'completed'] },
                  { $gte: ['$completedAt', today] }
                ]
              },
              1,
              0
            ]
          }
        },
        completedThisWeek: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'completed'] },
                  { $gte: ['$completedAt', weekStart] }
                ]
              },
              1,
              0
            ]
          }
        },
        completedThisMonth: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ['$status', 'completed'] },
                  { $gte: ['$completedAt', monthStart] }
                ]
              },
              1,
              0
            ]
          }
        },
        avgEstimatedTime: { $avg: '$estimatedTime' },
        avgActualTime: { $avg: '$actualTime' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    overdue: 0,
    completedToday: 0,
    completedThisWeek: 0,
    completedThisMonth: 0,
    avgEstimatedTime: 0,
    avgActualTime: 0
  };
};

// Static method to get category distribution
taskSchema.statics.getCategoryStats = async function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$category.name',
        count: { $sum: 1 },
        completed: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        color: { $first: '$category.color' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Task', taskSchema);
