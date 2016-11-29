var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  read: {type: Number, default:0},
  name: {type: String, required: true, trim: true},
  title: {type: String, required: true, trim: true},
  city: {type: String, required: true, trim: true},
  address: {type: String, required: true, trim: true},
  fee: {type: String, required: true, trim: true},
  facilities: {type: String, required: true, trim: true},
  rule: {type: String, required: true, trim: true},

  password: {type: String},
  createdAt: {type: Date, default: Date.now}
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Post = mongoose.model('Post', schema);

module.exports = Post;