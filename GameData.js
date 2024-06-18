const officeObjects = [];
officeObjects.push(
	"cup", 
	"book", 
	"cell phone"
);

class TraineeRobot {

	constructor() {
		let objIndex = getRandomInt(officeObjects.length);
		this.officeObject = officeObjects[objIndex];
	}
	
	
}


function getRandomInt(max) {
	return Math.floor(Math.random() * max);
}