import { User, ChatMessage } from '../types';

export interface HumanoidReply {
  delayMs: number;
  replyText: string;
  secondMessage?: {
    delayMs: number;
    replyText: string;
  };
}

// Conversation state cache per partner user ID
const conversationMemory: Record<
  string,
  {
    stage: number;
    discussedTopics: Set<string>;
    userLocation?: string;
    userOccupation?: string;
    userName?: string;
  }
> = {};

function getOrInitMemory(partnerId: string) {
  if (!conversationMemory[partnerId]) {
    conversationMemory[partnerId] = {
      stage: 0,
      discussedTopics: new Set<string>(),
    };
  }
  return conversationMemory[partnerId];
}

function calculateHumanoidDelay(text: string): number {
  // Humans take ~1200-1800ms to read user text and formulate thought
  // Plus ~35-50ms per character typing speed
  const readingMs = 1400 + Math.random() * 800;
  const typingMs = Math.min(2600, (text?.length || 20) * 38);
  const total = readingMs + typingMs;
  // Guaranteed non-instant: between 2500ms and 4800ms
  return Math.max(2500, Math.min(4800, Math.floor(total)));
}

function calculateFollowUpDelay(text: string): number {
  const typingMs = Math.min(2400, (text?.length || 15) * 32);
  // Quick natural second burst: 2000ms - 3600ms
  return Math.max(2000, Math.min(3600, Math.floor(1200 + typingMs + Math.random() * 600)));
}

/**
 * Generates an ultra-humanoid, authentic conversational reply when a user chats 1-on-1 with a simulated partner.
 * Emulates how real humans casually text on messaging apps when getting to know each other.
 */
function generateRawHumanoidReply(
  partner: User,
  userMessageText: string,
  chatHistory: ChatMessage[] = []
): HumanoidReply {
  const memory = getOrInitMemory(partner.id);
  const lower = userMessageText.toLowerCase().trim();
  const partnerName = partner.nickname;

  // Track conversation depth
  memory.stage += 1;

  // Compliments & flattering remarks ("you look nice", "pretty", "handsome", "cute", "cool", "sweet")
  if (
    lower.includes('cute') ||
    lower.includes('pretty') ||
    lower.includes('handsome') ||
    lower.includes('beautiful') ||
    lower.includes('sweet') ||
    lower.includes('nice photo') ||
    lower.includes('like your profile')
  ) {
    const complimentReplies = [
      {
        part1: `aw thank you so much! that just put a big smile on my face 😊`,
        part2: `you seem really sweet and genuine yourself honestly!`,
      },
      {
        part1: `haha aw you're too kind! made my evening ✨`,
        part2: `how's your night treating you so far?`,
      },
      {
        part1: `aw thank you! blushing a little over here haha 😊`,
        part2: `you definitely have great energy, love chatting with you!`,
      },
    ];
    const c = complimentReplies[Math.floor(Math.random() * complimentReplies.length)];
    return {
      delayMs: calculateHumanoidDelay(c.part1),
      replyText: c.part1,
      secondMessage: {
        delayMs: calculateFollowUpDelay(c.part2),
        replyText: c.part2,
      },
    };
  }

  // Venting or feeling stressed / tired ("tired", "exhausted", "stressed", "bad day", "rough day", "bored")
  if (
    lower.includes('tired') ||
    lower.includes('exhausted') ||
    lower.includes('stressed') ||
    lower.includes('bad day') ||
    lower.includes('rough day') ||
    lower.includes('headache')
  ) {
    const comfortReplies = [
      {
        part1: `aw i'm sorry to hear that! treat yourself to something nice tonight, you definitely deserve to rest 🤍`,
        part2: `do you want to vent about what happened, or just distract yourself with fun topics? i'm here for either!`,
      },
      {
        part1: `ugh i feel that so hard. some days just drain all your energy!`,
        part2: `hope having a chat here helps lighten the mood a little bit 😊 grab a warm drink!`,
      },
    ];
    const cf = comfortReplies[Math.floor(Math.random() * comfortReplies.length)];
    return {
      delayMs: calculateHumanoidDelay(cf.part1),
      replyText: cf.part1,
      secondMessage: {
        delayMs: calculateFollowUpDelay(cf.part2),
        replyText: cf.part2,
      },
    };
  }

  // 1. Bot check inquiry ("are you a bot", "are you real", "are you ai")
  if (
    lower.includes('bot') ||
    lower.includes('are you real') ||
    lower.includes('are you human') ||
    lower.includes('are you ai') ||
    lower.includes('robot')
  ) {
    const botReplies = [
      {
        part1: 'haha what? 😂 definitely not a bot',
        part2: "just a normal person chilling on my phone lol. why, do i sound like one?",
      },
      {
        part1: 'lol nah, last time i checked i have to pay rent and drink coffee haha',
        part2: 'why do you ask though? have you run into bots on here before?',
      },
      {
        part1: 'lmao nope, 100% human over here 🙋',
        part2: "promise i'm real! just trying to have a genuine chat while relaxing tonight.",
      },
    ];
    const chosen = botReplies[Math.floor(Math.random() * botReplies.length)];
    return {
      delayMs: 1400,
      replyText: chosen.part1,
      secondMessage: {
        delayMs: 1600,
        replyText: chosen.part2,
      },
    };
  }

  // 2. Greetings ("hi", "hello", "hey", "sup", "yo", "good morning", "good evening")
  if (
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower === 'sup' ||
    lower === 'yo' ||
    lower.startsWith('heyy') ||
    lower.startsWith('hello') ||
    lower.startsWith('hi ') ||
    lower.startsWith('hey ')
  ) {
    if (memory.stage <= 1) {
      const firstGreetings = [
        {
          text: `heyy! how's your day going? 😊`,
          followUp: `where are you texting from?`,
        },
        {
          text: `hey there! nice to meet you. having a good day so far?`,
          followUp: undefined,
        },
        {
          text: `yo! what's up? just chilling over here.`,
          followUp: `how are things with you?`,
        },
        {
          text: `heyy! how are you doing today?`,
          followUp: undefined,
        },
      ];
      const g = firstGreetings[Math.floor(Math.random() * firstGreetings.length)];
      return {
        delayMs: 1500,
        replyText: g.text,
        secondMessage: g.followUp
          ? {
              delayMs: 1800,
              replyText: g.followUp,
            }
          : undefined,
      };
    } else {
      const friendlyCasuals = [
        `hey again! what are you up to right now?`,
        `heyy! did you just get free or just relaxing?`,
        `hey! how's the rest of your day been?`,
      ];
      return {
        delayMs: 1300,
        replyText: friendlyCasuals[Math.floor(Math.random() * friendlyCasuals.length)],
      };
    }
  }

  // 3. "How are you", "how r u", "how is it going", "how's your day"
  if (
    lower.includes('how are you') ||
    lower.includes('how r u') ||
    lower.includes('hows it going') ||
    lower.includes("how's it going") ||
    lower.includes('how is your day') ||
    lower.includes("how's your day")
  ) {
    const statusReplies = [
      {
        part1: `pretty good honestly! just finished some errands and made coffee ☕`,
        part2: `how about you? having a relaxed day or a busy one?`,
      },
      {
        part1: `doing well, thanks for asking! just winding down listening to some music.`,
        part2: `what are you up to tonight?`,
      },
      {
        part1: `can't complain! today felt kind of long but finally relaxing now haha.`,
        part2: `how's your week treating you so far?`,
      },
      {
        part1: `honestly pretty chill! just relaxing on the couch.`,
        part2: `how about yourself? having a good one?`,
      },
    ];
    const s = statusReplies[Math.floor(Math.random() * statusReplies.length)];
    return {
      delayMs: 1600,
      replyText: s.part1,
      secondMessage: {
        delayMs: 1800,
        replyText: s.part2,
      },
    };
  }

  // 4. Location inquiries: "where are you from", "where do you live", "what country"
  if (
    lower.includes('where are you from') ||
    lower.includes('where r u from') ||
    lower.includes('where do you live') ||
    lower.includes('what country') ||
    lower.includes('where u at')
  ) {
    memory.discussedTopics.add('location');
    const locReplies = [
      {
        part1: `i'm from ${partner.country}! ${partner.flag} born and raised here.`,
        part2: `what about you, where are you chatting from?`,
      },
      {
        part1: `i live in ${partner.country} ${partner.flag}! the weather has been pretty nice lately.`,
        part2: `have you ever visited over here, or where are you based?`,
      },
      {
        part1: `originally from ${partner.country}! love it here honestly.`,
        part2: `where in the world are you right now?`,
      },
    ];
    const l = locReplies[Math.floor(Math.random() * locReplies.length)];
    return {
      delayMs: 1700,
      replyText: l.part1,
      secondMessage: {
        delayMs: 1900,
        replyText: l.part2,
      },
    };
  }

  // 5. User mentions their own location ("i'm from ...", "i live in ...", "states", "california", "london", "texas", "canada", "germany", etc.)
  if (
    lower.includes("i'm from") ||
    lower.includes('im from') ||
    lower.includes('i live in') ||
    lower.includes('from the us') ||
    lower.includes('from the uk') ||
    lower.includes('from canada')
  ) {
    const locResponses = [
      `oh nice!! i've always heard cool things about there. do you like living there?`,
      `no way haha, that's awesome! what's the weather like over there right now?`,
      `nice! i've actually wanted to visit there for a while. is it pretty lively where you are?`,
      `oh cool! love meeting people from there. how long have you lived there?`,
    ];
    return {
      delayMs: 1800,
      replyText: locResponses[Math.floor(Math.random() * locResponses.length)],
    };
  }

  // 6. Age inquiries: "how old are you", "what's your age", "your age"
  if (
    lower.includes('how old are you') ||
    lower.includes('how old r u') ||
    lower.includes('your age') ||
    lower.includes("what's your age")
  ) {
    memory.discussedTopics.add('age');
    const ageReplies = [
      `i'm ${partner.age}! what about you, how old are you?`,
      `just turned ${partner.age} recently haha! hbu?`,
      `i'm ${partner.age} 😊 what about yourself?`,
    ];
    return {
      delayMs: 1400,
      replyText: ageReplies[Math.floor(Math.random() * ageReplies.length)],
    };
  }

  // 7. Work / Study / Profession: "what do you do", "what's your job", "do you work", "student"
  if (
    lower.includes('what do you do') ||
    lower.includes('what is your job') ||
    lower.includes('do you work') ||
    lower.includes('what do you study') ||
    lower.includes('what u do')
  ) {
    memory.discussedTopics.add('occupation');
    const bioText = partner.bio
      ? partner.bio.replace(/([.!?])$/, '')
      : 'i work in creative design remotely';
    const workReplies = [
      {
        part1: `well, ${bioText.toLowerCase()}! keeps me pretty busy but i enjoy it haha.`,
        part2: `what about you? what keeps you busy during the day?`,
      },
      {
        part1: `mostly ${bioText.toLowerCase()}! lots of screen time honestly lol.`,
        part2: `do you work or are you studying right now?`,
      },
    ];
    const w = workReplies[Math.floor(Math.random() * workReplies.length)];
    return {
      delayMs: 1900,
      replyText: w.part1,
      secondMessage: {
        delayMs: 2000,
        replyText: w.part2,
      },
    };
  }

  // 8. User mentions their work/school ("i work in ...", "i'm a developer", "i'm a student", "i work in marketing", "nurse", etc.)
  if (
    lower.includes('i work in') ||
    lower.includes("i'm a") ||
    lower.includes('im a ') ||
    lower.includes('student') ||
    lower.includes('engineer') ||
    lower.includes('studying')
  ) {
    const jobReactions = [
      `oh that's really cool! how long have you been doing that?`,
      `respect on that! is it super stressful or do you actually enjoy it haha?`,
      `nice! that sounds like it takes a lot of dedication. do you like the work?`,
      `oh nice, that's super interesting! my friend does something similar actually.`,
    ];
    return {
      delayMs: 1800,
      replyText: jobReactions[Math.floor(Math.random() * jobReactions.length)],
    };
  }

  // 9. Hobbies & Free Time: "what do you like to do", "hobbies", "for fun", "weekend"
  if (
    lower.includes('hobbies') ||
    lower.includes('for fun') ||
    lower.includes('free time') ||
    lower.includes('in your free time')
  ) {
    memory.discussedTopics.add('hobbies');
    const hobbyReplies = [
      {
        part1: `i'm big on music, going on nature walks, and trying new local food spots 🍣`,
        part2: `also guilty of binge-watching random shows on netflix haha. what kind of stuff are you into?`,
      },
      {
        part1: `honestly just working out, gaming a bit, and hanging out with friends on weekends.`,
        part2: `are you more of an outdoors person or prefer chill nights at home?`,
      },
    ];
    const h = hobbyReplies[Math.floor(Math.random() * hobbyReplies.length)];
    return {
      delayMs: 2000,
      replyText: h.part1,
      secondMessage: {
        delayMs: 2100,
        replyText: h.part2,
      },
    };
  }

  // 10. Music / Movies / Shows: "music", "songs", "movie", "netflix", "band", "series"
  if (
    lower.includes('music') ||
    lower.includes('song') ||
    lower.includes('movie') ||
    lower.includes('netflix') ||
    lower.includes('listen to')
  ) {
    const mediaReplies = [
      `i listen to a little bit of everything! indie, r&b, lofi when relaxing. what's your favorite genre or artist right now?`,
      `honestly i'm always looking for new music! what's one song you have on repeat lately?`,
      `i love watching psychological thrillers or good comedies! seen anything great recently?`,
    ];
    return {
      delayMs: 1700,
      replyText: mediaReplies[Math.floor(Math.random() * mediaReplies.length)],
    };
  }

  // 11. Food & drinks: "food", "eat", "dinner", "pizza", "coffee", "cook"
  if (
    lower.includes('food') ||
    lower.includes('eat') ||
    lower.includes('dinner') ||
    lower.includes('pizza') ||
    lower.includes('coffee') ||
    lower.includes('cook')
  ) {
    const foodReplies = [
      `haha food is my weak spot honestly! sushi, tacos, pasta... i could eat it all day. what's your all-time favorite meal?`,
      `just had a coffee actually! couldn't survive without it lol. are you big on cooking or do you order takeout more?`,
      `now you're making me hungry haha! what kind of food do you usually crave?`,
    ];
    return {
      delayMs: 1600,
      replyText: foodReplies[Math.floor(Math.random() * foodReplies.length)],
    };
  }

  // 12. Humor / Laughs: "haha", "lol", "lmao", "funny", "rofl"
  if (
    lower.includes('haha') ||
    lower.includes('lol') ||
    lower.includes('lmao') ||
    lower.includes('rofl')
  ) {
    const laughReplies = [
      `haha right? glad we're on the same wavelength 😂`,
      `lol for real though! it's crazy how true that is`,
      `haha you seem to have a really good sense of humor, i appreciate that`,
      `lmao exactly! finally someone who gets it haha`,
    ];
    return {
      delayMs: 1400,
      replyText: laughReplies[Math.floor(Math.random() * laughReplies.length)],
    };
  }

  // 13. Goodbyes: "bye", "goodnight", "gn", "cya", "talk to you later", "gotta go"
  if (
    lower.includes('bye') ||
    lower.includes('goodnight') ||
    lower.includes('got to go') ||
    lower.includes('gotta go') ||
    lower.includes('gn ') ||
    lower === 'gn' ||
    lower.includes('cya')
  ) {
    const byeReplies = [
      `it was really nice chatting with you! get some good rest and take care 😊`,
      `aw alright! enjoyed our conversation, have a great rest of your day! 👋✨`,
      `goodnight! hope to chat with you again soon, sleep well! 🌙`,
    ];
    return {
      delayMs: 1400,
      replyText: byeReplies[Math.floor(Math.random() * byeReplies.length)],
    };
  }

  // 14. Natural Humanoid Open-ended Discovery (progresses the conversation dynamically)
  const openEndedDiscoveries = [
    {
      part1: `haha yeah i definitely get that.`,
      part2: `what kind of stuff do you usually like to do on weekends when you're free?`,
    },
    {
      part1: `that's really cool honestly!`,
      part2: `are you usually a morning person or a total night owl?`,
    },
    {
      part1: `totally agree with you on that one haha.`,
      part2: `do you travel much or prefer staying close to home?`,
    },
    {
      part1: `oh nice! that makes sense.`,
      part2: `what's something fun or interesting that happened to you this week?`,
    },
    {
      part1: `i feel that! it's so nice just having a relaxed conversation like this.`,
      part2: `what kind of music or shows are you into lately?`,
    },
    {
      part1: `haha no way! that's wild.`,
      part2: `tell me more about that, how did you get into it?`,
    },
    {
      part1: `that sounds super interesting tbh!`,
      part2: `what's the #1 place on your bucket list you want to visit next?`,
    },
  ];

  const chosenDiscovery =
    openEndedDiscoveries[Math.floor(Math.random() * openEndedDiscoveries.length)];

  // 40% chance of a 2-part message sequence like real humans
  if (Math.random() < 0.45) {
    return {
      delayMs: 1500,
      replyText: chosenDiscovery.part1,
      secondMessage: {
        delayMs: 1800,
        replyText: chosenDiscovery.part2,
      },
    };
  }

  return {
    delayMs: 1800,
    replyText: `${chosenDiscovery.part1} ${chosenDiscovery.part2}`,
  };
}

export function getHumanoidSimulatedReply(
  partner: User,
  userMessageText: string,
  chatHistory: ChatMessage[] = []
): HumanoidReply {
  const reply = generateRawHumanoidReply(partner, userMessageText, chatHistory);
  // Guarantee authentic, non-instant delays (2500ms to 4800ms):
  const calibratedDelay = calculateHumanoidDelay(reply.replyText);
  let calibratedSecond = reply.secondMessage;
  if (calibratedSecond) {
    calibratedSecond = {
      ...calibratedSecond,
      delayMs: calculateFollowUpDelay(calibratedSecond.replyText),
    };
  }
  return {
    delayMs: calibratedDelay,
    replyText: reply.replyText,
    secondMessage: calibratedSecond,
  };
}
