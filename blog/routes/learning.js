var express = require('express');
var router = express.Router();

router.get("/",function(req,res){
	res.render('learning/index',{
		title:"一日不学，混森难受！",
		url:req.url,
		user:req.session.user,
		success:req.flash('success').toString(),
		error:req.flash('error').toString()

	});
});

module.exports = router;