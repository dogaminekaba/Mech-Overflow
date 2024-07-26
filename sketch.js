// UI
let startGameBtn;
let startMenu;
let scoreTxt;
const definedTextSize = 30;

// Object Detection
let video;
let objectDetector;
let objectDetections = [];

// Voice Detection
let soundClassifier;

// Game Elements
let robotImgList;
let robotX, robotY;
let targetX, targetY;
let speed = 5;
let isAnimating = false;
let song;
let trainingState; // 'Objects','Job','Start'
let scoreCredits;
let voiceInput;

// size values
let gameSceneW = 1600;
let gameSceneH = 800;
let videoW = 500;
let videoH = 375;

let gameRunning = true;
let sampleRobot = new TraineeRobot();

var timerValue = 10;
var myTimer;

function preload() {
	objectDetector = ml5.objectDetector('cocossd');

	let options = { probabilityThreshold: 0.7 };
	soundClassifier = ml5.soundClassifier('SpeechCommands18w', options); 
	
	robotImgList = [];
	robotImgList.push(loadImage('assets/robot-1.png'));
	robotImgList.push(loadImage('assets/robot-2.png'));
	robotImgList.push(loadImage('assets/robot-3.png'));
	robotImgList.push(loadImage('assets/robot-4.png'));

	song = loadSound('assets/GrooveMachine.wav');
}

// configurations
function setup() {
	createCanvas(gameSceneW, gameSceneH);
	textFont('Teko');
	textSize(definedTextSize);

	video = createCapture(VIDEO);
	video.size(videoW, videoH);
	video.hide();

	soundClassifier.classify(onNewSoundClassified);
	voiceInput = '-';

	startGameBtn = document.getElementById('startGameBtn');
	startGameBtn.addEventListener('click', startGame);
	startMenu = document.getElementById('startMenu');

	song.setVolume(0.1);

	scoreTxt = document.getElementById('scoreTxt');
	scoreCredits = 0;
}

function startGame()
{
	song.loop();
	startGameBtn.remove();
	startMenu.remove();

	// Start detections
	startObjectDetection();

	// Evaluate the answer and get next training
	startTraining();

	myTimer = setInterval(timeIt, 1000);
}

function timeIt() {
	if (timerValue > 0) {
		timerValue--;
	}
}

async function startObjectDetection(){
	while(gameRunning) {
		objectDetector.detect(video, gotDetections);
		await sleep(100);
	}
}

function gotDetections(error, results) {
	if (error) {
		console.error(error);
	}
	objectDetections = results;
}

async function startTraining()
{
	let setupLearning = true;

	trainingState = 'Start';

	await sleep(200);
	while(gameRunning) {
		if(trainingState === 'Start'){

			sampleRobot = new TraineeRobot();
			trainingState = 'Objects';
			setupLearning = true;
			voiceInput = '-';

		} else if(trainingState === 'Objects'){

			if(setupLearning){
				speak('Show me ' + sampleRobot.officeObject);
				setupLearning = false;
				timerValue = 10;
			}

			if(sampleRobot.officeObjectLearned == 0)
			{
				await sleep(100);
			} else {
				scoreCredits += sampleRobot.officeObjectLearned; // +1 or -1
				await sleep(2000);
				trainingState = 'Job';
				setupLearning = true;
			}

		} else if (trainingState === 'Job'){

			if(setupLearning){
				speak('What is my job ID?');
				voiceInput = '-';
				setupLearning = false;
				timerValue = 10;
			}

			if(voiceInput == sampleRobot.jobId) {
				// SUCCESS
				sampleRobot.jobLearned = 1;
			}

			if(sampleRobot.jobLearned == 0)
			{
				await sleep(100);
			} else {
				scoreCredits += sampleRobot.jobLearned; // +1 or -1
				await sleep(2000);
				trainingState = 'Start';
			}
			
		}
	}
}

function draw() {
	clear();
	drawGameScene();
	drawVideoFeed();
	drawTimer();
	drawTraineeInfo(sampleRobot);

	scoreTxt.textContent = 	'Credits: ' + scoreCredits;
}

function drawGameScene() {
	background(100);
	stroke(0, 0, 0);
	noFill();
	strokeWeight(8);
	rect(0, 0, gameSceneW, gameSceneH);
}

function drawVideoFeed() {

	let outlineSize = 4;
	let margins = 4;

	image(video, outlineSize + margins, outlineSize + margins);

	textAlign(LEFT);

	for (let i = 0; i < objectDetections.length; i++) {
		let object = objectDetections[i];
		if (object.label == 'person') {
			continue;
		}

		if( trainingState === 'Objects' && object.label == sampleRobot.officeObject)
		{
			// SUCCESS
			sampleRobot.officeObjectLearned = 1;
		}

		// draw rect over object
		stroke('black');
		strokeWeight(4);
		noFill();
		rect(object.x, object.y, object.width, object.height);

		// write name of the object
		noStroke();
		fill('black');
		text(object.label, object.x + 10, object.y + definedTextSize);

	}

	// draw outline rect
	stroke('white');
	strokeWeight(outlineSize);
	noFill();

	// draw cam record overlay
	let startPointX = (outlineSize + margins) * 2;
	let startPointY = (outlineSize + margins) * 2;
	let endPointX = videoW;
	let endPointY = videoH;
	let lineLength = 20;

	// top left corner
	line(startPointX, startPointY, startPointX + lineLength, startPointY);
	line(startPointX, startPointY, startPointX, startPointY + lineLength);
	// top right corner
	line(endPointX, startPointY, endPointX - lineLength, startPointY);
	line(endPointX, startPointY, endPointX, startPointY + lineLength);
	// bottom left corner
	line(startPointX, endPointY, startPointX + lineLength, endPointY);
	line(startPointX, endPointY, startPointX, endPointY - lineLength);
	// bottom right corner
	line(endPointX, endPointY, endPointX - lineLength, endPointY);
	line(endPointX, endPointY, endPointX, endPointY - lineLength);
}

function onNewSoundClassified(error, results){
	if(error){
		console.error(error);
	}

	if(results){
		voiceInput = results[0].label;
	}
	else {
		voiceInput = '-';
	}
}

function drawTimer(){

	textAlign(CENTER);
	fill('white');
	noStroke();

	if (timerValue >= 10) {
		text('0:' + timerValue, width * 0.15, height * 0.6);
	}
	if (timerValue < 10) {
		text('0:0' + timerValue, width * 0.15, height * 0.6);
	}
	if (timerValue == 0) {
		fill('red');
		if(trainingState === 'Objects'){
			text('FAILED!', width * 0.15, height * 0.6 + (definedTextSize + 4));
			sampleRobot.officeObjectLearned = -1;
		} else if (trainingState === 'Job'){
			text('FAILED! ID was: ' + sampleRobot.jobId, width * 0.15, height * 0.6 + (definedTextSize + 4));
			sampleRobot.jobLearned = -1;
		}
	}
}

function drawTraineeInfo()
{
	// Draw Trainee Robot
	let robotImage = robotImgList[sampleRobot.robotType];
	image(robotImage, (width - robotImage.width) /2, height/3);

	// Draw Trainee Info
	noStroke();
	
	if(trainingState === 'Objects'){
		setColor(sampleRobot.officeObjectLearned);
		text('Show Object: ' + sampleRobot.officeObject, width * 0.15, height * 0.6 - (definedTextSize + 4));
	} else if (trainingState === 'Job'){
		setColor(sampleRobot.jobLearned);
		text('Say Job Id.', width * 0.15, height * 0.6 - (definedTextSize + 4));
	}

	drawSoundFeed();

	function setColor(learningStatus){
		if(learningStatus == 1){
			fill('lime');
		} else if (learningStatus == -1){
			fill('red');
		} else {
			fill('yellow');
		}
	}

}

function drawSoundFeed() {
	textAlign(CENTER);
	fill('white');
	noStroke();

	text('You said: ' + voiceInput, width * 0.15, height * 0.6 + 2 * (definedTextSize + 4));
}

function speak(words) {
	// Create a SpeechSynthesisUtterance
	const utterance = new SpeechSynthesisUtterance(words);
  
	// Select a voice
	const voices = speechSynthesis.getVoices();
	utterance.voice = voices[0]; // Choose a specific voice
  
	// Speak the text
	speechSynthesis.speak(utterance);
}

function sleep(millisecondsDuration)
{
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}

