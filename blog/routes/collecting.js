var express = require('express');
var router = express.Router();

router.get("/",function(req,res){
	console.log(req.url);
	res.render('collecting/index',{
		title:"各种各样的收藏",
		url:req.url,
		user:req.session.user,
		success:req.flash('success').toString(),
		error:req.flash('error').toString()
	});
});

module.exports = router;
