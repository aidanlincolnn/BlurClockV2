//https for callout 
var http = require('https');
//express server and io for socket setup - requires older version of socket io (2.3.0) and socket client (2.3.1) 
//- this took a million years to find out, stack overflow does not help for issues related to express
const express = require('express');
const app = express();
const serv = require('http').Server(app);
const io = require('socket.io')(serv);

var kill  = require('tree-kill');
const {spawn} = require('child_process');
var clock;

//global variables because I hate javascript and dont have time to do properly 
var requestZip = '';
var cityInfo = '';
var responseSunRise = '';
var responseSunSet= '';

console.log('server listening on port 8080');
//app runs on 8080
serv.listen(8080);
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

    socket.on('runClock', runClock);

    async function runClock(){
      console.log('running clock');
      clock = spawn("/home/aidan/rgbMatrix/rpi-rgb-led-matrix/examples-api-use/clock",["--led-no-hardware-pulse","--led-slowdown-gpio=4","--led-gpio-mapping=adafruit-hat-pwm","=-led-rows=32","--led-cols=64","--led-brightness=100","-f","/home/aidan/rgbMatrix/rpi-rgb-led-matrix/fonts/8x13.bdf","-d","%I:%M:%S","-y","10","-C","255,255,255"]);      
      clock.on('error', (error) => {
        console.log(`error: ${error.message}`);
      });
    
      clock.on("close", code => {
        console.log(`clock closed ${code}`);
      });
    }

    socket.on('killClock', killClock);
    
    async function killClock(){
      console.log('trying to kill clock by pid');
      if(clock.pid != null){
        console.log('killing clock:');
        kill(clock.pid);
      }
    }

    socket.on('moveMotorForward', moveMotorForward);

    async function moveMotorForward(){
      console.log('move motor forward');
      moveMotor = spawn("python3", ["./moveMotor.py", "1"]);
      
      
      moveMotor.on('error', (error) => {
        console.log(`error: ${error.message}`);
      });
    
      moveMotor.on("close", code => {
        console.log(`done moving forward ${code}`);
      });
    }

    socket.on('moveMotorBackward', moveMotorBackward);

    async function moveMotorBackward(){
      console.log('move motor backwards');
      moveMotor = spawn("python3", ["./moveMotor.py", "0"]);
      
      moveMotor.on('error', (error) => {
        console.log(`error: ${error.message}`);
      });
    
      moveMotor.on("close", code => {
        console.log(`done moving backwards ${code}`);
      });
    }

    socket.on('startBlurClock', startBlurClock);

    async function startBlurClock(){
      //turn off the clock program if it was running during calibration
      if(clock != null && clock.pid != null){
        kill(clock.pid);
      }
      console.log('starting blur clock');
      blurClock = spawn("python3", ["./blurClock.py"]);
      blurClock.stdout.on("data", data => {
        console.log(`stdout: ${data}`);
      });
      
      blurClock.stderr.on("data", data => {
        console.log(`stderr: ${data}`);
      });
      blurClock.on('error', (error) => {
        console.log(`error: ${error.message}`);
      });
    
      blurClock.on("close", code => {
        console.log(`exit blur clock ${code}`);
      });
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
