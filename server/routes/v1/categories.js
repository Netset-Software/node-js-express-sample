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
var SubCategory = require('../../models/subcategory');



/*---------------------------------------
          (1)  Get All Categories
 ----------------------------------------*/
router.get('/', share.ensureToken, function (req, res) {
    console.log("get all categories")

    Category.getCategories(function (err, categories) {
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
                message: "Categories fetched  successfully",
                categories: categories
            })
        }
    })
});





/*------------------------------------------------------
          (2)  Get Sub-categories of category
 -------------------------------------------------------*/

router.get('/:categoryId', share.ensureToken, function (req, res) {
    console.log("Get Sub-categories of category", req.params.categoryId)
    var category_id = req.params.categoryId;

    SubCategory.getSubCategories(category_id, function (err, sub_categories) {
        if (err) {
            console.log(" error-- ", err);
            res.statusCode = process.env.INV;
            res.json({
                message: "Something went wrong!",
                data: err
            })
        }
        else {
            var sub_categoriesToSend = [];
            for (var i in sub_categories) {
                sub_categoriesToSend[i] = sub_categories[i].toObject();
                sub_categoriesToSend[i].category_id = sub_categories[i].category_id._id;
                sub_categoriesToSend[i].category_name = sub_categories[i].category_id.name;
            }
            res.json({
                message: "Sub-Categories fetched  successfully",
                sub_categories: sub_categoriesToSend
            })

        }
    })

});



/*------------------------------------------------
          (1)  Get All Categories with sub categories
 ------------------------------------------------*/
router.get('/categories_subcategories', share.ensureToken, function (req, res) {
    console.log("get all categories newwwwww")
    // var baseUrl = req.protocol + '://' + req.get('host');
    var sendCategories = [];
    var device_type = req.get('devicetype');
    var device_id = req.get('deviceid');

    Category.getCategories(function (err, categories) {
        if (err) {
            console.log(" error-- ", err);
            res.statusCode = process.env.INV;
            res.json({
                message: "Something went wrong!",
                data: err
            })
        }
        else {
            for (var i in categories) {
                findSubCategories(categories[i]._id, i, callback);
                function callback(sub_categories, i) {
                    var sendcategory = categories[i].toObject();
                    var sendSubcates = [];
                    for (var i in sub_categories) {
                        sendSubcates[i] = sub_categories[i].toObject();
                        sendSubcates[i].selected = false;
                    }
                    sendcategory.selected = false;
                    sendcategory.sub_categories = sendSubcates;
                    sendCategories.push(sendcategory)
                    if (sendCategories.length == categories.length) {
                        console.log("this is the final repsonse:", sendCategories)
                        res.json({
                            message: "Categories found  successfully",
                            categories: sendCategories
                        })
                    }
                }
            }

        }
    })

    function findSubCategories(category, i, callback) {
        SubCategory.getSubcategoriesOfSingleCat(category, function (err, sub_categories) {
            if (err) {
                console.log(" error-- ", err);
                res.statusCode = process.env.INV;
                res.json({
                    message: "Something went wrong!",
                    data: err
                })
            }
            else {

                callback(sub_categories, i)

            }
        })
    }

});




module.exports = router;