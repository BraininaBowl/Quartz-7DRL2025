async function enemyTurn() {
	playerturn = false;
	// cleanup glyphs
	document.querySelectorAll(".map_layer.glyphs .cleanup").forEach((glyph) => {
		glyph.remove();
	});
	document.querySelectorAll(".map_layer.glyphs .death").forEach((glyph) => {
		glyph.classList.add("cleanup");
	});

	actors.forEach((actor) => {
		if (actor && actor.ai && actor.lives) {
			actor.turn();
		}
	});
	newEvent({ action: "function", source: "activatePlayerTurn", target: "" });
	parseEvents();
	parseEvents();
}

function activatePlayerTurn() {
	playerturn = true;
	if (player.health <= 0) {
		gameOver();
	}
	if (!rollback) {
		let enemies = false
		actors.forEach((actor) => {
			if ((actor.type=="grunt" || actor.type=="ranger") && actor.lives) {
				enemies = true;
			}
		});
		if (enemies == false) {
			newEvent({ action: "function", source: "newLevel" });
		}
		addCharge()
		current_turn ++;
		let snapshot = newEvent({type: "snapshot", target: current_turn});
		snapshots[current_turn] = snapshot;	

		if (phase_charge >= 1) {
			baseConfirmLabel = "PHASE"
		} else {
			baseConfirmLabel = "..."
		}
		setConfirmLabel(baseConfirmLabel);
	}
}

function gameOver() {
	localStorage.removeItem("Events"); 
	deathMenu();
}

function getTarget() {
	document.querySelector("body").classList.remove("phase_menu");
	closeMenu();
	targeting = true;
	target_x = player.x;
	target_y = player.y;
	moveTarget();
}

function moveTarget(dir) {
	if (dir == "up") {
		target_y--;
	} else if (dir == "right") {
		target_x++;
	} else if (dir == "down") {
		target_y++
	} else if (dir == "left") {
		target_x--
	}
	if (target_x < 0) {target_x = 0};
	if (target_x > 3) {target_x = 3};
	if (target_y < 0) {target_y = 0};
	if (target_y > 3) {target_y = 3};
	document.querySelectorAll(".target_cell").forEach((item) =>{
		item.classList.remove("target_cell");
		item.classList.remove("target_cell_false");
	});
	document.querySelectorAll(".grid .c" + target_x + "_" + target_y + "").forEach((item) =>{
		item.classList.add("target_cell");
		if (isCellFree(target_x,target_y) == false) {
			item.classList.add("target_cell_false");		
		}
	});
}

function endTarget() {
	targeting = false;
	document.querySelectorAll(".target_cell").forEach((item) =>{
		item.classList.remove("target_cell");
	});
}

function newLevel() {
	events = [];
	actors=[]
	clearMapVis();
	current_level++;
	newEvent({action:"function", source: "setSeed", target:getRandomInt(1000000000, 999999999999999999999999999)})
	parseEvents();
	makeMap();	
	populateMap();
	parseEvents();
	drawLives();
	drawCharge();
	updateMap();
	notify("Level " + current_level);
	playerturn = true;
}

function restart() {
	closeMenu();
	localStorage.removeItem("Events"); 
	current_level = 0;
	newLevel();
}

function deathMenu() {
    const title = "You died";
    const items = [
        {label: "Try again", action_function:"restart", action_args:null}, 
    ];
    const back = {label: "..", action_function:null, action_args:null};
    drawMenu({title: title, items:items, back:back});
}

function winMenu() {
    const title = "You won!";
    const items = [
        {label: "Try again", action_function:"restart", action_args:null}, 
    ];
    const back = {label: "..", action_function:null, action_args:null};
    drawMenu({title: title, items:items, back:back});
}