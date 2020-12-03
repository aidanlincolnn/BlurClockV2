//https for callout 
var http = require('https');
//express server and io for socket setup - requires older version of socket io (2.3.0) and socket client (2.3.1) 
//- this took a million years to find out, stack overflow does not help for issues related to express
const express = require('express');
const app = express();
const serv = require('http').Server(app);
const io = require('socket.io')(serv);

//global variables because I hate javascript and dont have time to do properly 
var requestZip = '';
var cityInfo = '';
var responseSunRise = '';
var responseSunSet= '';

//app runs on 8001
serv.listen(8001);
//this makes p5 work and get sent back to localhost
app.use(express.static(__dirname));
//send back index when we localhost 
app.get('/',(req , res)=>{
    console.log('sending back index');
    res.sendFile(__dirname+'/index.html');
});

//when socket is connection, do stuff
io.on('connection', function (socket) {
    console.log('connection made');
    socket.on('getZipData', getZipData);

    async function getZipData(data){
        console.log(data.zip);
        requestZip = data.zip;
        await makeSynchronouseRequest();
        console.log(responseSunRise);
        var dataOut = {
            sunRise  : responseSunRise,
            sunSet  : responseSunSet,
            city  : cityInfo,
        }
        console.log('sending dat back '+dataOut);
        socket.emit('zipResult',dataOut);
    }
});


//get data from sunrise api with zip as input
function callSunriseSetAPi(){
    //sunrise api information 
    var urlStart = 'https://api.opencagedata.com/geocode/v1/json?q=postal_code=';
    var urlEnd= '&key=81a689873844437c8d89a99822a8cd0d&pretty=1';
    console.log('call sunrise api');
    return new Promise((resolve,reject) => {
      var url = urlStart+requestZip+urlEnd;
      http.get(url, (response) => {
        var str = '';
        //another chunk of data has been received, so append it to `str`
        response.on('data', function (chunk) {
          str += chunk;
        });
        //the whole response has been received, so we just print it out here
        response.on('end', function () {
          var jsonResult = JSON.parse(str);
          resolve(jsonResult);
        });
        response.on('error', (error) => {
          reject(error);
        });
      });
    });
  }

//make make request and build result data
async function makeSynchronouseRequest(request){
    try{
        console.log('make request');
        let apiResponse = callSunriseSetAPi();
        response_body = await apiResponse;
        if(response_body.results[0]){
        cityInfo = response_body.results[0].formatted;

        var sunrise = response_body.results[0].annotations.sun.rise.apparent;
        var date = new Date(sunrise * 1000);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        var seconds = "0" + date.getSeconds();
        var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        responseSunRise=formattedTime.toString();
        
        var sunset = response_body.results[0].annotations.sun.set.apparent;
        date = new Date(sunset * 1000);
        hours = date.getHours();
        minutes = "0" + date.getMinutes();
        seconds = "0" + date.getSeconds();
        formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        responseSunSet=formattedTime.toString();

        console.log('request result:'+responseSunRise);
        console.log('request result:'+responseSunSet);
        console.log('request result:'+cityInfo);

        }
    }
    catch(error){
        console.log(error);
    }   
}
