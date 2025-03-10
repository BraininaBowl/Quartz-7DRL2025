function startPhase() {
	phase = true;
	const title = "When?";
	const items = [{ label: "Now", action_function: "getTarget", action_args: null, hover_action: "rollToNow" }];

	for (i = 1; i <= phase_charge; i++) {
		if (i <= current_turn) {
			items.push({
				label: -1 * i,
				action_function: "getTarget",
				action_args: null,
				hover_action: "rollToTurn",
				hover_args: current_turn - i,
			});
		}
	}
	const back = { label: "Close", action_function: "endPhase", action_args: null };
	drawMenu({ title: title, items: items, back: back });

	document.querySelector("body").classList.add("phase_menu");
	document.querySelector("body").classList.add("phased");
}

function endPhase() {
	phase = false;
	document.querySelector("body").classList.remove("phase_menu");
	closeMenu();
	rollToNow();
	document.querySelector("body").classList.remove("phased");
}
