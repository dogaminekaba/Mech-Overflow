// ml5.js: Object Detection with COCO-SSD (Webcam)
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/1.3-object-detection.html
// https://youtu.be/QEzRxnuaZCk

// p5.js Web Editor - Image: https://editor.p5js.org/codingtrain/sketches/ZNQQx2n5o
// p5.js Web Editor - Webcam: https://editor.p5js.org/codingtrain/sketches/VIYRpcME3
// p5.js Web Editor - Webcam Persistence: https://editor.p5js.org/codingtrain/sketches/Vt9xeTxWJ

// let img;
let video;
let detector;
let detections = [];
let robotImg;

// size values
let gameSceneW = 1600;
let gameSceneH = 800;
let videoW = 500;
let videoH = 375;

let gameRunning = true;
let objectTrainingStatus = 0; // -1: fail, 1: success
let sampleRobot = new TraineeRobot();

let timerValue = 10;

function preload() {
	detector = ml5.objectDetector('cocossd');
	robotImg = loadImage('assets/robot-1.png');
}

function gotDetections(error, results) {
	if (error) {
		console.error(error);
	}
	detections = results;
	detector.detect(video, gotDetections);
}

function setup() {
	createCanvas(gameSceneW, gameSceneH);
	video = createCapture(VIDEO);
	video.size(videoW, videoH);
	video.hide();
	detector.detect(video, gotDetections);

	// Evaluate the answer and get next training
	doAsyncAwaitThings();

	// TODO - generate game objects

	// start timer
	setInterval(timeIt, 1000);
}

function timeIt() {
	if (timerValue > 0) {
		timerValue--;
	}
}

async function doAsyncAwaitThings()
{
	while(gameRunning){
		await sleep(500);
		if(objectTrainingStatus != 0) {
			await sleep(1000);
			objectTrainingStatus = 0;
			sampleRobot = new TraineeRobot();
			timerValue = 10;
		}
	}
}


function draw() {
	clear();
	drawGameScene();
	drawVideoFeed();
	drawTimer();
	drawTraineeInfo(sampleRobot, objectTrainingStatus);

	// Draw the robot
	image(robotImg, (width - robotImg.width) /2, height/3);
}

function drawGameScene() {
	background(200);
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

	for (let i = 0; i < detections.length; i++) {
		let object = detections[i];
		if (object.label == "person") {
			continue;
		}

		if(object.label == sampleRobot.officeObject)
		{
			// object is successfully assigned!
			objectTrainingStatus = 1;
		}

		let objWidth = Math.ceil(object.width);
		let objHeight = Math.ceil(object.height);

		let img = createImage(objWidth, objHeight);
		img.copy(video, object.x, object.y, objWidth, objHeight, 0, 0, img.width, img.height);

		// image(img, 0, 0);

		img.loadPixels();

		let pixels = img.pixels;
		let imgR = 0;
		let imgG = 0;
		let imgB = 0;
		let imgA = 0;


		for (let j = 0; j < pixels.length; j += 4) {
			imgR += pixels[j];
			imgG += pixels[j + 1];
			imgB += pixels[j + 2];
			imgA += pixels[j + 3];
		}

		imgR = imgR / (pixels.length / 4);
		imgG = imgG / (pixels.length / 4);
		imgB = imgB / (pixels.length / 4);

		// draw rect over object
		stroke(imgR, imgG, imgB);
		strokeWeight(4);
		noFill();
		rect(object.x, object.y, object.width, object.height);

		// write name of the object
		noStroke();
		fill(imgR, imgG, imgB);
		textSize(24);
		text(object.label, object.x + 10, object.y + 24);

	}

	// draw outline rect
	stroke(255, 0, 0);
	strokeWeight(outlineSize);
	noFill();

	// draw cam record overlay
	let startPointX = (outlineSize + margins) * 2;
	let startPointY = (outlineSize + margins) * 2;
	let lineSize = 20;

	line(startPointX, startPointY, startPointX + lineSize, startPointY);
	line(startPointX, startPointY, startPointX, startPointY + lineSize);

	// rect(outlineSize + margins, outlineSize + margins, video.width, video.height);

	// write name of the employee
	noStroke();
	fill(255, 0, 0);
	textSize(24);
	// text("Employee_ID_18283687", outlineSize + margins, outlineSize + video.height + margins + 24);
}

function drawTimer(){

	textAlign(CENTER);
	fill('black');
	noStroke();

	if (timerValue >= 10) {
		text("0:" + timerValue, width * 0.15, height * 0.6);
	}
	if (timerValue < 10) {
		text('0:0' + timerValue, width * 0.15, height * 0.6);
	}
	if (timerValue == 0) {
		text('FAILED!', width * 0.15, height * 0.6 + 28);
		objectTrainingStatus = -1;
	}
}

function drawTraineeInfo(trainee, trainingStatus)
{
	// Draw Trainee
	noStroke();
	if(trainingStatus == 1){
		fill(0, 255, 0);
	}
	else if (trainingStatus == -1){
		fill(255, 0, 0);
	}
	else{
		fill(255, 255, 0);
	}
	
	textSize(24);
	text("Show Object: " + trainee.officeObject, width * 0.15, height * 0.6 - 28);
}

// a custom 'sleep' or wait' function, that returns a Promise that resolves only after a timeout
function sleep(millisecondsDuration)
{
  return new Promise((resolve) => {
    setTimeout(resolve, millisecondsDuration);
  })
}

