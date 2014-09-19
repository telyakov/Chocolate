var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var soap = require('soap');
io.on('connection', function(socket){
    var url = 'http://192.168.0.29:7001/Directory.asmx?WSDL';
    socket.on('request', function(sql){
        soap.createClient(url, function(err, client) {
            var args = {securityKey: 'test6543210', sql: sql};
            console.time('s')
            client.Exec2(args, function(err, result) {
            console.timeEnd('s')
//                console.log(result)
                socket.emit('web', result);
            });
        });
    });
    socket.on('add user',function(username){
    })
});
http.listen(3000, function(){
    console.log('listening on *:3000');
});