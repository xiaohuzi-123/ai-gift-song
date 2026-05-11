/**
 * AI Gift Song - Lyrics Generator
 * Generates personalized song lyrics based on user input with "Dai Zi Zhen" level quality
 * 
 * Voice Style Mapping: emotion + voiceType + songStyle → precise style description
 */

// Helper function for random selection
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Random modifier pools
const adjectives = ['beautiful', 'precious', 'wonderful', 'amazing', 'incredible', 'magical', 'special', 'extraordinary', 'radiant', 'enchanting'];
const timeWords = ['today', 'tonight', 'forever', 'always', 'right now', 'in this moment', 'every day', 'always and forever'];
const feelingWords = ['feel', 'know', 'see', 'sense', 'believe'];
const intensityWords = ['so much', 'truly', 'deeply', 'completely', 'utterly'];

// Emotion → vocal technique mapping
const emotionVocalMapping = {
  heartfelt: {
    male: {
      pop: "Soft intimate pop ballad, warm male vocal with subtle rasp, breathy phrasing in verses, gentle vibrato on held notes in chorus, close-mic intimate feel, emotional build from vulnerable to confident, 72 BPM, piano-driven with gentle strings",
      folk: "Tender acoustic folk, warm male vocal with natural resonance, storytelling delivery, fingerpicked guitar, emotional restraint in verses opening up in choruses, 70 BPM",
      rnb: "Soulful R&B ballad, smooth male vocal with warm head voice, melismatic phrases, piano and soft strings, intimate and heartfelt, 68 BPM",
      electronic: "Gentle synth ballad, warm male vocal with soft electronic processing, emotional synthesizers, 72 BPM",
      rock: "Emotional rock ballad, powerful male vocal with controlled grit, building intensity, acoustic guitar foundation with electric layers, 75 BPM",
      acoustic: "Intimate acoustic ballad, warm male vocal, fingerpicking guitar, breathy and vulnerable, emotional storytelling, 68 BPM"
    },
    female: {
      pop: "Tender pop ballad, sweet female vocal with breathy warmth, light vibrato, soft head voice transitions, intimate and whispery in verses, opens up in chorus with gentle power, 72 BPM",
      folk: "Delicate acoustic folk, sweet breathy female vocal, light vibrato, soft head voice transitions, intimate and whispery, fingerpicked guitar, 68 BPM",
      rnb: "Smooth R&B, soulful female vocal with smooth melismas, warm tone, emotional depth, soft keys arrangement, 70 BPM",
      electronic: "Ethereal synth-pop, breathy female vocal with subtle autotune, dreamy synths, intimate production, 72 BPM",
      rock: "Passionate rock, powerful female vocal with soaring range, emotional belt in chorus, driving rhythm section, 78 BPM",
      acoustic: "Pure acoustic, gentle female vocal, intimate and healing, sparse fingerpicked guitar, emotionally vulnerable, 65 BPM"
    },
    duet: {
      pop: "Pop duet ballad, warm male baritone and sweet female mezzo-soprano, call and response structure, intimate verses building to harmonized chorus, close-mic production, 75 BPM",
      folk: "Acoustic folk duet, gentle male voice and soft female voice, intertwined harmonies, storytelling with emotional depth, fingerpicked guitar, 70 BPM",
      rnb: "R&B duet, soulful male vocal and smooth female vocal, back-and-forth verses leading to powerful harmonized chorus, 72 BPM",
      electronic: "Electronic pop duet, warm male and ethereal female vocals, layered synths, emotional build, 74 BPM",
      rock: "Rock duet, powerful male and female vocals, alternating verses building to intense harmonized chorus, 80 BPM",
      acoustic: "Intimate acoustic duet, soft male and female vocals, simple fingerpicking, tender harmonies, 68 BPM"
    }
  },
  funny: {
    male: {
      pop: "Quirky upbeat pop, playful male vocal with comedic timing, bouncy rhythm, tongue-in-cheek delivery, bright synth and drums, 110 BPM",
      folk: "Humorous folk, witty male vocal with exaggerated storytelling, comedic pauses, acoustic guitar strumming, 105 BPM",
      rnb: "Playful R&B, smooth male vocal with humorous lyric delivery, funcky groove, 108 BPM",
      electronic: "Comedic electronic, silly male vocal processing, quirky synth sounds, fun and energetic, 115 BPM",
      rock: "Fun rock anthem, energetic male vocal with exaggerated expression, driving drums, humorous lyrics, 120 BPM",
      acoustic: "Comedic acoustic, funny male vocal with exaggerated storytelling, playful guitar, 100 BPM"
    },
    female: {
      pop: "Playful pop, cheeky female vocal with bright tone, comedic timing, bouncy melody, fun synth production, 110 BPM",
      folk: "Humorous folk, witty female vocal with storytelling flair, comedic acoustic arrangement, 105 BPM",
      rnb: "Fun R&B, sassy female vocal with playful delivery, smooth groove, humorous lyrics, 108 BPM",
      electronic: "Fun electronic, bubbly female vocal, quirky sound effects, danceable beat, 115 BPM",
      rock: "Energetic rock, powerful female vocal with playful expression, driving rhythm, fun anthem, 118 BPM",
      acoustic: "Playful acoustic, charming female vocal, light guitar, humorous storytelling, 100 BPM"
    },
    duet: {
      pop: "Comedic pop duet, playful male and witty female vocals, call and response jokes, bouncy production, 112 BPM",
      folk: "Funny folk duet, humorous male and female exchanges, comedic storytelling, acoustic arrangement, 105 BPM",
      rnb: "Playful R&B duet, smooth male and sassy female vocals, funny lyrics with groove, 110 BPM",
      electronic: "Fun electronic duet, processed male and female vocals, comedic electronic effects, 115 BPM",
      rock: "Fun rock duet, energetic male and female vocals, alternating humorous verses, 120 BPM",
      acoustic: "Humorous acoustic duet, funny male and female exchanges, playful guitar, 102 BPM"
    }
  },
  celebration: {
    male: {
      pop: "Uplifting anthemic pop, powerful male vocal with soaring chorus, celebratory energy, full band arrangement, crowd-pleasing melody, 128 BPM",
      folk: "Joyful folk anthem, strong male vocal, acoustic instruments with full arrangement, uplifting message, 125 BPM",
      rnb: "Groovy celebration R&B, smooth male vocal with gospel influences, choir-like harmonies, 126 BPM",
      electronic: "Festival EDM, energetic male vocal with build-ups, drop beats, euphoric atmosphere, 130 BPM",
      rock: "Triumphant rock anthem, powerful male vocal with gritty edge, driving drums, anthem feel, 135 BPM",
      acoustic: "Heartwarming acoustic celebration, strong male vocal, fingerpicking with strings, joyful atmosphere, 120 BPM"
    },
    female: {
      pop: "Joyful anthemic pop, powerful female vocal with soaring chorus, uplifting chords, celebratory energy, full band arrangement, 128 BPM",
      folk: "Uplifting folk, bright female vocal with harmonic richness, acoustic celebration, clap-along feel, 125 BPM",
      rnb: "Celebratory R&B, soulful female vocal with gospel influences, uplifting message, rich arrangement, 126 BPM",
      electronic: "Euphoric electronic pop, soaring female vocal, big drops, festival-ready, 130 BPM",
      rock: "Triumphant rock, powerful female vocal with incredible range, driving drums, 138 BPM",
      acoustic: "Joyful acoustic celebration, warm female vocal, fingerpicked guitar with strings, uplifting, 120 BPM"
    },
    duet: {
      pop: "Celebratory pop duet, strong male and female vocals, harmonized chorus, full arrangement, 128 BPM",
      folk: "Festive folk duet, harmonious male and female vocals, acoustic instruments, joyful atmosphere, 125 BPM",
      rnb: "Gospel-style R&B duet, soulful male and female vocals, choir feel, celebration, 126 BPM",
      electronic: "Festival electronic duet, powerful male and female vocals, euphoric drops, 132 BPM",
      rock: "Rock anthem duet, powerful male and female vocals, driving drums, triumphant feel, 135 BPM",
      acoustic: "Heartwarming acoustic duet, harmonious male and female vocals, uplifting message, 122 BPM"
    }
  },
  healing: {
    male: {
      pop: "Soothing pop ballad, gentle male vocal with warm tone, calming melody, peaceful production, 68 BPM",
      folk: "Healing acoustic folk, tender male vocal, gentle fingerpicked guitar, therapeutic atmosphere, 65 BPM",
      rnb: "Calming R&B, smooth male vocal with peaceful delivery, soft keys, 66 BPM",
      electronic: "Ambient electronic, ethereal male vocal, calming synths, peaceful atmosphere, 64 BPM",
      rock: "Gentle acoustic rock, soft male vocal, acoustic guitar with soft drums, calming, 68 BPM",
      acoustic: "Intimate acoustic, warm male vocal, gentle guitar, healing and comforting, 65 BPM"
    },
    female: {
      pop: "Soothing pop, whispery female vocal, gentle and healing, soft production, calming melody, 68 BPM",
      folk: "Gentle acoustic folk, soft breathy female vocal, fingerpicked guitar, therapeutic and calming, 65 BPM",
      rnb: "Smooth healing R&B, warm female vocal with smooth tone, soft keys arrangement, 66 BPM",
      electronic: "Ambient electronic, ethereal female vocal, calming synths, peaceful atmosphere, 64 BPM",
      rock: "Soft acoustic rock, gentle female vocal, acoustic guitar, calming production, 68 BPM",
      acoustic: "Pure acoustic healing, whispery female vocal, gentle guitar, deeply comforting, 65 BPM"
    },
    duet: {
      pop: "Healing pop duet, gentle male and soothing female vocals, comforting harmonies, peaceful production, 68 BPM",
      folk: "Therapeutic folk duet, soft male and female vocals, intertwined gently, calming guitar, 66 BPM",
      rnb: "Calming R&B duet, smooth male and warm female vocals, peaceful arrangement, 66 BPM",
      electronic: "Ambient electronic duet, ethereal vocals, calming synths, 65 BPM",
      rock: "Gentle rock duet, soft male and female vocals, acoustic foundation, calming, 68 BPM",
      acoustic: "Pure acoustic healing duet, whispery male and female vocals, intimate and comforting, 65 BPM"
    }
  },
  hype: {
    male: {
      pop: "High-energy pop anthem, powerful male vocal with intensity, driving beat, club-ready, 140 BPM",
      folk: "Energetic folk-rock, powerful male vocal, driving acoustic guitars with electric energy, 135 BPM",
      rnb: "High-octane R&B, intense male vocal with ad-libs, pounding bass, 138 BPM",
      electronic: "Festival banger, gritty male vocal, massive drops, crowd-energy, 145 BPM",
      rock: "Explosive rock, gritty powerful male vocal, driving drums and distorted guitar, explosive chorus, raw energy, 140 BPM",
      acoustic: "Intense acoustic anthem, powerful male vocal with acoustic drive, building energy, 130 BPM"
    },
    female: {
      pop: "High-energy pop anthem, powerful female vocal with belt, driving beat, energetic production, 140 BPM",
      folk: "Energetic folk-rock, powerful female vocal, acoustic guitars with full band energy, 135 BPM",
      rnb: "Powerful R&B, intense female vocal with runs and ad-libs, heavy bass, 138 BPM",
      electronic: "Festival electronic, soaring female vocal, massive drops, 145 BPM",
      rock: "Explosive rock, powerful gritty female vocal, driving drums, raw power, 142 BPM",
      acoustic: "Intense acoustic energy, powerful female vocal, driving fingerpicking, 130 BPM"
    },
    duet: {
      pop: "High-energy pop anthem, powerful male and female vocals, alternating intense verses, harmonized chorus, 142 BPM",
      folk: "Energetic folk-rock duet, powerful male and female vocals, driving guitars, 138 BPM",
      rnb: "High-octane R&B duet, intense male and female vocals, heavy groove, 140 BPM",
      electronic: "Festival banger duet, powerful vocals, massive drops, 145 BPM",
      rock: "Explosive rock duet, gritty male and powerful female vocals, driving drums, 142 BPM",
      acoustic: "Intense acoustic anthem duet, powerful vocals, driving guitar, 132 BPM"
    }
  }
};

// Voice type display info
const voiceInfo = {
  male: { name: "Male", subtitle: "Warm & soulful", emoji: "🎤" },
  female: { name: "Female", subtitle: "Sweet & expressive", emoji: "🎧" },
  duet: { name: "Duet", subtitle: "Together in harmony", emoji: "🎵" }
};

// Song style options
const songStyles = [
  { id: "pop", name: "Pop", emoji: "🎹", desc: "Catchy & modern" },
  { id: "folk", name: "Folk", emoji: "🪕", desc: "Storytelling & acoustic" },
  { id: "rnb", name: "R&B", emoji: "🎷", desc: "Smooth & soulful" },
  { id: "electronic", name: "Electronic", emoji: "🎛️", desc: "Electronic & futuristic" },
  { id: "rock", name: "Rock", emoji: "🎸", desc: "Powerful & energetic" },
  { id: "acoustic", name: "Acoustic", emoji: "🎻", desc: "Intimate & pure" }
];

/**
 * Extract user details from lyrics with [secret:...] tags
 */
function extractSecrets(lyrics) {
  const secrets = [];
  const secretRegex = /\[secret:([^\]]+)\]/g;
  let match;
  
  while ((match = secretRegex.exec(lyrics)) !== null) {
    secrets.push({
      text: match[1].trim(),
      label: getSecretLabel(match[1].trim())
    });
  }
  
  return secrets;
}

/**
 * Get label for secret based on content
 */
function getSecretLabel(text) {
  const lower = text.toLowerCase();
  if (lower.includes('memory') || lower.includes('remember') || lower.includes('time we')) {
    return 'Our Special Memory';
  }
  if (lower.includes('nickname') || lower.includes('call')) {
    return 'Our Nickname';
  }
  if (lower.includes('joke') || lower.includes('laugh') || lower.includes('funny')) {
    return 'Inside Joke';
  }
  if (lower.includes('promise') || lower.includes('swear') || lower.includes('always')) {
    return 'Our Promise';
  }
  return 'Special Detail';
}

/**
 * Generate song lyrics based on user data
 */
function generateLyrics({ emotion, recipientName, nickname, sharedMemory, insideJoke, personalMessage, voiceType }) {
  const isDuet = voiceType === 'duet';
  const recipient = nickname || recipientName;
  const adj = pickRandom(adjectives);
  const timeWord = pickRandom(timeWords);
  const feelingWord = pickRandom(feelingWords);
  const intensityWord = pickRandom(intensityWords);
  
  // Generate structure based on emotion
  let lyrics = '';
  
  // Intro with atmosphere
  lyrics += `[Intro]\n`;
  lyrics += `♪ ${pickRandom(['Ethereal', 'Gentle', 'Dreamy', 'Soft', 'Warm', 'Melancholic', 'Uplifting', 'Joyful'])} intro setting the ${pickRandom(['mood', 'atmosphere', 'feeling', 'tone'])} ♪\n\n`;
  
  // Verse 1 - Setting the scene with shared memory
  lyrics += `[Verse 1${isDuet ? ' - Male' : ''}]\n`;
  lyrics += generateVerseWithMemory(sharedMemory, nickname, isDuet ? 'male' : voiceType, adj, timeWord);
  lyrics += `\n`;
  
  if (isDuet) {
    lyrics += `[Verse 1 - Female]\n`;
    lyrics += generateFemaleVerse(sharedMemory, nickname, feelingWord);
    lyrics += `\n`;
  }
  
  // Pre-Chorus - Building emotion
  lyrics += `[Pre-Chorus${isDuet ? ' - Male' : ''}]\n`;
  lyrics += generatePreChorus(emotion, recipient, personalMessage, feelingWord, intensityWord);
  lyrics += `\n`;
  
  if (isDuet) {
    lyrics += `[Pre-Chorus - Female]\n`;
    lyrics += generateFemalePreChorus(emotion, recipient, feelingWord);
    lyrics += `\n`;
  }
  
  // Chorus - Main emotional message (appears twice)
  lyrics += `[Chorus]\n`;
  lyrics += generateChorus(emotion, recipient, nickname, personalMessage, isDuet, adj, timeWord);
  lyrics += `\n\n`;
  
  // Verse 2 - Inside joke and personal details
  lyrics += `[Verse 2${isDuet ? ' - Male' : ''}]\n`;
  lyrics += generateVerseWithJoke(insideJoke, nickname, sharedMemory, isDuet ? 'male' : voiceType, feelingWord);
  lyrics += `\n`;
  
  if (isDuet) {
    lyrics += `[Verse 2 - Female]\n`;
    lyrics += generateFemaleVerseWithJoke(insideJoke, nickname, feelingWord);
    lyrics += `\n`;
  }
  
  // Repeat Chorus
  lyrics += `[Chorus]\n`;
  lyrics += generateChorus(emotion, recipient, nickname, personalMessage, isDuet, adj, timeWord);
  lyrics += `\n\n`;
  
  // Bridge - Deep personal message
  lyrics += `[Bridge]\n`;
  lyrics += generateBridge(emotion, recipient, personalMessage, nickname, isDuet, feelingWord, intensityWord);
  lyrics += `\n\n`;
  
  // Final Chorus - Most powerful
  lyrics += `[Final Chorus]\n`;
  lyrics += generateFinalChorus(emotion, recipient, nickname, personalMessage, isDuet, adj, timeWord);
  lyrics += `\n\n`;
  
  // Outro
  lyrics += `[Outro]\n`;
  lyrics += generateOutro(emotion, recipient, nickname, adj, timeWord);
  
  return lyrics;
}

/**
 * Generate verse incorporating the shared memory
 */
function generateVerseWithMemory(memory, nickname, voiceType, adj, timeWord) {
  const lines = [];
  
  // Default verse variants with randomization
  const defaultVerseVariants = [
    [
      `Every ${pickRandom(['moment', 'second', 'breath', 'heartbeat'])} with you`,
      `Is like ${pickRandom(['magic', 'a dream', 'heaven', 'paradise', 'a wonder'])} I fell into`,
      `The way you ${pickRandom(['light up', 'touch', 'change', 'transform'])} my world`,
      `${pickRandom(['Takes my breath away', 'Makes everything right', 'Fills my heart with joy', 'Gives me butterflies'])}`
    ],
    [
      `${pickRandom(['In your presence', 'When I\'m with you', 'With you by my side', 'Next to you'])}`,
      `I ${pickRandom(['feel alive', 'find peace', 'feel complete', 'belong somewhere'])}`,
      `You're ${pickRandom(['my anchor', 'my compass', 'my north star', 'my shelter', 'my home'])}`,
      `${nickname ? nickname + ' ' : ''}${pickRandom(['in this crazy world', 'through every storm', 'through thick and thin', 'through it all'])}`
    ],
    [
      `${pickRandom(['Time stands still', 'The world goes quiet', 'Everything fades away', 'Colors seem brighter'])}`,
      `When ${nickname ? nickname + ' ' : 'you '}look at me ${pickRandom(['with those eyes', 'and smile', 'that way', ''])}`,
      `${pickRandom(['I get lost', 'I forget my troubles', 'I feel understood', 'I find myself'])}`,
      `${pickRandom(['In this beautiful moment', 'In this perfect instant', 'Right here, right now', 'In this space between us'])}`
    ],
    [
      `${pickRandom(['From the first time', 'The moment', 'That day when', 'When'])} I ${pickRandom(['saw you', 'met you', 'found you', 'knew you'])}`,
      `${pickRandom(['My heart knew', 'I realized', 'It was clear', 'I understood'])} you were the one`,
      `${nickname ? nickname + ' ' : ''}you ${pickRandom(['changed everything', 'made it better', 'brought the light', 'gave me hope'])}`,
      `${pickRandom(['And I\'ve never looked back', 'Since then, I\'ve been yours', 'Now we\'re here together', 'Forever I\'ll be grateful'])}`
    ]
  ];
  
  if (memory) {
    // Extract key elements from memory
    const memoryLower = memory.toLowerCase();
    
    if (memoryLower.includes('rain') || memoryLower.includes('raining')) {
      lines.push(pickRandom([`Remember when the rain fell down`, `The rain was falling gently`]));
      lines.push(pickRandom([`And ${nickname ? nickname + ' ' : 'you '}held me tight`, `${nickname ? nickname + ' ' : 'You '}pulled me close that night`]));
      lines.push(pickRandom([`The world outside was grey`, `Inside, we were warm and dry`]));
      lines.push(pickRandom([`But inside, everything felt right`, `With you, it always felt like home`]));
    } else if (memoryLower.includes('laugh') || memoryLower.includes('laughing') || memoryLower.includes('funny')) {
      lines.push(pickRandom([`We couldn't stop laughing that day`, `That laugh, I still remember it well`]));
      lines.push(pickRandom([`${nickname ? nickname + ' ' : 'You '}made me forget all my worries`, `${nickname ? nickname + ' ' : 'You '}chased my blues away`]));
      lines.push(pickRandom([`The way you laugh, the way you smile`, `Your joy is contagious`]));
      lines.push(pickRandom([`Those moments still ${pickRandom(['make me feel sunny', 'warm my heart', 'bring me joy', 'light up my day'])}`]));
    } else if (memoryLower.includes('night') || memoryLower.includes('star') || memoryLower.includes('sky')) {
      lines.push(pickRandom([`Under a million stars we sat`, `The night sky was our witness`]));
      lines.push(pickRandom([`Talking until the world went quiet`, `Sharing dreams beneath the moonlight`]));
      lines.push(pickRandom([`${nickname ? nickname + ', ' : ''}you showed me beauty`, `${nickname ? nickname + ' ' : 'You '}opened my eyes`]));
      lines.push(pickRandom([`In the darkness of the night`, `In that starlit moment`]));
    } else if (memoryLower.includes('first') || memoryLower.includes('met') || memoryLower.includes('meet')) {
      lines.push(pickRandom([`The first time I saw you, I knew`, `When we first met`]));
      lines.push(pickRandom([`This was something rare and true`, `Something ${pickRandom(['special', 'extraordinary', 'meant to be'])}`]));
      lines.push(pickRandom([`${nickname ? nickname + ' ' : ''}you changed my world`, `${nickname ? nickname + ' ' : 'You '}walked into my life`]));
      lines.push(pickRandom([`From that moment, my heart grew`, `And I knew it was fate`]));
    } else {
      // Generic but personal with memory
      lines.push(pickRandom([`I still remember ${memory.substring(0, 50)}`, `That moment stays with me`]));
      lines.push(`[secret:${memory.substring(0, 80)}]`);
      lines.push(pickRandom([`The way you looked at me that day`, `How you made me feel that night`]));
      lines.push(pickRandom([`${nickname ? nickname + ', ' : ''}I'll never forget`, `${nickname ? nickname + ', ' : ''}that memory's ${adj}`]));
    }
  } else {
    // Randomly pick a default verse variant
    lines.push(...pickRandom(defaultVerseVariants));
  }
  
  return lines.join('\n');
}

/**
 * Generate female verse for duet
 */
function generateFemaleVerse(memory, nickname, feelingWord) {
  const lines = [];
  
  const femaleVerseVariants = [
    [
      `And I remember it too`,
      `The way ${nickname ? nickname + ' ' : 'you '}made me ${pickRandom(['feel', 'believe', 'dream', 'hope'])}`,
      `Like the whole world disappeared`,
      `And it was just us, ${pickRandom(['that\'s real', 'together', 'alone', 'in harmony'])}`
    ],
    [
      `Every laugh we shared together`,
      `Every moment by your side`,
      `Is a story I hold close`,
      `A ${pickRandom(['beautiful', 'precious', 'treasured', 'beloved'])} place to reside`
    ],
    [
      `${pickRandom(['In your arms', 'With you near', 'When we\'re together', 'Beside you'])}`,
      `I ${pickRandom(['feel whole', 'find home', 'feel safe', 'belong'])}`,
      `${nickname ? nickname + ', ' : ''}you ${pickRandom(['understand me', 'know me best', 'see the real me', 'accept me fully'])}`,
      `${pickRandom(['That\'s why I\'m here', 'That\'s why I stay', 'That\'s why I love', 'That\'s what I cherish'])}`
    ],
    [
      `The way you ${pickRandom(['care for me', 'love me', 'hold me', 'look at me'])}`,
      `${pickRandom(['Melts my heart', 'Lights up my world', 'Fills me with joy', 'Gives me strength'])}`,
      `${nickname ? nickname + ', ' : ''}you're ${pickRandom(['my everything', 'my one and only', 'my forever', 'my dream come true'])}`,
      `${pickRandom(['I love you more', 'I\'m yours completely', 'You have my heart', 'You\'re mine alone'])}`
    ]
  ];
  
  if (memory) {
    lines.push(pickRandom([`And I remember it too`, `I recall it vividly`, `That memory lives in me`]));
    lines.push(pickRandom([`The way ${nickname ? nickname + ' ' : 'you '}made me feel`, `${nickname ? nickname + ' ' : 'You '}touched my soul`]));
    lines.push(pickRandom([`Like the whole world disappeared`, `Everything else faded away`]));
    lines.push(pickRandom([`And it was just us, that's real`, `And it was pure magic`]));
  } else {
    lines.push(...pickRandom(femaleVerseVariants));
  }
  
  return lines.join('\n');
}

/**
 * Generate verse with inside joke
 */
function generateVerseWithJoke(joke, nickname, memory, voiceType, feelingWord) {
  const lines = [];
  
  const verseJokeVariants = [
    [
      `And then there's that thing we say`,
      `The joke that's just ours alone`,
      `[secret:${joke || pickRandom(['That running joke', 'Our silly sign', 'The thing only we get', 'Our inside笑話'])}]`,
      `${pickRandom(['Makes me smile every time', 'Never fails to crack me up', 'Is our special connection', 'Is our little secret'])}`
    ],
    [
      `${nickname ? nickname + ', ' : ''}you're my ${pickRandom(['favorite person', 'best friend', 'partner in crime', 'soulmate'])}`,
      `The one who ${pickRandom(['knows me best', 'gets me', 'sees the real me', 'loves me anyway'])}`,
      `[secret:${nickname || pickRandom(['my sunshine', 'my love', 'my everything', 'my heart'])}]`,
      `${pickRandom(['The reason I smile', 'What I live for', 'My constant joy', 'My greatest gift'])}`
    ],
    [
      `${pickRandom(['Through every high', 'In good times')}/${pickRandom(['every low', 'and bad'])}`,
      `${nickname ? nickname + ' ' : 'You\'ve '}${pickRandom(['been my rock', 'stood by me', 'been my shelter', 'given me strength'])}`,
      `${pickRandom(['The memories we've made', 'The moments we've shared'])}`,
      `${pickRandom(['Show me who we are', 'Prove what we have', 'Strengthen our bond', 'Define our love'])}`
    ]
  ];
  
  if (joke) {
    lines.push(pickRandom([`And then there's that thing we say`, `Remember that joke we share?`, `The one that always makes us laugh?`]));
    lines.push(pickRandom([`The joke that's just ours alone`, `Our secret code that nobody else gets`]));
    lines.push(`[secret:${joke}]`);
    lines.push(pickRandom([`Makes me smile every time I recall`, `Never fails to brighten my day`, `Our little moment of joy`]));
  }
  
  if (nickname) {
    lines.push(pickRandom([`${nickname}, you're my favorite person`, `${nickname}, you mean everything to me`, `${nickname}, you're my sunshine`]));
    lines.push(pickRandom([`The one who knows me best`, `Who sees right through me`, `Who loves me anyway`, `Who makes life worth living`]));
    lines.push(`[secret:${nickname}]`);
  }
  
  if (lines.length === 0 || lines.length <= 2) {
    lines.push(...pickRandom(verseJokeVariants));
  }
  
  return lines.join('\n');
}

/**
 * Generate female verse with joke for duet
 */
function generateFemaleVerseWithJoke(joke, nickname, feelingWord) {
  const lines = [];
  
  const femaleJokeVariants = [
    [
      `And when I hear that joke`,
      `I know exactly what you mean`,
      `It's our secret language`,
      `The most ${pickRandom(['beautiful', 'precious', 'endearing', 'perfect'])} I've seen`
    ],
    [
      `${nickname ? nickname + ', ' : ''}you ${pickRandom(['understand me', 'get me', 'accept me', 'complete me'])}`,
      `${pickRandom(['Better than anyone else', 'Like no one else can', 'In a way that matters', 'In our special way'])}`,
      `${pickRandom(['We\'re a perfect match', 'Made for each other', 'Two halves of a whole', 'Together forever'])}`,
      `${pickRandom(['And I love you for it', 'That\'s why I\'m yours', 'That\'s why I stay', 'That\'s why we work'])}`
    ]
  ];
  
  if (joke) {
    lines.push(pickRandom([`And when I hear that joke`, `When that memory surfaces`, `When our private笑話 comes up`]));
    lines.push(pickRandom([`I know exactly what you mean`, `It takes me right back`, `It makes me laugh`, `It brings back the joy`]));
    lines.push(pickRandom([`It's our secret language`, `Our private code`, `Our special bond`, `Our little world`]));
    lines.push(pickRandom([`The most beautiful I've seen`, `That never gets old`, `That always delights`, `That I cherish most`]));
  }
  
  if (nickname) {
    lines.push(pickRandom([`${nickname}, you understand me`, `${nickname}, you know me best`, `${nickname}, you see me truly`]));
    lines.push(pickRandom([`Better than anyone else`, `Like nobody else does`, `In ways that matter`, `Deeply and truly`]));
  }
  
  if (lines.length === 0) {
    lines.push(...pickRandom(femaleJokeVariants));
  }
  
  return lines.join('\n');
}

/**
 * Generate pre-chorus building emotion
 */
function generatePreChorus(emotion, recipient, message, feelingWord, intensityWord) {
  const lines = [];
  
  const templates = {
    heartfelt: [
      [
        `When I ${feelingWord} of everything`,
        `Every ${pickRandom(['moment', 'memory', 'touch', 'smile'])}`,
        `I know there's something ${adj}`,
        `Between us, all this while`
      ],
      [
        `My heart ${feelingWord}s when I see you`,
        `${pickRandom(['Every time', 'More and more', 'More than ever', 'All the time'])} I ${feelingWord}`,
        `${pickRandom(['How lucky I am', 'What a gift you are', 'What we have is rare', 'This love is real'])}`,
        `${pickRandom(['And it's only growing', 'Growing stronger', 'Getting deeper', 'Getting better'])}`
      ],
      [
        `${pickRandom(['Can you feel it', 'Do you know it', 'Can you see it', 'Do you sense it'])}?`,
        `${pickRandom(['The way my heart beats', 'How much I care', 'What you mean to me', 'How far I'd go'])}`,
        `${pickRandom(['It's written all over', 'It's clear as day', 'It's in everything', 'It's undeniable'])}`,
        `${pickRandom(['This love we share', 'What we have together', 'Our connection', 'Our bond'])}`
      ],
      [
        `And as the music plays`,
        `${pickRandom(['I want you to know', 'I need you to know', 'I want you to feel', 'I need you to feel'])}`,
        `${pickRandom(['How much you mean to me', 'What you've done for me', 'Why I'm here', 'Where I'm headed'])}`,
        `${pickRandom(['Everything', 'The world', 'My heart', 'My soul'])}`
      ]
    ],
    funny: [
      [
        `You make me laugh so hard`,
        `${pickRandom(['Every single damn day', 'At the best times', 'No matter what', 'Always and forever'])}`,
        `But underneath the jokes`,
        `There's so much I want to say`
      ],
      [
        `${pickRandom(['Sure, we joke around', 'Okay, we\'re silly', 'Yeah, we\'re goofy', 'Alright, we\'re crazy'])}`,
        `${pickRandom(['But there\'s something real', 'But this is genuine', 'But it\'s more than fun', 'But it runs deep'])}`,
        `${pickRandom(['Underneath it all', 'Beneath the surface', 'Beyond the laughter', 'At the core of it'])}`,
        `${pickRandom(['I really do love you', 'This is the real deal', 'You\'re truly amazing', 'You\'re my favorite person'])}`
      ],
      [
        `Alright, getting real for a sec`,
        `${nickname ? nickname + ', ' : ''}you ${pickRandom(['crack me up', 'make me smile', 'brighten my day', 'never bore me'])}`,
        `${pickRandom(['But more than that', 'And honestly', 'In all seriousness', 'But truthfully'])}`,
        `${pickRandom(['You\'re also the best', 'You also mean everything', 'You also make life worth living', 'You also are my person'])}`
      ],
      [
        `${pickRandom(['I know we joke a lot', 'We\'re always laughing', 'We\'re quite the pair', 'We\'re absolute chaos'])}`,
        `${pickRandom(['But here\'s the thing', 'But what\'s the truth', 'But let me be real', 'But between us'])}`,
        `${pickRandom(['You\'re also the best', 'You also mean everything', 'You also make life worth living', 'You also are my person'])}`,
        `${pickRandom(['In all seriousness', 'No jokes here', 'Genuinely', 'Truly'])}`
      ]
    ],
    celebration: [
      [
        `We're on top of the world`,
        `${pickRandom(['Nothing can bring us down', 'We\'re untouchable', 'We\'re unstoppable', 'We\'re on cloud nine'])}`,
        `${pickRandom(['Let's celebrate together', 'Tonight we shine', 'This is our moment', 'We deserve this'])}`,
        `${pickRandom(['Dance across this town', 'Raise our voices high', 'Let the music play', 'Feel the joy overflow'])}`
      ],
      [
        `${pickRandom(['It\'s a beautiful day', 'What a perfect moment', 'This feeling is amazing', 'Can you believe this?'])}`,
        `${pickRandom(['Everything\'s coming together', 'We\'re finally here', 'This is what we worked for', 'Look how far we\'ve come'])}`,
        `${pickRandom(['Let\'s make some noise', 'Let\'s celebrate life', 'Let\'s dance our hearts out', 'Let\'s enjoy this'])}`,
        `${pickRandom(['Because we earned it', 'Because we deserve it', 'Because we\'re together', 'Because this is ours'])}`
      ],
      [
        `${pickRandom(['Raise your glass', 'Breathe it in', 'Feel this moment', 'Take it all in'])}`,
        `${pickRandom(['We did it', 'We made it', 'We\'re here', 'It\'s happening'])}`,
        `${pickRandom(['And it feels incredible', 'And it\'s beautiful', 'And we\'re unstoppable', 'And we\'re just getting started'])}`,
        `${pickRandom(['So let\'s keep going', 'So let\'s celebrate', 'So let\'s make more memories', 'So let\'s make it count'])}`
      ],
      [
        `${pickRandom(['This is our moment', 'We\'re shining bright', 'We\'re on fire', 'We\'re unstoppable'])}`,
        `${pickRandom(['Nothing can stop us now', 'We\'ve got this', 'We\'re unstoppable', 'We\'re blessed'])}`,
        `${pickRandom(['So let\'s raise the roof', 'So let\'s go all out', 'So let\'s not hold back', 'So let\'s make it epic'])}`,
        `${pickRandom(['Tonight we\'re royalty', 'We\'re living the dream', 'We\'re on top of the world', 'We\'re unstoppable'])}`
      ]
    ],
    healing: [
      [
        `When everything feels heavy`,
        `${nickname ? nickname + ' ' : 'You '}${pickRandom(['make the weight disappear', 'ease the burden', 'lighten the load', 'bring me peace'])}`,
        `Your presence is a comfort`,
        `That ${pickRandom(['quiets all my fear', 'calms my soul', 'heals my heart', 'brings me peace'])}`
      ],
      [
        `${pickRandom(['Take a deep breath', 'Close your eyes', 'Let it go', 'Rest easy'])}`,
        `${pickRandom(['With me here', 'By your side', 'In my arms', 'Together'])}`,
        `${pickRandom(['Nothing can hurt you', 'You\'re safe with me', 'I\'ve got you', 'We\'ll get through this'])}`,
        `${pickRandom(['I\'ll protect you', 'I\'ll hold you close', 'I\'ll be your shelter', 'I\'ll catch you'])}`
      ],
      [
        `${pickRandom(['If you\'re tired', 'If you\'re hurting', 'If you\'re struggling', 'If you need rest'])}`,
        `${pickRandom(['Come here to me', 'Let me hold you', 'Lean on me', 'Rest in my arms'])}`,
        `${pickRandom(['I\'ll be your strength', 'I\'ll be your comfort', 'I\'ll be your peace', 'I\'ll be your home'])}`,
        `${pickRandom(['Until you\'re ready', 'When you\'re healed', 'Through it all', 'Always'])}`
      ],
      [
        `${pickRandom(['The world can be harsh', 'Life isn\'t always fair', 'Sometimes it\'s tough', 'But we have each other'])}`,
        `${pickRandom(['But with you', 'But together', 'But hand in hand', 'But you\'re not alone'])}`,
        `${pickRandom(['Even storms feel calm', 'Even pain feels managed', 'Even darkness feels lit', 'Even sorrow feels bearable'])}`,
        `${pickRandom(['Because of you', 'Because of us', 'Because of this love', 'Because of your presence'])}`
      ]
    ],
    hype: [
      [
        `You push me to be better`,
        `${pickRandom(['Challenge me every day', 'Motivate me', 'Inspire me', 'Drive me forward'])}`,
        `With you I know I can`,
        `${pickRandom(['Find a way', 'Achieve anything', 'Break every record', 'Reach new heights'])}`
      ],
      [
        `${pickRandom(['We\'re on fire', 'We\'re unstoppable', 'We\'re a force', 'We\'re unstoppable'])}`,
        `${pickRandom(['Nothing can bring us down', 'We\'re unbreakable', 'We\'re unstoppable', 'We\'re unstoppable'])}`,
        `${pickRandom(['Let\'s go higher', 'Let\'s break through', 'Let\'s keep going', 'Let\'s make history'])}`,
        `${pickRandom(['There\'s no limit', 'We\'re unstoppable', 'We can do anything', 'We\'re unstoppable'])}`
      ],
      [
        `${pickRandom(['Feel this energy', 'Can you feel it?', 'Are you ready?', 'Let\'s do this'])}`,
        `${pickRandom(['We\'re unstoppable', 'We\'re on a roll', 'We can\'t lose', 'We\'re unstoppable'])}`,
        `${pickRandom(['There\'s nothing we can\'t do', 'The world is ours', 'We\'re making waves', 'We\'re unstoppable'])}`,
        `${pickRandom(['So let\'s keep pushing', 'So let\'s keep going', 'So let\'s keep rising', 'So let\'s keep winning'])}`
      ],
      [
        `${nickname ? nickname + ' ' : ''}${pickRandom(['You\'re incredible', 'You\'re unstoppable', 'You\'re a beast', 'You\'re amazing'])}`,
        `${pickRandom(['And I\'m right there with you', 'And we\'re unstoppable', 'And we\'re on fire', 'And we\'re unstoppable'])}`,
        `${pickRandom(['Together there\'s no stopping us', 'Together we\'re unstoppable', 'Together we\'re unstoppable', 'Together we\'re unstoppable'])}`,
        `${pickRandom(['Let\'s make it happen', 'Let\'s make it count', 'Let\'s make history', 'Let\'s make it epic'])}`
      ]
    ]
  };
  
  const emotionTemplates = templates[emotion] || templates.heartfelt;
  lines.push(...pickRandom(emotionTemplates));
  
  return lines.join('\n');
}

/**
 * Generate female pre-chorus for duet
 */
function generateFemalePreChorus(emotion, recipient, feelingWord) {
  const lines = [];
  
  const femalePreChorusVariants = [
    [
      `And I ${feelingWord} it too`,
      `${pickRandom(['This connection', 'What we share', 'This bond', 'Our love'])}`,
      `${pickRandom(['Is something so rare', 'Is undeniable', 'Is undeniable', 'Is undeniable'])}`,
      `${pickRandom(['Something beyond compare', 'Something special', 'Something precious', 'Something ours'])}`
    ],
    [
      `${pickRandom(['Your heart calls to mine', 'My heart finds yours', 'We\'re perfectly aligned', 'We\'re meant to be'])}`,
      `${pickRandom(['This love we share', 'What we\'ve built', 'Our connection', 'Our bond'])}`,
      `${pickRandom(['Is unlike anything', 'Is one of a kind', 'Is truly special', 'Is irreplaceable'])}`,
      `${pickRandom(['And I\'m grateful', 'And I\'m yours', 'And I\'m here', 'And I love you'])}`
    ],
    [
      `${pickRandom(['And as the music swells', 'And in this moment', 'And with every beat', 'And here with you'])}`,
      `${pickRandom(['I want you to know', 'I need you to feel', 'I want you to see', 'I need you to know'])}`,
      `${pickRandom(['How much you mean to me', 'What you\'ve become', 'Why I\'m here', 'How I feel'])}`,
      `${pickRandom(['More than words can say', 'In every way', 'Forever and always', 'Completely'])}`
    ]
  ];
  
  lines.push(...pickRandom(femalePreChorusVariants));
  
  return lines.join('\n');
}

/**
 * Generate main chorus
 */
function generateChorus(emotion, recipient, nickname, message, isDuet, adj, timeWord) {
  const lines = [];
  
  const templates = {
    heartfelt: [
      [
        `This song is for you, ${recipient}`,
        `Every word I sing is true`,
        `From the bottom of my heart`,
        `I'm sending all my love to you`,
        ``,
        `${nickname ? nickname + ', ' : ''}you mean the ${adj} to me`,
        `That's the ${pickRandom(['sweetest', 'truest', 'most honest', 'most heartfelt'])} thing I can say`,
        `In this melody you'll hear`,
        `How much you ${pickRandom(['brighten every day', 'mean to me', 'hold my heart', 'complete me'])}`
      ],
      [
        `This ${pickRandom(['melody', 'song', 'tune', 'ballad'])} is for you, ${recipient}`,
        `${pickRandom(['Every note', 'Every word', 'Every line', 'Every beat'])} comes from the heart`,
        `${pickRandom(['From the very depths of me', 'From my soul', 'From the core of who I am', 'From my heart'])}`,
        `${pickRandom(['This is my promise', 'This is my truth', 'This is my love', 'This is everything'])}`,
        ``,
        `${nickname ? nickname + ', ' : ''}you're my ${pickRandom(['everything', 'world', 'star', 'sunshine'])}`,
        `${pickRandom(['The one I think about', 'The one I cherish', 'The one I\'m grateful for', 'The one I love'])}`,
        `Let this song be the proof`,
        `${pickRandom(['That my love is real', 'That you\'re cherished', 'That you\'re loved', 'That I\'m yours'])}`
      ],
      [
        `Hey ${recipient}, this ${pickRandom(['song', 'tune', 'melody', 'piece'])} is for you`,
        `${pickRandom(['All of it', 'Every single word', 'All of this', 'Every note'])} is ${pickRandom(['from my heart', 'the truth', 'genuine', 'real'])}`,
        `${pickRandom(['I hope you can feel', 'I hope you can hear', 'I hope you know', 'I want you to understand'])}`,
        `${pickRandom(['How much you\'re loved', 'What you mean to me', 'That I\'m yours', 'That this is forever'])}`,
        ``,
        `${nickname ? nickname + ', ' : ''}in ${pickRandom(['this song', 'these lyrics', 'this melody', 'this moment'])}`,
        `${pickRandom(['I\'ve poured my heart out', 'I\'ve shared my soul', 'I\'ve expressed my love', 'I\'ve given you everything'])}`,
        `${pickRandom(['Listen closely', 'Hear my heart', 'Feel my love', 'Know my truth'])}`,
        `${pickRandom(['And know I\'m yours forever', 'And know you\'re loved', 'And know you\'re cherished', 'And know I\'m here'])}`
      ]
    ],
    funny: [
      [
        `Hey ${recipient}, this one's for you`,
        `${pickRandom(['The funniest person', 'The coolest person', 'The best person', 'The most awesome person'])} I know`,
        `${nickname ? nickname + ' ' : ''}you're ${pickRandom(['weird but in the best way', 'silly but lovable', 'goofy but adorable', 'quirky but amazing'])}`,
        `And ${pickRandom(['that\'s how it should be', 'that\'s what makes us work', 'I love that about you', 'that\'s why we\'re friends'])}!`,
        ``,
        `So here's a song of laughter`,
        `To match your ${pickRandom(['silly soul', 'funny spirit', 'playful nature', 'awesome self'])}`,
        `Every joke and every moment`,
        `${pickRandom(['Has made my life so whole', 'Has been a treasure', 'I\'ll always cherish', 'I\'ll never forget'])}`
      ],
      [
        `${recipient}! This ${pickRandom(['jam', 'bop', 'tune', 'song'])} is dedicated to you!`,
        `${pickRandom(['The one who always makes me laugh', 'The one who\'s always there', 'The one who gets my jokes', 'My favorite human'])}`,
        `${nickname ? nickname + ' ' : ''}you're the ${pickRandom(['best', 'greatest', 'coolest', 'funniest'])}`,
        `${pickRandom(['In the most annoying way', 'In the best way', 'No question', 'Hands down'])}!`,
        ``,
        `This ${pickRandom(['song', 'tune', 'melody', 'track'])} is ${pickRandom(['silly', 'fun', 'playful', 'goofy'])}`,
        `${pickRandom(['Just like you', 'Because of you', 'For you', 'With you'])}`,
        `${pickRandom(['Every laugh, every joke', 'All our moments', 'Everything we share', 'All the good times'])}`,
        `${pickRandom(['Make life worth living', 'Are my favorite', 'I cherish them all', 'Keep me going'])}`
      ]
    ],
    celebration: [
      [
        `We're celebrating you today`,
        `${recipient}, you're a ${pickRandom(['star', 'hero', 'champion', 'legend'])}`,
        `${pickRandom(['Everything you\'ve accomplished', 'All that you\'ve done', 'How far you\'ve come', 'Everything you are'])}`,
        `${pickRandom(['Has taken you so far', 'Is truly inspiring', 'Makes us so proud', 'Is incredible'])}`,
        ``,
        `So raise your voice with mine`,
        `${pickRandom(['Let\'s make some noise', 'Let\'s celebrate', 'Let\'s have a party', 'Let\'s have fun'])} ${pickRandom(['tonight', timeWord, 'right now', 'together'])}`,
        `${nickname ? nickname + ', ' : ''}you ${pickRandom(['deserve this moment', 'are amazing', 'are a star', 'shine so bright'])}`,
        `${pickRandom(['Shine on', 'Keep shining', 'Keep glowing', 'Keep being you'])}!`
      ],
      [
        `${pickRandom(['This is your moment', 'This is your day', 'This is for you', 'This is all about you'])}!`,
        `${recipient}, you're ${pickRandom(['on fire', 'unstoppable', 'amazing', 'incredible'])}`,
        `${pickRandom(['Everything\'s coming together', 'You\'ve made it', 'You\'ve done it', 'You\'re a star'])}`,
        `${pickRandom(['And we\'re so proud', 'And it\'s beautiful', 'And it\'s well-deserved', 'And you deserve this'])}!`,
        ``,
        `${pickRandom(['So let\'s dance', 'So let\'s sing', 'So let\'s celebrate', 'So let\'s cheer'])}!`,
        `${pickRandom(['This is our party', 'This is our moment', 'This is the night', 'This is your time'])}!`,
        `${nickname ? nickname + ', ' : ''}${pickRandom(['you\'re a star', 'you\'re amazing', 'you\'ve got this', 'we\'re so proud'])}!`,
        `${pickRandom(['SHINE ON!', 'KEEP GOING!', 'YOU\'RE AMAZING!', 'WE LOVE YOU!'])}`
      ]
    ],
    healing: [
      [
        `When you need some comfort`,
        `Let this song be there`,
        `${recipient}, I'm here for you`,
        `In ${pickRandom(['every breath of air', 'every moment', 'every heartbeat', 'every storm'])}`,
        ``,
        `Let the melody ${pickRandom(['heal you', 'comfort you', 'soothe you', 'embrace you'])}`,
        `Let the words ${pickRandom(['set you free', 'bring you peace', 'lift you up', 'carry you'])}`,
        `${nickname ? nickname + ' ' : ''}you're ${pickRandom(['not alone in this', 'loved beyond measure', 'held in my heart', 'safe with me'])}`,
        `${pickRandom(['I\'m right here', 'I\'ve got you', 'I\'m by your side', 'You\'re not alone'])}, ${pickRandom(['can\'t you see?', 'always', 'forever', 'trust me'])}?`
      ],
      [
        `${pickRandom(['If the world feels heavy', 'If you\'re feeling down', 'If you need peace', 'If you\'re hurting'])}`,
        `${pickRandom(['Put on this song', 'Press play on this', 'Listen to this', 'Let me sing to you'])}`,
        `${recipient}, ${pickRandom(['this is for you', 'I\'m thinking of you', 'You\'re on my mind', 'I\'m here for you'])}`,
        `${pickRandom(['To bring you comfort', 'To ease your pain', 'To give you hope', 'To be your light'])}`,
        ``,
        `${pickRandom(['Let the melody wrap around you', 'Let the music embrace you', 'Let the rhythm soothe you', 'Let the harmony heal you'])}`,
        `${pickRandom(['Like arms holding you close', 'Like a warm blanket', 'Like sunlight', 'Like a gentle hug'])}`,
        `${nickname ? nickname + ', ' : ''}${pickRandom(['you\'re going to be okay', 'better days are coming', 'this too shall pass', 'I\'ve got you'])}`,
        `${pickRandom(['I promise', 'Believe me', 'Trust me', 'Always'])}`
      ]
    ],
    hype: [
      [
        `${recipient}, you're ${pickRandom(['unstoppable', 'on fire', 'a beast', 'a legend'])}`,
        `${pickRandom(['Nothing can bring you down', 'No one can stop you', 'You\'re unstoppable', 'You\'re a force'])}`,
        `We own this ${pickRandom(['world', 'moment', 'scene', 'universe'])} together`,
        `${pickRandom(['Our power knows no bounds', 'We\'re unstoppable', 'We\'re unstoppable', 'We\'re unstoppable'])}`,
        ``,
        `So let's go, let's break through`,
        `${pickRandom(['There\'s nothing we can\'t do', 'The sky\'s the limit', 'We\'re unstoppable', 'We\'re unstoppable'])}`,
        `${nickname ? nickname + ', ' : ''}with you by my side`,
        `${pickRandom(['We\'re unstoppable', 'We\'re unstoppable', 'We\'re unstoppable', 'We\'re unstoppable'])}!`
      ],
      [
        `${pickRandom(['ARE YOU READY?!', 'LET\'S GO!', 'IT\'S TIME!', 'LET\'S DO THIS!'])}`,
        `${recipient}, ${pickRandom(['YOU\'RE A STAR!', 'YOU\'RE UNSTOPPABLE!', 'YOU\'RE AMAZING!', 'YOU\'RE THE BEST!'])}`,
        `${pickRandom(['WE\'RE ON FIRE!', 'WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!'])}`,
        `${pickRandom(['NOTHING CAN STOP US!', 'WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!'])}`,
        ``,
        `${pickRandom(['SO RAISE YOUR HANDS!', 'SO LET\'S GO!', 'SO LET\'S DO THIS!', 'SO LET\'S CELEBRATE!'])}`,
        `${pickRandom(['FEEL THIS ENERGY!', 'THIS IS OUR MOMENT!', 'WE\'RE ON FIRE!', 'WE\'RE UNSTOPPABLE!'])}`,
        `${nickname ? nickname + '! ' : ''}${pickRandom(['YOU\'RE INCREDIBLE!', 'YOU\'RE UNSTOPPABLE!', 'YOU\'RE A BEAST!', 'YOU\'RE AMAZING!'])}`,
        `${pickRandom(['LET\'S KEEP GOING!', 'WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!', 'LET\'S MAKE HISTORY!'])}`
      ]
    ]
  };
  
  const emotionTemplates = templates[emotion] || templates.heartfelt;
  lines.push(...pickRandom(emotionTemplates));
  
  return lines.join('\n');
}

/**
 * Generate bridge with deep personal message
 */
function generateBridge(emotion, recipient, message, nickname, isDuet, feelingWord, intensityWord) {
  const lines = [];
  
  if (message) {
    const bridgeVariants = [
      [
        `There's something I need to say`,
        `From the very depths of me`,
        `[secret:${message}]`,
        `This is my promise to you, ${recipient}`
      ],
      [
        `${pickRandom(['Let me tell you something', 'I need you to hear this', 'This is important', 'Listen to me'])}`,
        `${pickRandom(['Something I\'ve never said', 'Something from my heart', 'Something true', 'Something real'])}`,
        `[secret:${message}]`,
        `${recipient}, ${pickRandom(['I love you', 'You\'re my everything', 'I\'m yours', 'This is forever'])}`
      ]
    ];
    lines.push(...pickRandom(bridgeVariants));
  } else {
    const templates = {
      heartfelt: [
        [
          `I want you to know`,
          `That wherever life may lead`,
          `${nickname ? nickname + ' ' : ''}you'll always have a place`,
          `In my heart, you'll ${pickRandom(['succeed', 'belong', 'be loved', 'find home'])}`
        ],
        [
          `${pickRandom(['Through every storm', 'In good times and bad', 'Through it all', 'No matter what comes'])}`,
          `${nickname ? nickname + ' ' : ''}you ${pickRandom(['are my shelter', 'have my heart', 'bring me peace', 'give me strength'])}`,
          `${pickRandom(['And that will never change', 'And that\'s forever', 'And that\'s real', 'And that\'s true'])}`,
          `${recipient}, ${pickRandom(['I love you', 'You\'re my person', 'I\'m yours', 'This is us'])}`
        ],
        [
          `${pickRandom(['Close your eyes', 'Take my hand', 'Listen to my heart', 'Feel this moment'])}`,
          `${pickRandom(['I\'m saying this', 'This is my truth', 'This is my promise', 'This is my vow'])}`,
          `${nickname ? nickname + ', ' : ''}${pickRandom(['you mean everything', 'you\'re my world', 'I\'m completely yours', 'you\'re my forever'])}`,
          `${pickRandom(['And I\'ll always be here', 'And I\'ll never leave', 'And that\'s a promise', 'And that\'s the truth'])}`
        ]
      ],
      funny: [
        [
          `Alright, getting real for a sec`,
          `${nickname ? nickname + ', ' : ''}you're ${pickRandom(['actually pretty great', 'seriously amazing', 'truly the best', 'seriously awesome'])}`,
          `${pickRandom(['Even when you steal my fries', 'Despite all the jokes', 'Through all the chaos', 'Beneath the laughter'])}`,
          `${pickRandom(['I\'d choose you', 'You\'re my person', 'You\'re my favorite', 'I love you'])}, ${pickRandom(['no debate', 'always', 'no question', 'forever'])}`
        ],
        [
          `${pickRandom(['Okay okay, real talk', 'But seriously though', 'In all honesty', 'Now for real'])}`,
          `${nickname ? nickname + ' ' : ''}you're the ${pickRandom(['best thing', 'greatest thing', 'coolest thing', 'sweetest thing'])}`,
          `${pickRandom(['That ever happened to me', 'In my whole life', 'Hands down', 'Without a doubt'])}`,
          `${pickRandom(['And I mean it', 'And I\'m not joking', 'And I\'m serious', 'And it\'s true'])}`
        ]
      ],
      celebration: [
        [
          `This moment is ours`,
          `${pickRandom(['A memory we\'ll keep forever', 'A moment to cherish', 'A memory to hold', 'A moment in time'])}`,
          `${nickname ? nickname + ' ' : ''}${pickRandom(['let\'s celebrate life', 'this is our time', 'we did it together', 'we\'re unstoppable'])}`,
          `${pickRandom(['And chase dreams together', 'And keep rising', 'And keep shining', 'And keep going'])}`
        ],
        [
          `${pickRandom(['Look at how far we\'ve come', 'Can you believe this?', 'Remember when...?', 'This is incredible'])}`,
          `${pickRandom(['From the beginning', 'Through it all', 'Against all odds', 'Together'])}`,
          `${nickname ? nickname + ', ' : ''}${pickRandom(['you\'ve been amazing', 'we\'ve been unstoppable', 'this is our reward', 'we deserve this'])}`,
          `${pickRandom(['And the best is yet to come', 'And we\'re just getting started', 'And we\'re going higher', 'And we\'re unstoppable'])}`
        ]
      ],
      healing: [
        [
          `Take a breath with me`,
          `Let the ${pickRandom(['worries fade away', 'storm pass', 'pain ease', 'healing begin'])}`,
          `${recipient}, you're ${pickRandom(['stronger', 'braver', 'better', 'enough'])}`,
          `${pickRandom(['Than you know', 'Every day', 'More than you think', 'In every way'])}`
        ],
        [
          `${pickRandom(['If the world is heavy', 'If today was hard', 'If you\'re feeling low', 'If you need peace'])}`,
          `${pickRandom(['Let me carry some', 'Let me be here', 'Let me hold you', 'Let me help'])}`,
          `${nickname ? nickname + ', ' : ''}${pickRandom(['you don\'t have to be alone', 'we\'re in this together', 'I\'ve got you', 'I\'m here for you'])}`,
          `${pickRandom(['Lean on me', 'Trust me', 'I\'m here', 'We\'ll get through'])}`
        ]
      ],
      hype: [
        [
          `This is just the beginning`,
          `We have so far to go`,
          `${nickname ? nickname + ' ' : ''}${pickRandom(['let's make history', 'this is our moment', 'we\'re unstoppable', 'let\'s go higher'])}`,
          `${pickRandom(['Together, watch us grow', 'Together, we\'re unstoppable', 'Together, we\'re legends', 'Together, we\'re unstoppable'])}!`
        ],
        [
          `${pickRandom(['YOU! ARE! AMAZING!', 'YOU! ARE! UNSTOPPABLE!', 'WE! ARE! UNSTOPPABLE!', 'WE! ARE! LEGENDS!'])}`,
          `${pickRandom(['And this is just the start', 'And we\'re just warming up', 'And we\'re on fire', 'And we\'re unstoppable'])}`,
          `${nickname ? nickname + ' ' : ''}${pickRandom(['let\'s keep climbing', 'let\'s break records', 'let\'s go further', 'let\'s be legendary'])}`,
          `${pickRandom(['There\'s no ceiling!', 'There\'s no limit!', 'We\'re unstoppable!', 'We\'re unstoppable!'])}`
        ]
      ]
    };
    
    const emotionTemplates = templates[emotion] || templates.heartfelt;
    lines.push(...pickRandom(emotionTemplates));
  }
  
  return lines.join('\n');
}

/**
 * Generate final chorus - most powerful version
 */
function generateFinalChorus(emotion, recipient, nickname, message, isDuet, adj, timeWord) {
  const lines = [];
  
  // More emphatic version of the chorus
  const templates = {
    heartfelt: [
      [
        `THIS song is for you, ${recipient}!`,
        `Every ${pickRandom(['single', 'single', 'single', 'last'])} word is TRUE!`,
        `From the DEEPEST part of me`,
        `I give my HEART to you!`,
        ``,
        `${nickname ? nickname.toUpperCase() + '! ' : ''}YOU mean the ${adj.toUpperCase()} to me!`,
        `${pickRandom(['That\'s the truest thing', 'That\'s my honest truth', 'That\'s my solemn vow', 'That\'s my promise'])} I'll say`,
        `In this melody you'll hear`,
        `My LOVE for you, ${pickRandom(['every single day', 'always and forever', 'until the end', 'through it all'])}!`
      ],
      [
        `${recipient.toUpperCase()}! ${pickRandom(['THIS', 'MY', 'OUR', 'ONE MORE'])} SONG IS FOR YOU!`,
        `${pickRandom(['Every word', 'Every note', 'Every line', 'Every beat'])} ${pickRandom(['is the truth', 'is from my heart', 'is real', 'is for you'])}!`,
        `${pickRandom(['Listen to my heart', 'Feel my soul', 'Hear my love', 'Know my truth'])}`,
        `${pickRandom(['This is EVERYTHING', 'This is FOREVER', 'This is UNCONDITIONAL', 'This is MY ALL'])}!`,
        ``,
        `${nickname ? nickname.toUpperCase() + '! ' : ''}${pickRandom(['YOU\'RE MY EVERYTHING!', 'YOU\'RE MY WORLD!', 'YOU\'RE MY FOREVER!', 'YOU\'RE MY ALL!'])}`,
        `${pickRandom(['More than I can say', 'More than words', 'More than ever', 'Infinite'])}!`,
        `${pickRandom(['In this song', 'In these lyrics', 'In this melody', 'In my heart'])}`,
        `${pickRandom(['I give you EVERYTHING!', 'YOU\'RE LOVED!', 'YOU\'RE CHERISHED!', 'YOU\'RE MINE!'])}`
      ]
    ],
    funny: [
      [
        `HEY ${recipient.toUpperCase()}! THIS ONE'S FOR YOU!`,
        `${pickRandom(['The FUNNIEST soul', 'The COOLEST dude', 'The BEST human', 'My FAVORITE person'])} I know!`,
        `${nickname ? nickname.toUpperCase() + ' ' : ''}YOU'RE ${pickRandom(['WEIRD but it\'s the BEST', 'AWESOME no doubt', 'HILARIOUS forever', 'THE BEST EVER'])}!`,
        `And ${pickRandom(['that\'s just how it goes', 'that\'s why we\'re us', 'I wouldn\'t change it', 'that\'s why I love you'])}!`,
        ``,
        `So SING ALONG with laughter`,
        `Match your ${pickRandom(['silly soul', 'funny spirit', 'goofy nature', 'playful self'])}!`,
        `${pickRandom(['Every joke, every moment', 'All our good times', 'Everything we share', 'Every memory'])}`,
        `${pickRandom(['Has made my life SO WHOLE!', 'Is what I treasure!', 'Is what I\'ll keep!', 'Is PRICELESS!'])}`
      ]
    ],
    celebration: [
      [
        `WE'RE CELEBRATING ${recipient.toUpperCase()} TODAY!`,
        `YOU'RE A ${pickRandom(['STAR!', 'LEGEND!', 'CHAMPION!', 'HERO!'])}!`,
        `${pickRandom(['EVERYTHING accomplished', 'ALL that you\'ve done', 'HOW far you\'ve come', 'EVERYTHING you are'])}`,
        `${pickRandom(['Has taken you SO FAR!', 'Is so INSPIRING!', 'Makes us so PROUD!', 'Is truly INCREDIBLE!'])}!`,
        ``,
        `SO RAISE YOUR VOICE WITH OURS!`,
        `${pickRandom(['Let\'s make some NOISE!', 'Let\'s CELEBRATE!', 'Let\'s have FUN!', 'Let\'s PARTY!'])} ${pickRandom(['TONIGHT!', timeWord.toUpperCase() + '!', 'RIGHT NOW!', 'TOGETHER!'])}`,
        `${nickname ? nickname + ', ' : ''}YOU ${pickRandom(['DESERVE THIS MOMENT!', 'ARE AMAZING!', 'SHINE SO BRIGHT!', 'ARE A STAR!'])}!`,
        `${pickRandom(['SHINE ON!', 'KEEP GOING!', 'NEVER STOP!', 'CELEBRATE!'])}!`
      ]
    ],
    healing: [
      [
        `When you need some comfort`,
        `Let this song be there!`,
        `${recipient}, I'M HERE for you!`,
        `In ${pickRandom(['every breath of air', 'every single moment', 'every heartbeat', 'every storm'])}!`,
        ``,
        `Let the melody HEAL you!`,
        `Let the words SET YOU FREE!`,
        `${nickname ? nickname + ' ' : ''}YOU'RE ${pickRandom(['NOT ALONE', 'LOVED', 'CHERISHED', 'HELD'])} in this!`,
        `${pickRandom(['I\'M RIGHT HERE!', 'I\'VE GOT YOU!', 'I\'M BY YOUR SIDE!', 'YOU\'RE NOT ALONE!'])} ${pickRandom(['CAN\'T YOU SEE?!', 'ALWAYS!', 'FOREVER!', 'TRUST ME!'])}`
      ]
    ],
    hype: [
      [
        `${recipient.toUpperCase()}! YOU'RE ${pickRandom(['UNSTOPPABLE!', 'ON FIRE!', 'A BEAST!', 'A LEGEND!'])}!`,
        `${pickRandom(['NOTHING can bring you down!', 'NO ONE can stop you!', 'YOU\'RE UNSTOPPABLE!', 'YOU\'RE A FORCE!'])}!`,
        `WE OWN THIS ${pickRandom(['WORLD!', 'MOMENT!', 'SCENE!', 'UNIVERSE!'])} TOGETHER!`,
        `${pickRandom(['OUR POWER knows NO BOUNDS!', 'WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!'])}!`,
        ``,
        `SO LET'S GO! LET'S BREAK THROUGH!`,
        `${pickRandom(['THERE\'S NOTHING we can\'t do!', 'THE SKY\'S THE LIMIT!', 'WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!'])}!`,
        `${nickname ? nickname.toUpperCase() + '! ' : ''}WITH YOU by my side!`,
        `${pickRandom(['WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!', 'WE\'RE UNSTOPPABLE!'])}!`
      ]
    ]
  };
  
  const emotionTemplates = templates[emotion] || templates.heartfelt;
  lines.push(...pickRandom(emotionTemplates));
  
  return lines.join('\n');
}

/**
 * Generate outro
 */
function generateOutro(emotion, recipient, nickname, adj, timeWord) {
  const lines = [];
  
  const outroVariants = [
    [
      `♪ ♪ ♪`,
      ``,
      `${nickname || recipient}...`,
      `${pickRandom(['This is our song', 'This is for you', 'This is my heart', 'This is my love'])}`,
      ``,
      `♪ ${pickRandom(['Fade out with emotion', 'Softly fading', 'Slowly dissolving', 'Gently releasing'])} ♪`
    ],
    [
      `♪ ♪ ♪`,
      ``,
      `${nickname || recipient}...`,
      `${pickRandom(['Remember this moment', 'Hold onto this', 'Keep this in your heart', 'Carry this with you'])}`,
      ``,
      `♪ ${pickRandom(['Until we meet again', 'Fading into forever', 'Singing into the night', 'Dancing into dreams'])} ♪`
    ],
    [
      `${nickname || recipient}...`,
      `${pickRandom(['This is just the beginning', 'We\'ll meet again', 'Until next time', 'Until forever'])}`,
      ``,
      `♪ ♪ ♪`,
      ``,
      `${pickRandom(['The melody lingers', 'The song continues', 'The love remains', 'The memory stays'])}`,
      `♪ ♪ ♪`
    ],
    [
      `♪ ♪ ♪`,
      ``,
      `${pickRandom(['Thank you', 'I love you', 'You\'re amazing', 'You\'re my everything'])}, ${nickname || recipient}...`,
      `${pickRandom(['For everything', 'For being you', 'For this moment', 'For us'])}`,
      ``,
      `♪ ${pickRandom(['Fading to silence', 'Softly ending', 'Gently closing', 'Beautifully done'])} ♪`
    ]
  ];
  
  lines.push(...pickRandom(outroVariants));
  
  return lines.join('\n');
}

/**
 * Build complete Suno API style string
 */
function buildStyle(emotion, voiceType, songStyle) {
  const styleMap = emotionVocalMapping[emotion]?.[voiceType]?.[songStyle];
  if (styleMap) {
    return styleMap;
  }
  // Fallback
  return `Pop ballad, emotional vocals, 80 BPM`;
}

/**
 * Get vocal gender for API
 */
function getVocalGender(voiceType) {
  if (voiceType === 'male') return 'm';
  if (voiceType === 'female') return 'f';
  return 'f'; // duet defaults to female lead, duet structure is in lyrics tags
}

module.exports = {
  generateLyrics,
  extractSecrets,
  buildStyle,
  getVocalGender,
  emotionVocalMapping,
  voiceInfo,
  songStyles
};
