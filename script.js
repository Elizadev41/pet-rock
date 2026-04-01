            const MAX_HAPPINESS = 100;
            const MIN_HAPPINESS = 0;
            const DECAY_EVERY_MS = 25 * 60 * 1000;
            const DECAY_AMOUNT = 5;
            const POSITIVE_BOOST = 2;
            const NEGATIVE_PENALTY = 12;
            const QUOTE_HISTORY_LIMIT = 5;

            const ROCK_IMAGES = {
                happy: "rock images/download (3).png",
                neutral: "rock images/download (2).jpg",
                sad: "rock images/raf,360x360,075,t,fafafa_ca443f4786.u2.jpg",
                angry: "rock images/download (4).png"
            };

            const positiveResponses = [
                "Rock appreciates the kindness.",
                "That made the little stone feel seen.",
                "Good energy received.",
                "Rock is vibing with that.",
                "That was nourishing."
            ];

            const negativeResponses = [
                "Rock heard that and lost some sparkle.",
                "Mean words detected. Happiness reduced.",
                "That landed like a pebble to the heart.",
                "Rock is not okay with that.",
                "Kindness is part of the wellness plan."
            ];

            const negativePatterns = [
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
                "trash"
            ];

            let happiness = loadNumber("happiness", 50);
            let lastDecayAt = loadNumber("lastDecayAt", Date.now());
            let lastFedAt = loadNumber("lastFedAt", 0);
            let bornAt = loadNumber("bornAt", Date.now());
            let quoteHistory = loadArray("quoteHistory", []);

            function loadNumber(key, fallback) {
                const value = parseInt(localStorage.getItem(key), 10);
                return Number.isNaN(value) ? fallback : value;
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
                localStorage.setItem("happiness", String(happiness));
                localStorage.setItem("lastDecayAt", String(lastDecayAt));
                localStorage.setItem("lastFedAt", String(lastFedAt));
                localStorage.setItem("bornAt", String(bornAt));
                localStorage.setItem("quoteHistory", JSON.stringify(quoteHistory));
            }

            function clamp(value) {
                return Math.max(MIN_HAPPINESS, Math.min(MAX_HAPPINESS, value));
            }

            function containsNegativeLanguage(text) {
                const normalized = text.toLowerCase().trim();
                return negativePatterns.some((pattern) => normalized.includes(pattern));
            }

            function applyDecay() {
                const now = Date.now();
                const elapsed = now - lastDecayAt;
                const decaySteps = Math.floor(elapsed / DECAY_EVERY_MS);

                if (decaySteps > 0) {
                    happiness = clamp(happiness - (decaySteps * DECAY_AMOUNT));
                    lastDecayAt += decaySteps * DECAY_EVERY_MS;
                    saveState();
                }
            }

            function formatRelativeTime(timestamp) {
                if (!timestamp) return "Never";

                const diff = Date.now() - timestamp;
                const minute = 60 * 1000;
                const hour = 60 * minute;
                const day = 24 * hour;

                if (diff < minute) return "just now";

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
                return Math.max(1, Math.floor((Date.now() - bornAt) / dayMs) + 1);
            }

            function getMoodConfig() {
                if (happiness >= 75) {
                    return { label: "Happy", image: ROCK_IMAGES.happy, color: "#5bd18b" };
                }

                if (happiness >= 45) {
                    return { label: "Calm", image: ROCK_IMAGES.neutral, color: "#7d8cff" };
                }

                if (happiness >= 20) {
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

                if (quoteHistory.length === 0) {
                    const emptyItem = document.createElement("li");
                    emptyItem.textContent = "No quotes yet.";
                    historyList.appendChild(emptyItem);
                    return;
                }

                quoteHistory.forEach((entry) => {
                    const item = document.createElement("li");
                    item.textContent = entry.text + " (" + formatRelativeTime(entry.at) + ")";
                    historyList.appendChild(item);
                });
            }

            function updateUI() {
                applyDecay();

                const mood = getMoodConfig();
                const timeUntilNextDecay = Math.max(
                    0,
                    Math.ceil((DECAY_EVERY_MS - (Date.now() - lastDecayAt)) / 60000)
                );

                document.getElementById("happinessText").innerText = "Happiness: " + happiness;
                document.getElementById("fill").style.width = happiness + "%";
                document.getElementById("fill").style.background = mood.color;
                document.getElementById("moodText").innerText = "Mood: " + mood.label;
                document.getElementById("rockImage").src = mood.image;
                document.getElementById("decayText").innerText =
                    "-" + DECAY_AMOUNT + " every 25 min, next in " + timeUntilNextDecay + " min";
                document.getElementById("lastFedText").innerText = formatRelativeTime(lastFedAt);
                document.getElementById("daysAliveText").innerText = "Day " + getDaysAlive();
                document.getElementById("lastQuote").innerText =
                    quoteHistory.length > 0 ? quoteHistory[0].text : "Nothing yet";

                renderHistory();
            }

            function feedRock() {
                const quoteInput = document.getElementById("quote");
                const quote = quoteInput.value.trim();
                if (!quote) return;

                applyDecay();

                if (containsNegativeLanguage(quote)) {
                    happiness = clamp(happiness - NEGATIVE_PENALTY);
                    document.getElementById("response").innerText =
                        negativeResponses[Math.floor(Math.random() * negativeResponses.length)];
                } else {
                    happiness = clamp(happiness + POSITIVE_BOOST);
                    document.getElementById("response").innerText =
                        positiveResponses[Math.floor(Math.random() * positiveResponses.length)];
                }

                lastFedAt = Date.now();
                lastDecayAt = Date.now();
                quoteHistory.unshift({ text: quote, at: lastFedAt });
                quoteHistory = quoteHistory.slice(0, QUOTE_HISTORY_LIMIT);
                quoteInput.value = "";

                saveState();
                animateRock();
                updateUI();
            }

            setInterval(updateUI, 60 * 1000);
            updateUI();
