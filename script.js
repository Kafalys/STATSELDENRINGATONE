const DATA_URL = "data.json";

let RUN_DATA = null;
let selectedDay = null;

const $ = (id) => document.getElementById(id);

function setText(id, value) {
    const element = $(id);

    if (element) {
        element.textContent = value;
    } else {
        console.warn(`Élément #${id} introuvable dans le HTML.`);
    }
}

function formatNumber(value) {
    if (value === null || value === undefined || value === "") return "—";
    return new Intl.NumberFormat("fr-FR").format(value);
}

function formatPercent(value) {
    if (!Number.isFinite(value)) return "0 %";
    return `${value.toFixed(2).replace(".", ",")} %`;
}

function renderSummary() {
    const g = RUN_DATA.global || {};
    const stream = RUN_DATA.stream || {};

    const bossPercent = g.totalBosses
        ? (g.bossesVaincus / g.totalBosses) * 100
        : 0;

    const firstTryPercent = g.bossesVaincus
        ? (g.firstTry / g.bossesVaincus) * 100
        : 0;

    setText(
        "boss-killed-main",
        `${formatNumber(g.bossesVaincus)} / ${formatNumber(g.totalBosses)}`
    );

    setText(
        "boss-percent-main",
        `${formatPercent(bossPercent)} de l'ensemble des boss`
    );

    setText(
        "major-bosses",
        `${formatNumber(g.bossesMajeursVaincus)} / ${formatNumber(g.totalBossesMajeurs)}`
    );

    setText("total-deaths", formatNumber(g.mortsTotales));

    setText("first-try-count", formatNumber(g.firstTry));

    setText("first-try-percent", formatPercent(firstTryPercent));

    setText(
        "zones-visited",
        `${formatNumber(g.zonesVisitees)} / ${formatNumber(g.zonesTotale)}`
    );

    setText(
        "avg-attempts",
        g.moyenneTentatives !== undefined
            ? Number(g.moyenneTentatives).toFixed(2).replace(".", ",")
            : "—"
    );

    setText("days-count", formatNumber(stream.joursDeRun));
    setText("stream-time", stream.streamTime ?? "—");
    setText("game-time", stream.gameTime ?? "—");
    setText("subs", formatNumber(stream.subs));
    setText("quests-completed", formatNumber(stream.quetesAccomplies));}

function getDays() {
    return [...(RUN_DATA.days || [])].sort((a, b) => a.day - b.day);
}

function renderDayTabs() {
    const tabs = $("day-tabs");
    tabs.innerHTML = "";

    getDays().forEach(day => {
        const button = document.createElement("button");

        button.className = "day-tab";
        button.type = "button";
        button.textContent = `JOUR ${day.day}`;
        button.dataset.day = day.day;

        button.addEventListener("click", () => selectDay(day.day));

        tabs.appendChild(button);
    });
}

function selectDay(day) {
    selectedDay = day;

    document.querySelectorAll(".day-tab").forEach(button => {
        button.classList.toggle(
            "active",
            Number(button.dataset.day) === day
        );
    });

    const panel = $("day-panel");

    panel.style.animation = "none";
    void panel.offsetWidth;
    panel.style.animation = "panelIn .35s ease";

    renderDay(day);
}

function renderDay(day) {
    const dayData = getDays().find(item => item.day === day);

    const bossData = (RUN_DATA.bossesByDay || [])
        .find(item => item.day === day);

    const bosses = bossData?.bosses || [];

    $("selected-day-title").textContent = day;

    $("day-boss-count").textContent =
        formatNumber(dayData?.bossesVaincus);

    const deaths = dayData?.morts;

    $("day-deaths").textContent =
        deaths == null ? "—" : formatNumber(deaths);

    const list = $("boss-list");

    list.innerHTML = "";

    bosses.forEach(boss => {
        const row = document.createElement("div");

        row.className = "boss-row";

        const name = document.createElement("span");

        name.className = "boss-name";
        name.textContent = boss.name;

        const result = document.createElement("div");

        result.className = "boss-result";

        if (boss.attempts === 1) {
            const badge = document.createElement("span");

            badge.className = "first-try";
            badge.textContent = "FIRST TRY";

            result.appendChild(badge);
        } else {
            const attempts = document.createElement("span");

            attempts.textContent =
                `${formatNumber(boss.attempts)} tentatives`;

            result.appendChild(attempts);
        }

        row.appendChild(name);
        row.appendChild(result);

        list.appendChild(row);
    });
}

function renderTopFive() {
    const list = $("top-five-list");
    const featured = $("top-five-featured");

    if (list) list.innerHTML = "";
    if (featured) featured.innerHTML = "";

    const bosses = RUN_DATA.topAttempts || [];
    if (bosses.length === 0) return;

    const first = bosses[0];

    if (featured) {
        featured.innerHTML = `
            <span class="featured-rank">01</span>
            <span class="featured-name">${first.boss}</span>
            <span class="featured-attempts">${formatNumber(first.attempts)}</span>
            <span class="featured-label">TENTATIVES</span>
            <span class="featured-death-percent" id="malenia-death-percent"></span>
        `;

        // Pourcentage affiché uniquement pour Malenia :
        // (tentatives - 1) / mortsTotales * 100
        const totalDeaths = Number(RUN_DATA.global?.mortsTotales);
        const attempts = Number(first.attempts);

        if (
            first.boss === "Malenia, Blade of Miquella" &&
            Number.isFinite(totalDeaths) &&
            totalDeaths > 0 &&
            Number.isFinite(attempts)
        ) {
            const percentage = ((attempts - 1) / totalDeaths) * 100;
            const percentElement = $("malenia-death-percent");

            if (percentElement) {
                percentElement.textContent =
                    `${percentage.toFixed(2).replace(".", ",")} % des morts totales`;
            }
        }
    }

    bosses.slice(1, 5).forEach((boss, index) => {
        const row = document.createElement("div");
        row.className = "rank-row";
        row.innerHTML = `
            <span class="rank-number">${String(index + 2).padStart(2, "0")}</span>
            <span class="rank-name">${boss.boss}</span>
            <span class="rank-value">
                ${formatNumber(boss.attempts)}
                tentative${boss.attempts > 1 ? "s" : ""}
            </span>
        `;
        if (list) list.appendChild(row);
    });
}
function renderRecords() {
    const r = RUN_DATA.records || {};

    $("record-boss").textContent =
        r.bossLePlusDeTentatives ?? "—";

    $("record-boss-value").textContent =
        r.bossLePlusDeTentativesValeur == null
            ? "—"
            : `${formatNumber(r.bossLePlusDeTentativesValeur)} tentatives`;

    $("record-productive-day").textContent =
        r.jourPlusDeBoss == null
            ? "—"
            : `Jour ${r.jourPlusDeBoss}`;

    const productiveDay = getDays()
        .find(d => d.day === r.jourPlusDeBoss);

    $("record-productive-value").textContent =
        productiveDay
            ? `${formatNumber(productiveDay.bossesVaincus)} boss vaincus`
            : "—";

    $("record-deadly-day").textContent =
        r.jourPlusDeMorts == null
            ? "—"
            : `Jour ${r.jourPlusDeMorts}`;

    const deadlyDay = getDays()
        .find(d => d.day === r.jourPlusDeMorts);

    $("record-deadly-value").textContent =
        deadlyDay?.morts == null
            ? "—"
            : `${formatNumber(deadlyDay.morts)} morts`;
}

function renderTimeline() {
    const timeline = $("timeline");
    timeline.innerHTML = "";

    const days = RUN_DATA.days || [];
    const majorBosses = RUN_DATA.majorBosses || [];

    days.forEach(dayData => {
        const day = dayData.day;

        // Keep every recorded run day. Only bosses with an assigned day
        // are considered defeated major bosses.
        const bosses = majorBosses.filter(boss => boss.day === day);

        const item = document.createElement("div");
        item.className = "timeline-item";

        const bossesHTML = bosses.length
            ? bosses
                .map(boss => `<span class="timeline-boss">${boss.name}</span>`)
                .join("")
            : `<span class="timeline-empty">Aucun boss majeur vaincu ce jour-là</span>`;

        item.innerHTML = `
            <div class="timeline-day">JOUR ${day}</div>
            <div class="timeline-dot-wrap">
                <span class="timeline-dot"></span>
            </div>
            <div class="timeline-bosses">
                ${bossesHTML}
            </div>
        `;

        timeline.appendChild(item);
    });
}
async function init() {
    try {

        const response = await fetch(DATA_URL, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `Impossible de charger ${DATA_URL}`
            );
        }

        RUN_DATA = await response.json();

        renderSummary();
        renderDayTabs();
        renderTopFive();
        renderRecords();
        renderTimeline();

        const firstDay = getDays()[0]?.day;

        if (firstDay !== undefined) {
            selectDay(firstDay);
        }

    } catch (error) {

        console.error(
            "Erreur de chargement des données :",
            error
        );
    }
}

document.addEventListener(
    "DOMContentLoaded",
    init
);