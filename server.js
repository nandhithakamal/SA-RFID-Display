var hapi = require('hapi');
var coap = require('coap');
var qs = require('querystring');
var pg = require("pg");


var hapiServer = new hapi.Server();
var coapServer = coap.createServer();

var tag = '';
var parsedData = undefined;

var conString = process.env["DATABASE_URL"];
var client = new pg.Client(conString);
client.connect((err) =>{
    if(err){
        console.log("Connection error" + err);
    }else{
        console.log("Connected");
    }
});

hapiServer.connection({ port: 9090, host: 'localhost'});

var io = require('socket.io')(hapiServer.listener);

io.on('connection', function(socket){
    socket.emit('tagRead', "Nothing yet!" );
});

hapiServer.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    hapiServer.start((err) => {
        if(err){
            console.log(err);
        }
        else{
            console.log(`Server on ${hapiServer.info.uri}`);

        }
    });

    hapiServer.route({
        method: 'GET',
        path: '/index',
        handler: function (request, reply) {
            reply.file('index.html');
        }
    });
    hapiServer.route({
        method: 'GET',
        path: '/style.css',
        handler: function (request, reply){
            reply.file('./style.css');
        }
    });
    hapiServer.route({
        method: 'GET',
        path: '/script.js',
        handler: function (request, reply){
            reply.file('./script.js');
        }
    });
    hapiServer.route({
        method: 'GET',
        path: '/socket.io/socket.io.js',
        handler: function(request, reply){
            reply.file('./node_modules/socket.io/lib/socket.js');
        }
    })
    hapiServer.route({
        method: 'GET',
        path: '/{name}',
        handler: function (request, reply) {
            reply('Hello, '+ request.params.name + '! <br> I am seamless-access, the all powerful and all encompassing!');
        }
    });
    hapiServer.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.redirect('/index');
        }
    });
});

coapServer.on('request', function(req, res) {
  if(req.method=='POST') {
        var body='';
        req.on('data', function (data) {
            body +=data;
        });
    }
    req.on('end',function(){
         var POST =  JSON.stringify(qs.parse(body));
         tag = POST.slice(3,14);
         var selectQuery = `select * from emp_records where tag = '${tag}';`;
         var insertQuery = `INSERT INTO logs values (DEFAULT, now(), '${tag}');`;

         client.query(selectQuery, (err, res) =>{
            if(err)
                console.log(err + " Error in DB");
            else if (res.rows[0] == undefined){
                console.log(tag + 'Unauthorised');
                io.emit('tagRead', tag + ' - Unauthorised');
            }
            else{
                details = res.rows[0];
                client.query(insertQuery, (err, res) =>{
                    if(err)
                       console.log(err + "Error inserting the log");
                    else{
                       console.log(details);
                       io.emit('tagRead', details);
                   }
               });
           }
        });
    });
    res.end("thank you");
});

coapServer.listen(function() {
    console.log("SEAMLESS_ACCESS_SERVER_STARTED");
});
