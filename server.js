var hapi = require('hapi');
var serialport = require('serialport');
var events = require('events');


var server = new hapi.Server();
var portName = 'COM5';
var tags = '';
var parsedData = undefined;

var sp = new serialport(portName, {
    baudRate: 230400,
});

var eventEmitter = new events.EventEmitter();

eventEmitter.on('tag', function(tag){
    console.log("I saw " + tag);
});

sp.on('data', function(data) {
    parsedData = data.toString();
    //console.log("Parsed Data" + parsedData + typeof parsedData + parsedData.length);
    if (parsedData.length > 3){
        tags = parsedData;
        eventEmitter.emit('tag', tags);
        //console.log(tags);
    }
    else{
        tags = undefined;
        //console.log(tags);
    }
});

server.connection({ port: 9090, host: 'localhost'});

server.start((err) => {
    if(err){
        console.log(err);
    }
    else{
        console.log(`Server on ${server.info.uri}`);
    }
});



/*server.route({
    method: 'GET',
    path: '/{name}',
    handler: function (request, reply) {
        reply('Hello, ' + encodeURIComponent(request.params.name) + '! <br> I am seamless-access, the  all powerful and all encompassing!');
    }
});*/

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/index',
        handler: function (request, reply) {
            reply.file('./index.html');
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
    server.route({
        method: 'GET',
        path: '/index/data',
        handler: function(request, reply){
            reply(tags);
        }
    });
});
