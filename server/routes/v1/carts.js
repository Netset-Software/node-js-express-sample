const express = require('express');
const router = express.Router();
const dotenv = require('dotenv');
const path = require('path');
var multer = require('multer');
var jwt = require('jsonwebtoken');
var config = require('../../../config');
var moment = require('moment-timezone');
var share = require('../../session/shareFunction.js');

dotenv.config();

var Category = require('../../models/category');
var Cart = require('../../models/cart');
var Lineitem = require('../../models/lineitem');
var Commission = require('../../models/commission');


/*---------------------------------------
          (1)  Add cart
 ----------------------------------------*/
router.post('/', share.ensureToken, function (req, res) {
    console.log("Add cart", req.body, req.userid)
    var params = req.body;
    params.user = req.userid;
    if (!params.provider || !params.product_id) {
        res.statusCode = process.env.INV
        res.json({
            message: 'All fields are mendatory'
        })
    }
    else {
        Cart.checkCart(params, function (err, cartUpdated) {
            if (err) {
                console.log(" error-- ", err);
                res.statusCode = process.env.INV;
                res.json({
                    message: "Something went wrong!",
                    data: err
                })
            }
            else {
                ////// If cart exists
                if (cartUpdated) {
                    Lineitem.updateQuantityByCart(cartUpdated._id, params, function (err, lineitem) {
                        if (err) {
                            console.log(" error-- ", err);
                            res.statusCode = process.env.INV;
                            res.json({
                                message: "Something went wrong!",
                                data: err
                            })
                        }
                        else {
                            res.statusCode = process.env.SUC;
                            res.json({
                                message: "Added to cart."
                            })
                        }
                    })
                }
                //// If cart not exists with product check if cart exists with same user and provider to add product
                else {
                    Cart.checkForSameProvider(params, function (err, cartUpdatedProvider) {
                        if (err) {
                            console.log(" error-- ", err);
                            res.statusCode = process.env.INV;
                            res.json({
                                message: "Something went wrong!",
                                data: err
                            })
                        }
                        else {
                            if (cartUpdatedProvider) {
                                var sendParams = {
                                    cart: cartUpdatedProvider._id,
                                    product: params.product_id,
                                    qty: params.qty
                                }
                                Lineitem.addNewLineitem(sendParams, function (err, newLineitem) {
                                    if (err) {
                                        console.log(" error-- ", err);
                                        res.statusCode = process.env.INV;
                                        res.json({
                                            message: "Something went wrong!",
                                            data: err
                                        })
                                    }
                                    else {
                                        var products = cartUpdatedProvider.products, lineitems = cartUpdatedProvider.lineitems;
                                        products.push(params.product_id)
                                        lineitems.push(newLineitem._id)
                                        Cart.updateCartProducts(cartUpdatedProvider._id, products, lineitems, function (err, newLineitem) {
                                            if (err) {
                                                console.log(" error-- ", err);
                                                res.statusCode = process.env.INV;
                                                res.json({
                                                    message: "Something went wrong!",
                                                    data: err
                                                })
                                            }
                                            else {
                                                res.statusCode = process.env.SUC;
                                                res.json({
                                                    message: "Added to cart."
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                            else {
                                //////// No existing cart so creating new cart
                                console.log("No existing cart so creating new cart")
                                Cart.addNewCart(params, function (err, newCart) {
                                    console.log("err, newCart", err, newCart)
                                    if (err) {
                                        console.log(" error-- ", err);
                                        res.statusCode = process.env.INV;
                                        res.json({
                                            message: "Something went wrong!",
                                            data: err
                                        })
                                    }
                                    else {

                                        var sendParams = {
                                            cart: newCart._id,
                                            product: params.product_id,
                                            qty: params.qty
                                        }
                                        Lineitem.addNewLineitem(sendParams, function (err, newLineitem) {
                                            console.log("err, newLineitem", err, newLineitem)
                                            if (err) {
                                                console.log(" error-- ", err);
                                                res.statusCode = process.env.INV;
                                                res.json({
                                                    message: "Something went wrong!",
                                                    data: err
                                                })
                                            }
                                            else {
                                                var products = [], lineitems = [];
                                                products.push(params.product_id)
                                                lineitems.push(newLineitem._id)
                                                Cart.updateCartProducts(newCart._id, products, lineitems, function (err, newLineitem) {
                                                    console.log("err, newLineitem", err, newLineitem)
                                                    if (err) {
                                                        console.log(" error-- ", err);
                                                        res.statusCode = process.env.INV;
                                                        res.json({
                                                            message: "Something went wrong!",
                                                            data: err
                                                        })
                                                    }
                                                    else {
                                                        res.statusCode = process.env.SUC;
                                                        res.json({
                                                            message: "Added to cart."
                                                        })
                                                    }
                                                })
                                            }
                                        })
                                    }
                                })
                            }
                        }
                    })
                }
            }
        })
    }
})





/*---------------------------------------
          (2)  Inc/Dec/remove product
 ----------------------------------------*/
router.put('/lineitems/:id', share.ensureToken, function (req, res) {
    console.log("Inc/Dec/remove product", req.body, req.userid)
    var params = req.body;
    if (!params.type) {
        res.statusCode = process.env.INV
        res.json({
            message: 'All fields are mendatory'
        })
    }
    else {
        if (params.type == 'INC') {
            Lineitem.increaseQty(req.params.id, function (err, lineitem) {
                if (err) {
                    console.log(" error-- ", err);
                    res.statusCode = process.env.INV;
                    res.json({
                        message: "Something went wrong!",
                        data: err
                    })
                }
                else {
                    res.json({
                        message: "Lineitem updated successfully"
                    })
                }
            })
        }
        else if (params.type == 'DEC') {
            Lineitem.decreaseQty(req.params.id, function (err, lineitem) {
                if (err) {
                    console.log(" error-- ", err);
                    res.statusCode = process.env.INV;
                    res.json({
                        message: "Something went wrong!",
                        data: err
                    })
                }
                else {
                    res.json({
                        message: "Lineitem updated successfully"
                    })
                }
            })
        }
        else {
            Lineitem.deleteLineitem(req.params.id, function (err, lineitem) {
                if (err) {
                    console.log(" error-- ", err);
                    res.statusCode = process.env.INV;
                    res.json({
                        message: "Something went wrong!",
                        data: err
                    })
                }
                else {
                    Cart.removeLineitemFromCart(req.params.id, lineitem, function (err, lineitem) {
                        if (err) {
                            console.log(" error-- ", err);
                            res.statusCode = process.env.INV;
                            res.json({
                                message: "Something went wrong!",
                                data: err
                            })
                        }
                        else {
                            res.json({
                                message: "Lineitem updated successfully"
                            })
                        }
                    })
                }
            })
        }
    }
})



/*---------------------------------------
          (3)  Delete cart
 ----------------------------------------*/
router.delete('/:id', share.ensureToken, function (req, res) {
    console.log("Delete cart", req.body, req.userid)
    var params = req.body;
    Cart.deleteCart(req.params.id, function (err, cart) {
        if (err) {
            console.log(" error-- ", err);
            res.statusCode = process.env.INV;
            res.json({
                message: "Something went wrong!",
                data: err
            })
        }
        else {
            Lineitem.deleteCartLineitems(req.params.id, function (err, lineitems) {
                if (err) {
                    console.log(" error-- ", err);
                    res.statusCode = process.env.INV;
                    res.json({
                        message: "Something went wrong!",
                        data: err
                    })
                }
                else {
                    res.json({
                        message: "Cart deleted successfully"
                    })
                }
            })
        }
    })

})




/*---------------------------------------
          (4)  Get cart
 ----------------------------------------*/
router.get('/', share.ensureToken, function (req, res) {
    console.log("get cart", req.body, req.userid)
    Commission.getTax(function (err, taxData) {
        if (err) {
            console.log(" error-- ", err);
            res.statusCode = process.env.INV;
            res.json({
                message: "Something went wrong!",
                data: err
            })
        } else {
            Cart.getCartDetails(req.userid, function (err, cart) {
                if (err) {
                    console.log(" error-- ", err);
                    res.statusCode = process.env.INV;
                    res.json({
                        message: "Something went wrong!",
                        data: err
                    })
                }
                else {
                    res.json({
                        message: "Cart fetched successfully",
                        cart: cart,
                        service_fee: taxData.commission
                    })
                }
            })
        }
    })
})
module.exports = router;