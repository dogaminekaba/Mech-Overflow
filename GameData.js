const officeObjects = [];
officeObjects.push(
	'cup', 
	'book', 
	'cell phone',
	'backpack',
	'scissors',
	'car',
	'bottle',
	'fork',
	'apple',
	'chair',
	'potted plant',
	'keyboard',
	'vase',
	'teddy bear'
);

const jobIds = [];
jobIds.push(
	'zero', 
	'one', 
	'two',
	'three',
	'four',
	'five',
	'six',
	'seven',
	'eight',
	'nine'
);

class TraineeRobot {

	constructor() {
		// assign office object
		let objIndex = getRandomInt(officeObjects.length);
		this.officeObject = officeObjects[objIndex];

		let maxRobots = 4;

		// assign robot type
		this.robotType = getRandomInt(maxRobots);

		// assign job id
		let jobIdIndex = this.robotType + 1;
		this.jobId = jobIds[jobIdIndex];

		this.officeObjectLearned = 0;
		this.jobLearned = 0;
	}

}


function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}