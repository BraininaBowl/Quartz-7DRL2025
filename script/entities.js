class Actor {
	type;
	x;
	y;
	dir;
	id;
	ai;
	aware;
	blocks;
	lastAction;

	constructor(type, x, y, dir = 0, aware = false) {
		this.type = type;
		this.x = x;
		this.y = y;
		this.id = actors.length;
		this.ai = false;
		this.presence = true;
		this.lives = true;
		if (this.type == "player") {
			this.maxHealth = 4;
			this.health = 4;
			this.class = "player";
		}
		if (this.type == "clear") {
			this.ai = false;
			this.presence = false;
			this.class = "ephemeral";
		}
		if (this.type == "grunt") {
			this.ai = true;
			this.sightRange = 3;
			this.attackRange = 1;
			this.attackDamage = 1;
			this.death = "clear";
			this.class = "enemy";
		}
		if (this.type == "ranger") {
			this.ai = true;
			this.sightRange = 3;
			this.attackRange = 3;
			this.attackDamage = 1;
			this.death = "grunt";
			this.class = "enemy";
		}
		if (this.type == "piston") {
			this.ai = true;
			this.sightRange = 2;
			this.attackRange = 1;
			this.attackDamage = 0;
			this.death = "clear";
			this.class = "enemy";
		}
		if (this.type == "wall") {
			this.blocks = true;
			this.class = "wall";
			this.indestructable = true;
		}
		if (this.type == "spike") {
			this.blocks = true;
			this.class = "wall";
			this.attackDamage = 1;
			this.indestructable = true;
		}
		if (this.type == "pit") {
			this.class = "pit";
			this.indestructable = true;
		}
		if (this.type == "song") {
			this.class = "item";
		}
		if (this.type == "charge") {
			this.class = "item";
		}
		if (this.type == "win") {
			this.class = "item";
		}
		this.dir = dir;
		this.aware = aware;
		this.lastAction = "spawn";

		actors[this.id] = this;

		if (!(reparsing && this.class == "item")) {
			if (this.presence) {
				addGlyph(this);
				setMapContent(this.x, this.y, this.id);
			} else {
				setMapContent(this.x, this.y, false);
			}
		}
	}

	move(direction, event_id) {
		if (this.lives) {
			let offsetX = 0;
			let offsetY = 0;
			let newX = this.x;
			let newY = this.y;
			let newDir = this.dir;
			if (direction == "up") {
				newY--;
				newDir = 0;
			} else if (direction == "down") {
				newY++;
				newDir = 2;
			} else if (direction == "right") {
				newX++;
				newDir = 1;
			} else if (direction == "left") {
				newX--;
				newDir = 3;
			} else {
				if (debug) {
					console.log("Invalid direction");
				}
			}

			if (newX >= 0 && newX <= 3 && newY >= 0 && newY <= 3) {
				const cell = readCell(newX, newY);
				if (cell[0] === false) {
					// move here
					setMapContent(this.x, this.y, false);
					this.x = newX;
					this.y = newY;
					this.dir = newDir;
					setMapContent(this.x, this.y, this.id);
				} else {
					let actor = actors[cell];
					removeAnims(this.id);
					document.querySelectorAll(".actor.id_" + this.id).forEach((item) => {
						item.classList.remove("nudge-" + direction);
						item.classList.add("nudge-" + direction);
					});
					if (actor.type == "pit") {
						offsetX = newX - this.x;
						offsetY = newY - this.y;
						newEvent({
							insert_at: event_id + 1,
							action: "function",
							source: "killActor",
							target: this.id.toString(),
						});
						moveGlyph(this, offsetX, offsetY, true);
						killGlyph(this.id);
					}
					if (actor.class == "enemy") {
						newEvent({
							insert_at: event_id + 1,
							action: "function",
							source: "takeDamage",
							target: cell.toString(),
						});
						//("" + cell + "");
					}
					if (actor.type == "spike") {
						if (this.type == "player") {
							this.getHit(actor.attackDamage);
						} else {
							takeDamage(this.id.toString());
						}
					}
					if (actor.type == "spike") {
						if (this.type == "player") {
							this.getHit(actor.attackDamage);
						} else {
							takeDamage(this);
						}
					}
					if (actor.class == "item") {
						if (reparsing == false) {
							if (actor.type == "song") {
								notify("Found " + findSong() + "!");
							} else if (actor.type == "charge") {
								addCharge(1);
								notify("Found a PHASE charge!");
							}else if (actor.type == "win") {
								winMenu();
							}
							killActor(actor.id.toString());
						}
					}
				}
			}
			moveGlyph(this, offsetX, offsetY);
		}
	}

	turn() {
		if (getsAlerted(this)) {
			this.aware = true;
		}
		if (["grunt", "ranger"].includes(this.type)) {
			if (this.aware) {
				// turn to player
				turnTowards(this.id, player.id);
				//get distance to player
				let distance = Math.abs(this.x - player.x) + Math.abs(this.y - player.y);
				if (distance <= this.attackRange) {
					// inside range: try to attack
					if (canSee(this, player)) {
						// line of sight: attack!
						newEvent({
							action: "function",
							source: "attackActor",
							target: "" + this.id + ", " + player.id + "",
						});
					} else {
						stepToLineOfSight(this.id, player.id);
					}
				} else {
					// ouside range: step towards
					stepTowards(this.id, player.id);
				}
			} else {
				if (this.lastAction == false) {
					// No last action; turn
					newEvent({ action: "function", source: "rotateActor", target: "" + this.id + ", -1" });
				} else {
					this.lastAction = false;
				}
			}

			if (getsAlerted(this)) {
				newEvent({ action: "function", source: "awareActor", target: "" + this.id + "" });
			}
		}

		if (["piston"].includes(this.type)) {
			this.aware = false;
			let targetX = this.x;
			let targetY = this.y;
			let dir;
			if (this.dir == 0) {
				targetY--;
				dir = "up";
			} else if (this.dir == 1) {
				targetX++;
				dir = "right";
			} else if (this.dir == 2) {
				targetY++;
				dir = "down";
			} else if (this.dir == 3) {
				targetX--;
				dir = "left";
			}
			let target = readCell(targetX, targetY);
			if (target && actors[target] && (actors[target].class == "player" || actors[target].class == "enemy")) {
				newEvent({ type: "action", action: "move", target: dir, source: target.toString() });
			}
		}

		updateGlyph(this);
	}

	getHit(damage) {
		this.health -= damage;
		drawLives();
		removeAnims(this.id);
		document.querySelectorAll(".actor.id_" + this.id).forEach((item) => {
			item.classList.add("flicker");
		});
	}
}

function removeAnims(id) {
	document.querySelectorAll(".actor.id_" + id).forEach((item) => {
		item.classList.remove("flicker");
		item.classList.remove("nudge-left");
		item.classList.remove("nudge-right");
		item.classList.remove("nudge-up");
		item.classList.remove("nudge-down");
	});
}

function addActor(data) {
	const parsedData = data.split(", ");
	const name = parsedData[0];
	const type = parsedData[1];
	const x = parseInt(parsedData[2]);
	const y = parseInt(parsedData[3]);
	const dir = parseInt(parsedData[4]);
	const aware = parsedData[5];

	window[name] = new Actor(type, x, y, dir, aware);
}

function addGlyph(actor) {
	let glyph = document.createElement("div");

	// set up type
	if (actor.type == "player") {
		glyph.innerHTML = "<i class='ti ti-at'></i>";
	} else if (actor.type == "grunt") {
		glyph.innerHTML = "<i class='ti ti-square-rounded-filled'></i>";
	} else if (actor.type == "ranger") {
		glyph.innerHTML = "<i class='ti ti-square-rounded-chevron-up-filled'></i>";
	} else if (actor.type == "piston") {
		glyph.innerHTML = "<i class='ti ti-device-cctv-filled'></i>";
	} else if (actor.type == "spike") {
		glyph.innerHTML = "<i class='ti ti-artboard'></i>";
	} else if (actor.type == "pit") {
	} else if (actor.type == "wall") {
	} else if (actor.type == "song") {
		glyph.innerHTML = "<i class='ti ti-device-audio-tape'></i>";
	} else if (actor.type == "charge") {
		glyph.innerHTML = "<i class='ti ti-diamond'></i>";
	} else if (actor.type == "win") {
		glyph.innerHTML = "<i class='ti ti-trophy-filled'></i>";
	}
	glyph.classList = "actor type_" + actor.type + " class_" + actor.class + " id_" + actor.id;

	// add to map
	document.querySelectorAll(".map_layer.glyphs").forEach((item) => {
		item.appendChild(glyph.cloneNode(true));
	});

	updateGlyph(actor);
	moveGlyph(actor, 0, 0, false);
}

function updateGlyph(actor) {
	if (actor.class == "enemy") {
		document.querySelectorAll(".map_layer.glyphs .id_" + actor.id + " i.ti").forEach((glyph_inner) => {
			glyph_inner.style.transform = "rotateZ(" + actor.dir * 90 + "deg)";
		});
	}

	document.querySelectorAll(".map_layer.glyphs .id_" + actor.id).forEach((glyph) => {
		// add properties
		// property: dir
		if ([0, 1, 2, 3].includes(actor.dir)) {
			glyph.dataset.dir = actor.dir;
		}
		// property: ai
		if (actor.ai) {
			glyph.dataset.ai = actor.ai;
		}
		// property: aware
		if (actor.aware) {
			glyph.dataset.aware = actor.aware;
		}
		// property: sight range
		if (actor.sightRange) {
			let newRange;
			let newCellX;
			let newCellY;
			for (i = 0; i < actor.sightRange; i++) {
				newRange = i + 1;
				if (actor.dir == 0) {
					newCellX = actor.x;
					newCellY = actor.y - i;
				} else if (actor.dir == 1) {
					newCellX = actor.x + i;
					newCellY = actor.y;
				} else if (actor.dir == 2) {
					newCellX = actor.x;
					newCellY = actor.y + i;
				} else if (actor.dir == 3) {
					newCellX = actor.x - i;
					newCellY = actor.y;
				}
				if (
					newCellX < 0 ||
					newCellX > 3 ||
					newCellY < 0 ||
					newCellY > 3 ||
					doesCellBlockSight(newCellX, newCellY)
				) {
					break;
				}
			}
			glyph.dataset.sightRange = newRange;
		}
		// property: block line of sight
		if (["wall"].includes(actor.type)) {
			glyph.dataset.block = true;
		}
	});
}

function moveGlyph(actor, offsetX = 0, offsetY = 0, transition = true) {
	if (actor.lives) {
		document.querySelectorAll(".map_layer.glyphs .id_" + actor.id).forEach((item) => {
			if (transition) {
				item.classList.add("transition");
			} else {
				item.classList.remove("transition");
			}
			item.style.top = "calc(" + (actor.y + offsetY) + " * 25%)";
			item.style.left = "calc(" + (actor.x + offsetX) + " * 25%)";
		});
		updateGlyph(actor);
	}
}

function killGlyph(target_id) {
	document.querySelectorAll(".map_layer.glyphs .id_" + target_id).forEach((glyph) => {
		glyph.classList.add("death");
	});
}

function removeGlyph(actor) {
	document.querySelectorAll(".map_layer.glyphs .id_" + actor.id).forEach((glyph) => {
		glyph.remove();
	});
}

function rotateActor(data) {
	const parsedData = data.split(", ");
	const actor = actors[parseInt(parsedData[0])];
	const dir = parseInt(parsedData[1]);

	actor.dir += dir;
	if (actor.dir < 0) {
		actor.dir = 3;
	} else if (actor.dir > 3) {
		actor.dir = 0;
	}
	updateGlyph(actor);
	actor.lastAction = "turn";
}

function awareActor(data) {
	const parsedData = data.split(", ");
	const actor = actors[parseInt(parsedData[0])];
	actor.aware = true;
}

function attackActor(data) {
	const parsedData = data.split(", ");
	const source_id = parsedData[0];
	const target_id = parsedData[1];
	const source = actors[source_id];
	const target = actors[target_id];
	if (target.lives && source.lives && !target.indestructable) {
		let dir = getDirection(source_id, target_id);
		removeAnims(source_id);
		document.querySelectorAll(".actor.id_" + source_id).forEach((item) => {
			item.classList.add("nudge-" + dir);
		});

		turnTowards(source_id, target_id);
		target.getHit(source.attackDamage);
	}
}

function shoveActor(data) {
	const parsedData = data.split(", ");
	const source_id = parsedData[0];
	const target_id = parsedData[1];
	const source = actors[source_id];
	const dir = getDirection(source_id, target_id);
	removeAnims(source_id);
	document.querySelectorAll(".actor.id_" + source_id).forEach((item) => {
		item.classList.add("nudge-" + dir);
	});
	const target = actors[target_id];
	let direction = getDirection(source_id, target_id);
	target.move(direction);
}

function takeDamage(data) {
	const parsedData = data.split(", ");
	const source_id = parsedData[0];
	const source = actors[source_id];
	if (!source.indestructable) {
		if (source.type == "ranger") {
			removeGlyph(source);
			source.type = "grunt";
			source.sightRange = 3;
			source.attackRange = 1;
			source.attackDamage = 1;
			source.death = "clear";
			source.aware = true;
			addGlyph(source);
		} else if (["grunt", "piston"].includes(source.type)) {
			killActor(source_id.toString());
		}
	}
}

function killActor(data) {
	const parsedData = data.split(", ");
	const target_id = parsedData[0];
	const target = actors[target_id];
	if (!target.indestructable) {
		killGlyph(target_id);
		if (target.type == "player") {
			// game over
			gameOver();
		} else {
			target.ai = false;
			target.presence = false;
			target.class = "ephemeral";
		}
		target.lives = false;
		setMapContent(target.x, target.y, false);
	}
}

function clearActor(data) {
	const parsedData = data.split(", ");
	const target_id = parsedData[0];
	const target = actors[target_id];
	target.ai = false;
	target.presence = false;
	target.class = "ephemeral";
	//target.lives = false;
	target.type = "clear";
	removeGlyph(target);
	setMapContent(target.x, target.y, false);
}

function teleportPlayer(data) {
	endTarget();
	endPhase();
	const parsedData = data.split(", ");
	setMapContent(player.x, player.y, false);
	player.x = parseInt(parsedData[0]);
	player.y = parseInt(parsedData[1]);
	setMapContent(player.x, player.y, player.id);
	moveGlyph(player, 0, 0, false);
}
