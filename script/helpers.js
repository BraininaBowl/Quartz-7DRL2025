function canMove(x0, y0, x1, y1) {
    if (x1 < 0 || x1 >= map.w || y1 < 0 || y1 >= map.h) {
        return false;
    } else if (isCellFree(x1,y1)) {
        return true;
    } else {
		// something here
		return false;
	}
}

function getsAlerted(actor) {
	let stepX;
	let stepY;
	let hit = false;
	for (i = 0; i < actor.sightRange; i++) {
		newRange = i + 1
		if (actor.dir == 0) {
			stepX = actor.x
			stepY = actor.y - i;
		} else if (actor.dir == 1) {
			stepX = actor.x + i
			stepY = actor.y;
		} else if (actor.dir == 2) {
			stepX = actor.x
			stepY = actor.y + i;
		} else if (actor.dir == 3) {
			stepX = actor.x - i
			stepY = actor.y;
		}
		let cell = readCell(stepX, stepY);
		if (actors[cell] && (actors[cell].type == "player" || actors[cell].aware)) {
			hit = true;
			break;
		}
		if (stepX < 0 || stepX > 3 || stepY < 0 || stepY > 3 || doesCellBlockSight(stepX,stepY)) {
			break;
		}
	}
	if (hit) {
		return true;
	} else {
		return false;
	}
}

function stepTowards(source_id, target_id) {
	const source = actors[source_id];
	const target = actors[target_id];
	let move = dijkstra(source.x, source.y, target.x, target.y);
	newEvent({type: "action", action: "move", target: move.dir, source: source.id.toString()});
}

function stepToLineOfSight(source_id, target_id) {
	let dir = getDirection(source_id, target_id);
	newEvent({type: "action", action: "move", target: dir, source: source_id.toString()});
}

function turnTowards(source_id, target_id) {
	// this should use getDirection, refactor later
	const source = actors[source_id];
	const target = actors[target_id];
	let xdist = Math.abs(source.x - target.x);
	let ydist = Math.abs(source.y - target.y);
	let dir;
	if ((xdist <= ydist || ydist == 0) && xdist > 0) {
		if (source.x < target.x) {
			dir = 1;
		} else {
			dir = 3;
		}
	} else {
		if (source.y < target.y) {
			dir = 2;
		} else {
			dir = 0;
		}
	}
	source.dir = dir;
	updateGlyph(source);
}

function getDirection(source_id, target_id){
	const source = actors[source_id];
	const target = actors[target_id];
	let xdist = Math.abs(source.x - target.x);
	let ydist = Math.abs(source.y - target.y);
	let dir;
	if ((xdist <= ydist || ydist == 0) && xdist > 0) {
		if (source.x < target.x) {
			dir = "right";
		} else {
			dir = "left";
		}
	} else {
		if (source.y < target.y) {
			dir = "down";
		} else {
			dir = "up";
		}
	}
	return dir;
}

function canSee(source, target) {
	let stepX;
	let stepY;
	let hit = false;
	for (i = 0; i < source.sightRange; i++) {
		newRange = i + 1
		if (source.dir == 0) {
			stepX = source.x
			stepY = source.y - i;
		} else if (source.dir == 1) {
			stepX = source.x + i
			stepY = source.y;
		} else if (source.dir == 2) {
			stepX = source.x
			stepY = source.y + i;
		} else if (source.dir == 3) {
			stepX = source.x - i
			stepY = source.y;
		}
		if (target.x == stepX && target.y == stepY) {
			hit = true;
			break;
		}
		if (stepX < 0 || stepX > 3 || stepY < 0 || stepY > 3 || doesCellBlockSight(stepX,stepY)) {
			break;
		}
		if ((stepX != source.x && stepY != source.y) && readMap(stepX,stepY) && actors[readMap(stepX,stepY)] && actors[readMap(stepX,stepY)].class == "enemy") {
			// would hit another enemy
			break;
		}
		
		
	}
	if (hit) {
		return true;
	} else {
		return false;
	}
}

function addCharge(amount = 0.5) {
    phase_charge += amount;
    if (phase_charge > 4) {
        phase_charge = 4;
    } else if (phase_charge < 0) {
        phase_charge = 0;
    }
    drawCharge();
}

function limit(val, min, max) {
	if (val < min) {
		return min;
	} else if (val > max) {
		return max;
	} else {
		return val;
	}
}

function wrap(val, min, max) {
	while (val < min) {
		val += max;
	}
	while (val > max) {
		val -= max;
	}
	return val;
}

function dijkstra(source_x, source_y, dest_x, dest_y) {
	let queue = [];
	let dijkstramap = {};
	item = {
		x: dest_x,
		y: dest_y,
		val: 0,
	};
	queue.push(item);

	function testItem(x, y, val) {
		if (isCellFree(x,y)) {
			if (dijkstramap[x]) {
				if (dijkstramap[x][y]) {
					if (dijkstramap[x][y] > val) {
						dijkstramap[x][y] = val;
						item = {
							x: x,
							y: y,
							val: val,
						};
						queue.push(item);
					}
				} else {
					dijkstramap[x][y] = val + 1;
					item = {
						x: x,
						y: y,
						val: val,
					};
					queue.push(item);
				}
			} else {
				dijkstramap[x] = {};
				dijkstramap[x][y] = val + 1;
				item = {
					x: x,
					y: y,
					val: val,
				};
				queue.push(item);
			}
		} else if (dest_x == x && dest_y == y) {
			if (!dijkstramap[x]) {
				dijkstramap[x] = {};
			}
			dijkstramap[x][y] = 1;
		}
	}
	function readDijkstra(x, y) {
		if (dijkstramap[x]) {
			if (dijkstramap[x][y]) {
				return dijkstramap[x][y];
			} else {
				return 999999999;
			}
		} else {
			return 999999999;
		}
	}
	function compareByVal(a, b) {
		return a.val - b.val;
	}

	while (queue.length > 0) {
		let current = queue.shift();
		if (source_x == current.x && source_y == current.y) {
			// target here
		} else {
			if (current.x - 1 >= 0 ) { testItem(current.x - 1, current.y, current.val + 1) };
			if (current.x + 1 <= 3 ) { testItem(current.x + 1, current.y, current.val + 1) };
			if (current.y - 1 >= 0 ) { testItem(current.x, current.y - 1, current.val + 1) };
			if (current.y + 1 <= 3 ) { testItem(current.x, current.y + 1, current.val + 1) };
		}
	}

	// sort results
	let results = [
		{
			dir: "up",
			val: readDijkstra(source_x, source_y - 1),
		},
		{
			dir: "right",
			val: readDijkstra(source_x + 1, source_y),
		},
		{
			dir: "down",
			val: readDijkstra(source_x, source_y + 1),
		},
		{
			dir: "left",
			val: readDijkstra(source_x - 1, source_y),
		},
	];

	results.sort(compareByVal);
	return results[0];
}

function bresenham(x0, y0, x1, y1) {
	let points = [];
	let deltax = x1 - x0;
	let deltay = y1 - y0;
	let stepx = Math.sign(deltax);
	let stepy = Math.sign(deltay);
	deltax = Math.abs(deltax);
	deltay = Math.abs(deltay);

	let diff = deltax - deltay;

	while (true) {
		if (x0 === x1 && y0 === y1) {
			break;
		}

		points.push({ x: x0, y: y0 });

		let nextstep = 2 * diff;

		if (nextstep > -deltay) {
			diff -= deltay;
			x0 += stepx;
		}

		if (nextstep < deltax) {
			diff += deltax;
			y0 += stepy;
		}
	}

	return points;
}

function setSeed(base) {
	seed = base.toString();
}

function getSeededRandom() {
	let result;
	while (isNaN(parseInt(result))) {
		result = seed[0];
		seed = seed.slice(1)
	}
	seed = seed + "" + result;
	return parseInt(result);
}

function getRandomInt(min, max) {
	const minCeiled = Math.ceil(min);
	const maxFloored = Math.floor(max);
	return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
  }

function reset() {
    events.length = 0;
    actors.length = 0;
    seed = "";
    playerturn = true;
	playerturn.lives = 4;
    menu_active = false;
    menu_item = 0;
    menu_length = 0;
    menu_active_item = 0;
    menu = [];
}

// delay stuff
const waitForMe = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function setConfirmLabel(label) {
	document.querySelectorAll("#screen .screen_content .item_e .item_label").forEach((item) => {
        item.innerHTML = label;
    });
}

function setCancelLabel(label) {
	document.querySelectorAll("#screen .screen_content .item_q .item_label").forEach((item) => {
        item.innerHTML = label;
    });
}