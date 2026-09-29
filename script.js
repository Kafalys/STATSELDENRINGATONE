/*
    ============================================================
    DONNÉES DE LA RUN
    ============================================================

    Les valeurs ci-dessous sont TEMPORAIRES.
    C'est ici que les vraies données de Tone seront renseignées.

    Pour un boss :
      attempts: 1  => vaincu au premier essai
      attempts: 2  => une mort avant la victoire
      attempts: 8  => sept morts avant la victoire

    IMPORTANT :
    Le jeu fournit ici le nombre de TENTATIVES.
    Le nombre de morts sur un boss = attempts - 1.
*/

const RUN_DATA = {
    totalBosses: 165,

    // Nombre de boss majeurs dans Elden Ring.
    // Valeur temporaire à confirmer selon la définition retenue pour la run.
    totalMajorBosses: 15,

    totalDays: null, // calculé automatiquement d'après les jours renseignés

    stream: {
        streamTime: "74h15",
        gameTime: "68h32",
        subs: 127,
        shopPoints: 48500
    },

    // Chaque entrée représente un boss vaincu.
    // day = jour de la victoire
    // attempts = nombre de tentatives avant la victoire incluse
    bosses: [
        { name: "Margit, le Déchu", day: 1, attempts: 4, major: true },
        { name: "Godrick le Greffé", day: 1, attempts: 2, major: true },
        { name: "Demi-Humain Chef", day: 1, attempts: 1, major: false },
        { name: "Rennala, Reine de la Pleine Lune", day: 2, attempts: 1, major: true },
        { name: "Radahn, Fléau des Astres", day: 2, attempts: 7, major: true },
        { name: "Chevalier du Creuset", day: 2, attempts: 3, major: false },
        { name: "Rykard, Seigneur du Blasphème", day: 3, attempts: 2, major: true },
        { name: "Morgott, Roi des Réprouvés", day: 3, attempts: 4, major: true },
        { name: "Géant de Feu", day: 4, attempts: 6, major: true },
        { name: "Godskin Duo", day: 4, attempts: 10, major: false },
        { name: "Maliketh, la Lame d'Ébène", day: 5, attempts: 12, major: true },
        { name: "Mohg, Seigneur du Sang", day: 5, attempts: 5, major: false },
        { name: "Malenia, Déesse de la Putréfaction", day: 6, attempts: 24, major: false },
        { name: "Radagon de l'Ordre d'Or", day: 7, attempts: 3, major: true },
        { name: "Bête d'Elden", day: 7, attempts: 2, major: true }
    ]
};

// ------------------------------------------------------------
// UTILITAIRES
// ------------------------------------------------------------

const $ = (id) => document.getElementById(id);

function formatNumber(value) {
    return new Intl.NumberFormat("fr-FR").format(value);
}

function formatPercent(value) {
    return `${value.toFixed(1).replace(".", ",")} %`;
}

function deathsFromAttempts(attempts) {
    return Math.max(0, attempts - 1);
}

function getBossesKilled() {
    return RUN_DATA.bosses.length;
}

function getTotalAttempts() {
    return RUN_DATA.bosses.reduce((sum, boss) => sum + boss.attempts, 0);
}

function getTotalDeaths() {
    return RUN_DATA.bosses.reduce((sum, boss) => sum + deathsFromAttempts(boss.attempts), 0);
}

function getFirstTryCount() {
    return RUN_DATA.bosses.filter(boss => boss.attempts === 1).length;
}

function getMajorBosses() {
    return RUN_DATA.bosses.filter(boss => boss.major);
}

function getDays() {
    return [...new Set(RUN_DATA.bosses.map(boss => boss.day))].sort((a, b) => a - b);
}

// ------------------------------------------------------------
// BILAN
// ------------------------------------------------------------

function renderSummary() {
    const killed = getBossesKilled();
    const deaths = getTotalDeaths();
    const firstTry = getFirstTryCount();
    const majors = getMajorBosses().length;
    const days = getDays();

    const bossPercent = killed / RUN_DATA.totalBosses * 100;
    const firstTryPercent = killed ? firstTry / killed * 100 : 0;
    const avgAttempts = killed ? getTotalAttempts() / killed : 0;

    $("boss-killed-main").textContent = `${killed} / ${RUN_DATA.totalBosses}`;
    $("boss-percent-main").textContent = `${formatPercent(bossPercent)} de l'ensemble des boss`;

    $("major-bosses").textContent = `${majors} / ${RUN_DATA.totalMajorBosses}`;
    $("total-deaths").textContent = formatNumber(deaths);
    $("first-try-count").textContent = `${firstTry} / ${killed}`;
    $("first-try-percent").textContent = formatPercent(firstTryPercent);
    $("days-count").textContent = days.length;
    $("avg-deaths").textContent = avgAttempts.toFixed(2).replace(".", ",");

    $("stream-time").textContent = RUN_DATA.stream.streamTime;
    $("game-time").textContent = RUN_DATA.stream.gameTime;
    $("subs").textContent = formatNumber(RUN_DATA.stream.subs);
    $("shop-points").textContent = formatNumber(RUN_DATA.stream.shopPoints);
}

// ------------------------------------------------------------
// JOURS
// ------------------------------------------------------------

let selectedDay = null;

function renderDayTabs() {
    const days = getDays();
    const tabs = $("day-tabs");
    tabs.innerHTML = "";

    days.forEach(day => {
        const button = document.createElement("button");
        button.className = "day-tab";
        button.type = "button";
        button.textContent = `JOUR ${day}`;
        button.dataset.day = day;

        button.addEventListener("click", () => {
            selectDay(day);
        });

        tabs.appendChild(button);
    });
}

function selectDay(day) {
    selectedDay = day;

    document.querySelectorAll(".day-tab").forEach(button => {
        button.classList.toggle("active", Number(button.dataset.day) === day);
    });

    const panel = $("day-panel");
    panel.style.animation = "none";
    void panel.offsetWidth;
    panel.style.animation = "panelIn .35s ease";

    renderDay(day);
}

function renderDay(day) {
    const bosses = RUN_DATA.bosses.filter(boss => boss.day === day);
    const attempts = bosses.reduce((sum, boss) => sum + boss.attempts, 0);
    const deaths = attempts - bosses.length;

    $("selected-day-title").textContent = day;
    $("day-boss-count").textContent = bosses.length;
    $("day-attempts").textContent = `${deaths} mort${deaths > 1 ? "s" : ""}`;

    const list = $("boss-list");
    list.innerHTML = "";

    bosses.forEach(boss => {
        const row = document.createElement("div");
        row.className = "boss-row";

        const name = document.createElement("span");
        name.className = `boss-name${boss.major ? " boss-major" : ""}`;
        name.textContent = boss.name;

        const result = document.createElement("div");
        result.className = "boss-result";

        const deaths = deathsFromAttempts(boss.attempts);
        result.appendChild(document.createTextNode(`☠ ${deaths} mort${deaths !== 1 ? "s" : ""}`));

        if (boss.attempts === 1) {
            const badge = document.createElement("span");
            badge.className = "first-try";
            badge.textContent = "FIRST TRY";
            result.appendChild(badge);
        }

        row.appendChild(name);
        row.appendChild(result);
        list.appendChild(row);
    });
}

// ------------------------------------------------------------
// TOP 5
// ------------------------------------------------------------

function renderTopFive() {
    const sorted = [...RUN_DATA.bosses]
        .sort((a, b) => {
            const deathDiff = deathsFromAttempts(b.attempts) - deathsFromAttempts(a.attempts);
            if (deathDiff !== 0) return deathDiff;
            return a.name.localeCompare(b.name);
        });

    // Gestion des égalités : même rang si même nombre de morts.
    const top = sorted.slice(0, 5);
    const list = $("top-five-list");
    list.innerHTML = "";

    let previousDeaths = null;
    let rank = 0;

    top.forEach((boss, index) => {
        const deaths = deathsFromAttempts(boss.attempts);

        if (deaths !== previousDeaths) {
            rank = index + 1;
            previousDeaths = deaths;
        }

        const row = document.createElement("div");
        row.className = "rank-row";

        row.innerHTML = `
            <span class="rank-number">${String(rank).padStart(2, "0")}</span>
            <span class="rank-name">${boss.name}</span>
            <span class="rank-value">☠ ${deaths}</span>
        `;

        list.appendChild(row);
    });
}

// ------------------------------------------------------------
// RECORDS
// ------------------------------------------------------------

function renderRecords() {
    const days = getDays();

    const deadliestBoss = [...RUN_DATA.bosses]
        .sort((a, b) => deathsFromAttempts(b.attempts) - deathsFromAttempts(a.attempts))[0];

    const dayStats = days.map(day => {
        const bosses = RUN_DATA.bosses.filter(boss => boss.day === day);
        const deaths = bosses.reduce((sum, boss) => sum + deathsFromAttempts(boss.attempts), 0);

        return { day, bossCount: bosses.length, deaths };
    });

    const mostProductive = [...dayStats].sort((a, b) => b.bossCount - a.bossCount)[0];
    const deadliestDay = [...dayStats].sort((a, b) => b.deaths - a.deaths)[0];

    if (deadliestBoss) {
        $("record-boss").textContent = deadliestBoss.name;
        $("record-boss-value").textContent = `${deathsFromAttempts(deadliestBoss.attempts)} morts`;
    }

    if (mostProductive) {
        $("record-productive-day").textContent = `Jour ${mostProductive.day}`;
        $("record-productive-value").textContent = `${mostProductive.bossCount} boss vaincu${mostProductive.bossCount > 1 ? "s" : ""}`;
    }

    if (deadliestDay) {
        $("record-deadly-day").textContent = `Jour ${deadliestDay.day}`;
        $("record-deadly-value").textContent = `${deadliestDay.deaths} morts`;
    }
}

// ------------------------------------------------------------
// CHRONOLOGIE DES BOSS MAJEURS
// ------------------------------------------------------------

function renderTimeline() {
    const majorBosses = getMajorBosses()
        .sort((a, b) => a.day - b.day);

    const grouped = new Map();

    majorBosses.forEach(boss => {
        if (!grouped.has(boss.day)) grouped.set(boss.day, []);
        grouped.get(boss.day).push(boss);
    });

    const timeline = $("timeline");
    timeline.innerHTML = "";

    grouped.forEach((bosses, day) => {
        const item = document.createElement("div");
        item.className = "timeline-item";

        const bossMarkup = bosses
            .map(boss => `<span class="timeline-boss">${boss.name}</span>`)
            .join("");

        item.innerHTML = `
            <div class="timeline-day">JOUR ${day}</div>
            <div class="timeline-dot-wrap"><span class="timeline-dot"></span></div>
            <div class="timeline-bosses">${bossMarkup}</div>
        `;

        timeline.appendChild(item);
    });
}

// ------------------------------------------------------------
// INITIALISATION
// ------------------------------------------------------------

function init() {
    renderSummary();
    renderDayTabs();
    renderTopFive();
    renderRecords();
    renderTimeline();

    const firstDay = getDays()[0];
    if (firstDay !== undefined) selectDay(firstDay);
}

document.addEventListener("DOMContentLoaded", init);
