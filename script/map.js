function makeMap() {
	map.w = 4;
	map.h = 4;
	map.content = [];
	map.freecells = [];
	for (let x = 0; x < map.w; x++) {
		map.content[x] = [];
		for (let y = 0; y < map.h; y++) {
			setMapContent(x, y, false);
		}
	}
}

function updateMap() {
	actors.forEach((actor) => {
		updateGlyph(actor);
	});
}

function clearMapVis() {
	document.querySelectorAll(".glyphs .actor").forEach((item) => {
		item.remove();
	})
}

function setMapContent(x, y, value) {
	if (map.content[x] && map.content[x][y] && actors[map.content[x][y]] && actors[map.content[x][y]].type == "pit") {
		return;
	}
	map.content[x][y] = [value];
	const cellid = x * map.w + y;
	if (value === false || value === undefined) {
		map.freecells[cellid] = true;
	} else {
		map.freecells[cellid] = false;
	}
}

function isCellFree(x, y) {
	const cellid = x * map.w + y;
	return map.freecells[cellid];
}

function doesCellBlockSight(x, y) {
	let cell = readCell(x, y);
	if (cell && actors[cell]) {
		return actors[cell].blocks;
	} else {
		return false;
	}
}

function makeFreeCellList() {
	let freeCellList = [];
	map.freecells.forEach((item, i) => {
		if (item) {
			freeCellList.push(i);
		}
	});
	return freeCellList;
}

function readCell(x, y) {
	if (map.content[x]) {
		if (map.content[x][y] || map.content == 0) {
			return map.content[x][y];
		} else {
			return false;
		}
	} else {
		return false;
	}
}

function populateMap() {
	let mapnumber = Math.ceil((getSeededRandom() / 10) * 13);
	baseMap(mapnumber);
	parseEvents();
	let freeCellList = makeFreeCellList();
	let location = freeCellList.splice(Math.floor((getSeededRandom() / 10) * freeCellList.length), 1);
	let cell_y = location[0] % 4;
	let cell_x = (location[0] - cell_y) / 4;
	newEvent({ action: "function", source: "addActor", target: "player, player, " + cell_x + ", " + cell_y + "" });

	if (current_level > 1 && current_level != 8) {
		if (getSeededRandom() < 4) {
			location = freeCellList.splice(Math.floor((getSeededRandom() / 10) * freeCellList.length), 1);
			cell_y = location[0] % 4;
			cell_x = (location[0] - cell_y) / 4;
			newEvent({
				action: "function",
				source: "addActor",
				target: "song_" + Date.now().toString() + ", song, " + cell_x + ", " + cell_y + "",
			});
		}
		if (getSeededRandom() < 4) {
			location = freeCellList.splice(Math.floor((getSeededRandom() / 10) * freeCellList.length), 1);
			cell_y = location[0] % 4;
			cell_x = (location[0] - cell_y) / 4;
			newEvent({
				action: "function",
				source: "addActor",
				target: "charge_" + Date.now().toString() + ", charge, " + cell_x + ", " + cell_y + "",
			});
		}
	}
	if (current_level == 8) {
		location = freeCellList.splice(Math.floor((getSeededRandom() / 10) * freeCellList.length), 1);
		cell_y = location[0] % 4;
		cell_x = (location[0] - cell_y) / 4;
		newEvent({
			action: "function",
			source: "addActor",
			target: "win, win, " + cell_x + ", " + cell_y + "",
		});
	}

	let cells_to_fill = limit(freeCellList.length - 7 + getSeededRandom() / 8 + current_level / 4, 1);
	if (current_level == 1 && cells_to_fill > 3) {
		cells_to_fill = 3;
	}
	for (let i = 0; i < cells_to_fill; i++) {
		if (freeCellList.length > 3) {
			location = freeCellList.splice(Math.floor((getSeededRandom() / 10) * freeCellList.length), 1);
			cell_y = location[0] % 4;
			cell_x = (location[0] - cell_y) / 4;
			let type;
			let dir = Math.round((getSeededRandom() / 10) * 4);
			if (getSeededRandom() < 4) {
				type = "ranger";
			} else if (getSeededRandom() > 8) {
				type = "spike";
			} else {
				type = "grunt";
			}
			newEvent({
				action: "function",
				source: "addActor",
				target: "" + type + "_" + Date.now().toString() + ", " + type + ", " + cell_x + ", " + cell_y + ", " + dir,
			});
		}
	}
}

function baseMap(num) {
	if (num == 0) {
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 0, 1" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 1, 1" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 3, 1" });
	} else if (num == 1) {
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 1, 0" });
		newEvent({ action: "function", source: "addActor", target: "pit" + Date.now().toString() + ", pit, 1, 1" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 1, 3, 0" });
	} else if (num == 2) {
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 0, 0, 1" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 0, 1, 1" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 3, 2, 3" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 3, 3, 3" });
	} else if (num == 3) {
		newEvent({ action: "function", source: "addActor", target: "spike" + Date.now().toString() + ", spike, 1, 1" });
		newEvent({ action: "function", source: "addActor", target: "spike" + Date.now().toString() + ", spike, 2, 1" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 1, 3, 0" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 2, 3, 0" });
	} else if (num == 4) {
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 0, 0" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 1, 1" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 3, 3" });
	} else if (num == 5) {
		newEvent({ action: "function", source: "addActor", target: "spike" + Date.now().toString() + ", spike, 0, 0" });
		newEvent({ action: "function", source: "addActor", target: "spike" + Date.now().toString() + ", spike, 3, 3" });
		newEvent({ action: "function", source: "addActor", target: "pit" + Date.now().toString() + ", pit, 3, 0" });
		newEvent({ action: "function", source: "addActor", target: "pit" + Date.now().toString() + ", pit, 0, 3" });
	} else if (num == 6) {
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 1, 1" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 1, 2" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 2, 1" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 2, 2" });
	} else if (num == 7) {
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 0, 0" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 0, 1, 1" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 2, 0, 2" });
		newEvent({ action: "function", source: "addActor", target: "spike" + Date.now().toString() + ", spike, 2, 2" });
	} else if (num == 8) {
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 0, 1, 1" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 0, 2, 1" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 3, 1, 3" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 3, 2, 3" });
	} else if (num == 9) {
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 1, 1" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 2, 1" });
	} else if (num == 10) {
		newEvent({ action: "function", source: "addActor", target: "spike" + Date.now().toString() + ", spike, 1, 0" });
		newEvent({ action: "function", source: "addActor", target: "spike" + Date.now().toString() + ", spike, 2, 0" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 1, 3" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 2, 3" });
	} else if (num == 11) {
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 3, 0, 3" });
		newEvent({ action: "function", source: "addActor", target: "piston" + Date.now().toString() + ", piston, 2, 3, 0" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 1, 1" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 3, 1" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 3, 2" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 0, 3" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 1, 3" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 3, 3" });
	} else {
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 2, 2" });
		newEvent({ action: "function", source: "addActor", target: "wall" + Date.now().toString() + ", wall, 1, 1" });
	}
}
