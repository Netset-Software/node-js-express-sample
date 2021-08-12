var mongoose = require('mongoose');
const { param } = require('../routes/v1/carts');
var Schema = mongoose.Schema;

var cartSchema = new Schema({
    user: { type: String, ref: 'User' },
    provider: { type: String, ref: 'User' },
    lineitems: [{ type: String, ref: 'Lineitems' }],
    products: [{ type: String, ref: 'Product' }],
    status: { type: String, default: "ACT" }
},
    {
        timestamps: true
    });

var Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart

module.exports.addNewCart = function (params, callback) {
    var new_cart = new Cart(params);
    new_cart.save(callback);
}

module.exports.checkCart = function (params, callback) {
    Cart.findOne({ user: params.user, provider: params.provider, products: params.product_id, status: 'ACT' }, callback);
}

module.exports.updateCartProducts = function (cart_id, products, lineitems, callback) {
    Cart.findByIdAndUpdate(cart_id, { products: products, lineitems: lineitems }, { new: true }, callback);
}

module.exports.checkForSameProvider = function (params, callback) {
    Cart.findOne({ user: params.user, provider: params.provider, status: 'ACT' }, callback);
}

module.exports.removeLineitemFromCart = function (id, params, callback) {
    Cart.findByIdAndUpdate(params.cart, { $pull: { lineitems: id, products: params.product } }, { new: true }, callback);
}

module.exports.productDeletedByProvider = function (id, callback) {
    Cart.updateMany({ products: id }, { $pull: { products: id, 'lineitems.$product': id } }, { new: true }, callback);
}

module.exports.deleteCart = function (id, callback) {
    Cart.findByIdAndUpdate(id, { status: 'DEL' }, { new: true }, callback);
}

module.exports.getCartDetails = function (user_id, callback) {
    Cart.findOne({ user: user_id, status: 'ACT' })
        .populate('provider')
        .populate({
            path: 'lineitems',
            model: "Lineitem",
            populate: {
                path: 'product',
                model: 'Product',
                populate: {
                    path: 'images',
                    model: 'ProductImage'
                }
            }
        })
        .exec(callback);
}


module.exports.changeStatusCart = function (id, callback) {
    Cart.findByIdAndUpdate(id, { status: 'APP' }, { new: true }, callback);
}