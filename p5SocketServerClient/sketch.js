var socket;

function setup() {
	let h = 400
  	let w = 400
  	console.log('trying to connect to socket');
	  socket = io();
	  socket.on('zipResult', showAPIData)
  	createCanvas(h, w);
	input = createInput();
  	input.position(20, 65);

  	button = createButton('submit');
  	button.position(input.x + input.width, 65);
	button.mousePressed(sendRequest);
	
	button1 = createButton('run Clock');
  	button1.position(button.x + 60, button.y);
	button1.mousePressed(runClockRequest);

	button2 = createButton('kill Clock');
  	button2.position(button1.x + 75, button1.y);
	button2.mousePressed(killClockRequest);


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

function runClockRequest(){
	console.log('turning on clock');
	socket.emit('runClock');
}

function killClockRequest(){
	console.log('turning off clock');
	socket.emit('killClock');
}

function showAPIData(data){
	console.log('got results: '+data.sunRise);
	output.html('Got Result: <br/> Location:'+data.city+'</br>Sunrise:'+data.sunRise+'<br/>Sunset:'+data.sunSet);
  	input.value('');
}
