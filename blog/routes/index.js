var express = require('express');
var crypto = require('crypto');
var router = express.Router();
// var multer = require('multer');
// var upload = multer().single('avatar');
// var upload = multer({ dest: './public/images'} );
var fs = require('fs');
var User = require('../models/user.js');
var Post = require('../models/post.js');
var Comment = require('../models/comment.js');
var trimHtml = require('trim-html');
/* GET home page. */
var uuid = require('node-uuid');

router.get('/', function(req, res) {
	Post.getCategories(function(err, cats) {
		if (err) {
			req.flash('error', err);
		}
		var categories = cats;
		Post.getCategory(function(err, cat) {
			if (err) {
				req.flash('error', err);
			}
			var category = cat;

			Post.getHotBlog(function(err, docs) {
				if (err) {
					req.flash('error', err);
				}
				Post.getArchive(function(err, posts) {
					if (err) {
						req.flash('error', err);
						return res.redirect('/');
					}
					var trimed =[];
					posts.forEach(function(post,index){
						 trimed[index]  = trimHtml(post.content,{limit:100});
					});
					//console.log(req.flash('error').toString())
					res.render('index', {
						title: '最近的文章',
						posts: posts,
						docs: docs,
						category: category,
						trimed:trimed,
						categories: categories,
						url: req.url,
						success: req.flash('success').toString(),
						error: req.flash('error').toString(),
						user: req.session.user
					})
				});
			})
		});
	});

});



router.get('/reg', checkNotLogin);
router.get('/reg', function(req, res) {
	res.render('reg', {
		title: '注册',
		user: req.session.user,
		url: req.url,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/reg', checkNotLogin);
router.post('/reg', function(req, res) {
	var name = req.body.name,
		password = req.body.password,
		passwdconf = req.body.passwdconf,
		email = req.body.email;
	//检验两次密码输入是否一致
	if (passwdconf != password) {
		req.flash('error', '两次输入的密码不一致');
		return res.redirect('/reg');
	}

	//生成密码的MD5值
	var md5 = crypto.createHash('md5'),
		password = md5.update(req.body.password).digest('hex'),
		newUser = new User({
			name: name,
			password: password,
			email: email
		});
	//检查用户名是否存在
	User.get(newUser.name, function(err, user) {
		if (user) {
			req.flash('error', '用户已存在');
			return res.redirect('/reg');
		}
		newUser.save(function(err, user) {
			if (err) {
				req.flash('error', err);
				return res.redirect('/reg');
			}
			req.session.user = user;
			req.flash('success', '注册成功');
			res.redirect('/');
		});
	});
});

router.get('/login', checkNotLogin);
router.get('/login', function(req, res) {
	res.render('login', {
		title: '登录',
		user: req.session.user,
		url: req.url,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});
});

router.post('/login', checkNotLogin);
router.post('/login', function(req, res) {
	var md5 = crypto.createHash('md5');
	password = md5.update(req.body.password).digest('hex');
	//检查用户是否存在
	User.get(req.body.name, function(err, user) {
		if (!user) {
			req.flash('error', '用户不存在');
			return res.redirect('/login');
		}
		//检查密码是否一致
		if (user.password != password) {
			req.flash('error', '密码输入错误');
			return res.redirect('/login');
		}
		//正确则存入session
		req.session.user = user;
		req.flash('success', '登录成功！');
		res.redirect('/');
	});
});

router.get('/post', checkLogin);
router.get('/post', function(req, res) {
	res.render('post', {
		title: '发表',
		user: req.session.user,
		url: req.url,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	})
});

router.post('/post', checkLogin);
router.post('/post', function(req, res) {
	var currentUser = req.session.user;
	var categories = [{
		"category": req.body.category1
	}, {
		"category": req.body.category2
	}];
	var tags = [{
		"tag": req.body.tag1
	}, {
		"tag": req.body.tag2
	}, {
		"tag": req.body.tag3
	}];
	var post = new Post(currentUser.name, currentUser.head, req.body.title, categories, tags, req.body.content);
	post.save(function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('/');
		}
		req.flash('success', '发布成功');
		res.redirect('/');
	});
});

router.get('/logout', checkLogin);
router.get('/logout', function(req, res) {
	req.session.user = null,
		req.flash('success', '登出成功');
	res.redirect('/');
});

router.get('/upload', checkLogin);
router.get('/upload', function(req, res) {
	res.render('upload', {
		title: '文件上传',
		user: req.session.user,
		url: req.url,
		success: req.flash('success').toString(),
		error: req.flash('error').toString()
	});

});

router.post('/upload', checkLogin);
router.post('/upload', function(req, res) {

	for (var i in req.files) {
		if (req.files[i].size == 0) {
			//使用同步方式删除文件
			fs.unlinkSync(req.files[i].path);
			console.log('成功删除一个空文件');
		} else {
			var target_path = './public/images/' + req.files[i].name;
			//使用同步方式重命名一个文件
			//fs.renameSync(req.files[i].path,target_path);
			var is = fs.createReadStream(req.files[i].path);
			var os = fs.createWriteStream(target_path);

			is.pipe(os);
			is.on('end', function() {
				fs.unlinkSync(req.files[i].path);
			});
		}
		req.flash('success', '文件上传成功');
		res.redirect('/upload');
	}
});

router.get('/blog', function(req, res) {
	Post.getCategories(function(err, cats) {
		if (err) {
			req.flash('error', err);
		}
		var categories = cats;
		Post.getCategory(function(err, cat) {
			if (err) {
				req.flash('error', err);
			}
			var category = cat;

			Post.getHotBlog(function(err, docs) {
				if (err) {
					req.flash('error', err);
				}
				//判断是否是第一页， 并把请求的页数转换成 number 类型
				var page = req.query.p ? parseInt(req.query.p) : 1;
				//查询并返回第page页的六篇文章

				Post.getSix(null, page, function(err, posts, total) {
					if (err) {
						posts = [];
					}
					var trimed =[];
					 posts.forEach(function(post,index){
                                                 trimed[index]  = trimHtml(post.content,{limit:100});
                                        });
					res.render('blog', {
						title: '我的博客',
						posts: posts,
						categories: categories,
						trimed:trimed,
						docs: docs,
						category: category,
						page: page,
						url: req.url,
						totalpage: Math.ceil(total / 6),
						isFirstPage: (page - 1) == 0,
						isLastPage: ((page - 1) * 6 + posts.length) == total,
						user: req.session.user,
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
					});
				});
			});
		});
	});
});

router.get('/tags', function(req, res) {
	Post.getTags(function(err, posts) {
		if (err) {
			req.flash('error', err);
			res.redirect('/');
		}
		res.render('tags', {
			title: '标签',
			posts: posts,
			url: req.url,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.get('/tags/:tag', function(req, res) {
	Post.getCategories(function(err, cats) {
		if (err) {
			req.flash('error', err);
		}
		var categories = cats;
		Post.getCategory(function(err, cat) {
			if (err) {
				req.flash('error', err);
			}
			var category = cat;

			Post.getHotBlog(function(err, docs) {
				if (err) {
					req.flash('error', err);
				}
				Post.getTag(decodeURIComponent(req.params.tag), function(err, posts) {
					if (err) {
						req.flash('error', err);
						res.redirect('/');
					}
					res.render('tag', {
						title: '标签:' + decodeURIComponent(req.params.tag),
						user: req.session.user,
						url: req.url,
						posts: posts,
						docs:docs,
						category:category,
						categories:categories,						
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
					});
				});
			});
		});
	});
});


router.get('/search', function(req, res) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	Post.getCategories(function(err, cats) {
		if (err) {
			req.flash('error', err);
		}
		var categories = cats;
		Post.getCategory(function(err, cat) {
			if (err) {
				req.flash('error', err);
			}
			var category = cat;

			Post.getHotBlog(function(err, docs) {
				if (err) {
					req.flash('error', err);
				}
				Post.search(req.query.keyword,page, function(err, posts,total) {
					if (err) {
						req.flash('error', err);
					//	console.log(err);
						return res.redirect('/');
					}
					res.render('search', {
						title: req.query.keyword  + ' 的搜索结果：',
						user: req.session.user,
						category:category,
						categories:categories,
						docs:docs,
						query:req.query.keyword,
						url: req.url,
						page: page,
						totalpage: Math.ceil(total / 10),
						isFirstPage: (page - 1) == 0,
						//isLastPage: ((page - 1) * 10 + posts.length) == total,
						posts: posts,
						success: req.flash('success').toString(),
						error: req.flash('error').toString()
					});
				});
			});
		});
	});
});

//router.get('/u/:name', checkLogin);
router.get('/u/:name', function(req, res) {
	var page = req.query.p ? parseInt(req.query.p) : 1;
	//检查用户是否存在
	User.get(encodeURIComponent(req.params.name), function(err, user) {

		if (!user) {
			req.flash('error', '用户不存在');
			return redirect('/');
		}
		Post.getCategories(function(err, cats) {
			if (err) {
				req.flash('error', err);
			}
			var categories = cats;
			Post.getCategory(function(err, cat) {
				if (err) {
					req.flash('error', err);
				}
				var category = cat;

				Post.getHotBlog(function(err, docs) {
					if (err) {
						req.flash('error', err);
					}
					//查询并返回该用户的6篇文章
					Post.getSix(user.name, page, function(err, posts, total) {
						if (err) {
							req.flash('error', err);
							return res.redirect('/');
						}
						res.render('user', {
							title: user.name,
							posts: posts,
							category:category,
							categories:categories,
							docs:docs,
							page: page,
							url: req.url,
							totalpage: Math.ceil(total / 6),
							isFirstPage: (page - 1) == 0,
							isLastPage: ((page - 1) * 6 + posts.length) == total,
							user: req.session.user,
							success: req.flash('success').toString(),
							error: req.flash('error').toString()
						});
					});
				});
			});
		});
	});
});

//router.get('/u/:name/:day/:title', checkLogin)
router.get('/p/:_id', function(req, res) {
	Post.getCategories(function(err, cats) {
		if (err) {
			req.flash('error', err);
		}
		var categories = cats;
		Post.getCategory(function(err, cat) {
			if (err) {
				req.flash('error', err);
			}
			var category = cat;

			Post.getHotBlog(function(err, docs) {
				if (err) {
					req.flash('error', err);
				}
				Post.getOne(req.params._id, function(err, post) {
					if (err) {
						req.flash('error', err);
						return res.redirect('back');
					}
					if (post != null) {
						res.render('article', {
							title: post.title,
							post: post,
							categories:categories,
							category:category,
							docs:docs,
							url: req.url,
							user: req.session.user,
							success: req.flash('success').toString(),
							error: req.flash('error').toString()
						});
					} else {
						res.render('404');
					}
				});
			});
		});
	});
});

//留言提交处理，不需要检查登录，访客也可评论
//router.post('/u/:name/:day/:title',checkLogin);
router.post('/p/:_id', function(req, res) {
	var parent_id = req.query.parent_id || '';
	var date = new Date(),
		time = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
	var md5 = crypto.createHash('md5'),
		email_MD5 = md5.update(req.body.email.toLowerCase()).digest('hex'),
		head = "http://cn.gravatar.com/avatar/" + email_MD5 + "?s=35";
	var comment = {
		"name": req.body.name,
		"head": head,
		"time": time,
		"parent_id": parent_id,
		"comment_id": uuid.v1(),
		"website": req.body.website,
		"email": req.body.email,
		"content": req.body.content,
		"hide":false,
		"state": 1
	};
	var newComment = new Comment(req.params._id, comment);
	newComment.save(function(err) {
		if (err) {
			req.flash("error", err);
			return res.redirect('back');
		}
		req.flash('success', '评论提交成功！');
		return res.redirect('back');

	});

});

router.get('/removecomment/:_id', checkLogin);
router.get('/removecomment/:_id', function(req, res) {
	var post_id = req.params._id;
	var comment_id = req.query.comment_id;
	Post.removeComment(post_id, comment_id, function(err) {
	//	console.log(err)
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '删除评论成功！');
		res.status(200);
		return res.redirect('back');
	});
});

router.get('/hidecomment/:_id', checkLogin);
router.get('/hidecomment/:_id', function(req, res) {
	var post_id = req.params._id;
	var comment_id = req.query.comment_id;
	Post.hideComment(post_id, comment_id, function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '隐藏评论成功！');
		return res.redirect('back');
	});
});

router.get('/showcomment/:_id', checkLogin);
router.get('/showcomment/:_id', function(req, res) {
	var post_id = req.params._id;
	var comment_id = req.query.comment_id;
	Post.showComment(post_id, comment_id, function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '显示评论成功！');
		return res.redirect('back');
	});
});

router.get('/edit/:_id', checkLogin);
router.get('/edit/:_id', function(req, res) {
	Post.edit(req.params._id, function(err, post) {
		if (err) {			
			req.flash('error', err);
			res.redirect('back');
		}
		res.render('edit', {
			
			title: '编辑：' + post.title,
			post: post,
			url: req.url,
			user: req.session.user,
			success: req.flash('success').toString(),
			error: req.flash('error').toString()
		});
	});
});

router.post('/edit/:_id', checkLogin);
router.post('/edit/:_id', function(req, res) {
	var currentUser = req.session.user;
	var title = req.body.title;
	console.log(title);
	var categories = [{
		"category": req.body.category1
	}, {
		"category": req.body.category2
	}];
	var tags = [{
		"tag": req.body.tag1
	}, {
		"tag": req.body.tag2
	}, {
		"tag": req.body.tag3
	}];
	var post = new Post(currentUser.name, currentUser.head, title, categories, tags, req.body.content);
	Post.update(req.params._id, post, function(err) {
		//var title = encodeURIComponent(req.params.title);
		var url = "/p/" + req.params._id;
		if (err) {
			req.flash('error', err);
			return res.redirect(url);
		}
		req.flash('success', '修改成功！');
		res.redirect(url);

	})
});

router.get('/remove/:_id', checkLogin);
router.get('/remove/:_id', function(req, res) {
	var currentUser = req.session.user;
	Post.remove(req.params._id, function(err) {
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}
		req.flash('success', '删除成功!');
		res.redirect('/');
	});
});

router.get('/reprint/:_id', checkLogin);
router.get('/reprint/:_id', function(req, res) {
	Post.edit(req.params._id, function(err, post) {
		if (err) {
			req.flash('error', err);
			return res.redirect('back');
		}

		var currentUser = req.session.user;
		var reprint_from = {
				name: post.name,
				day: post.time.day,
				title: post.title,
				_id: req.params._id
			},
			reprint_to = {
				name: currentUser.name,
				head: currentUser.head
			};
		Post.reprint(reprint_from, reprint_to, function(err, post) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			req.flash('success', '转载成功！');
			var title = encodeURIComponent(post.title);
			var url = '/p/' + post._id;
			res.redirect(url);
		});
	});
});

//消息处理
router.get("/message", function(req, res) {
	if (req.session.user) {
		var count = 0;
		Post.message(req.session.user.name, function(err, posts) {
			if (err) {
				req.flash('error', err);
				return res.redirect('back');
			}
			res.send(posts);
		});
	} else res.send(null);
});

router.get("/categories/:fenlei",function(req,res){
	var fenlei = decodeURIComponent(req.params.fenlei);
	var page = req.query.p ? parseInt(req.query.p) : 1;
	Post.getCategories(function(err, cats) {
		if (err) {
			req.flash('error', err);
		}
		var categories = cats;
		Post.getCategory(function(err, cat) {
			if (err) {
				req.flash('error', err);
			}
			var category = cat;
			Post.getHotBlog(function(err, docs) {
				if (err) {
					req.flash('error', err);
				}
				Post.getCategoryPosts(fenlei,function(err,posts,total){
				//	console.log(posts)
					res.render('categories',{
						title:"分类："+fenlei,
						page: page,
						url: req.url,
						totalpage: Math.ceil(total / 6),
						isFirstPage: (page - 1) == 0,
						isLastPage: ((page - 1) * 6 + posts.length) == total,
						user:req.session.user,
						success:req.flash('success').toString(),
						error:req.flash('error').toString(),
						categories:categories,
						category:category,
						docs:docs,
						posts:posts
					});
				});
			});
		});
	});
})

router.use(function(req, res) {
	res.render("404");
});

function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.flash('error', '未登录');
		res.redirect('/login');
	}
	next();
}

function checkNotLogin(req, res, next) {
	if (req.session.user) {
		req.flash('error', '已登录');
		res.redirect('back');
	}
	next();
}

module.exports = router;
