var express = require('express');
var router = express.Router();
var Clothes = require("../models/clothes")

router.get("/",function(req,res){
	res.render('learning/index',{
		title:"一日不学，混森难受！",
		url:req.url,
		user:req.session.user,
		success:req.flash('success').toString(),
		error:req.flash('error').toString()

	});
});
router.get("/jscharts",function(req,res){  
    res.render('learning/jscharts',{
        title:'',
        url:req.url,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    });
});

router.get("/getClothes",function(req,res){
    Clothes.getOne(function(err,clothes){
        if (err) {
			req.flash('error', err);
		}
        res.send(clothes);
    });
})
module.exports = router;