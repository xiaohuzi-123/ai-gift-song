/**
 * AI Gift Song - Lyrics Generator
 * Generates personalized song lyrics based on user input with "Dai Zi Zhen" level quality
 * 
 * Voice Style Mapping: emotion + voiceType + songStyle → precise style description
 */

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
  duet: { name: "Duet", subtitle: "Together in harmony", emoji: "🎵" 
}
};

// Song style options
const songStyles = [
  { id: "pop", name: "Pop", emoji: "🎹", desc: "Catchy & modern" },
  { id: "folk", name: "Folk", emoji: "🪕", desc: "Storytelling & acoustic" },
  { id: "rnb", name: "R&B", emoji: "🎷", desc: "Smooth & soulful" },
  { id: "electronic", name: "Electronic", emoji: "🎛️", desc: "Electronic & futuristic" },
  { id: "rock", name: "Rock", emoji: "🎸", desc: "Powerful & energetic" },
  { id: "acoustic", name: "Acoustic", emoji: "🎻", desc: "Intimate & pure" 
}
];

// Simple randomization utilities
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const adjectives = ['beautiful', 'precious', 'wonderful', 'amazing', 'incredible', 'magical', 'special', 'radiant', 'enchanting', 'breathtaking'];
const timeWords = ['today', 'tonight', 'forever', 'always', 'right now', 'in this moment', 'every day'];
const feelingVerbs = ['feel', 'know', 'see', 'sense', 'believe'];

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
  
  // Generate structure based on emotion
  let lyrics = '';
  
  // Intro with atmosphere
  lyrics += `[Intro]\n`;
  const adj = pickRandom(adjectives);
  const timeWord = pickRandom(timeWords);
  const moodWord = pickRandom(["mood", "atmosphere", "feeling", "tone"]);
  const melWord = pickRandom(["melody", "harmony", "rhythm", "tune"]);
  lyrics += `♪ ${adj.charAt(0).toUpperCase() + adj.slice(1)} ${melWord} setting the ${moodWord} ♪\n\n`;
  
  // Verse 1 - Setting the scene with shared memory
  lyrics += `[Verse 1${isDuet ? ' - Male' : ''}]\n`;
  lyrics += generateVerseWithMemory(sharedMemory, nickname, isDuet ? 'male' : voiceType);
  lyrics += `\n`;
  
  if (isDuet) {
    lyrics += `[Verse 1 - Female]\n`;
    lyrics += generateFemaleVerse(sharedMemory, nickname);
    lyrics += `\n`;
  
}
  
  // Pre-Chorus - Building emotion
  lyrics += `[Pre-Chorus${isDuet ? ' - Male' : ''}]\n`;
  lyrics += generatePreChorus(emotion, recipient, personalMessage);
  lyrics += `\n`;
  
  if (isDuet) {
    lyrics += `[Pre-Chorus - Female]\n`;
    lyrics += generateFemalePreChorus(emotion, recipient);
    lyrics += `\n`;
  
}
  
  // Chorus - Main emotional message (appears twice)
  lyrics += `[Chorus]\n`;
  lyrics += generateChorus(emotion, recipient, nickname, personalMessage, isDuet);
  lyrics += `\n\n`;
  
  // Verse 2 - Inside joke and personal details
  lyrics += `[Verse 2${isDuet ? ' - Male' : ''}]\n`;
  lyrics += generateVerseWithJoke(insideJoke, nickname, sharedMemory, isDuet ? 'male' : voiceType);
  lyrics += `\n`;
  
  if (isDuet) {
    lyrics += `[Verse 2 - Female]\n`;
    lyrics += generateFemaleVerseWithJoke(insideJoke, nickname);
    lyrics += `\n`;
  
}
  
  // Repeat Chorus
  lyrics += `[Chorus]\n`;
  lyrics += generateChorus(emotion, recipient, nickname, personalMessage, isDuet);
  lyrics += `\n\n`;
  
  // Bridge - Deep personal message
  lyrics += `[Bridge]\n`;
  lyrics += generateBridge(emotion, recipient, personalMessage, nickname, isDuet);
  lyrics += `\n\n`;
  
  // Final Chorus - Most powerful
  lyrics += `[Final Chorus]\n`;
  lyrics += generateFinalChorus(emotion, recipient, nickname, personalMessage, isDuet);
  lyrics += `\n\n`;
  
  // Outro
  lyrics += `[Outro]\n`;
  lyrics += generateOutro(emotion, recipient, nickname);
  
  return lyrics;

}

/**
 * Generate verse incorporating the shared memory
 */
function generateVerseWithMemory(memory, nickname, voiceType) {
  const lines = [];
  
  if (memory) {
    // Extract key elements from memory
    const memoryLower = memory.toLowerCase();
    
    if (memoryLower.includes('rain') || memoryLower.includes('raining')) {
      lines.push(`Remember when the rain fell down`);
      lines.push(`And ${nickname ? nickname + ' ' : 'you '}held me tight`);
      lines.push(`The world outside was grey`);
      lines.push(`But inside, everything felt right`);
    } else if (memoryLower.includes('laugh') || memoryLower.includes('laughing') || memoryLower.includes('funny')) {
      lines.push(`We couldn't stop laughing that day`);
      lines.push(`${nickname ? nickname + ' ' : 'You '}made me forget all my worries`);
      lines.push(`The way you laugh, the way you smile`);
      lines.push(`Those moments still make me feel sunny`);
    } else if (memoryLower.includes('night') || memoryLower.includes('star') || memoryLower.includes('sky')) {
      lines.push(`Under a million stars we sat`);
      lines.push(`Talking until the world went quiet`);
      lines.push(`${nickname ? nickname + ', ' : ''}you showed me beauty`);
      lines.push(`In the darkness of the night`);
    } else if (memoryLower.includes('first') || memoryLower.includes('met') || memoryLower.includes('meet')) {
      lines.push(`The first time I saw you, I knew`);
      lines.push(`This was something rare and true`);
      lines.push(`${nickname ? nickname + ' ' : ''}you changed my world`);
      lines.push(`From that moment, my heart grew`);
    } else {
      // Generic but personal
      lines.push(`I still remember ${memory.substring(0, 50)}`);
      lines.push(`[secret:${memory.substring(0, 80)}]`);
      lines.push(`The way you looked at me that day`);
      lines.push(`${nickname ? nickname + ', ' : ''}I'll never forget`);
    
}
  } else {
    // Default verse if no memory provided
    lines.push(`Every moment with you`);
    lines.push(`Is a treasure I hold dear`);
    lines.push(`The way you light up my life`);
    lines.push(`Is something words can't compare`);
  
}
  
  return lines.join('\n');

}

/**
 * Generate female verse for duet
 */
function generateFemaleVerse(memory, nickname) {
  const lines = [];
  
  if (memory) {
    lines.push(`And I remember it too`);
    lines.push(`The way you ${nickname ? nickname + ' ' : 'you '}made me feel`);
    lines.push(`Like the whole world disappeared`);
    lines.push(`And it was just us, that's real`);
  } else {
    lines.push(`Every laugh we shared together`);
    lines.push(`Every moment by your side`);
    lines.push(`Is a story I hold close`);
    lines.push(`A beautiful place to reside`);
  
}
  
  return lines.join('\n');

}

/**
 * Generate verse with inside joke
 */
function generateVerseWithJoke(joke, nickname, memory, voiceType) {
  const lines = [];
  
  if (joke) {
    lines.push(`And then there's that thing we say`);
    lines.push(`The joke that's just ours alone`);
    lines.push(`[secret:${joke}]`);
    lines.push(`Makes me smile every time I recall`);
  
}
  
  if (nickname) {
    lines.push(`${nickname}, you're my favorite person`);
    lines.push(`The one who knows me best`);
    lines.push(`[secret:${nickname}]`);
  
}
  
  if (lines.length === 0) {
    lines.push(`Through every high and every low`);
    lines.push(`You've been my guiding star`);
    lines.push(`The memories we've made together`);
    lines.push(`Have shown me who we are`);
  
}
  
  return lines.join('\n');

}

/**
 * Generate female verse with joke for duet
 */
function generateFemaleVerseWithJoke(joke, nickname) {
  const lines = [];
  
  if (joke) {
    lines.push(`And when I hear that joke`);
    lines.push(`I know exactly what you mean`);
    lines.push(`It's our secret language`);
    lines.push(`The most beautiful I've seen`);
  
}
  
  if (nickname) {
    lines.push(`${nickname}, you understand me`);
    lines.push(`Better than anyone else`);
  
}
  
  return lines.length > 0 ? lines.join('\n') : `And now we're here together\nSinging this song just for us\nEvery moment that we've shared\nHas led us here to this`;

}

/**
 * Generate pre-chorus building emotion
 */
function generatePreChorus(emotion, recipient, message) {
  const lines = [];
  
  const templates = {
    heartfelt: [
      `When I think of everything`,
      `Every moment, every smile`,
      `I know there's something special`,
      `Between us all this while`
    ],
    funny: [
      `You make me laugh so hard`,
      `Every single damn day`,
      `But underneath the jokes`,
      `There's so much I want to say`
    ],
    celebration: [
      `We're on top of the world`,
      `Nothing can bring us down`,
      `Let's celebrate together`,
      `Dance across this town`
    ],
    healing: [
      `When everything feels heavy`,
      `You make the weight disappear`,
      `Your presence is a comfort`,
      `That quiets all my fear`
    ],
    hype: [
      `You push me to be better`,
      `Challenge me every day`,
      `With you I know I can`,
      `Find a way, find a way`
    ]
  };
  
  const selected = templates[emotion] || templates.heartfelt;
  lines.push(...selected);
  
  return lines.join('\n');

}

/**
 * Generate female pre-chorus for duet
 */
function generateFemalePreChorus(emotion, recipient) {
  const lines = [
    `And I feel it too`,
    `This connection that we share`,
    `Is something so rare`,
    `Something beyond compare`
  ];
  
  return lines.join('\n');

}

/**
 * Generate main chorus
 */
function generateChorus(emotion, recipient, nickname, message, isDuet) {
  const lines = [];
  
  const templates = {
    heartfelt: [
      `This song is for you, ${recipient}`,
      `Every word I sing is true`,
      `From the bottom of my heart`,
      `I'm sending all my love to you`,
      ``,
      `${nickname ? nickname + ', ' : ''}you mean the world to me`,
      `That's the sweetest thing I can say`,
      `In this melody you'll hear`,
      `How much you brighten every day`
    ],
    funny: [
      `Hey ${recipient}, this one's for you`,
      `The funniest person I know`,
      `${nickname ? nickname + ' ' : ''}you're weird but in the best way`,
      `And that's how it should be, yo!`,
      ``,
      `So here's a song of laughter`,
      `To match your silly soul`,
      `Every joke and every moment`,
      `Has made my life so whole`
    ],
    celebration: [
      `We're celebrating you today`,
      `${recipient}, you're a star`,
      `Everything you've accomplished`,
      `Has taken you so far`,
      ``,
      `So raise your voice with mine`,
      `Let's make some noise tonight`,
      `${nickname ? nickname + ', ' : ''}you deserve this moment`,
      `Shine on, shine bright`
    ],
    healing: [
      `When you need some comfort`,
      `Let this song be there`,
      `${recipient}, I'm here for you`,
      `In every breath of air`,
      ``,
      `Let the melody heal you`,
      `Let the words set you free`,
      `${nickname ? nickname + ' ' : ''}you're not alone in this`,
      `I'm right here, can't you see?`
    ],
    hype: [
      `${recipient}, you're unstoppable`,
      `Nothing can bring you down`,
      `We own this world together`,
      `Our power knows no bound`,
      ``,
      `So let's go, let's break through`,
      `There's nothing we can't do`,
      `${nickname ? nickname + ', ' : ''}with you by my side`,
      `We're unstoppable, it's true!`
    ]
  };
  
  const selected = templates[emotion] || templates.heartfelt;
  lines.push(...selected);
  
  return lines.join('\n');

}

/**
 * Generate bridge with deep personal message
 */
function generateBridge(emotion, recipient, message, nickname, isDuet) {
  const lines = [];
  
  if (message) {
    lines.push(`There's something I need to say`);
    lines.push(`From the very depths of me`);
    lines.push(`[secret:${message}]`);
    lines.push(`This is my promise to you, ${recipient}`);
  } else {
    const templates = {
      heartfelt: [
        `I want you to know`,
        `That wherever life may lead`,
        `${nickname ? nickname + ' ' : ''}you'll always have a place`,
        `In my heart, you'll succeed`
      ],
      funny: [
        `Alright, getting real for a sec`,
        `${nickname ? nickname + ', ' : ''}you're actually pretty great`,
        `Even when you steal my fries`,
        `I'd choose you, no debate`
      ],
      celebration: [
        `This moment is ours`,
        `A memory we'll keep forever`,
        `${nickname ? nickname + ' ' : ''}let's celebrate life`,
        `And chase dreams together`
      ],
      healing: [
        `Take a breath with me`,
        `Let the worries fade away`,
        `${recipient}, you're stronger`,
        `Than you know, every day`
      ],
      hype: [
        `This is just the beginning`,
        `We have so far to go`,
        `${nickname ? nickname + ' ' : ''}let's make history`,
        `Together, watch us grow!`
      ]
    };
    
    const selected = templates[emotion] || templates.heartfelt;
    lines.push(...selected);
  
}
  
  return lines.join('\n');

}

/**
 * Generate final chorus - most powerful version
 */
function generateFinalChorus(emotion, recipient, nickname, message, isDuet) {
  const lines = [];
  
  // More emphatic version of the chorus
  const templates = {
    heartfelt: [
      `THIS song is for you, ${recipient}`,
      `Every single word is true`,
      `From the deepest part of me`,
      `I give my heart to you!`,
      ``,
      `${nickname ? nickname + ' ' : ''}YOU mean the world to me!`,
      `That's the truest thing I'll say`,
      `In this melody you'll hear`,
      `My love for you, every single day!`
    ],
    funny: [
      `HEY ${recipient}, this one's for you!`,
      `The funniest soul I know!`,
      `${nickname ? nickname.toUpperCase() + ' ' : ''}you're weird but it's the best`,
      `And that's just how it goes!`,
      ``,
      `So sing along with laughter`,
      `Match your silly soul!`,
      `Every joke, every moment`,
      `Has made my life so whole!`
    ],
    celebration: [
      `WE'RE celebrating YOU today!`,
      `${recipient}, you're our star!`,
      `Everything accomplished`,
      `Has taken you so far!`,
      ``,
      `SO RAISE YOUR VOICE WITH OURS!`,
      `Let's make some noise tonight!`,
      `${nickname ? nickname + ', ' : ''}you deserve this moment!`,
      `SHINE ON, SHINE BRIGHT!`
    ],
    healing: [
      `When you need some comfort`,
      `Let this song be there!`,
      `${recipient}, I'm here for you!`,
      `In every breath of air!`,
      ``,
      `Let the melody HEAL you!`,
      `Let the words set you FREE!`,
      `${nickname ? nickname + ' ' : ''}you're NOT ALONE in this!`,
      `I'm right here, can't you SEE?!`
    ],
    hype: [
      `${recipient.toUpperCase()}! YOU'RE UNSTOPPABLE!`,
      `NOTHING can bring you down!`,
      `WE OWN this world together!`,
      `Our power knows NO BOUND!`,
      ``,
      `SO LET'S GO, LET'S BREAK THROUGH!`,
      `There's NOTHING we can't do!`,
      `${nickname ? nickname.toUpperCase() + '! ' : ''}WITH YOU by my side!`,
      `WE'RE UNSTOPPABLE, IT'S TRUE!`
    ]
  };
  
  const selected = templates[emotion] || templates.heartfelt;
  lines.push(...selected);
  
  return lines.join('\n');

}

/**
 * Generate outro
 */
function generateOutro(emotion, recipient, nickname) {
  const lines = [
    `♪ ♪ ♪`,
    ``,
    `${nickname || recipient}...`,
    `This is our song.`,
    ``,
    `♪ Fade out with emotion ♪`
  ];
  
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
  return 'f'; // duet defaults to female lead

}

export {
  generateLyrics,
  extractSecrets,
  buildStyle,
  getVocalGender,
  emotionVocalMapping,
  voiceInfo,
  songStyles
};
