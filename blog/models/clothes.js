var mongodb = require("./db");

var Clothes = function(category,data){
    this.category = category;
    this.data = data;
}
module.exports = Clothes;

Clothes.getOne = function (callback) {
    mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('clothes', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
            collection.findOne({},function(err,clothes){
                mongodb.close();
                if(err){
                    return callback(err);
                }
                callback(null,clothes);
            })
        })
    })
}