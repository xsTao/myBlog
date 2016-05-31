var mongodb = require('./db');
// var markdown = require('markdown').markdown;
var ObjectID = require('mongodb').ObjectID;

//创建Post类,其初始化在提交文章的时候进行
function Post(name, head, title, categories, tags, content) {
	this.name = name;
	this.head = head;
	this.content = content;
	this.title = title;
	this.tags = tags;
	this.categories = categories;
}
//封装Post类   以便在index.js中调用
module.exports = Post;

//
//存储文章及相关信息

Post.prototype.save = function(callback) {
	var date = new Date();
	//设置不同的时间格式，根据需求选择不同的时间制
	var time = {
			date: date,
			year: date.getFullYear(),
			month: date.getFullYear() + '-' + (date.getMonth() + 1),
			day: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate(),
			minute: date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + " " + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
		}
		//文章所包含的字段
	var post = {
		name: this.name,
		head: this.head,
		time: time,
		title: this.title,
		categories: this.categories,
		tags: this.tags,
		content: this.content,
		comments: [],
		pv: 0,
		reprint_info: {}
	}

	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		} //连接posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			} //插入数据，数据源是post对象
			collection.insert(post, {
				safe: true
			}, function(err) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null); //插入数据成功，返回err为null
			});
		});
	});
}

//获取所有文章及相关信息
//getAll 太多了  修改为getTen   一次获取十篇
// Post.getAll = function(name, callback) {
// 	//打开数据库
// 	mongodb.open(function(err, db) {
// 		if (err) {
// 			return callback(err);
// 		}
// 		db.collection('posts', function(err, collection) {
// 			if (err) {
// 				mongodb.close();
// 				return callback(err);
// 			}
// 			var query = {};
// 			if (name) {
// 				query.name = name;
// 			}
// 			//根据query对象查询文章
// 			collection.find(query).sort({
// 				time: -1 //按时间最近排序
// 			}).toArray(function(err, docs) { //以数组形式返回
// 				// console.log(docs)
// 				mongodb.close();
// 				if (err) {
// 					return callback(err);
// 				}//将markdown转换为html
// 				// docs.forEach(function(doc) {
// 				// 	doc.content = markdown.toHTML(doc.content);
// 				// });
// 				return callback(null, docs); //查询成功则以数组形式返回
// 			});
// 		});
// 	});
// }
//获取6篇文章及相关信息
Post.getSix = function(name, page, callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var query = {};
			if (name) {
				query.name = name;
			}
			//使用count返回特定查询的文章数total
			collection.count(query, function(err, total) {
				//根据 query 对象查询， 并跳过前 (page-1)*6 个结果， 返回之后的 6 个结果
				collection.find(query, {
					skip: (page - 1) * 6,
					limit: 6
				}).sort({
					time: -1 //按时间最近排序
				}).toArray(function(err, docs) { //以数组形式返回
					// console.log(docs)
					mongodb.close();
					if (err) {
						return callback(err);
					} //将markdown转换为html
					// docs.forEach(function(doc) {
					// 	doc.content = markdown.toHTML(doc.content);
					// });
					return callback(null, docs, total);
				}); //查询成功则以数组形式返回
			});
		});
	});
}

//获取一篇文章
Post.getOne = function(_id, callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		//读取posts集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			} //根据姓名、日期和标题找到文章
			//每访问一次，pv值增加1
			collection.update({
				"_id": new ObjectID(_id)
			}, {
				$inc: {
					"pv": 1
				}
			}, function(err, res) {
				if (err) {
					return callback(err);
				}
			});
			collection.findOne({
				"_id": new ObjectID(_id)
			}, function(err, doc) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				//解析markdown为html
				// doc.content = markdown.toHTML(doc.content);
				// doc.comments.forEach(function(comment) {
				// 	comment.content = markdown.toHTML(comment.content);
				// });
				callback(null, doc); //返回查询到的文章
			});
		});
	});
}

//返回原始发表的内容
Post.edit = function(_id, callback) {
	console.log("sdgsar"+_id);
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
console.log(err);
				mongodb.close();
				return callback(err);
			}
			//查询,根据姓名日期标题(id)找到相应的文章
			collection.findOne({
				"_id": new ObjectID(_id)
			}, function(err, doc) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, doc);
			});

		});
	});
}

//更新一篇文章及其相关信息
Post.update = function(_id, post, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.update({
				"_id": ObjectID(_id)
			}, {
				$set: {
					title:post.title,
					categories:post.categories,
					tags:post.tags,
					content: post.content //更新文章的内容
				}
			}, function(err, result) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null);
			});
		});
	});
}

//返回文章的所有存档信息
Post.getArchive = function(callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		//
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			} //返回只包含 name、 time、 title 属性的文档组成的存档数组
			collection.find({}, {
				"name": 1,
				"time": 1,
				"title": 1,
				"comments": 1,
				"content": 1,
				"pv": 1
			}, {
				limit: 20
			}).sort({
				time: -1
			}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
}

Post.getTags = function(callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//distinct 用来找出给定键的所有不同值
			collection.distinct('tags.tag', function(err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(null, docs);
			});
		});
	});
}

Post.getTag = function(tag, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//通过 tags.tag 查询并返回只含有 name、 time、 title 键的文档组成的数组
			collection.find({
				"tags.tag": tag
			}, {
				"name": 1,
				"title": 1,
				"time": 1
			}).sort({
				time: -1
			}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				callback(err, docs);
			});
		});
	});
}

Post.search = function(keyword, page, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			var pattern = new RegExp("^.*" + keyword + ".*$", "i");
			collection.count({
				"title": pattern
			}, function(err, total) {
				if (err) {
					return callback(err);
				}
				collection.find({
					"title": pattern
				}, {
					"name": 1,
					"time": 1,
					"title": 1,
					"comments": 1,
					"content": 1
				}, {
					skip: (page - 1) * 10,
					limit: 10
				}).sort({
					time: -1
				}).toArray(function(err, docs) {
					mongodb.close();
					if (err) {
						callback(err);
					}
					// docs.forEach(function(doc) {
					// 	doc.content = markdown.toHTML(doc.content);
					// });
					callback(null, docs, total);
				});
			});
		});
	});
}

Post.reprint = function(reprint_from, reprint_to, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection("posts", function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//找到被转载的原文档
			collection.findOne({
				'name': reprint_from.name,
				"time.day": reprint_from.day,
				"title": reprint_from.title
			}, function(err, doc) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				var date = new Date();
				var time = {
					date: date,
					year: date.getFullYear(),
					month: date.getFullYear() + "-" + (date.getMonth() + 1),
					day: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
					minute: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
				};
				delete doc._id;
				doc.name = reprint_to.name;
				doc.time = time;
				doc.head = reprint_to.head;
				doc.title = (doc.title.search(/[转载]/) > -1) ? doc.title : "[转载]" + doc.title;
				doc.comments = [];
				doc.reprint_info = {
					"reprint_from": reprint_from
				};
				doc.pv = 0;
				//更新被转载的原文档的 reprint_info 内的 reprint_to
				collection.update({
					"name": reprint_from.name,
					"time.day": reprint_from.day,
					"title": reprint_from.title
				}, {
					$push: {
						"reprint_info.reprint_to": {
							"name": doc.name,
							"day": time.day,
							"title": doc.title
						}
					}
				}, function(err) {
					if (err) {
						mongodb.close();
						return callback(err);
					}
				});
				//将转载生成的副本修改后存入数据库， 并返回存储后的文档
				collection.insert(doc, {
					safe: true
				}, function(err, post) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					callback(null, post.ops[0]);
				});
			});
		});
	});
}

//删除一篇文章
Post.remove = function(_id, callback) {
	//打开数据库
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		//读取 posts 集合
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//查询要删除的文档
			collection.findOne({
				"_id": ObjectID(_id)
			}, function(err, doc) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				//如果有 reprint_from， 即该文章是转载来的， 先保存下来
				var reprint_from = "";
				if (doc.reprint_info.reprint_from) {
					reprint_from = doc.reprint_info.reprint_from;
				}
				if (reprint_from != "") {
					//更新原文章所在文档的 reprint_to
					collection.update({
						"name": reprint_from.name,
						"time.day": reprint_from.day,
						"title": reprint_from.title
					}, {
						$pull: {
							"reprint_info.reprint_to": {
								"_id": new ObjectID(_id)
							}
						}
					}, function(err) {
						if (err) {
							mongodb.close();
							return callback(err);
						}
					});
				}
				// 删除转载来的文章所在的文档
				collection.remove({
					"_id": ObjectID(_id)
				}, {
					w: 1
				}, function(err) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					callback(null);
				});
			});
		});
	});
};

Post.removeComment = function(post_id, comment_id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			//找到并删除相关子评论
			collection.find({
				$or: [{
					"_id": new ObjectID(post_id),
					"comments.comment_id": comment_id
				}, {
					"_id": new ObjectID(post_id),
					"comments.parent_id": comment_id
				}]
			}, {
				'comments': 1,
				'_id': 0
			}).toArray(function(err, docs) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				docs[0].comments.forEach(function(doc) {
					collection.update({
						"_id": new ObjectID(post_id),
						"comments.parent_id": doc.comment_id
					}, {
						$pull: {
							'comments': {
								"parent_id": doc.comment_id
							}
						}
					}, function(err, res) {
						if (err) {
							return callback(err);
						}
					});
				});
			});

			//删除父评论及直接子评论
			collection.update({
				"_id": new ObjectID(post_id),
				"comments.comment_id": comment_id
			}, {
				"$pull": {
					"comments": {
						"comment_id": comment_id
					}
				}
			}, function(err, res) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				collection.update({
					"_id": new ObjectID(post_id),
					"comments.parent_id": comment_id
				}, {
					"$pull": {
						"comments": {
							"parent_id": comment_id
						}
					}
				}, function(err, res) {
					mongodb.close();
					if (err) {
						return callback(err);
					}
					callback(null);
				});
			});
		});
	});
}

Post.hideComment = function(post_id, comment_id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.update({
				"_id": new ObjectID(post_id),
				"comments.comment_id": comment_id
			}, {
				$set: {
					"comments.$.hide": true
				}
			}, function(err, res) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				return callback(null);
			});
		});
	});
}

Post.showComment = function(post_id, comment_id, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}

			collection.update({
				"_id": new ObjectID(post_id),
				"comments.comment_id": comment_id
			}, {
				$set: {
					"comments.$.hide": false
				}
			}, function(err, res) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				return callback(null);
			});
		});
	});
}

Post.message = function(name, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.find({
				"name": name,
				"comments.state": 1
			}, {
				"comments": 1,
				_id: 0
			}).sort({
				time: -1
			}).toArray(function(err, posts) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				return callback(null, posts[0]);
			});
		});
	});
}


Post.getCategory = function(callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.distinct('categories.category', function(err, docs) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				return callback(null, docs);
			});
		});
	});
}

Post.getCategories = function(callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.find({
				"categories": {
					$exists: 1
				}
			}, {
				"categories": 1,
				"_id": 0
			}).toArray(function(err, docs) {
				mongodb.close();
				if (err) {
				//	console.log(err)
					return callback(err);
				}
				return callback(null, docs);
			});
		});
	});
}

Post.getHotBlog = function(callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			collection.find({}, {
				"title": 1,
				"pv": 1
			}, {
				limit: 10
			}).sort({
				pv: -1
			}).toArray(function(err, titles) {
				mongodb.close();
				if (err) {
					return callback(err);
				}
				return callback(null, titles);
			})
		})
	})
}

Post.getCategoryPosts = function(fenlei, callback) {
	mongodb.open(function(err, db) {
		if (err) {
			return callback(err);
		}
		db.collection('posts', function(err, collection) {
			if (err) {
				mongodb.close();
				return callback(err);
			}
			collection.count({
				"categories.category": fenlei
			}, function(err, total) {
				if (err) {
					mongodb.close();
					return callback(err);
				}
				collection.find({
					"categories.category": fenlei
				}, {}).toArray(function(err, docs, total) {
					mongodb.close();
					if (err) {
					//	console.log(err)
						return callback(err);
					}
					// docs.forEach(function(doc) {
					// 	doc.content = markdown.toHTML(doc.content);
					// });
					return callback(null, docs, total);
				});
			});
		});
	});
}
