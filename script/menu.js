function drawMenu(menu_data) {
    menu = menu_data;
    let menu_inner = document.createElement("div");
    menu_inner.classList = "menu_inner";

    let menu_header = document.createElement("div");
    menu_header.classList = "menu_header";
    menu_header.appendChild(document.createTextNode(menu_data.title));
    // menu_inner.appendChild(menu_header);
    document.querySelectorAll("#screen .screen_content .menu_container").forEach((item) => {
        item.appendChild(menu_header.cloneNode(true));
    });

    menu_data.items.forEach(item => {
        let menu_item = document.createElement("div");
        menu_item.classList = "menu_item";
        menu_item.appendChild(document.createTextNode(item.label));
        menu_inner.appendChild(menu_item);
            
    });

    document.querySelectorAll("#screen .screen_content .menu_container").forEach((item) => {
        item.appendChild(menu_inner.cloneNode(true));
    });

    setConfirmLabel("Confirm");
    setCancelLabel(menu.back.label);
    
    menu_active_item = 0;
    menu_length = menu_data.items.length;
    menu_active = true;
    moveMenu(0);
    document.querySelector("body").classList.add("menu_is_active");
}

function moveMenu(dir) {
    document.querySelectorAll("#screen .menu_active_item").forEach(item => {
        item.classList.remove("menu_active_item");
    });

    menu_active_item += dir;
    if (menu_active_item >= menu_length) {menu_active_item = 0;}
    if (menu_active_item < 0) {menu_active_item = menu_length - 1;}

    document.querySelectorAll("#screen .menu_item:nth-of-type(" + (menu_active_item + 1) + ")").forEach(item => {
        item.classList.add("menu_active_item");
        item.scrollIntoView();
    });
    if (menu.items[menu_active_item].hover_action) {
        window[menu.items[menu_active_item].hover_action](menu.items[menu_active_item].hover_args);
    }
}

function closeMenu() {
    document.querySelector("body").classList.remove("menu_is_active");
    menu_active = false;
    document.querySelectorAll("#screen .screen_content .menu_container").forEach((item) => {
        item.innerHTML="";
    });

    setCancelLabel("Menu");
    setConfirmLabel(baseConfirmLabel);
}

function runActiveMenuItem() {
    window[menu.items[menu_active_item].action_function](menu.items[menu_active_item].action_args);
}

function menuBack() {
    window[menu.back.action_function](menu.back.action_args);
}

function mainMenu() {
    const title = "Menu";
    const items = [
        {label: "New game", action_function:"restart", action_args:null}, 
        {label: "Save game", action_function:"saveGame", action_args:null}
    ];
    if(localStorage.getItem("Events")) {
        items.push({label: "Load game", action_function:"loadGame", action_args:null})
    }
    const back = {label: "Close", action_function:"closeMenu", action_args:null};
    drawMenu({title: title, items:items, back:back});
}

function saveGame() {
    closeMenu();
	const saveData = JSON.stringify(events);
	localStorage.setItem("Events", saveData);
	localStorage.setItem("Level", JSON.stringify(current_level));
    notify("Game saved");
}

function loadGame() {
    reset();
	events = JSON.parse(localStorage.getItem("Events"));
current_level= JSON.parse(localStorage.getItem("Level"));
    closeMenu();
    rollback = true;
    parseEvents(0,0,true);
    rollback = false;
}

function notify(title) {
    const items = [
        {label: "OK", action_function:"closeMenu", action_args:null}
    ];
    const back = {label: "Close", action_function:"closeMenu", action_args:null};
    drawMenu({title: title, items:items, back:back});
}
