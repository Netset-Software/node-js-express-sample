var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var lineitemSchema = new Schema({
    cart: { type: String, ref: 'Cart' },
    product: { type: String, ref: 'Product' },
    qty: { type: Number, default: 1 },
    status: { type: String, default: "ACT" }
},
    {
        timestamps: true
    });

var Lineitem = mongoose.model('Lineitem', lineitemSchema);
module.exports = Lineitem

module.exports.addNewLineitem = function (params, callback) {
    var new_lineitem = new Lineitem(params);
    new_lineitem.save(callback);
}

module.exports.updateQuantityByCart = function (cart_id, params, callback) {
    if(params.qty){
        var qtyToAdd = parseInt(params.qty);
        Lineitem.findOneAndUpdate({ cart: cart_id, product: params.product_id, status: 'ACT' }, { $inc: { qty: qtyToAdd } }, { new: true }, callback);
    }
    else{
        Lineitem.findOneAndUpdate({ cart: cart_id, product: params.product_id, status: 'ACT' }, { $inc: { qty: 1 } }, { new: true }, callback);
    } 
}

module.exports.increaseQty = function (id, callback) {
    Lineitem.findByIdAndUpdate(id,{ $inc: { qty: 1 } }, { new: true }, callback);
}

module.exports.decreaseQty = function (id, callback) {
    Lineitem.findByIdAndUpdate(id,{ $inc: { qty: -1 } }, { new: true }, callback);
}

module.exports.deleteLineitem = function (id, callback) {
    Lineitem.findByIdAndUpdate(id,{ status: 'DEL'}, { new: true }, callback);
}

module.exports.deleteCartLineitems = function (id, callback) {
    Lineitem.updateMany({cart_id: id},{ status: 'DEL'}, { new: true }, callback);
}