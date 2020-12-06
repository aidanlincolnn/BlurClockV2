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

	button3 = createButton('move motor forward');
  	button3.position(button2.x + 75, button2.y);
	button3.mousePressed(moveMotorForward);

	button4 = createButton('move motor backward');
  	button4.position(button3.x+140, button3.y);
	button4.mousePressed(moveMotorBackward);

	button5 = createButton('start blur clock');
  	button5.position(button4.x+160, button4.y);
	button5.mousePressed(startBlurClock);

	button6 = createButton('end blur clock');
  	button6.position(button5.x+110, button5.y);
	button6.mousePressed(endBlurClock);


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

function moveMotorForward(){
	console.log('motor forward call');
	socket.emit('moveMotorForward');
}
function moveMotorBackward(){
	console.log('motor backwards call');
	socket.emit('moveMotorBackward');
}

function startBlurClock(){
	console.log('start blur clock');
	socket.emit('startBlurClock');
}

function endBlurClock(){
	console.log('end blur clock');
	socket.emit('endBlurClock');
}

function showAPIData(data){
	console.log('got results: '+data.sunRise);
	output.html('Got Result: <br/> Location:'+data.city+'</br>Sunrise:'+data.sunRise+'<br/>Sunset:'+data.sunSet);
  	input.value('');
}
