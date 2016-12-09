var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  incoming_requester: {type: String, required: true, trim: true}, //예약요청이 나에게 들어옴
  outgoing_requester: {type: String, required: true, trim: true}, //내가 예약요청함
  title: {type: String, required: true, trim: true},
  checkin: {type: Date, default: Date.now},
  checkout: {type: Date, default: Date.now},
  personnel: {type: String, required: true, trim: true},
  situation: {type: String, required: true, trim: true},
}, {
  toJSON: { virtuals: true},
  toObject: {virtuals: true}
});

var Reserve = mongoose.model('Reserve', schema);

module.exports = Reserve;