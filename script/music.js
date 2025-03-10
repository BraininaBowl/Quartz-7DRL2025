let music_player;

function updatePlayer() {
	if (music_state == 1) {
		document.querySelector(".controls .music .player").classList.add("playing");
	} else {
		document.querySelector(".controls .music .player").classList.remove("playing");
	}
	document.querySelector(".music .front .song_counter").innerHTML = current_song + 1 + "/" + found_songs.length;
	// console.log(current_song + ": " + songs[current_song]);
}

function nextSong() {
	current_song++;
	if (current_song > found_songs.length - 1) {
		current_song = 0;
	}
	if (music_state != 0) {
		stopSong();
	}
	playSong();
}

function prevSong() {
	current_song--;
	if (current_song < 0) {
		current_song = found_songs.length - 1;
	}
	if (music_state != 0) {
		stopSong();
	}
	playSong();
}

function playPauseSong() {
	if (music_state == 0) {
		playSong();
	} else if (music_state == 1) {
		pauseSong();
	} else if (music_state == 2) {
		playSong();
	}
}

function stopSong() {
	music_player.stop();
	music_state = 0;
	updatePlayer();
}

function pauseSong() {
	music_player.pause();
	music_state = 2;
	updatePlayer();
}

function playSong() {
	if (music_state == 0) {
		let song_url = "./././music/" + found_songs[current_song];
		loadSong(song_url);
	} else if (music_state == 2) {
		music_player.play();
	}
	music_state = 1;
	updatePlayer();
}

async function loadSong(url) {
	music_player = new MIDIPlayer(url);
	music_player.onload = function (song) {
		music_player.play();
	};
	music_player.onend = function (song) {
		nextSong();
	};
}

let found_songs = [];
let songs_to_find = [];
if (localStorage.getItem("Music")) {
	found_songs = JSON.parse(localStorage.getItem("Music"));
	updateSongs();
} else {
	found_songs.push(all_songs[getRandomInt(0, all_songs.length)]);
	updateSongs();
	findSong(false);
	findSong(false);
	findSong();
}

function updateSongs() {
	songs_to_find = all_songs.filter(function (el) {
		return !found_songs.includes(el);
	});
}

function findSong(save = true) {
    let songname = songs_to_find[getRandomInt(0, songs_to_find.length)];
	found_songs.push(songname);
	updateSongs();
    if (save) {
        const save_music = JSON.stringify(found_songs);
        localStorage.setItem("Music", save_music);
    }
    updatePlayer()
    return songname;
}
