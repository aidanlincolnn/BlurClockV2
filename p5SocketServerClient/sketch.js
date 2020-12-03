const { text } = require("body-parser");

var socket;


function setup() {
	let h = 400
  	let w = 400
  	console.log('trying to connect to socket');
	  socket = io("http://localhost:8001");
	  socket.on('zipResult', showAPIData)
  	createCanvas(h, w);
	input = createInput();
  	input.position(20, 65);

  	button = createButton('submit');
  	button.position(input.x + input.width, 65);
	button.mousePressed(sendRequest);
	  
	message = createElement('h2', 'Enter A Zip Code');
	message.position(20, 5);

	output = createElement('h2', '');
	output.position(20, 70);
  	noStroke()
}

function sendRequest(){
	const zipIn = input.value();
  	
	console.log('asking for data for zip 11206');

	var data = {
		zip : zipIn
	}
	socket.emit('getZipData',data);
}

function showAPIData(data){
	console.log('got results: '+data.sunRise);
	output.html('Got Result: <br/> Location:'+data.city+'</br>Sunrise:'+data.sunRise+'<br/>Sunset:'+data.sunSet);
  	input.value('');
}
