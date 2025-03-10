updatePlayer();

newEvent({action:"function", source: "setSeed", target:getRandomInt(1000000000, 999999999999999999999999999)})
parseEvents();
makeMap();
parseEvents();
drawMap();
newLevel();
parseEvents();
drawLives();
drawCharge();
updateMap();
setCancelLabel("Menu")
setConfirmLabel("...")

