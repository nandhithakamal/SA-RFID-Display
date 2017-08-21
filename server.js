var hapi = require('hapi');
var serialport = require('serialport');

var server = new hapi.Server();
var portName = 'COM5';
var tag = '';
var parsedData = undefined;

var sp = new serialport(portName, {
    baudRate: 230400,
});


server.connection({ port: 9090, host: 'localhost'});

var io = require('socket.io')(server.listener);

io.on('connection', function(socket){
    socket.emit('tagRead', "Nothing yet!" );
});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.start((err) => {
        if(err){
            console.log(err);
        }
        else{
            console.log(`Server on ${server.info.uri}`);
        }
    });

    server.route({
        method: 'GET',
        path: '/index',
        handler: function (request, reply) {
            reply.file('index.html');
        }
    });
    server.route({
        method: 'GET',
        path: '/style.css',
        handler: function (request, reply){
            reply.file('./style.css');
        }
    });
    server.route({
        method: 'GET',
        path: '/script.js',
        handler: function (request, reply){
            reply.file('./script.js');
        }
    });
    /*server.route({
        method: 'GET',
        path: '/socket.io/socket.io.js',
        handler: function(request, reply){
            reply.file('./node_modules/socket.io/lib/socket.js');
        }
    })*/
    server.route({
        method: 'GET',
        path: '/{name}',
        handler: function (request, reply) {
            reply('Hello, '+ request.params.name + '! <br> I am seamless-access, the all powerful and all encompassing!');
        }
    });
    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.redirect('/index');
        }
    });
});

sp.on('data', function(data) {
    parsedData = data.toString();
    //console.log("Parsed Data" + parsedData + typeof parsedData + parsedData.length);
    if (parsedData.length > 3){
        tag = parsedData;
        io.emit('tagRead', tag);
        //console.log(tags);
    }
    else{
        tag = undefined;
        //console.log(tags);
    }
});
