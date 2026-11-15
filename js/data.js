/* ==========================================================================
   Moon Outpost - Game Data & Constants
   ========================================================================== */

// Canvas & World Dimensions
const VW = 800, VH = 500, WW = 3200, WH = 2000;
const Z = { x: 1440, y: 930, w: 330, h: 150 }; // Base shelter boundary

// Rock Types: [Name, Rarity, Value, Color, MiningTime, EducationalDesc]
const T = [
  ["Basalt", "Common", 1, "#9aa0b0", 0, "🧱 A plain grey rock. Builders can use it to make walls!"],
  ["Anorthosite", "Uncommon", 3, "#eef1fa", 0, "✨ A shiny white rock from the bright hills. We can get metal out of it!"],
  ["Pyroxene", "Uncommon", 5, "#d9a066", 1.2, "🟠 A crunchy orange rock with metal hiding inside!"],
  ["Ilmenite", "Rare", 8, "#4aa3ff", 2, "💙 A blue rock with air hiding inside! It could help astronauts breathe!"],
  ["Water Ice", "Rare", 12, "#9ff3ff", 2.5, "🧊 Frozen water! Astronauts can drink it, breathe it and make rocket fuel!"],
  ["Meteorite", "Rare", 12, "#ff9f43", 2.5, "☄️ A space rock that fell from the sky and went BONK on the Moon!"],
  ["Olivine", "Epic", 20, "#7ee26b", 3.5, "💚 A green gem-rock that grows deep inside planets!"],
  ["Helium-3", "Epic", 35, "#ffe14d", 4, "💛 Tiny, tiny bits hide in Moon dust. Scientists dream about using it for fuel!"],
  ["Moon Opal", "Legendary", 50, "#ff6bd6", 5, "🌈 A pretend super-rare gem that only lives in this game!"]
];

// Flare classes & Lunar zones
const CL = [["C-class", 0.6], ["M-class", 1], ["X-class", 1.6]];
const ZN = ["Highlands", "Dark plains", "Central plain", "Shadowed craters", "Meteor field"];

// Base Upgrades & Costs
const U = [
  ["tank", "💨 Oxygen tank", "+30 air per level"],
  ["bag", "🎒 Bigger bag", "+4 slots per level"],
  ["drill", "⛏ Faster drill", "−25% mining time"],
  ["lining", "🛡️ Radiation lining", "−20% flare damage"],
  ["gen", "⚡ Generator", "+10 kW and a new solar panel"],
  ["rover", "🤖 Rover scanner", "Rover grabs nearby rocks"],
  ["chef", "👩‍🍳 Space chef", "Foods are 20% stronger per level"],
  ["garden", "🌱 Garden", "Greenhouse grows meals 30% faster per level"],
  ["pantry", "🗄️ Pantry shelves", "+3 snack slots per level"]
];
const COST = [40, 80, 140];

// Biome Color Palettes
const PAL = [
  ["#a7aabd", "#9da1b6", "#b1b4c7", "#9599ae"],
  ["#6f7390", "#686c8a", "#777b99", "#62667f"],
  ["#8d91a6", "#868aa0", "#9498ad", "#7f8398"],
  ["#5d6a88", "#566280", "#667391", "#4f5a76"],
  ["#9a8678", "#927e70", "#a39080", "#8a7668"]
];

// Offline NASA Fallback Sample Flares
const SAMPLE = [
  { cls: "M2.3", t: "2016-01-02T00:11Z", loc: "S21W73" },
  { cls: "M5.2", t: "2014-05-08T10:07Z", loc: "N05E55" },
  { cls: "M1.8", t: "2014-05-06T09:03Z", loc: "S13W87" },
  { cls: "M1.0", t: "2014-05-06T22:09Z", loc: "S09W91" },
  { cls: "C9.6", t: "2016-01-28T12:02Z", loc: "N03W47" }
];

// Educational Tips Carousel
const TIPS = [
  "🌬️ The Moon has NO air! That's why astronauts carry their own air tank. 💨",
  "🦘 Moon gravity is much weaker, so astronauts bounce and hop like bunnies!",
  "🧊 NASA found frozen water ice hiding in dark Moon craters. Grab 🧊 Water Ice to get extra air!",
  "🏠 Go back to the base to fill your air, rest and bank your rocks!",
  "🎒 Your bag only holds a few rocks. Bank them in the base to make room!",
  "⛏ Shiny glowing rocks are rare! Hold E next to them to dig them up.",
  "☄️ Space rocks hit the Moon all the time because it has no air to stop them!",
  "☀️ The Sun sometimes sneezes out a flare. NASA watches it with special telescopes. 🔭",
  "🛡️ In the base panel (press B) you can share power between air, food and the flare shield.",
  "👣 Footprints on the Moon can stay for a very, very long time because there is no wind!",
  "🌍 The Moon is slowly floating away from Earth, about as fast as your fingernails grow!",
  "🌞 One day on the Moon lasts about 29 Earth days. That's a LONG day!",
  "🥬 Greenhouse power grows food rations 🥫. Eat with F inside the base!",
  "💨 Zooming (Shift) is fast but uses lots of air. Walk when you can!",
  "🥶 The Moon is super hot in the sunshine and super cold in the shadows!",
  "🧑‍🚀 NASA's Artemis missions want to bring astronauts back to the Moon!",
  "🍅 Canadian classrooms grow Tomatosphere seeds that took a space-like trip. Cool!",
  "🧂 Space salt and pepper are liquid! Tiny grains could float into eyes and machines.",
  "👅 Food can taste bland in space, so many astronauts love spicy sauce! 🌶️",
  "🫧 Fizzy drinks are tricky in space because bubbles don't rise like they do at home.",
  "🥬 Astronauts have grown lettuce, radishes and even chili peppers on the space station!",
  "🧑‍🍳 NASA and the Canadian Space Agency run the Deep Space Food Challenge to invent food for long trips!",
  "🔴 Sunspots are cooler dark spots on the Sun. They come and go in an 11 year cycle!",
  "⚡ A solar flare's light reaches us in about 8 minutes, super fast!",
  "🌌 Auroras are glowing sky lights made when sun-stuff meets Earth's magnet bubble.",
  "🧲 The Moon has no big magnet bubble like Earth, so a base needs its own shield!",
  "📻 Flares can cause radio blackouts. Hold R in the base to fix yours!",
  "🌫️ Moon dust is sticky and scratchy. Brush it off with R!",
  "🌪️ A CME takes hours to days to reach Earth. That gives a countdown to get ready!",
  "🌩️ The Kp number goes from 0 to 9. Kp 5 is a small storm, 7 is strong and 9 is extreme!",
  "🔥 Spacewalks burn about 200 extra food-calories every hour, so astronauts get hungrier outside!",
  "🤖 M and X flares can knock out robots that have no shield. Keep your 🛡️ shield powered!",
  "⚖️ Launching heavy food is costly. A 4-person crew needs about 10,500 kg for a 3 year trip!",
  "🍽️ Astronauts need about 1,900 to 3,200 food-calories (kcal) every day."
];

// Difficulty Presets
const DIF = [
  { n: "Easy", e: "🐣", c: "g", goal: 0.7, haz: 0.7, dmg: 0.7, o2: 0.8, fd: 0.8, h: "More air, less hungry, fewer surprises" },
  { n: "Normal", e: "🚀", c: "b", goal: 1, haz: 1, dmg: 1, o2: 1, fd: 1, h: "The real space trip!" },
  { n: "Hard", e: "🔥", c: "o", goal: 1.3, haz: 1.35, dmg: 1.3, o2: 1.2, fd: 1.2, h: "More flares, more hunger. For experts!" }
];

// Campaign Days
const DAYS = [
  { n: 1, em: "🌅", t: "Landing Day", st: "Solar Farm", bi: "🔋", goal: 90, mx: 0, f: 0.8, m: 0.6, ev: 0, s: 0.7, perk: "+5 kW more power on the next days", d: "Land on the Moon! Only little C-class flares ☀️ and a few space rocks. Learn the ropes and build the Solar Farm!" },
  { n: 2, em: "🌤️", t: "Growing Day", st: "Greenhouse Dome", bi: "🌱", goal: 170, mx: 1, f: 1, m: 0.9, ev: 0.7, s: 1, perk: "Meals grow 30% faster on Day 3", d: "Medium M-class flares can knock out radio and robots 🤖. A Sun-burp (CME) may follow, with a countdown!" },
  { n: 3, em: "🌙", t: "Storm Day", st: "Shield Tower", bi: "🛡️", goal: 260, mx: 2, f: 1.2, m: 1.1, ev: 1.2, s: 1.2, perk: "The outpost is complete! 🎉", d: "Giant X-class flares, CME magnet storms and Sun particles! Share your power wisely and try the Storm protocol in the base." }
];

const FLFX = [
  "C = minor flare: tiny radiation.",
  "M = moderate flare: radio static, and robots with no shield go offline!",
  "X = MAJOR flare: radio blackout, strong radiation, and a CME may follow!"
];

const FIXMSG = {
  radio: "📻 Radio fixed! Beep boop, you can hear again!",
  gps: "🛰️ GPS fixed! Your map knows where you are!",
  surge: "⚡ Breaker flipped! Power is back!",
  dust: "🧹 All clean! Dust brushed off!"
};

// Available Mission Types
const CHS = [
  ["fix", "🔧 Fix 3 problems", 3, 40, () => G.nF],
  ["rare", "💎 Bank 4 rare rocks", 4, 50, () => G.tally.slice(3).reduce((a, b) => a + b, 0)],
  ["ice", "🧊 Bank 2 Water Ice", 2, 35, () => G.tally[4]],
  ["eat", "🍱 Eat 3 snacks", 3, 30, () => G.nE],
  ["pts", "⭐ Score 150 points", 150, 45, () => G.score],
  ["hide", "☀️ Get through 2 flares without fainting", 2, 40, () => G.nB ? 0 : G.fl.filter(f => G.t >= f.s + 35).length]
];

// Space Food Items (NASA / Canadian Space Agency Research)
const FOODS = [
  { id: "tort", e: "🌯", n: "Tortilla wrap", p: 10, fd: 25, k: "Astronauts use tortillas instead of bread because crumbs would float everywhere!" },
  { id: "pb", e: "🥜", n: "Peanut butter", p: 12, fd: 20, stm: 20, k: "Spreads are easy to eat in space because they stick to the food, not float away." },
  { id: "straw", e: "🍓", n: "Freeze-dried strawberries", p: 15, fd: 15, stm: 30, k: "Freeze-dried food has the water taken out, so it is super light and lasts a long time!" },
  { id: "pasta", e: "🍝", n: "Pasta meal (add water)", p: 25, fd: 40, k: "Some space meals are dried. You add water to wake them up!" },
  { id: "bar", e: "🍫", n: "Energy bar", p: 18, fd: 10, bf: ["speed", 20], k: "Ready-to-eat snacks need no cooking, which is handy on busy days." },
  { id: "lett", e: "🥬", n: "Fresh lettuce", p: 30, fd: 20, hp: 20, k: "Astronauts have really grown lettuce on the space station!" },
  { id: "tomato", e: "🍅", n: "Space tomato", p: 35, fd: 15, bf: ["shield", 30], k: "Kids in Canada grow tomato seeds in the Tomatosphere program! (Tough suit is a game power-up.)" },
  { id: "stew", e: "🍲", n: "Hot space stew", p: 45, fd: 60, hp: 30, k: "Some meals are heated in pouches so they stay safe to eat for a long time." },
  { id: "juice", e: "🧃", n: "Juice pouch", p: 14, fd: 10, hp: 15, stm: 10, k: "Drinks come in pouches with a straw so they don't float away!" }
];

// Space School Phenomena: Sun, Earth & Impacts
const SW = "https://www.spaceweather.gov/";
const CSA = "https://www.asc-csa.gc.ca/eng/";

const SUN = [
  ["🔴", "Sunspots and the Solar Cycle", "Sunspots are dark patches on the Sun where strong magnets get all tangled up. They look dark because they are cooler than the Sun around them! The Sun grows lots of spots, then fewer, then lots again, in a cycle that lasts about 11 years.", "More spots usually means more flares, so busy Sun years are riskier.", "phenomena/sunspotssolar-cycle"],
  ["⚡", "Solar Flares (Radio Blackouts)", "A flare is a big flash of light and energy from the Sun, like a sneeze! Its light gets to us in about 8 minutes. Flares have sizes: C is little 🐣, M is medium 🐯 and X is GIANT 🦖. Big ones can make radio signals on Earth go fuzzy. That is called a radio blackout.", "The flare banners are real NASA flares. Medium and giant ones cause 📻 Radio static. Fix it in the base with R!", "phenomena/solar-flares-radio-blackouts"],
  ["🌪️", "Coronal Mass Ejections (CMEs)", "A CME is a giant bubble of Sun-stuff and magnets that burps out of the Sun. It is slower than a flare and can take a few days to cross space. If it hits Earth, it can shake Earth's magnet bubble.", "CMEs start the ⚡ magnet storms that weaken your power and wobble your GPS.", "phenomena/coronal-mass-ejections"],
  ["🕳️", "Coronal Holes", "Coronal holes are dark patches in the Sun's outer layer where the magnets are open like a window. Sun-wind zooms out of them extra fast!", "Fast sun-wind helps make storms; the storm events in the game remind you of this.", "phenomena/coronal-holes"],
  ["💨", "Solar Wind", "The solar wind is a never-ending breeze of teeny tiny charged bits blowing out from the Sun in every direction. It is why comet tails always point away from the Sun!", "Comets in the menu have tails pointing away from the Sun. Can you see it?", "phenomena/solar-wind"],
  ["🔆", "Solar EUV Irradiance", "EUV is extreme ultraviolet light from the Sun. You can't see it, but it warms up the high, thin air around Earth and makes it puff up bigger.", "This puffing up is why satellites get tugged lower (satellite drag).", "phenomena/solar-euv-irradiance"],
  ["📻", "F10.7 cm Radio Emissions", "The Sun makes radio waves too! Scientists measure a special one called F10.7. It is like a thermometer that tells how busy the Sun is.", "", "phenomena/f107-cm-radio-emissions"]
];

const EARTH = [
  ["🧲", "Earth's Magnetosphere", "Earth is like a giant magnet with an invisible bubble around it. The bubble pushes most sun-stuff away and keeps us safe. The Moon doesn't have a big bubble like that, so astronauts there need shields!", "Your 🛡️ flare shield is like a mini magnet bubble for the base.", "phenomena/earths-magnetosphere"],
  ["🌌", "Aurora", "When sun-stuff slides into Earth's magnet bubble near the poles, the sky glows in green, pink and purple curtains. These are the Northern and Southern Lights!", "", "phenomena/aurora"],
  ["🌩️", "Geomagnetic Storms", "A geomagnetic storm happens when a CME or fast sun-wind shakes Earth's magnet bubble. Scientists give them a level from G1 (small) to G5 (extreme).", "⚡ Magnet storm events show a real NASA storm level when NASA data is live.", "phenomena/geomagnetic-storms"],
  ["🛰️", "Ionosphere", "The ionosphere is a layer of Earth's high air where sunlight turns gas into charged bits. Some radio waves bounce off it like a trampoline!", "", "phenomena/ionosphere"],
  ["✨", "Ionospheric Scintillation", "Sometimes the ionosphere gets bumpy patches. Signals passing through twinkle like stars, so GPS and satellite messages can get wobbly.", "🛰️ GPS wobble in the game!", "phenomena/ionospheric-scintillation"],
  ["🔢", "Total Electron Content (TEC)", "Scientists count how many charged bits are in a tall pillar of the ionosphere. More bits can slow GPS signals, so the count helps fix GPS errors.", "", "phenomena/total-electron-content"],
  ["🍩", "Radiation Belts", "Two donut-shaped rings of zippy particles are trapped by Earth's magnet. They are called the Van Allen belts. Satellites passing through must be tough!", "", "phenomena/radiation-belts"],
  ["☢️", "Solar Radiation Storm", "Super fast tiny particles from big flares and CMEs can zoom through space. They can hurt satellites and astronauts, so astronauts hide in the safest part of their spacecraft. Levels go from S1 to S5.", "Hide in the base during flares. The 🛡️ shield and 🍅 tomato power-up make it safer!", "phenomena/solar-radiation-storm"],
  ["🌠", "Galactic Cosmic Rays", "These are fast particles from far away, from exploded stars. They are always around. They are a bit weaker when the Sun is very busy, because the strong solar wind pushes some away.", "", "phenomena/galactic-cosmic-rays"]
];

const IMP = [
  ["⚡", "Electric Power Transmission", "Magnet storms can push extra electric current into long power lines and make big transformers too hot. Power companies watch the alerts and get ready.", "⚡ Power surge: your generator gets weak.", "impacts/electric-power-transmission"],
  ["🧭", "GPS Systems", "GPS uses signals from satellites. A bumpy ionosphere can make the signal slow or wobbly, so a map can be a little wrong.", "🛰️ GPS wobble: your minimap jumps around.", "impacts/space-weather-and-gps-systems"],
  ["📻", "HF Radio Communications", "Pilots and ships use high-frequency radio that bounces off the ionosphere. A flare can make it go quiet on the sunny side of Earth.", "📻 Radio blackout: minimap static and rover scanner off.", "impacts/hf-radio-communications"],
  ["📡", "Satellite Communications", "Space weather can confuse or zap satellites, so phone and TV signals from space can fizzle.", "", "impacts/satellite-communications"],
  ["🛰️", "Satellite Drag", "Storms heat Earth's high air so it puffs up. Satellites run into more air and get pulled lower, so operators must steer them back up.", "", "impacts/satellite-drag"]
];

const EZ = [
  ["☀️", "The Sun is a big, hot ball in the sky."],
  ["🤧", "Sometimes the Sun sneezes. That is a solar flare!"],
  ["🫧", "A big Sun bubble is called a CME. It floats far away."],
  ["🌍", "Earth has an invisible hug. It keeps us safe."],
  ["🌈", "Pretty sky lights are called auroras."],
  ["🌙", "The Moon has no air. Astronauts bring air in a tank."],
  ["🏠", "The base is a safe house. Hide there when the Sun sneezes!"],
  ["🧊", "Ice on the Moon is frozen water. Yum, a drink!"],
  ["🌯", "Astronauts eat tortillas. No crumbs floating around!"],
  ["🥬", "Plants can grow in space. Fresh lettuce!"],
  ["🤖", "A rover is a robot helper. It likes a safe place too."],
  ["🔧", "If something breaks, fix it! Hold R in the base."]
];

// Quiz Banks
const QZ_ALL = [
  ["What is a solar flare?", "A big flash of light and energy from the Sun ☀️", "A rock on the Moon 🪨", "A kind of rocket 🚀", "A flare is like the Sun sneezing! It is a giant flash of light and energy."],
  ["How long does flare light take to reach Earth?", "About 8 minutes ⚡", "About 8 days", "About 8 years", "Light is super fast! Flare light gets here in about 8 minutes."],
  ["Flares come in sizes C, M and X. Which one is the BIGGEST?", "X-class 🦖", "C-class 🐣", "M-class 🐯", "C is little, M is medium and X is the biggest, a major flare!"],
  ["What can M-class and X-class flares do?", "Make radio fuzzy and knock out robots with no shield 📻", "Make the Moon bigger 🌕", "Turn rocks into cheese 🧀", "Strong flares cause radio blackouts and can switch off electronics that are not shielded. Shields help!"],
  ["What is a CME?", "A giant bubble of Sun-stuff that burps into space 🌪️", "A moon rock that glows 💎", "A space snack 🍫", "CME means Coronal Mass Ejection. It is a huge cloud of Sun-stuff and magnets."],
  ["How long can a CME take to reach Earth?", "A few hours up to a few days 🕒", "One blink 👀", "One whole year 📅", "CMEs are slower than light. Scientists can see them coming, so there is a countdown to get ready!"],
  ["Why is it great that scientists can see a CME coming?", "We get a countdown to get ready 🛡️", "It makes the CME go away", "It makes the Sun cooler", "The travel time gives astronauts a chance to hide in the base and send power to the shield."],
  ["The Kp number goes from 0 to 9. What does it measure?", "How strong a magnet storm is 🌩️", "How many rocks are on the Moon", "How tall an astronaut is", "Kp 5 is a small storm, Kp 7 is strong and Kp 9 is extreme!"],
  ["Which Kp number is an EXTREME storm?", "Kp 9", "Kp 0", "Kp 2", "Kp 9 is the top of the scale. Kp 5 is minor and Kp 7 is strong."],
  ["What are SEPs (Solar Energetic Particles)?", "Super-fast tiny bits from the Sun that can hurt astronauts outside ☢️", "Space cookies 🍪", "Tiny moons 🌙", "SEPs zoom out after big Sun blasts. Outside the base they make astronauts tired and sick, so hide inside!"],
  ["Where is the safest place in a radiation storm?", "Inside a shielded base 🏠", "On top of a hill", "Next to a crater", "Shielded walls block many of the zippy particles."],
  ["Why do astronauts carry air tanks on the Moon?", "The Moon has NO air to breathe 💨", "The air smells funny", "Tanks look cool", "The Moon has almost no air, so astronauts bring their own."],
  ["Why do sunspots look dark?", "They are cooler than the Sun around them 🔴", "They are made of coal", "They are holes to space", "Sunspots are still very hot, just cooler than the bright parts."],
  ["How long is the Sun's busy-and-sleepy cycle?", "About 11 years", "About 1 day", "About 100 years", "The Sun has more spots and flares, then fewer, then more again about every 11 years."],
  ["What protects Earth from most Sun-stuff?", "Earth's invisible magnet bubble 🧲", "Clouds ☁️", "Trees 🌳", "The magnetosphere pushes most Sun-stuff away. The Moon has no big one, so a base needs a shield!"],
  ["What makes the Northern Lights (aurora)?", "Sun-stuff meeting Earth's magnet bubble 🌌", "Street lamps", "Fireflies", "Charged bits slide down near the poles and make the sky glow."],
  ["Why do astronauts eat tortillas instead of bread?", "Crumbs would float into machines 🌯", "Tortillas are round", "Bread is too tasty", "Floating crumbs can get into eyes and equipment."],
  ["About how much food energy does an astronaut need each day?", "1,900 to 3,200 calories (kcal) 🍽️", "About 10 calories", "About 100,000 calories", "That is about what busy people need on Earth."],
  ["Spacewalks make astronauts extra hungry. How many EXTRA calories per hour?", "About 200 🏃", "About 0", "About 20,000", "Hard work outside burns about 200 extra kcal every hour. In the game, being outside uses food faster!"],
  ["Packed space food is almost half water. Why does that matter for rockets?", "Water is heavy, so the food costs more to launch ⚖️", "Water makes rockets sing", "It does not matter", "A 4-person crew needs about 10,500 kg of food for 3 years. Light food is a big help!"],
  ["Why is freeze-dried food good for space?", "It is light and lasts a long time 🍓", "It is very heavy", "It makes noise", "The water is taken out, so it weighs less and keeps for ages."],
  ["What does a space greenhouse give astronauts?", "Fresh food, vitamins and oxygen 🥬", "Moon rocks", "Rocket fuel", "Plants also clean the air, which helps close the life-support loop."],
  ["What does a greenhouse cost to run?", "Power for lights and pumps, plus water 💡", "Nothing at all", "A sunburn", "Growing plants takes lights and pumps, so greenhouse power is a trade-off in the game."],
  ["A storm is coming! What is the smart power plan?", "Shield first, and pause the extras 🛡️", "Turn everything on full", "Turn off the air", "Engineers send power to shielding and life support and switch off non-essential things for a while."]
];

const QZ_EASY = [
  ["Is the Sun hot or cold?", "Hot 🔥", "Cold 🧊", "The Sun is super, super hot!"],
  ["What do we call the Sun's sneeze?", "A solar flare 🤧", "A pizza 🍕", "A flare is a big flash of light from the Sun."],
  ["Does the Moon have air to breathe?", "No, it does not 🚫", "Yes, lots of air 🌬️", "The Moon has no air, so astronauts bring air with them."],
  ["Where do you hide when the Sun sneezes?", "In the base 🏠", "Outside in the dust 🌫️", "The base keeps astronauts safe."],
  ["What do astronauts carry to breathe on the Moon?", "An air tank 💨", "A teddy bear 🧸", "The tank gives them air to breathe."],
  ["Which one can grow in a space garden?", "Lettuce 🥬", "A car 🚗", "Astronauts really grew lettuce in space!"],
  ["Why do astronauts like tortillas?", "No crumbs float away 🌯", "They are square 🟦", "Floating crumbs can get into machines."],
  ["What are the pretty lights in the sky near the poles called?", "Aurora 🌌", "Street lamps 💡", "Sun-stuff meets Earth's invisible hug and the sky glows!"],
  ["What can astronauts drink from the Moon?", "Ice made of water 🧊", "A lake of juice 🧃", "There is frozen water hiding in dark Moon craters."],
  ["Which flare is the BIGGEST?", "X 🦖", "C 🐣", "C is little, M is medium and X is the biggest."],
  ["What keeps Earth safe like an invisible hug?", "A magnet bubble 🧲", "A fluffy blanket 🛏️", "Earth's magnet bubble pushes away most Sun-stuff."],
  ["The air is getting low! What do you do?", "Go back to the base 🏠", "Take a nap 😴", "The base fills your air tank back up."]
];

// Input Keyboard Mapping
const KM = {
  ArrowUp: "up", KeyW: "up",
  ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left",
  ArrowRight: "right", KeyD: "right",
  KeyE: "mine", KeyF: "eat", KeyR: "fix", KeyQ: "snack",
  ShiftLeft: "sprint", ShiftRight: "sprint"
};
