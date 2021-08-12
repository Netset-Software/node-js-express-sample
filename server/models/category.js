var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
    name: String,
    image: String,
    selectedImage: String,
    status: { type: String, default: "ACT" }
},
    {
        timestamps: true
    });

var Category = mongoose.model('Category', categorySchema);
module.exports = Category

module.exports.addNewCategory = function (params, callback) {
    var new_category = new Category(params);
    new_category.save(callback);
}

module.exports.deleteCategory = function (cat_id, callback) {
    Category.findByIdAndUpdate(cat_id, { status: 'DEL' }, { new: true }, callback);
}

module.exports.updateCategory = function (cat_id, data, callback) {
    var update = clean(data);
    Category.findByIdAndUpdate(cat_id, update, { new: true }, callback);
}

module.exports.getCategories = function (callback) {
    Category.find({ status: 'ACT' })
        .exec(callback);
}




function clean(obj) {
    for (var propName in obj) {
        if (obj[propName] === null || obj[propName] === '' || obj[propName] === undefined) {
            delete obj[propName];
        }
    }
    console.log(obj);
    return obj;
}