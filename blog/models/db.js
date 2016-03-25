var settings  = require('../settings'),
    Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server;
module.exports =  new Db(settings.Db,new Server(settings.host,27017,{auto_reconnect:true}), {safe: true});
