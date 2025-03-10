const debug = false;
let events = [];
let snapshots = [];
let actors = [];
let map = {};
let reparsing = false;

let seed = "";

let rollback = false;
let playerturn = true;
let current_turn = 0;
let current_level = 0;

let phased_turn = 0;
let phase_charge = 0;
let phase_control_char;
let phased = false;
let baseConfirmLabel = "...";

let target_x = 0;
let target_y = 0;
let targeting = false;

let menu_active = false;
let menu_item = 0;
let menu_length = 0;
let menu_active_item = 0;
let menu = [];

// Sound
const sound_button_soft = new Audio("./sfx/button_soft.mp3");
sound_button_soft.preload = "auto";
const sound_button_hard = new Audio("./sfx/button_hard.mp3");
sound_button_hard.preload = "auto";

// Music
let all_songs = [
	"saint-saens_danse_macabre.mid",
	"Autumn-violin-and-piano.mid",
	"Eine-Kleine-Nachtmusik1.mid",
	"Tchaikovsky-op19-no3-fueillet-d-album-flute-and-piano.mid",
	"Toccata-and-Fugue-Dm.mid",
	"arabesque1.mid",
	"bach-badinerie-flute-piano.mid",
	"bach-cello-suite-no1-prelude.mid",
	"beethoven-symphony9-4-ode-to-joy-piano-solo.mid",
	"bizet-jeux-d-enfants-poupee.mid",
	"bizet-jeux-d-enfants-toupie.mid",
	"book1-fugue24-string-quartet.mid",
	"brahms-symphony3-3-theme-violin-piano.mid",
	"carnival-of-the-animals-the-elephant.mid",
	"chopin-nocturne-op9-no2-violin-and-piano.mid",
	"cpe-bach-sonata6-1-f-minor-allegro-di-molto.mid",
	"death-and-the-maiden3.mid",
	"debussy-clair-de-lune.mid",
	"dvorak-humoresque7-violin-piano.mid",
	"edvard-grieg-peer-gynt1-morning-mood-flute-piano.mid",
	"franz-liszt-liebestraum-3.mid",
	"franz-schubert-standchen-serenade.mid",
	"fur-elise.mid",
	"grieg-lyric-piece-op12-no1-arietta.mid",
	"handel-water-music-hornpipe.mid",
	"haydn-piano-sonata-31-1.mid",
	"isaac-albeniz-espana-tango-op165-no2.mid",
	"leyenda.mid",
	"mozart-piano-concerto-21-2-elvira-madigan.mid",
	"mozart-symphony40-1-piano-solo.mid",
	"prelude15.mid",
	"purcell-didos-lament.mid",
	"rachmaninoff-prelude-in-c-sharp-minor.mid",
	"rachmaninoff-prelude-in-g-minor.mid",
	"saint-saens-carnival-of-the-animals-the-swan.mid",
	"sugar-plum-fairy.mid",
	"vivaldi-estro-armonico-no11-2.mid",
	"vivaldi-winter-2-violin-piano.mid",
];

let current_song = 0;
let music_state = 0;

const levels = 12;
