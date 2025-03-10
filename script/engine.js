function newEvent(package) {
	if (debug) {
		console.log(package);
	}
	let event = new Object();
	event.parsed = false;
	if (package.type) {
		event.type = package.type;
	} else {
		//console.log("No type for event " + package);
	}
	if (package.action) {
		event.action = package.action;
	} else {
		//console.log("No action for event " + package);
	}
	if (package.source) {
		event.source = package.source;
	} else {
		//console.log("No source for event " + package);
	}
	if (package.target) {
		event.target = package.target;
	} 
	if (package.insert_at) {
		event.id = package.insert_at;
		events.splice(package.insert_at,0,event);
	} else {
		let id = events.length;
		event.id = id;
		events.push(event);
	}
	return event.id;
}

function checkEvents() {
	for (let i = 0; i < events.length; i++) {
		if (events[i].id != i) {
			events[i].id = i;
		}
		if (events[i].type == "snapshot"){
			if (snapshots[events[i].target] != i) {
				snapshots[events[i].target] = i;
			}
		}
	}
}

async function parseEvents(start = 0, delay = 0, reparse = false, end = false) {
	let newstart = false;
 	events.forEach(async(event,i) => {
		if (event.id != i) {
			event.id = i;
			//array out of sync, restart from here
			if (newstart == false) {
				if (i > start) {
					newstart = i;
				} else {
					newstart = start;
				}	
			}
		}
		if (event.type == "snapshot"){
			if (snapshots[event.target] != i) {
				snapshots[event.target] = i;
			}
		}
		if ((!event.parsed || reparse) && event.id >= start && (!end || event.id < end) && newstart == false) {
			if (event.parsed) {
				reparsing = true;
			}
			if (delay > 0) {
				await waitForMe(delay); // wait
			}
			runEvent(event.id);
			reparsing = false;
		}
	});
	if (newstart) {
		parseEvents(newstart,delay,reparse,end);
	}
}

function runEvent(id, parse = true) {
	const action = events[id].action;
	const source = events[id].source;
	const target = events[id].target;
	if (action == "move") {
		actors[source].move(target,id);
	} else if (action == "function") {
		// source = function name, target = arguments
		window[source](target);
	}
	if (parse) {
		events[id].parsed = true;
	}
}

function clearForRoll() {
	actors.length = 0;
	map = {}
	makeMap();
}

function rollToTurn(turn) {
	clearForRoll();
	rollback = true;
	const turn_event = snapshots[turn];
	parseEvents(0,0,true,turn_event);
	phased_turn = turn;
}

function rollToNow(offset = 0) {
	if (rollback) {
		const turn_event = snapshots[phased_turn]+offset;
		parseEvents(turn_event,50,true);
		rollback = false;
		endPhase();
	}
}

