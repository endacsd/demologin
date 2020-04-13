
var http = require('http');

var querystring = require('querystring');

var url = require('url');

var fs = require('fs');



var mysql = require('mysql');

var mysql_user = {
    host : 'localhost',
    user : 'root',
    password : '123456',
    database: 'my_sql'
};

var connection = mysql.createConnection(mysql_user);
connection.connect(function (err) {
    if(err){
        console.log('[error] :' + err);
        connection.end();
        return;
    };
    console.log('link ok!');
});



var Event = require('events').EventEmitter;

var query =new Event();

query.on('login',function (username,password,connection) {
    var find = 'SELECT * FROM userinfo WHERE UserName = ' + username;

    //sql

    connection.query(find,function (err,result) {
        if(err){
            console.log(['error'] + err);
            return;
        }

        if(result.length){
            console.log('------------start----------------');
            var string = JSON.stringify(result);
            var json =JSON.parse(string)[0];
            console.log(string);

            if(json.UserPass == password){
                console.log('ok');
            }else{
                console.log('not');
            }
            console.log('-------------end-----------------');
        }else{
            console.log('not exist');
        }

    });
});

/*
query.on('regsiter', function (username,password,connection) {



    var find = 'SELECT * FROM userinfo WHERE UserName = ' + username;
    var insert = 'INSERT INTO userinfo (Id,UserName,UserPass) VALUES (0,?,?)';
    //sql
    
    connection.query(find,function (err,result) {
        
        if(err){
            console.log('[errorkkk]'+ err);
            return;
        }
        
        if(result.length){
            console.log('has exist');
            return;
        }else{
            var inserInfo =[username,password];
            
            
            connection.query(insert,inserInfo,function (err,result) {
                if(err){
                    console.log('[resgiter error]'+err);
                    return;
                }

                console.log('------------start----------------');
                console.log('register ok!');
                console.log(result);
                console.log('-------------end-----------------');
            });
        }
        
    });
});


 */

//
//定义注册事件    传入 username password  链接数据库对象
query.on('regsiter', function(username, password, connection) {
//编写查询语句
    var find = 'SELECT * FROM userinfo WHERE UserName = ' + username;
//编写添加语句
    var insert = 'INSERT INTO userinfo (Id,UserName,UserPass) VALUES (0,?,?)';
//执行sql语句
    connection.query(find, function(err, result) {
        if (err) {   //链接失败 直接return;
            console.log('[错误]' + err);
            return;
        }

        if (result.length) {   //如果数据库返回数据 说明账号已存在
            console.log('账号已存在');
            return;
        } else {               //否则不存在   可以进行注册
            var inserInfo = [username, password];  //定义插入数据
            //执行插入数据语句
            connection.query(insert, inserInfo, function(err, result) {
                if (err) {   //链接失败 直接return;
                    console.log('[注册错误]' + err);
                    return;
                };
                console.log('------------start----------------');
                console.log('注册成功');
                console.log(result);
                console.log('--------------end-----------------');
            });
        }
    });
});

//
http.createServer(function (req,res) {
    if(req.url == '/favicon.ico'){
        return;
    }

    var pathname = url.parse(req.url).pathname;
    var body = '';

    //
    req.on('data',function (chunk) {
       body = '';
       body += chunk;
       body = querystring.parse(body);
    });
    //
    fs.readFile(pathname.substring(1) + '.html',function (err,data) {
        if(err) {
            res.writeHead(404,{
                'Content-Type' : 'text/html; charset=utf-8'
            });
            res.write('404 PAGE');
        }else{
            res.writeHead(200,{
                'Content-Type' : 'text/html; charset=utf-8'
            });
            //
            if(body){
                switch(pathname) {
                    case '/login':
                        query.emit('login',body.username,body.password,connection);
                        break;
                    case '/regsiter' :
                        query.emit('regsiter',body.username,body.password,connection);
                };
            }
            //
            res.write(data);
        }
        res.end();
    });
}).listen(3000);

