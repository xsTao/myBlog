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
        title:'js图表学习--echarts',
        url:req.url,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    });
});
router.get("/interactive",function(req,res){
    res.render('learning/interactive',{
        title:'css3制作菜单',
        url:req.url,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    });
});
router.get("/waterfall",function(req,res){
    res.render('learning/waterfall',{
        title:'图片瀑布流',
        url:req.url,
        user:req.session.user,
        success:req.flash('success').toString(),
        error:req.flash('error').toString()
    });
});
router.get("/picturewall",function(req,res){
    res.render('learning/picturewall',{
        title:'照片墙',
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