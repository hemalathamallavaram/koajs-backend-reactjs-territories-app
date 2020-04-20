const mongoose = require('mongoose');
const Schema = mongoose.Schema,ObjectId = Schema.ObjectId;

/**
 * Article Schema
 */
var TerritorySchema = new Schema({
  key: {
    type: String,
    default: '',
    trim: true,
    unique: true
  },  
  articles:[ {type : mongoose.Schema.ObjectId, ref : 'Article'} ]
});

/**
 * Validations
 */
TerritorySchema.path('key').validate(key => key.length, 'key cannot be blank');

mongoose.model('Territory', TerritorySchema);
