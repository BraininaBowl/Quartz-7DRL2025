function drawMap() {
    clearScreen();

    let glyphs = document.createElement("div");
    glyphs.classList = "map_layer glyphs";
    drawToScreen(glyphs);

    let grid = document.createElement("div");
    grid.classList = "map_layer grid";
    for (let x = 0; x < map.w; x++) {
        let column = document.createElement("div");
        column.classList = "column";
        column.style.left = (100/map.w * x) + "%";
        column.style.width = (100/map.w) + "%";
		for (let y = 0; y < map.h; y++) {
            let cell = document.createElement("div");
            cell.classList = "cell c" + x + "_" + y;
            cell.style.top = (100/map.h * y) + "%";
            cell.style.height = (100/map.h) + "%";
            cell.style.width = "100%";
            column.appendChild(cell);
		}
        grid.appendChild(column);
	}   
    drawToScreen(grid);

    let menu_container = document.createElement("div");
    menu_container.classList = "map_layer menu_container";
    drawToScreen(menu_container);

    let help = document.createElement("div");
    help.classList = "help_bar";

    let help_hints = document.createElement("div");
    help_hints.classList = "hints";

    let item_q = document.createElement("div");
    item_q.classList = "item item_q";
    let item_q_icon = document.createElement("div");
    item_q_icon.classList = "item_icon";
    item_q_icon.innerHTML = "Q";
    item_q.appendChild(item_q_icon);
    let item_q_label = document.createElement("div");
    item_q_label.classList = "item_label";
    item_q_label.innerHTML = "Text here";
    item_q.appendChild(item_q_label);
    help_hints.appendChild(item_q);

    let item_e = document.createElement("div");
    item_e.classList = "item item_e";
    let item_e_icon = document.createElement("div");
    item_e_icon.classList = "item_icon";
    item_e_icon.innerHTML = "E";
    item_e.appendChild(item_e_icon);
    let item_e_label = document.createElement("div");
    item_e_label.classList = "item_label";
    item_e_label.innerHTML = "Other text here";
    item_e.appendChild(item_e_label);
    help_hints.appendChild(item_e);

    help.appendChild(help_hints);

    let help_life = document.createElement("div");
    help_life.classList = "life";

    help.appendChild(help_life);

    drawToScreen(help);
}

function clearScreen() {
    document.querySelectorAll("#screen .screen_content").forEach((item) => {
        item.innerHTML = "";
    });
}

function drawToScreen(object) {
    document.querySelectorAll("#screen .screen_content").forEach((item) => {
        item.appendChild(object.cloneNode(true));
    });
}

function drawLives() {
    let content = ""
    for (i = 0; i < player.maxHealth; i++) {
        if (i < player.health) {
            content += "<i class='ti ti-heart-filled'></i>";
        } else {
            content += "<i class='ti ti-heart'></i>";
        }
        
    }

    document.querySelectorAll("#screen .help_bar .life").forEach((item) => {
        item.innerHTML = content;
    });

}

function drawCharge() {
    document.querySelectorAll(".phase_counter .phase").forEach((item) => {
        let this_charge = item.dataset.phase;
        if(phase_charge >= this_charge) {
            item.classList.remove("phase_half");
            item.classList.add("phase_full");
        } else if(phase_charge == this_charge - 0.5) {
            item.classList.add("phase_half");
            item.classList.remove("phase_full");
        } else {
            item.classList.remove("phase_half");
            item.classList.remove("phase_full");
        }
    });
}
