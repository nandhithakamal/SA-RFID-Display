var hapi = require('hapi');
var coap = require('coap');
var qs = require('querystring');
var pg = require('hapi-postgres-connection').getCon();
var pg = require("pg");


var hapiServer = new hapi.Server();
var coapServer = coap.createServer();


var tag = '';
var parsedData = undefined;


/*var conString = process.env["DATABASE_URL"];
var client = new pg.Client(conString);
client.connect();


var sp = new serialport(portName, {
    baudRate: 230400,
});*/


hapiServer.connection({ port: 9090, host: 'localhost'});


//console.log(JSON.stringify(selectQuery));
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
      //  res.write(qs.parse(body));
      req.on('end',function(){
             var POST =  JSON.stringify(qs.parse(body));
             tag = POST.slice(3,14);
             console.log(tag);
             io.emit('tagRead',tag);
            //console.log(JSON.stringify(POST));
         });


res.end("thank you");
  //res.end('Hello ' + req.url.split('/')[1] + '\n')
});

// the default CoAP port is 5683
coapServer.listen(function() {
    console.log("SEAMLESS_ACCESS_SERVER_STARTED");
});

/*sp.on('data', function(data) {
    parsedData = data.toString();
    //console.log("Parsed Data" + parsedData + typeof parsedData + parsedData.length);
    if (parsedData.length > 3){
        tag = parsedData;
        var selectQuery = client.query(`select * from emp_records where tag = ${tag};`, (err, res) => {
            if(err)
                console.log(err + "error from db - not an authorized user!");
            else{
                console.log(res.rows[0]);
                client.query(`INSERT INTO logs values (DEFAULT, now(), ${tag});`);
                io.emit(res.rows[0]);
            }
        });

        io.emit('tagRead', tag);
        //console.log(tags);
    }
    else{
        tag = undefined;
        //console.log(tags);
    }
});*/
