const I18N = {
  zh: {
    subtitle: "本地定时生成，GitHub Pages 展示",
    lastUpdate: "最后更新",
    summaryTitle: "简报",
    eventsTitle: "事件流",
    source: "来源",
    loadFailed: "加载失败",
  },
  en: {
    subtitle: "Generated on local PC and displayed on GitHub Pages",
    lastUpdate: "Last Update",
    summaryTitle: "Summary",
    eventsTitle: "Events",
    source: "Source",
    loadFailed: "Load Failed",
  },
};

let currentLang = "zh";
let currentData = null;

async function loadData() {
  const res = await fetch("./data/latest.json?ts=" + Date.now());
  if (!res.ok) throw new Error("failed to load data");
  return res.json();
}

function setLanguage(lang) {
  currentLang = lang === "en" ? "en" : "zh";
  const t = I18N[currentLang];
  document.getElementById("subtitle").textContent = t.subtitle;
  document.getElementById("lastUpdateLabel").textContent = t.lastUpdate;
  document.getElementById("summaryTitle").textContent = t.summaryTitle;
  document.getElementById("eventsTitle").textContent = t.eventsTitle;
  document.getElementById("btnZh").classList.toggle("active", currentLang === "zh");
  document.getElementById("btnEn").classList.toggle("active", currentLang === "en");
  localStorage.setItem("ozmonitor_lang", currentLang);
  if (currentData) renderAll(currentData);
}

function renderStats(stats) {
  const container = document.getElementById("stats");
  container.innerHTML = "";
  Object.entries(stats || {}).forEach(([k, v]) => {
    const card = document.createElement("article");
    card.className = "stat-card";
    card.innerHTML = `
      <div class="stat-key">${k}</div>
      <div class="stat-val">${v}</div>
    `;
    container.appendChild(card);
  });
}

function renderSummary(summary) {
  const list = document.getElementById("summaryList");
  list.innerHTML = "";
  (summary || []).forEach((line) => {
    const li = document.createElement("li");
    li.textContent = line;
    list.appendChild(li);
  });
}

function renderEvents(events) {
  const root = document.getElementById("events");
  root.innerHTML = "";
  const t = I18N[currentLang];
  (events || []).forEach((item) => {
    const box = document.createElement("article");
    box.className = "event-item";
    const linkHtml = item.url ? `<a href="${item.url}" target="_blank" rel="noreferrer">${t.source}</a>` : "";
    box.innerHTML = `
      <div class="event-top">
        <div class="event-title">${item.title || "-"}</div>
        <span class="badge">${item.type || "info"}</span>
      </div>
      <div class="event-desc">${item.description || ""}</div>
      <div class="event-time">${item.time || ""} ${linkHtml}</div>
    `;
    root.appendChild(box);
  });
}

function resolveSummary(data) {
  if (currentLang === "en") return data.summary_en || data.summary || [];
  return data.summary_zh || data.summary || [];
}

function renderAll(data) {
  document.getElementById("updatedAt").textContent = data.updated_at || "--";
  renderStats(data.stats);
  renderSummary(resolveSummary(data));
  renderEvents(data.events);
}

async function main() {
  document.getElementById("btnZh").addEventListener("click", () => setLanguage("zh"));
  document.getElementById("btnEn").addEventListener("click", () => setLanguage("en"));
  const saved = localStorage.getItem("ozmonitor_lang");
  const browserLang = (navigator.language || "").toLowerCase();
  setLanguage(saved || (browserLang.startsWith("zh") ? "zh" : "en"));

  try {
    currentData = await loadData();
    renderAll(currentData);
  } catch (err) {
    document.getElementById("updatedAt").textContent = I18N[currentLang].loadFailed;
    console.error(err);
  }
}

main();
