const mongoose = require('mongoose');
const Schema = mongoose.Schema,ObjectId = Schema.ObjectId;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  title: {
    type: String,
    default: '',
    trim: true
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  territories:[ {type : mongoose.Schema.ObjectId, ref : 'Territory'} ]
});

/**
 * Validations
 */
ArticleSchema.path('title').validate(title => title.length, 'Title cannot be blank');

mongoose.model('Article', ArticleSchema);
