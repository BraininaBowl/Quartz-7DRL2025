window.addEventListener(
	"keydown",
	function (event) {
		if (event.defaultPrevented) {
			return; // Do nothing if the event was already processed
		}
		if (playerturn == true) {
			switch (event.code) {
				case "ArrowDown":
				case "Numpad2":
				case "KeyS":
					// code for "down arrow" key press.
					handleInput("down");
					break;
				case "ArrowUp":
				case "Numpad8":
				case "KeyW":
					// code for "up arrow" key press.
					handleInput("up");
					break;
				case "ArrowLeft":
				case "Numpad4":
				case "KeyA":
					// code for "left arrow" key press.
					handleInput("left");
					break;
				case "ArrowRight":
				case "Numpad6":
				case "KeyD":
					// code for "right arrow" key press.
					handleInput("right");
					break;
				case "Enter":
				case "KeyE":
				case "Space":
				case "Numpad5":
					// code for "confirm" key press.
					handleInput("confirm");
					break;
				case "Escape":
				case "KeyQ":
				case "Numpad0":
						handleInput("back");
					break;
				case "Digit1":
					handleInput(1);
					break;
				case "Digit2":
					handleInput(2);
					break;
				case "Digit3":
					handleInput(3);
					break;
				case "Digit4":
					handleInput(4);
					break;
				case "Digit5":
					handleInput(5);
					break;
				case "Digit6":
					handleInput(6);
					break;
				case "Digit7":
					handleInput(7);
					break;
				case "Digit8":
					handleInput(8);
					break;
				case "Digit9":
					handleInput(9);
					break;
				case "Digit0":
					handleInput(0);
					break;
				case "KeyX":
					handleInput("song_playpause");
					break;
				case "KeyZ":
					handleInput("song_prev");
					break
				case "KeyC":
					handleInput("song_next");
					break
				default:
					return; // Quit when this doesn't handle the key event.
			}
		}
		// Cancel the default action to avoid it being handled twice
		event.preventDefault();
	},
	true
);
// the last option dispatches the event to the listener first,
// then dispatches event to window

document.querySelectorAll(".controls .button").forEach((item) => item.addEventListener(
	'click', function(e){
		handleInput(item.getAttribute("data-input"));
		e.stopPropagation();
	},false
));

function handleInput(key) {
	if(["song_playpause","song_prev","song_next"].includes(key)) {
		sound_button_hard.play()
		if (key == "song_playpause") {
			playPauseSong();
		} else if (key == "song_prev") {
			prevSong();
		} else if (key == "song_next") {
			nextSong();
		}
	} else if(playerturn) {
    	sound_button_soft.play()
		if (menu_active) {
			if (key == "up") {
				moveMenu(-1);
			} else if (key == "down") {
				moveMenu(1);
			} else if (key == "confirm") {
				runActiveMenuItem();
			} else if (key == "back") {
				menuBack();
			}

		} else if (targeting) {
			if(["up","down","left", "right"].includes(key)) {
				moveTarget(key);
			} else if (key == "confirm") {
				if (rollback) {
					phase_charge-= current_turn - phased_turn;
					// make duplicate, control this duplicate
					let datebuffer = Date.now().toString();
					let phase_event = newEvent({insert_at: snapshots[phased_turn],  action: "function", source: "addActor", target: "player_" + datebuffer + ", player, " + (target_x) + ", " + (target_y) + "" });
					parseEvents(phase_event,0,false,phase_event+1);
					phase_control_char = "player_" + datebuffer;
					endTarget();
				} else {
					phase_charge--
					// teleport
					endTarget();
					newEvent({ action: "function", source: "teleportPlayer", target: "" + (target_x) + ", " + (target_y) + "" });
					parseEvents();
				}				
			} else if (key == "back") {
				endTarget();
				endPhase();
			}	
		} else if (rollback) {
			if(["up","down","left", "right"].includes(key)) {
				newEvent({insert_at: snapshots[phased_turn] + 1, type: "input", action: "move", target: key, source: window[phase_control_char].id.toString()});
				newEvent({insert_at: snapshots[phased_turn] + 2, action: "function", source: "clearActor", target: window[phase_control_char].id.toString()});
				parseEvents()
				rollToNow(0);
			} else if (key == "confirm") {
			} else if (key == "back") {
			}	
		} else {
			if(["up","down","left", "right"].includes(key)) {
				newEvent({type: "input", action: "move", target: key, source: player.id.toString()});
				parseEvents();
				enemyTurn();
			} else if (key == "confirm") {
				startPhase();
				
			} else if (key == "back") {
				mainMenu();
			}
			
		}
	}	
};
