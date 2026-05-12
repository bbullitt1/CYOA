export interface StoryType {
  e:      string; // emoji
  n:      string; // name
  sub:    string; // subtitle
  ac:     string; // accent color
  t:      string; // theme description for prompt
  gn:     string; // genre name
  ptcl:   string; // particle color
  portal: string; // portal gradient (unused in native, kept for reference)
  glow:   string; // glow color rgba
}

export const STORY_TYPES: StoryType[] = [
  // MAGIC & FANTASY
  { e:'🧙', n:'Magic & Dragons',   sub:'Fantasy Quest',       ac:'#c084fc', t:'dragons, enchanted castles, and brave heroes on a magical quest',          gn:'Fantasy Quest',      ptcl:'#c084fc', portal:'', glow:'rgba(150,60,255,.8)'  },
  { e:'🏰', n:'Enchanted Kingdom', sub:'Royal Adventure',     ac:'#818cf8', t:'magic kingdoms, noble quests, and royal mysteries',                        gn:'Enchanted Kingdom',  ptcl:'#818cf8', portal:'', glow:'rgba(100,80,255,.8)'  },
  { e:'🧚', n:'Fairy Realm',       sub:'Magical Creatures',   ac:'#f0abfc', t:'fairies, pixies, and enchanted creatures in a magical forest',              gn:'Fairy Realm',        ptcl:'#f0abfc', portal:'', glow:'rgba(180,40,220,.8)' },
  { e:'🔮', n:'Crystal Caves',     sub:'Underground Magic',   ac:'#67e8f9', t:'mysterious crystal caves, underground magic, and hidden worlds',            gn:'Crystal Caves',      ptcl:'#67e8f9', portal:'', glow:'rgba(20,170,220,.8)' },
  { e:'🪄', n:'Wizard Academy',    sub:'Spells & Studies',    ac:'#a78bfa', t:'a school for young wizards learning spells and facing challenges',          gn:'Wizard Academy',     ptcl:'#a78bfa', portal:'', glow:'rgba(130,50,240,.8)' },
  { e:'🐉', n:'Dragon Riders',     sub:'Sky & Fire',          ac:'#fb923c', t:'dragon riders soaring through the skies and battling dark forces',          gn:'Dragon Riders',      ptcl:'#fb923c', portal:'', glow:'rgba(220,80,20,.8)'  },
  { e:'🧝', n:'Elven Forest',      sub:'Ancient Wisdom',      ac:'#86efac', t:'an ancient elven forest with magical creatures and forgotten secrets',      gn:'Elven Forest',       ptcl:'#86efac', portal:'', glow:'rgba(30,150,70,.8)'  },
  { e:'🗡️',n:'Dark Dungeon',      sub:'Brave the Depths',    ac:'#fbbf24', t:'dangerous dungeons, brave adventurers, and ancient monsters',               gn:'Dark Dungeon',       ptcl:'#fbbf24', portal:'', glow:'rgba(200,100,20,.8)' },
  { e:'⚗️', n:'Potion Master',    sub:'Brew & Discover',     ac:'#34d399', t:'alchemists brewing magical potions and discovering ancient secrets',         gn:'Potion Master',      ptcl:'#34d399', portal:'', glow:'rgba(10,180,120,.8)' },
  { e:'🦊', n:'Clever Fox',        sub:'Wit & Wisdom',        ac:'#fb923c', t:'a clever fox using wits and wisdom to outsmart bigger enemies',             gn:'Clever Fox',         ptcl:'#fb923c', portal:'', glow:'rgba(220,120,20,.8)' },
  // SPACE & SCI-FI
  { e:'🚀', n:'Space Explorer',    sub:'Sci-Fi Adventure',    ac:'#60a5fa', t:'rockets, alien worlds, and daring missions on distant planets',             gn:'Space Adventure',    ptcl:'#60a5fa', portal:'', glow:'rgba(40,110,255,.8)' },
  { e:'👽', n:'Alien Planet',      sub:'First Contact',       ac:'#4ade80', t:'exploring alien planets and making first contact with new species',          gn:'Alien Contact',      ptcl:'#4ade80', portal:'', glow:'rgba(40,200,90,.8)'  },
  { e:'🛸', n:'UFO Mystery',       sub:'Close Encounter',     ac:'#a78bfa', t:'mysterious UFOs, alien encounters, and unexplained phenomena',              gn:'UFO Mystery',        ptcl:'#a78bfa', portal:'', glow:'rgba(130,60,220,.8)' },
  { e:'🌌', n:'Galaxy Pirates',    sub:'Stars & Plunder',     ac:'#f472b6', t:'space pirates sailing through galaxies seeking cosmic treasure',            gn:'Galaxy Pirates',     ptcl:'#f472b6', portal:'', glow:'rgba(220,40,120,.8)' },
  { e:'🤖', n:'Robot World',       sub:'Bots & Circuits',     ac:'#6ee7b7', t:'a world where friendly robots and humans solve problems together',          gn:'Robot World',        ptcl:'#6ee7b7', portal:'', glow:'rgba(40,200,130,.8)' },
  { e:'🌙', n:'Moonbase Alpha',    sub:'Lunar Colony',        ac:'#94a3b8', t:'a moonbase colony facing challenges while exploring the lunar surface',     gn:'Moonbase',           ptcl:'#94a3b8', portal:'', glow:'rgba(100,130,180,.8)'},
  { e:'⚡', n:'Time Machine',      sub:'Through the Ages',    ac:'#fde047', t:'a time machine adventure visiting different historical periods',             gn:'Time Travel',        ptcl:'#fde047', portal:'', glow:'rgba(220,180,20,.8)' },
  { e:'🔭', n:'Star Gazer',        sub:'Cosmic Discovery',    ac:'#e0e7ff', t:'astronomers discovering new planets and solving cosmic mysteries',           gn:'Cosmic Discovery',   ptcl:'#e0e7ff', portal:'', glow:'rgba(100,90,220,.8)' },
  { e:'♟️', n:'AI Revolution',    sub:'Cyber Future',        ac:'#22d3ee', t:'a future city where AI and humans coexist in a technological world',        gn:'Cyber Future',       ptcl:'#22d3ee', portal:'', glow:'rgba(20,180,220,.8)' },
  { e:'🌟', n:'Star Children',     sub:'Born to Shine',       ac:'#fde047', t:'children with star powers protecting the universe from darkness',           gn:'Star Powers',        ptcl:'#fde047', portal:'', glow:'rgba(40,100,220,.8)' },
  // NATURE & ADVENTURE
  { e:'🦜', n:'Jungle Quest',      sub:'Wild & Dangerous',    ac:'#86efac', t:'jungle animals, hidden ancient temples, and wild exploration',              gn:'Jungle Explorer',    ptcl:'#86efac', portal:'', glow:'rgba(40,180,60,.8)'  },
  { e:'🌋', n:'Volcano Island',    sub:'Fire & Earth',        ac:'#f97316', t:'a volcanic island adventure with lava, danger, and hidden treasure',        gn:'Volcano Island',     ptcl:'#f97316', portal:'', glow:'rgba(230,80,20,.8)'  },
  { e:'🏔️', n:'Mountain Climb',  sub:'Peak Challenge',      ac:'#d1d5db', t:'climbing treacherous mountains and surviving dangerous conditions',          gn:'Mountain Adventure', ptcl:'#d1d5db', portal:'', glow:'rgba(130,140,160,.8)'},
  { e:'❄️', n:'Arctic Explorer',  sub:'Frozen Frontier',     ac:'#bae6fd', t:'exploring the frozen Arctic, surviving blizzards, and icy challenges',      gn:'Arctic Adventure',   ptcl:'#bae6fd', portal:'', glow:'rgba(20,160,240,.8)' },
  { e:'🦁', n:'Wildlife Safari',  sub:'Savanna Stories',     ac:'#fbbf24', t:'a safari adventure with amazing African wildlife and brave explorers',       gn:'Safari Adventure',   ptcl:'#fbbf24', portal:'', glow:'rgba(220,140,20,.8)' },
  { e:'🦕', n:'Dinosaur Land',    sub:'Jurassic Survival',   ac:'#a3e635', t:'a prehistoric world filled with dinosaurs and ancient creatures',            gn:'Dinosaur Adventure', ptcl:'#a3e635', portal:'', glow:'rgba(120,200,20,.8)' },
  { e:'🌿', n:'Forest Spirits',   sub:"Nature's Magic",      ac:'#6ee7b7', t:'forest spirits, talking animals, and the magic of the natural world',       gn:'Forest Magic',       ptcl:'#6ee7b7', portal:'', glow:'rgba(10,180,110,.8)' },
  { e:'🐺', n:'Wolf Pack',        sub:'Wild & Free',         ac:'#e2e8f0', t:'life among a wolf pack, survival in the wild, and pack loyalty',            gn:'Wolf Pack',          ptcl:'#e2e8f0', portal:'', glow:'rgba(110,140,180,.8)'},
  { e:'🌊', n:'Raging Rapids',    sub:'White Water Rush',    ac:'#38bdf8', t:'wild river adventures, white water rapids, and nature survival',             gn:'River Adventure',    ptcl:'#38bdf8', portal:'', glow:'rgba(20,140,220,.8)' },
  { e:'🌸', n:'Cherry Blossom',   sub:'Japanese Adventure',  ac:'#fbcfe8', t:'a magical journey through ancient Japan with samurai and nature spirits',    gn:'Japanese Quest',     ptcl:'#fbcfe8', portal:'', glow:'rgba(220,40,110,.8)' },
  // OCEAN & UNDERWATER
  { e:'🐙', n:'Deep Ocean',       sub:'Underwater World',    ac:'#67e8f9', t:'discovering the mysteries of the deep ocean and underwater creatures',       gn:'Ocean Adventure',    ptcl:'#67e8f9', portal:'', glow:'rgba(20,150,220,.8)' },
  { e:'🧜', n:'Mermaid Kingdom',  sub:'Under the Waves',     ac:'#a5f3fc', t:'a magical underwater kingdom with mermaids, seahorses, and ocean magic',     gn:'Mermaid Kingdom',    ptcl:'#a5f3fc', portal:'', glow:'rgba(10,180,220,.8)' },
  { e:'🦈', n:'Shark Dive',       sub:'Ocean Predator',      ac:'#7dd3fc', t:'a thrilling underwater adventure with sharks and ocean predators',           gn:'Ocean Predator',     ptcl:'#7dd3fc', portal:'', glow:'rgba(15,120,200,.8)' },
  { e:'🏴‍☠️',n:'Pirate Ship',  sub:'Seas of Fortune',     ac:'#fbbf24', t:'pirates sailing the high seas in search of treasure and adventure',          gn:'Pirate Adventure',   ptcl:'#fbbf24', portal:'', glow:'rgba(180,160,40,.8)' },
  { e:'🐠', n:'Coral Reef',       sub:'Rainbow Depths',      ac:'#fb923c', t:'the colorful world of coral reefs and tropical ocean creatures',             gn:'Coral Reef',         ptcl:'#fb923c', portal:'', glow:'rgba(20,180,200,.8)' },
  { e:'🦑', n:'Sea Monster',      sub:'Kraken Rising',       ac:'#818cf8', t:'battling sea monsters in the depths of the ancient ocean',                  gn:'Sea Monster',        ptcl:'#818cf8', portal:'', glow:'rgba(80,60,220,.8)'  },
  { e:'🐋', n:'Whale Song',       sub:'Ocean Giants',        ac:'#38bdf8', t:"journeying with majestic whales through the world's great oceans",          gn:'Ocean Journey',      ptcl:'#38bdf8', portal:'', glow:'rgba(10,160,220,.8)' },
  { e:'🚢', n:'Ocean Storm',      sub:'Battle the Waves',    ac:'#94a3b8', t:'a ship crew battling a massive ocean storm and surviving at sea',            gn:'Ocean Storm',        ptcl:'#94a3b8', portal:'', glow:'rgba(60,100,160,.8)' },
  // MYSTERY & DETECTIVE
  { e:'🔍', n:'Mystery Island',   sub:'Solve the Puzzle',    ac:'#fbbf24', t:'hidden clues, suspicious strangers, and a mystery only you can solve',       gn:'Mystery Island',     ptcl:'#fbbf24', portal:'', glow:'rgba(220,130,20,.8)' },
  { e:'🕵️', n:'Detective Agency',sub:'Case Closed',         ac:'#d97706', t:'a brave young detective solving crimes and catching sneaky criminals',        gn:'Detective Adventure',ptcl:'#d97706', portal:'', glow:'rgba(200,110,20,.8)' },
  { e:'👻', n:'Haunted House',    sub:'Spooky Spirits',      ac:'#c4b5fd', t:'exploring a haunted house filled with friendly and scary ghosts',            gn:'Haunted Adventure',  ptcl:'#c4b5fd', portal:'', glow:'rgba(120,60,200,.8)' },
  { e:'🕶️', n:'Spy Mission',     sub:'Top Secret',          ac:'#4ade80', t:'a young spy on a top-secret mission to save the world',                     gn:'Spy Adventure',      ptcl:'#4ade80', portal:'', glow:'rgba(30,160,80,.8)'  },
  { e:'🗺️', n:'Lost City',       sub:'Ancient Secrets',     ac:'#d97706', t:'discovering a lost ancient city hidden deep in the jungle',                  gn:'Lost City',          ptcl:'#d97706', portal:'', glow:'rgba(210,120,20,.8)' },
  { e:'💎', n:'Treasure Hunt',    sub:'Find the Gold',       ac:'#fcd34d', t:'following ancient maps to find legendary buried treasure',                   gn:'Treasure Hunt',      ptcl:'#fcd34d', portal:'', glow:'rgba(220,160,30,.8)' },
  { e:'🌃', n:'Night Detective',  sub:'Shadows & Secrets',   ac:'#818cf8', t:'a night detective solving mysterious cases in a city full of secrets',       gn:'Night Mystery',      ptcl:'#818cf8', portal:'', glow:'rgba(90,70,200,.8)'  },
  { e:'🎭', n:'Secret Identity',  sub:'Who Am I?',           ac:'#f472b6', t:'a mysterious adventure about discovering a hidden identity and truth',        gn:'Secret Identity',    ptcl:'#f472b6', portal:'', glow:'rgba(220,40,120,.8)' },
  // HISTORICAL & CULTURAL
  { e:'🏺', n:'Ancient Egypt',    sub:'Pharaohs & Pyramids', ac:'#fbbf24', t:'ancient Egypt with pharaohs, pyramids, mummies, and hidden tombs',           gn:'Ancient Egypt',      ptcl:'#fbbf24', portal:'', glow:'rgba(220,160,20,.8)' },
  { e:'⚔️', n:'Medieval Knight', sub:'Sword & Honour',      ac:'#d1d5db', t:'a medieval adventure with knights, castles, jousting, and dragons',          gn:'Medieval Quest',     ptcl:'#d1d5db', portal:'', glow:'rgba(150,160,180,.8)'},
  { e:'🥷', n:'Ninja Quest',      sub:'Stealth & Speed',     ac:'#e2e8f0', t:'a ninja adventure with stealth, martial arts, and ancient Japan',            gn:'Ninja Adventure',    ptcl:'#e2e8f0', portal:'', glow:'rgba(100,120,160,.8)'},
  { e:'🛡️', n:'Viking Adventure',sub:'Norse Legends',       ac:'#a1a1aa', t:'Viking adventures across stormy seas with Norse gods and monsters',          gn:'Viking Quest',       ptcl:'#a1a1aa', portal:'', glow:'rgba(140,140,160,.8)'},
  { e:'🏛️', n:'Ancient Greece',  sub:'Gods & Heroes',       ac:'#fde68a', t:'ancient Greek heroes, gods of Olympus, and epic mythological quests',        gn:'Greek Mythology',    ptcl:'#fde68a', portal:'', glow:'rgba(220,170,30,.8)' },
  { e:'🤠', n:'Wild West',        sub:'Cowboys & Outlaws',   ac:'#d97706', t:'the Wild West with cowboys, outlaws, gold rushes, and frontier towns',       gn:'Wild West',          ptcl:'#d97706', portal:'', glow:'rgba(200,120,20,.8)' },
  { e:'🥋', n:'Samurai Honor',    sub:'Way of the Blade',    ac:'#fca5a5', t:'a samurai story of honor, skill, and duty in feudal Japan',                 gn:'Samurai Quest',      ptcl:'#fca5a5', portal:'', glow:'rgba(200,40,40,.8)'  },
  { e:'🗿', n:'Aztec Empire',     sub:'Lost Civilization',   ac:'#fbbf24', t:'exploring the great Aztec empire, its temples, and ancient secrets',         gn:'Aztec Adventure',    ptcl:'#fbbf24', portal:'', glow:'rgba(210,110,20,.8)' },
  { e:'🌸', n:'Feudal Japan',     sub:'Honor & Blossom',     ac:'#fbcfe8', t:'honor, culture, and mystery in the world of ancient Japan',                  gn:'Feudal Japan',       ptcl:'#fbcfe8', portal:'', glow:'rgba(220,30,110,.8)' },
  // SUPERHERO & ACTION
  { e:'🦸', n:'Superhero School', sub:'Train & Save the Day',ac:'#facc15', t:'young superheroes training their powers and saving the world',               gn:'Superhero Academy',  ptcl:'#facc15', portal:'', glow:'rgba(40,110,240,.8)' },
  { e:'🦹', n:'Villain Reform',   sub:'Bad to Good',         ac:'#f472b6', t:'a former villain learning to be a hero and making amends',                   gn:'Villain Story',      ptcl:'#f472b6', portal:'', glow:'rgba(180,30,90,.8)'  },
  { e:'🏎️', n:'Race to Victory', sub:'Speed & Skill',       ac:'#f97316', t:'an exciting racing adventure with daring moves and close finishes',          gn:'Racing Adventure',   ptcl:'#f97316', portal:'', glow:'rgba(220,80,20,.8)'  },
  { e:'🎯', n:'Secret Agent',     sub:'Mission Impossible',  ac:'#22d3ee', t:'a secret agent on a thrilling mission to stop an evil organization',        gn:'Secret Agent',       ptcl:'#22d3ee', portal:'', glow:'rgba(20,160,220,.8)' },
  { e:'🥊', n:'Champion Fighter', sub:'Rise to the Top',     ac:'#fca5a5', t:'a young fighter training hard to become the world champion',                 gn:'Fighting Champion',  ptcl:'#fca5a5', portal:'', glow:'rgba(200,50,50,.8)'  },
  { e:'🧗', n:'Extreme Sports',   sub:'Push Your Limits',    ac:'#fdba74', t:"extreme sports adventures pushing the limits of what's possible",            gn:'Extreme Adventure',  ptcl:'#fdba74', portal:'', glow:'rgba(220,120,30,.8)' },
  // IMAGINATIVE
  { e:'🍬', n:'Candy Kingdom',    sub:'Sweet Adventure',     ac:'#f9a8d4', t:'a magical world made entirely of candy, sweets, and delicious treats',      gn:'Candy World',        ptcl:'#f9a8d4', portal:'', glow:'rgba(220,30,110,.8)' },
  { e:'💭', n:'Dream World',      sub:'Sleep & Adventure',   ac:'#c4b5fd', t:'an adventure inside a magical dream world with impossible things',           gn:'Dream Adventure',    ptcl:'#c4b5fd', portal:'', glow:'rgba(140,70,230,.8)' },
  { e:'🔬', n:'Shrunk Tiny',      sub:'Micro World',         ac:'#86efac', t:'shrunk to the size of an ant and exploring a giant everyday world',          gn:'Tiny Adventure',     ptcl:'#86efac', portal:'', glow:'rgba(10,170,110,.8)' },
  { e:'🧸', n:'Toy World',        sub:'Playtime Quest',      ac:'#fb923c', t:'toys come to life and go on adventures in the world of humans',              gn:'Toy Adventure',      ptcl:'#fb923c', portal:'', glow:'rgba(230,80,20,.8)'  },
  { e:'🎪', n:'Haunted Carnival', sub:'Thrills & Chills',    ac:'#f472b6', t:'a mysterious carnival where strange magic and spooky fun await',             gn:'Carnival Mystery',   ptcl:'#f472b6', portal:'', glow:'rgba(220,30,110,.8)' },
  { e:'☁️', n:'Cloud Kingdom',   sub:'Sky High',             ac:'#bae6fd', t:'a floating cloud kingdom above the earth with sky creatures',               gn:'Sky Kingdom',        ptcl:'#bae6fd', portal:'', glow:'rgba(20,180,240,.8)' },
  { e:'🌈', n:'Rainbow Realm',    sub:'Color & Magic',       ac:'#a78bfa', t:'a magical realm where colors have power and rainbows lead to adventure',     gn:'Rainbow Quest',      ptcl:'#a78bfa', portal:'', glow:'rgba(150,50,230,.8)' },
  { e:'🦄', n:'Unicorn Valley',   sub:'Magic & Friendship',  ac:'#f9a8d4', t:'a magical valley where unicorns and children share adventures',              gn:'Unicorn Adventure',  ptcl:'#f9a8d4', portal:'', glow:'rgba(220,30,110,.8)' },
  { e:'🦋', n:'Butterfly Grove',  sub:'Metamorphosis Magic', ac:'#f0abfc', t:'magical butterflies, enchanted gardens, and transformation adventures',      gn:'Butterfly Magic',    ptcl:'#f0abfc', portal:'', glow:'rgba(180,30,190,.8)' },
  { e:'🏝️', n:'Tropical Paradise',sub:'Sun & Fun',          ac:'#fde047', t:'a tropical island adventure with hidden beaches and local mysteries',         gn:'Island Adventure',   ptcl:'#fde047', portal:'', glow:'rgba(10,170,100,.8)' },
  // ELEMENTS & FORCES
  { e:'🔥', n:'Fire Kingdom',     sub:'Flame & Power',       ac:'#f97316', t:'a world of fire where brave heroes battle volcanic forces',                  gn:'Fire Adventure',     ptcl:'#f97316', portal:'', glow:'rgba(230,80,20,.8)'  },
  { e:'🌪️', n:'Storm Riders',    sub:'Thunder & Lightning',  ac:'#94a3b8', t:'riders who harness the power of storms and lightning',                      gn:'Storm Adventure',    ptcl:'#94a3b8', portal:'', glow:'rgba(80,120,190,.8)' },
  { e:'🌿', n:'Earth Guardian',   sub:'Nature Protector',    ac:'#86efac', t:'guardians of the earth protecting nature from those who would destroy it',   gn:'Earth Guardian',     ptcl:'#86efac', portal:'', glow:'rgba(30,160,70,.8)'  },
  { e:'💨', n:'Sky Dancers',      sub:'Wind & Wonder',       ac:'#bae6fd', t:'riders of the wind exploring endless skies and cloud cities',               gn:'Sky Adventure',      ptcl:'#bae6fd', portal:'', glow:'rgba(20,180,220,.8)' },
  { e:'🧊', n:'Ice Palace',       sub:'Frozen Royalty',      ac:'#e0f2fe', t:'a frozen palace where ice magic and winter spirits hold ancient secrets',    gn:'Ice Kingdom',        ptcl:'#e0f2fe', portal:'', glow:'rgba(20,160,240,.8)' },
  // QUIRKY & FUN
  { e:'🎵', n:'Music World',      sub:'Rhythm & Rhyme',      ac:'#818cf8', t:'a world where music is magic and sounds can change everything',              gn:'Music Adventure',    ptcl:'#818cf8', portal:'', glow:'rgba(100,80,220,.8)' },
  { e:'🎨', n:'Art Kingdom',      sub:'Painted Worlds',      ac:'#f472b6', t:'a world inside a painting where art comes to life and color has power',      gn:'Art Adventure',      ptcl:'#f472b6', portal:'', glow:'rgba(220,30,100,.8)' },
  { e:'🏀', n:'Sports Champion',  sub:'Game Day Glory',      ac:'#fb923c', t:'a young athlete rising through the ranks to become a sports champion',       gn:'Sports Adventure',   ptcl:'#fb923c', portal:'', glow:'rgba(230,90,20,.8)'  },
  { e:'📚', n:'Book World',       sub:'Into the Story',      ac:'#fbbf24', t:'falling into a magical library where story worlds come to life',             gn:'Book Adventure',     ptcl:'#fbbf24', portal:'', glow:'rgba(210,140,20,.8)' },
  { e:'🌙', n:'Moon Festival',    sub:'Lanterns & Legend',   ac:'#fde68a', t:'a magical moon festival with legends, dragons, and glowing lanterns',        gn:'Festival Magic',     ptcl:'#fde68a', portal:'', glow:'rgba(220,180,30,.8)' },
  { e:'🎃', n:'Halloween Night',  sub:'Tricks & Treats',     ac:'#f97316', t:'a Halloween adventure where monsters, magic, and mystery mix',               gn:'Halloween Quest',    ptcl:'#f97316', portal:'', glow:'rgba(220,100,10,.8)' },
  { e:'🐱', n:'Cat Kingdom',      sub:'Paws & Power',        ac:'#f9a8d4', t:'a magical kingdom ruled by cats where feline heroes go on adventures',       gn:'Cat Adventure',      ptcl:'#f9a8d4', portal:'', glow:'rgba(220,30,110,.8)' },
  { e:'🌾', n:'Farm Life',        sub:'Country Adventure',   ac:'#a3e635', t:'a farm adventure with talking animals and magical crops',                    gn:'Farm Adventure',     ptcl:'#a3e635', portal:'', glow:'rgba(120,200,20,.8)' },
  { e:'🎸', n:'Rock Band Quest',  sub:'Music & Mayhem',      ac:'#818cf8', t:'a rock band going on tour and solving mysteries along the way',              gn:'Music Quest',        ptcl:'#818cf8', portal:'', glow:'rgba(100,70,220,.8)' },
  { e:'🧩', n:'Puzzle Realm',     sub:'Think & Solve',       ac:'#67e8f9', t:'a world where puzzles and riddles unlock magical powers and passages',       gn:'Puzzle Quest',       ptcl:'#67e8f9', portal:'', glow:'rgba(20,180,220,.8)' },
  { e:'🌠', n:'Shooting Stars',   sub:'Wish Upon a Star',    ac:'#fde047', t:'following a shooting star through a magical adventure across the sky',       gn:'Star Adventure',     ptcl:'#fde047', portal:'', glow:'rgba(100,90,220,.8)' },
  { e:'🌻', n:'Sunflower Valley', sub:'Golden Days',         ac:'#fde047', t:'a warm valley full of magical sunflowers and cheerful nature spirits',       gn:'Valley Quest',       ptcl:'#fde047', portal:'', glow:'rgba(220,180,20,.8)' },
  { e:'🌍', n:'World Explorer',   sub:'Every Corner',        ac:'#34d399', t:'traveling the globe discovering new cultures and ancient wonders',            gn:'World Adventure',    ptcl:'#34d399', portal:'', glow:'rgba(10,180,110,.8)' },
  { e:'🦓', n:'Savanna Run',      sub:'Wild and Fast',       ac:'#fbbf24', t:'racing across the African savanna with zebras, lions, and wildebeest',       gn:'Savanna Adventure',  ptcl:'#fbbf24', portal:'', glow:'rgba(220,150,20,.8)' },
  { e:'🌺', n:'Flower Kingdom',   sub:'Petal Power',         ac:'#f9a8d4', t:'a kingdom of giant flowers where tiny heroes go on big adventures',          gn:'Flower Kingdom',     ptcl:'#f9a8d4', portal:'', glow:'rgba(220,20,90,.8)'  },
  { e:'🐸', n:'Swamp Secrets',    sub:'Murky & Magical',     ac:'#86efac', t:'a magical swamp with talking frogs, hidden spirits, and boggy mysteries',    gn:'Swamp Magic',        ptcl:'#86efac', portal:'', glow:'rgba(30,140,50,.8)'  },
  { e:'🏜️', n:'Desert Mirage',  sub:'Sands of Mystery',    ac:'#fcd34d', t:'a desert adventure with mirages, sandstorms, and hidden oases',              gn:'Desert Adventure',   ptcl:'#fcd34d', portal:'', glow:'rgba(220,160,20,.8)' },
  { e:'🦅', n:'Sky Kingdom',      sub:'Wings & Wind',        ac:'#7dd3fc', t:'flying kingdoms in the sky where eagle-riders soar through the clouds',      gn:'Sky Kingdom',        ptcl:'#7dd3fc', portal:'', glow:'rgba(10,170,230,.8)' },
  { e:'🦝', n:'City Critters',    sub:'Urban Animal Gang',   ac:'#94a3b8', t:'a gang of clever city animals pulling off adventures in a big city',         gn:'City Animals',       ptcl:'#94a3b8', portal:'', glow:'rgba(90,120,170,.8)' },
  { e:'🐉', n:'Sea Dragon',       sub:'Deep & Fierce',       ac:'#22d3ee', t:'sea dragons protecting the ocean depths from ancient evil forces',            gn:'Sea Dragon',         ptcl:'#22d3ee', portal:'', glow:'rgba(20,180,220,.8)' },
  { e:'🧊', n:'Frozen Tundra',    sub:'Survival Challenge',  ac:'#bae6fd', t:'surviving and exploring a vast frozen tundra full of icy mysteries',          gn:'Tundra Survival',    ptcl:'#bae6fd', portal:'', glow:'rgba(80,140,200,.8)' },
  { e:'🌊', n:'Surf Champions',   sub:'Ride the Waves',      ac:'#38bdf8', t:'surf champions tackling the biggest waves and ocean mysteries',               gn:'Surf Adventure',     ptcl:'#38bdf8', portal:'', glow:'rgba(10,160,220,.8)' },
  { e:'🏗️', n:'City Builders',   sub:'Build & Protect',     ac:'#fbbf24', t:'young engineers building a city and defending it from disasters',            gn:'City Building',      ptcl:'#fbbf24', portal:'', glow:'rgba(160,170,40,.8)' },
  { e:'🌑', n:'Midnight Quest',   sub:'Under the Moon',      ac:'#818cf8', t:'a nighttime adventure where moonlight reveals hidden magic',                  gn:'Night Adventure',    ptcl:'#818cf8', portal:'', glow:'rgba(90,70,200,.8)'  },
  { e:'🐬', n:'Dolphin Bay',      sub:'Ocean Friends',       ac:'#38bdf8', t:'adventures with a pod of dolphins in a magical ocean bay',                   gn:'Dolphin Adventure',  ptcl:'#38bdf8', portal:'', glow:'rgba(20,150,220,.8)' },
  { e:'🦉', n:'Owl Forest',       sub:'Night Wisdom',        ac:'#fbbf24', t:'a forest of wise owls guarding ancient secrets through the night',            gn:'Owl Forest',         ptcl:'#fbbf24', portal:'', glow:'rgba(180,150,40,.8)' },
  { e:'🐲', n:'Dragon Keep',      sub:'Ancient Fortress',    ac:'#f97316', t:'an ancient fortress where brave heroes battle to reclaim their home',         gn:'Fortress Quest',     ptcl:'#f97316', portal:'', glow:'rgba(210,120,20,.8)' },
];

export const GENRE_BADGES: Record<string, [string, string, string]> = {
  'Fantasy Quest':    ['🐉 Dragon Friend',  '⚔️ Brave Knight',   '✨ Magic Master'],
  'Space Adventure':  ['🚀 Space Ace',      '👾 Alien Ally',      '⭐ Star Explorer'],
  'Jungle Explorer':  ['🌴 Jungle Expert',  '🐆 Cat Whisperer',   '🗺️ Pathfinder'],
  'Mystery Island':   ['🔍 Clue Master',    '🕵️ Top Detective',   '🌟 Case Solved'],
  'Ocean Adventure':  ['🐠 Sea Champion',   '🐙 Ocean Hero',      '🌊 Wave Rider'],
  'Robot World':      ['🤖 Bot Builder',    '⚙️ Tech Genius',     '🔧 Circuit Hero'],
  'Pirate Adventure': ['⚓ Sea Captain',    '🗺️ Map Master',      '💰 Treasure Hunter'],
  'Superhero Academy':['🦸 Super Hero',     '💥 City Saver',      '🏅 Champion'],
  'Dinosaur Adventure':['🦕 Dino Tamer',   '🌋 Volcano Brave',   '🦴 Fossil Finder'],
  'Wizard Academy':   ['🧙‍♀️ Spell Master', '📚 Book Wizard',     '⚡ Magic Ace'],
  'Unicorn Adventure':['🦄 Unicorn Friend', '🌈 Rainbow Keeper',  '✨ Enchanted'],
  'Haunted Adventure':['👻 Ghost Friend',   '🔦 Brave Explorer',  '🌟 Mystery Solver'],
};

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
