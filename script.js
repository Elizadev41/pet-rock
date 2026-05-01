const MAX_HAPPINESS = 100;
const MIN_HAPPINESS = 0;
const DECAY_EVERY_MS = 25 * 60 * 1000;
const DECAY_AMOUNT = 5;
const BASIC_BOOST = 2;
const GOOD_BOOST = 4;
const AMAZING_BOOST = 8;
const NEGATIVE_PENALTY = 12;
const QUOTE_HISTORY_LIMIT = 5;

const ROCK_IMAGES = {
    happy: "rock images/download (3).png",
    neutral: "rock images/download (2).jpg",
    sad: "rock images/raf,360x360,075,t,fafafa_ca443f4786.u2.jpg",
    angry: "rock images/download (4).png"
};

const ROCK_NAMES = [
    "Pebble",
    "Granite",
    "Basalt",
    "Marble",
    "Slate",
    "Flint",
    "Jasper",
    "Echo",
    "Moss",
    "Atlas",
    "Nova",
    "Clover"
];

const PERSONALITY_RESPONSES = {
    cheerful: {
        positive: [
            "{name} is glowing after that.",
            "{name} just soaked up every kind word.",
            "{name} feels like the happiest pebble alive.",
            "That gave {name} a sunny little sparkle.",
            "{name} is absolutely delighted."
        ],
        negative: [
            "{name} wilted a little hearing that.",
            "{name} is trying to stay upbeat, but ouch.",
            "That dimmed {name}'s sparkle.",
            "{name} took that one to heart.",
            "{name} needs a kinder vibe than that."
        ]
    },
    stoic: {
        positive: [
            "{name} accepts your kindness with quiet appreciation.",
            "{name} gives a steady, satisfied nod.",
            "That landed well. {name} feels stronger.",
            "{name} remains composed, but clearly pleased.",
            "{name} stores that kindness carefully."
        ],
        negative: [
            "{name} endures, but morale has dropped.",
            "{name} says nothing, yet the damage is visible.",
            "That was unkind. {name} felt it.",
            "{name} has entered a disappointed silence.",
            "{name} would prefer respect."
        ]
    },
    dramatic: {
        positive: [
            "{name} is overwhelmed with joy and elegance.",
            "{name} declares this the compliment of the century.",
            "At last, {name} feels truly understood.",
            "{name} is thriving in the spotlight of your praise.",
            "That sent {name} into a glorious emotional spiral."
        ],
        negative: [
            "{name} has collapsed into theatrical despair.",
            "A tragedy! {name} cannot believe you said that.",
            "{name} is clutching imaginary pearls.",
            "That wounded {name}'s very geological soul.",
            "{name} will be dramatic about this for hours."
        ]
    }
};

const QUALITY_KEYWORDS = [
    "love",
    "amazing",
    "awesome",
    "great",
    "wonderful",
    "sweet",
    "brilliant",
    "best",
    "proud",
    "beautiful",
    "fantastic",
    "adorable"
];

const NEGATIVE_PATTERNS = [
    "u suck",
    "you suck",
    "stupid",
    "dumb",
    "hate you",
    "i hate you",
    "idiot",
    "loser",
    "ugly",
    "worst",
    "trash",
    "terrible",
    "awful",
    "horrible",
    "nasty",
    "sucks",
    "suck",
    "crap",
    "fool",
    "annoying",
    "pathetic",
    "kill you",
    "die",
    "death",
    "worthless",
    "garbage",
    "trash",
    "lame",
    "stink",
    "disgusting",
    "gross",
    "sucks",
    "suck",
    "crap",
    "fool",
    "annoying",
    "pathetic",
    "67",
    "69",
    "41"
];

const BADGE_DEFS = [
    {
        id: "first_feed",
        title: "First Pebble",
        description: "Feed your rock for the first time.",
        check: (state) => state.totalFeeds >= 1
    },
    {
        id: "ten_quotes",
        title: "Talkative",
        description: "Feed 10 quotes.",
        check: (state) => state.totalFeeds >= 10
    },
    {
        id: "fifty_quotes",
        title: "Stone Confidant",
        description: "Feed 50 quotes.",
        check: (state) => state.totalFeeds >= 50
    },
    {
        id: "hundred_quotes",
        title: "Quote Machine",
        description: "Feed 100 quotes.",
        check: (state) => state.totalFeeds >= 100
    },
    {
        id: "streak_3",
        title: "Warm Up",
        description: "Reach a 3 day streak.",
        check: (state) => state.longestStreak >= 3
    },
    {
        id: "streak_5",
        title: "Steady Care",
        description: "Reach a 5 day streak.",
        check: (state) => state.longestStreak >= 5
    },
    {
        id: "streak_7",
        title: "Week of Love",
        description: "Reach a 7 day streak.",
        check: (state) => state.longestStreak >= 7
    },
    {
        id: "streak_14",
        title: "Fortnight Friend",
        description: "Reach a 14 day streak.",
        check: (state) => state.longestStreak >= 14
    },
    {
        id: "streak_30",
        title: "Legendary Routine",
        description: "Reach a 30 day streak.",
        check: (state) => state.longestStreak >= 30
    },
    {
        id: "max_happiness",
        title: "Pure Joy",
        description: "Fill happiness to 100.",
        check: (state) => state.maxHappinessSeen >= 100
    },
    {
        id: "reviver",
        title: "Back From The Brink",
        description: "Revive your fainted rock once.",
        check: (state) => state.totalRevives >= 1
    },
    {
        id: "kind_keeper",
        title: "Heart of Gold",
        description: "Send 25 positive quotes.",
        check: (state) => state.positiveFeeds >= 25
    }
];

let badgePopupTimeout = null;
let pendingRockName = "";

const state = {
    happiness: loadNumber("happiness", 50),
    lastDecayAt: loadNumber("lastDecayAt", Date.now()),
    lastFedAt: loadNumber("lastFedAt", 0),
    bornAt: loadNumber("bornAt", Date.now()),
    quoteHistory: loadArray("quoteHistory", []),
    totalFeeds: loadNumber("totalFeeds", 0),
    positiveFeeds: loadNumber("positiveFeeds", 0),
    currentStreak: loadNumber("currentStreak", 0),
    longestStreak: loadNumber("longestStreak", 0),
    lastStreakDate: loadString("lastStreakDate", ""),
    badges: loadArray("badges", []),
    maxHappinessSeen: loadNumber("maxHappinessSeen", 50),
    totalRevives: loadNumber("totalRevives", 0),
    bestQualityTier: loadString("bestQualityTier", ""),
    rockName: loadString("rockName", ""),
    isFainted: loadBoolean("isFainted", false)
};

initializeRockIdentity();
saveState();

function loadNumber(key, fallback) {
    const value = parseInt(localStorage.getItem(key), 10);
    return Number.isNaN(value) ? fallback : value;
}

function loadString(key, fallback) {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
}

function loadBoolean(key, fallback) {
    const value = localStorage.getItem(key);
    if (value === null) {
        return fallback;
    }

    return value === "true";
}

function loadArray(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function saveState() {
    localStorage.setItem("happiness", String(state.happiness));
    localStorage.setItem("lastDecayAt", String(state.lastDecayAt));
    localStorage.setItem("lastFedAt", String(state.lastFedAt));
    localStorage.setItem("bornAt", String(state.bornAt));
    localStorage.setItem("quoteHistory", JSON.stringify(state.quoteHistory));
    localStorage.setItem("totalFeeds", String(state.totalFeeds));
    localStorage.setItem("positiveFeeds", String(state.positiveFeeds));
    localStorage.setItem("currentStreak", String(state.currentStreak));
    localStorage.setItem("longestStreak", String(state.longestStreak));
    localStorage.setItem("lastStreakDate", state.lastStreakDate);
    localStorage.setItem("badges", JSON.stringify(state.badges));
    localStorage.setItem("maxHappinessSeen", String(state.maxHappinessSeen));
    localStorage.setItem("totalRevives", String(state.totalRevives));
    localStorage.setItem("bestQualityTier", state.bestQualityTier);
    localStorage.setItem("rockName", state.rockName);
    localStorage.setItem("isFainted", String(state.isFainted));
}

function initializeRockIdentity() {
    if (!state.rockName && !pendingRockName) {
        pendingRockName = getRandomRockName();
    }
}

function getRandomRockName() {
    const randomIndex = Math.floor(Math.random() * ROCK_NAMES.length);
    return ROCK_NAMES[randomIndex];
}

function clamp(value) {
    return Math.max(MIN_HAPPINESS, Math.min(MAX_HAPPINESS, value));
}

function containsNegativeLanguage(text) {
    const normalized = text.toLowerCase().trim();
    return NEGATIVE_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function getLocalDateStamp(timestamp = Date.now()) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

function getPreviousDateStamp(dateStamp) {
    if (!dateStamp) {
        return "";
    }

    const [year, month, day] = dateStamp.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    date.setDate(date.getDate() - 1);
    return getLocalDateStamp(date.getTime());
}

function getPersonality() {
    const hash = state.rockName
        .split("")
        .reduce((total, letter) => total + letter.charCodeAt(0), 0);
    const personalities = ["cheerful", "stoic", "dramatic"];
    return personalities[hash % personalities.length];
}

function applyTemplate(template) {
    return template.replaceAll("{name}", state.rockName);
}

function getRandomResponse(kind) {
    const personality = getPersonality();
    const templates = PERSONALITY_RESPONSES[personality][kind];
    const template = templates[Math.floor(Math.random() * templates.length)];
    return applyTemplate(template);
}

function assessQuality(text) {
    const trimmed = text.trim();
    const words = trimmed.split(/\s+/).filter(Boolean);
    const normalized = trimmed.toLowerCase();
    let score = 0;

    if (trimmed.length >= 12) {
        score += 1;
    }

    if (trimmed.length >= 28) {
        score += 1;
    }

    if (words.length >= 4) {
        score += 1;
    }

    if (words.length >= 8) {
        score += 1;
    }

    if (QUALITY_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
        score += 2;
    }

    if (/[!?]/.test(trimmed)) {
        score += 1;
    }

    if (score >= 5) {
        return { label: "Amazing", boost: AMAZING_BOOST, className: "amazing" };
    }

    if (score >= 3) {
        return { label: "Good", boost: GOOD_BOOST, className: "good" };
    }

    return { label: "Basic", boost: BASIC_BOOST, className: "" };
}

function applyDecay() {
    const now = Date.now();
    const elapsed = now - state.lastDecayAt;
    const decaySteps = Math.floor(elapsed / DECAY_EVERY_MS);

    if (decaySteps > 0) {
        state.happiness = clamp(state.happiness - decaySteps * DECAY_AMOUNT);
        state.lastDecayAt += decaySteps * DECAY_EVERY_MS;

        if (state.happiness === 0) {
            state.isFainted = true;
            state.currentStreak = 0;
        }

        saveState();
    }
}

function formatRelativeTime(timestamp) {
    if (!timestamp) {
        return "Never";
    }

    const diff = Date.now() - timestamp;
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
        return "just now";
    }

    if (diff < hour) {
        const minutes = Math.floor(diff / minute);
        return minutes + " minute" + (minutes === 1 ? "" : "s") + " ago";
    }

    if (diff < day) {
        const hours = Math.floor(diff / hour);
        return hours + " hour" + (hours === 1 ? "" : "s") + " ago";
    }

    const days = Math.floor(diff / day);
    return days + " day" + (days === 1 ? "" : "s") + " ago";
}

function getDaysAlive() {
    const dayMs = 24 * 60 * 60 * 1000;
    return Math.max(1, Math.floor((Date.now() - state.bornAt) / dayMs) + 1);
}

function getMoodConfig() {
    if (state.isFainted) {
        return { label: "Fainted", image: ROCK_IMAGES.angry, color: "#a87070" };
    }

    if (state.happiness >= 75) {
        return { label: "Happy", image: ROCK_IMAGES.happy, color: "#5bd18b" };
    }

    if (state.happiness >= 45) {
        return { label: "Calm", image: ROCK_IMAGES.neutral, color: "#7d8cff" };
    }

    if (state.happiness >= 20) {
        return { label: "Sad", image: ROCK_IMAGES.sad, color: "#ff9f6b" };
    }

    return { label: "Angry", image: ROCK_IMAGES.angry, color: "#ff7171" };
}

function animateRock() {
    const image = document.getElementById("rockImage");
    image.classList.remove("bump");
    void image.offsetWidth;
    image.classList.add("bump");
}

function renderHistory() {
    const historyList = document.getElementById("historyList");
    historyList.innerHTML = "";

    if (state.quoteHistory.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.textContent = "No messages yet.";
        historyList.appendChild(emptyItem);
        return;
    }

    state.quoteHistory.forEach((entry) => {
        const item = document.createElement("li");
        let text = entry.text + " (" + formatRelativeTime(entry.at) + ")";

        if (entry.quality) {
            text += " - " + entry.quality;
        }

        item.textContent = text;
        historyList.appendChild(item);
    });
}

function getBadgeState() {
    return {
        totalFeeds: state.totalFeeds,
        positiveFeeds: state.positiveFeeds,
        longestStreak: state.longestStreak,
        maxHappinessSeen: state.maxHappinessSeen,
        totalRevives: state.totalRevives,
        bestQualityTier: state.bestQualityTier
    };
}

function renderBadges() {
    const badgeGrid = document.getElementById("badgeGrid");
    badgeGrid.innerHTML = "";

    BADGE_DEFS.forEach((badgeDef) => {
        const badge = document.createElement("div");
        const unlocked = state.badges.includes(badgeDef.id);
        badge.className = "badge " + (unlocked ? "unlocked" : "locked");

        const title = document.createElement("span");
        title.className = "badge-title";
        title.textContent = badgeDef.title;

        const description = document.createElement("span");
        description.className = "badge-desc";
        description.textContent = badgeDef.description;

        badge.appendChild(title);
        badge.appendChild(description);
        badgeGrid.appendChild(badge);
    });
}

function showBadgePopup(title) {
    const popup = document.getElementById("badgePopup");
    popup.textContent = "Badge earned: " + title;
    popup.classList.add("show");

    if (badgePopupTimeout) {
        clearTimeout(badgePopupTimeout);
    }

    badgePopupTimeout = setTimeout(() => {
        popup.classList.remove("show");
    }, 2400);
}

function unlockBadges() {
    const badgeState = getBadgeState();
    let unlockedAny = false;

    BADGE_DEFS.forEach((badgeDef) => {
        if (!state.badges.includes(badgeDef.id) && badgeDef.check(badgeState)) {
            state.badges.push(badgeDef.id);
            showBadgePopup(badgeDef.title);
            unlockedAny = true;
        }
    });

    if (unlockedAny) {
        saveState();
    }
}

function updateStreak(nowDateStamp) {
    if (state.lastStreakDate === nowDateStamp) {
        return;
    }

    if (state.lastStreakDate === getPreviousDateStamp(nowDateStamp)) {
        state.currentStreak += 1;
    } else {
        state.currentStreak = 1;
    }

    state.lastStreakDate = nowDateStamp;
    state.longestStreak = Math.max(state.longestStreak, state.currentStreak);
}

function updateQualityTag(quality) {
    const qualityTag = document.getElementById("qualityTag");

    if (!quality) {
        qualityTag.className = "quality-tag hidden";
        qualityTag.textContent = "";
        return;
    }

    const classNames = ["quality-tag"];

    if (quality.className) {
        classNames.push(quality.className);
    }

    qualityTag.className = classNames.join(" ");
    qualityTag.textContent = quality.label + " +" + quality.boost;
}

function setResponseText(text, quality) {
    document.getElementById("responseText").innerText = text;
    updateQualityTag(quality);
}

function setupEventListeners() {
    const startButton = document.getElementById("startPetRockButton");
    const randomizeButton = document.getElementById("randomizeRockNameButton");
    const quoteInput = document.getElementById("quote");
    const feedButton = document.getElementById("feedRockButton");
    const reviveButton = document.getElementById("reviveRockButton");

    startButton.addEventListener("click", startPetRock);
    randomizeButton.addEventListener("click", chooseRandomRockName);
    feedButton.addEventListener("click", feedRock);
    reviveButton.addEventListener("click", reviveRock);

    quoteInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            feedRock();
        }
    });
}

function syncWelcomeScreen() {
    const hasName = Boolean(state.rockName && state.rockName.trim());
    document.getElementById("welcomeScreen").classList.toggle("hidden", hasName);
    document.querySelector(".app").classList.toggle("hidden", !hasName);

    if (!hasName) {
        document.getElementById("rockNamePreview").innerText = pendingRockName || getRandomRockName();
    }
}

function updateUI() {
    syncWelcomeScreen();

    if (!state.rockName) {
        return;
    }

    applyDecay();
    const todayStamp = getLocalDateStamp();
    const yesterdayStamp = getPreviousDateStamp(todayStamp);

    if (
        state.currentStreak > 0 &&
        state.lastStreakDate &&
        state.lastStreakDate !== todayStamp &&
        state.lastStreakDate !== yesterdayStamp
    ) {
        state.currentStreak = 0;
        saveState();
    }

    const mood = getMoodConfig();
    const timeUntilNextDecay = Math.max(
        0,
        Math.ceil((DECAY_EVERY_MS - (Date.now() - state.lastDecayAt)) / 60000)
    );
    const personality = getPersonality();

    document.getElementById("rockIdentity").innerText =
        state.rockName + " the " + personality + " rock";
    document.getElementById("happinessText").innerText = "Happiness: " + state.happiness;
    document.getElementById("fill").style.width = state.happiness + "%";
    document.getElementById("fill").style.background = mood.color;
    document.getElementById("moodText").innerText = "Mood: " + mood.label;
    document.getElementById("rockImage").src = mood.image;
    document.getElementById("rockImage").style.opacity = state.isFainted ? "0.72" : "1";
    document.getElementById("decayText").innerText =
        "-" + DECAY_AMOUNT + " every 25 min, next in " + timeUntilNextDecay + " min";
    document.getElementById("lastFedText").innerText = formatRelativeTime(state.lastFedAt);
    document.getElementById("daysAliveText").innerText = "Day " + getDaysAlive();
    document.getElementById("lastQuote").innerText =
        state.quoteHistory.length > 0 ? state.quoteHistory[0].text : "Nothing yet";
    document.getElementById("streakText").innerText =
        state.currentStreak + " day" + (state.currentStreak === 1 ? "" : "s");
    document.getElementById("longestStreakText").innerText =
        state.longestStreak + " day" + (state.longestStreak === 1 ? "" : "s");

    unlockBadges();

    const streakBanner = document.getElementById("streakBanner");
    streakBanner.innerText = "\uD83D\uDD25 " + state.currentStreak + " days in a row!";
    streakBanner.classList.toggle("hidden", state.currentStreak < 2 || state.isFainted);

    document.getElementById("feedSection").classList.toggle("hidden", state.isFainted);
    document.getElementById("faintOverlay").classList.toggle("hidden", !state.isFainted);

    renderHistory();
    renderBadges();
}

function setBestQuality(qualityLabel) {
    const ranks = { "": 0, Basic: 1, Good: 2, Amazing: 3 };

    if (ranks[qualityLabel] > ranks[state.bestQualityTier]) {
        state.bestQualityTier = qualityLabel;
    }
}

function feedRock() {
    if (state.isFainted) {
        return;
    }

    const quoteInput = document.getElementById("quote");
    const quote = quoteInput.value.trim();

    if (!quote) {
        return;
    }

    applyDecay();

    if (state.isFainted) {
        updateUI();
        return;
    }

    const isNegative = containsNegativeLanguage(quote);
    const quality = isNegative ? null : assessQuality(quote);
    const now = Date.now();
    const todayStamp = getLocalDateStamp(now);

    state.totalFeeds += 1;
    state.lastFedAt = now;
    state.lastDecayAt = now;

    if (isNegative) {
        state.happiness = clamp(state.happiness - NEGATIVE_PENALTY);
        setResponseText(getRandomResponse("negative"), null);
    } else {
        state.positiveFeeds += 1;
        state.happiness = clamp(state.happiness + quality.boost);
        setResponseText(getRandomResponse("positive"), quality);
        setBestQuality(quality.label);

        if (quality.label === "Amazing") {
            // Removed amazingQuotes increment
        }
    }

    updateStreak(todayStamp);
    state.maxHappinessSeen = Math.max(state.maxHappinessSeen, state.happiness);

    state.quoteHistory.unshift({
        text: quote,
        at: now,
        quality: quality ? quality.label : "Rough"
    });
    state.quoteHistory = state.quoteHistory.slice(0, QUOTE_HISTORY_LIMIT);

    if (state.happiness === 0) {
        state.isFainted = true;
        state.currentStreak = 0;
    }

    quoteInput.value = "";
    saveState();
    animateRock();
    updateUI();
}

function reviveRock() {
    state.isFainted = false;
    state.happiness = 25;
    state.currentStreak = 0;
    state.lastStreakDate = "";
    state.lastDecayAt = Date.now();
    state.totalRevives += 1;
    saveState();
    setResponseText(state.rockName + " is back on its little rocky feet.", null);
    updateUI();
}

function startPetRock() {
    state.rockName = pendingRockName || getRandomRockName();
    saveState();
    syncWelcomeScreen();
    updateUI();
}

function chooseRandomRockName() {
    let nextName = getRandomRockName();

    if (ROCK_NAMES.length > 1) {
        while (nextName === pendingRockName) {
            nextName = getRandomRockName();
        }
    }

    pendingRockName = nextName;
    document.getElementById("rockNamePreview").innerText = pendingRockName;
}

window.feedRock = feedRock;
window.reviveRock = reviveRock;
window.startPetRock = startPetRock;
window.chooseRandomRockName = chooseRandomRockName;

setupEventListeners();
setInterval(updateUI, 60 * 1000);
updateUI();

// ============================================
// TAB NAVIGATION SYSTEM
// ============================================

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));
            
            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            document.getElementById(targetTab + 'Tab').classList.add('active');
            
            // Save active tab
            localStorage.setItem('activeTab', targetTab);
        });
    });
    
    // Restore last active tab
    const savedTab = localStorage.getItem('activeTab') || 'rock';
    const savedButton = document.querySelector(`[data-tab="${savedTab}"]`);
    if (savedButton) {
        savedButton.click();
    }
}

// ============================================
// JOURNAL TAB FUNCTIONALITY
// ============================================

const journalState = {
    entries: JSON.parse(localStorage.getItem('journalEntries') || '[]'),
    todayMood: null
};

function initJournal() {
    updateJournalDate();
    renderJournalEntries();
    
    // Mood selector
    document.querySelectorAll('.mood-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            journalState.todayMood = btn.dataset.mood;
        });
    });
    
    // Save journal entry
    document.getElementById('saveJournalButton').addEventListener('click', saveJournalEntry);
}

function updateJournalDate() {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    document.getElementById('journalDate').textContent = formatted;
}

function saveJournalEntry() {
    const textarea = document.getElementById('journalTextarea');
    const text = textarea.value.trim();
    
    if (!text) {
        alert('Please write something in your journal first!');
        return;
    }
    
    const entry = {
        text: text,
        mood: journalState.todayMood || 'okay',
        date: new Date().toISOString(),
        dateStamp: getLocalDateStamp()
    };
    
    // Check if entry for today already exists
    const todayStamp = getLocalDateStamp();
    const existingIndex = journalState.entries.findIndex(e => e.dateStamp === todayStamp);
    
    if (existingIndex >= 0) {
        journalState.entries[existingIndex] = entry;
    } else {
        journalState.entries.unshift(entry);
    }
    
    // Keep only last 30 entries
    journalState.entries = journalState.entries.slice(0, 30);
    
    localStorage.setItem('journalEntries', JSON.stringify(journalState.entries));
    
    // Give rock happiness boost
    if (state.rockName) {
        state.happiness = clamp(state.happiness + 5);
        state.maxHappinessSeen = Math.max(state.maxHappinessSeen, state.happiness);
        saveState();
        updateUI();
    }
    
    // Clear form
    textarea.value = '';
    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
    journalState.todayMood = null;
    
    renderJournalEntries();
    showFeedback('Journal saved! +5 happiness');
}

function renderJournalEntries() {
    const list = document.getElementById('journalList');
    
    if (journalState.entries.length === 0) {
        list.innerHTML = '<p class="empty-state">No entries yet. Start journaling today!</p>';
        return;
    }
    
    const moodEmojis = {        amazing: 'Amazing',        good: 'Good',        okay: 'Okay',        rough: 'Rough'
    };
    
    list.innerHTML = journalState.entries.map(entry => {
        const date = new Date(entry.date);
        const formatted = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
        });
        
        return `
            <div class="entry-card">
                <div class="entry-header">
                    <span class="entry-date">${formatted}</span>
                    <span class="entry-mood">${moodEmojis[entry.mood] || 'Okay'}</span>
                </div>
                <p class="entry-text">${entry.text}</p>
            </div>
        `;
    }).join('');
}

// ============================================
// POMODORO TIMER FUNCTIONALITY
// ============================================

const pomodoroState = {
    timeLeft: 25 * 60, // 25 minutes in seconds
    isRunning: false,
    isWorkSession: true,
    interval: null,
    sessionsToday: loadNumber('pomodoroSessionsToday', 0),
    sessionsTotal: loadNumber('pomodoroSessionsTotal', 0),
    lastSessionDate: loadString('pomodoroLastDate', ''),
    tasks: JSON.parse(localStorage.getItem('pomodoroTasks') || '[]')
};

function initPomodoro() {
    updateTimerDisplay();
    updatePomodoroStats();
    renderTasks();
    
    document.getElementById('startTimerButton').addEventListener('click', startTimer);
    document.getElementById('pauseTimerButton').addEventListener('click', pauseTimer);
    document.getElementById('resetTimerButton').addEventListener('click', resetTimer);
    document.getElementById('addTaskButton').addEventListener('click', addTask);
    
    // Check if it's a new day
    const today = getLocalDateStamp();
    if (pomodoroState.lastSessionDate !== today) {
        pomodoroState.sessionsToday = 0;
        pomodoroState.lastSessionDate = today;
        savePomodoroState();
    }
}

function startTimer() {
    pomodoroState.isRunning = true;
    document.getElementById('startTimerButton').classList.add('hidden');
    document.getElementById('pauseTimerButton').classList.remove('hidden');
    
    pomodoroState.interval = setInterval(() => {
        pomodoroState.timeLeft--;
        updateTimerDisplay();
        
        if (pomodoroState.timeLeft <= 0) {
            timerComplete();
        }
    }, 1000);
}

function pauseTimer() {
    pomodoroState.isRunning = false;
    clearInterval(pomodoroState.interval);
    document.getElementById('startTimerButton').classList.remove('hidden');
    document.getElementById('pauseTimerButton').classList.add('hidden');
}

function resetTimer() {
    pauseTimer();
    pomodoroState.timeLeft = pomodoroState.isWorkSession ? 25 * 60 : 5 * 60;
    updateTimerDisplay();
}

function timerComplete() {
    pauseTimer();
    
    if (pomodoroState.isWorkSession) {
        // Work session complete
        pomodoroState.sessionsToday++;
        pomodoroState.sessionsTotal++;
        pomodoroState.lastSessionDate = getLocalDateStamp();
        savePomodoroState();
        updatePomodoroStats();
        
        // Give rock happiness boost
        if (state.rockName) {
            state.happiness = clamp(state.happiness + 3);
            state.maxHappinessSeen = Math.max(state.maxHappinessSeen, state.happiness);
            saveState();
            updateUI();
        }
        
        showFeedback('Work session complete! +3 happiness');
        
        // Switch to break
        pomodoroState.isWorkSession = false;
        pomodoroState.timeLeft = 5 * 60;
    } else {
        // Break complete
        showFeedback('Break over! Ready for another session?');
        pomodoroState.isWorkSession = true;
        pomodoroState.timeLeft = 25 * 60;
    }
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes = Math.floor(pomodoroState.timeLeft / 60);
    const seconds = pomodoroState.timeLeft % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    document.getElementById('timerText').textContent = display;
    document.getElementById('timerLabel').textContent = pomodoroState.isWorkSession ? 'Work Session' : 'Break Time';
}

function updatePomodoroStats() {
    document.getElementById('sessionsToday').textContent = pomodoroState.sessionsToday;
    document.getElementById('sessionsTotal').textContent = pomodoroState.sessionsTotal;
}

function savePomodoroState() {
    localStorage.setItem('pomodoroSessionsToday', pomodoroState.sessionsToday);
    localStorage.setItem('pomodoroSessionsTotal', pomodoroState.sessionsTotal);
    localStorage.setItem('pomodoroLastDate', pomodoroState.lastSessionDate);
}

function addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();
    
    if (!text) return;
    
    pomodoroState.tasks.push({
        id: Date.now(),
        text: text,
        completed: false
    });
    
    localStorage.setItem('pomodoroTasks', JSON.stringify(pomodoroState.tasks));
    input.value = '';
    renderTasks();
}

function toggleTask(id) {
    const task = pomodoroState.tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        localStorage.setItem('pomodoroTasks', JSON.stringify(pomodoroState.tasks));
        renderTasks();
    }
}

function deleteTask(id) {
    pomodoroState.tasks = pomodoroState.tasks.filter(t => t.id !== id);
    localStorage.setItem('pomodoroTasks', JSON.stringify(pomodoroState.tasks));
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('taskList');
    
    if (pomodoroState.tasks.length === 0) {
        list.innerHTML = '<p class="empty-state">No tasks yet. Add what you\'re working on!</p>';
        return;
    }
    
    list.innerHTML = pomodoroState.tasks.map(task => `
        <li class="task-item">
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask(${task.id})"
            >
            <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
        </li>
    `).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function showFeedback(message) {
    const popup = document.getElementById('badgePopup');
    popup.textContent = message;
    popup.classList.add('show');
    
    setTimeout(() => {
        popup.classList.remove('show');
    }, 2400);
}

// Make functions globally available for inline event handlers
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// ============================================
// INITIALIZE EVERYTHING
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initJournal();
    initPomodoro();
});


