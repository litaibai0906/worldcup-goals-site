const COLORS = ["#087e83", "#cf7336", "#477ca8", "#b95046", "#7560a8", "#638d49", "#b65a81", "#357a68"];
const COUNTRY_ZH = {
  Argentina: "阿根廷", Australia: "澳大利亚", Belgium: "比利时", Brazil: "巴西", Chile: "智利",
  Croatia: "克罗地亚", Czechoslovakia: "捷克斯洛伐克", Denmark: "丹麦", England: "英格兰", France: "法国",
  Germany: "德国", Hungary: "匈牙利", Italy: "意大利", Mexico: "墨西哥", Netherlands: "荷兰",
  Poland: "波兰", Portugal: "葡萄牙", "Soviet Union": "苏联", Spain: "西班牙", Sweden: "瑞典",
  Uruguay: "乌拉圭", "West Germany": "西德", Yugoslavia: "南斯拉夫", "United States": "美国",
  "South Korea": "韩国", Japan: "日本", Cameroon: "喀麦隆", Nigeria: "尼日利亚", Morocco: "摩洛哥",
  Senegal: "塞内加尔", Ghana: "加纳", Algeria: "阿尔及利亚", Tunisia: "突尼斯", Egypt: "埃及",
  "Costa Rica": "哥斯达黎加", Colombia: "哥伦比亚", Ecuador: "厄瓜多尔", Paraguay: "巴拉圭",
  Switzerland: "瑞士", Austria: "奥地利", Romania: "罗马尼亚", Bulgaria: "保加利亚", Turkey: "土耳其",
  Russia: "俄罗斯", Ukraine: "乌克兰", Serbia: "塞尔维亚", "Republic of Ireland": "爱尔兰",
  "Northern Ireland": "北爱尔兰", Scotland: "苏格兰", Wales: "威尔士", Canada: "加拿大",
  "Saudi Arabia": "沙特阿拉伯", Iran: "伊朗", Qatar: "卡塔尔", China: "中国", "South Africa": "南非",
  "New Zealand": "新西兰", Honduras: "洪都拉斯", Jamaica: "牙买加", "Ivory Coast": "科特迪瓦",
  "Côte d'Ivoire": "科特迪瓦", "North Korea": "朝鲜", Iraq: "伊拉克", Panama: "巴拿马",
  "United Arab Emirates": "阿联酋", "Czech Republic": "捷克", Slovakia: "斯洛伐克", Slovenia: "斯洛文尼亚",
  Bosnia: "波黑", "Bosnia and Herzegovina": "波黑", Greece: "希腊", Peru: "秘鲁", Bolivia: "玻利维亚",
  "El Salvador": "萨尔瓦多", Haiti: "海地", Cuba: "古巴", "Dutch East Indies": "荷属东印度",
  "East Germany": "东德", "German DR": "东德", Togo: "多哥", Angola: "安哥拉", "Trinidad and Tobago": "特立尼达和多巴哥",
  "United States of America": "美国", "Curaçao": "库拉索", "Curaçao": "库拉索", "Cape Verde": "佛得角",
  "DR Congo": "刚果（金）", "Congo DR": "刚果（金）", "North Macedonia": "北马其顿", "Czechia": "捷克",
  "Türkiye": "土耳其", "Korea Republic": "韩国", "Korea DPR": "朝鲜", "IR Iran": "伊朗",
  "Bosnia & Herzegovina": "波黑", "Bosnia-Herzegovina": "波黑", USA: "美国", Zaire: "扎伊尔",
};

const state = {
  data: null,
  rows: [],
  countries: [],
  nameMode: "standard",
  view: "leaderboard",
  profileCountry: "Brazil",
  compareCountries: [],
  compareMode: "goals",
  rank: { from: "all", to: "all", stage: "全部", search: "", sort: "goals_for", dir: -1, metric: "goals_for", minMatches: 10 },
  heatStage: "全部",
  scorerYear: "all",
  scorerCountry: "all",
  scorerSearch: "",
};

const number = (value, digits = 0) => Number(value).toLocaleString("zh-CN", {
  minimumFractionDigits: digits,
  maximumFractionDigits: digits,
});
const countryLabel = (country) => COUNTRY_ZH[country] || country;
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[char]));

async function loadData() {
  const root = document.getElementById("view-root");
  try {
    const response = await fetch("./data/worldcup.json.gz");
    if (!response.ok) throw new Error(`数据请求失败（${response.status}）`);
    const stream = response.body.pipeThrough(new DecompressionStream("gzip"));
    state.data = await new Response(stream).json();
    refreshRows();
    const nameMode = document.getElementById("name-mode");
    nameMode.value = state.nameMode;
    nameMode.addEventListener("change", (event) => {
      state.nameMode = event.target.value;
      refreshRows();
      render();
    });
    const overall = aggregate(state.rows);
    const byGoals = overall.slice().sort((a, b) => b.goals_for - a.goals_for);
    state.compareCountries = byGoals.slice(0, 4).map((row) => row.country);
    state.profileCountry = byGoals[0]?.country || state.countries[0];
    render();
  } catch (error) {
    root.innerHTML = `<div class="error-box">无法读取项目数据：${esc(error.message)}。请通过本地网站地址打开页面。</div>`;
  }
}

function refreshRows() {
  const sourceNames = state.nameMode === "source";
  state.rows = state.data.country_matches.map((row) => ({
    ...row,
    country: sourceNames ? row.country_source : row.country,
    opponent: sourceNames ? row.opponent_source : row.opponent,
  }));
  state.countries = [...new Set(state.rows.map((row) => row.country))].sort();
  const byGoals = aggregate(state.rows).sort((a, b) => b.goals_for - a.goals_for);
  state.compareCountries = byGoals.slice(0, 4).map((row) => row.country);
  if (!state.countries.includes(state.profileCountry)) {
    state.profileCountry = byGoals[0]?.country || state.countries[0];
  }
}

function aggregate(rows) {
  const map = new Map();
  for (const row of rows) {
    let entry = map.get(row.country);
    if (!entry) {
      entry = {
        country: row.country, matches: 0, wins: 0, draws: 0, losses: 0,
        goals_for: 0, goals_against: 0, editions: new Set(), group: blankStage(), knockout: blankStage(),
      };
      map.set(row.country, entry);
    }
    entry.matches += 1;
    entry.goals_for += row.goals_for;
    entry.goals_against += row.goals_against;
    entry.editions.add(row.edition_year);
    if (row.result === "胜") entry.wins += 1;
    else if (row.result === "平") entry.draws += 1;
    else entry.losses += 1;
    const stage = row.stage === "小组赛" ? entry.group : entry.knockout;
    stage.matches += 1;
    stage.goals += row.goals_for;
  }
  return [...map.values()].map((row) => ({
    ...row,
    editions: row.editions.size,
    goal_difference: row.goals_for - row.goals_against,
    goals_per_match: row.goals_for / row.matches,
    group_average: row.group.matches ? row.group.goals / row.group.matches : null,
    knockout_average: row.knockout.matches ? row.knockout.goals / row.knockout.matches : null,
  }));
}

function blankStage() { return { matches: 0, goals: 0 }; }

function editionStats(rows) {
  const byYear = new Map();
  for (const row of rows) {
    let year = byYear.get(row.edition_year);
    if (!year) {
      year = { year: row.edition_year, matches: 0, goals: 0, goals_against: 0, wins: 0, draws: 0, losses: 0, group: blankStage(), knockout: blankStage() };
      byYear.set(row.edition_year, year);
    }
    year.matches += 1;
    year.goals += row.goals_for;
    year.goals_against += row.goals_against;
    if (row.result === "胜") year.wins += 1;
    else if (row.result === "平") year.draws += 1;
    else year.losses += 1;
    const stage = row.stage === "小组赛" ? year.group : year.knockout;
    stage.matches += 1;
    stage.goals += row.goals_for;
  }
  return [...byYear.values()].sort((a, b) => a.year - b.year).map((row) => ({
    ...row,
    average: row.goals / row.matches,
    goal_difference: row.goals - row.goals_against,
  }));
}

function filteredRows() {
  const filter = state.rank;
  const from = filter.from === "all" ? -Infinity : Number(filter.from);
  const to = filter.to === "all" ? Infinity : Number(filter.to);
  return state.rows.filter((row) => (
    row.edition_year >= from && row.edition_year <= to
    && (filter.stage === "全部" || row.stage === filter.stage)
    && countryLabel(row.country).toLowerCase().includes(filter.search.toLowerCase())
  ));
}

function setPageHeading(title, subtitle) {
  document.getElementById("page-title").textContent = title;
  document.getElementById("page-subtitle").textContent = subtitle;
}

function renderMetrics() {
  const matches = state.rows.length / 2;
  const goals = state.rows.reduce((sum, row) => sum + row.goals_for, 0);
  const countryCount = state.countries.length;
  const average = goals / matches;
  const metrics = [
    ["参赛届次", number(state.data.years.length), "届世界杯"],
    ["比赛数量", number(matches), "场已收录比赛"],
    ["国家队名称", number(countryCount), state.nameMode === "source" ? "来源名称" : "标准名称"],
    ["比赛总进球", number(goals), `场均 ${number(average, 2)} 球/场`],
  ];
  document.getElementById("metric-strip").innerHTML = metrics.map(([label, value, note]) => `
    <div class="metric"><div class="metric-label">${label}</div><div class="metric-value">${value}</div><div class="metric-note">${note}</div></div>
  `).join("");
  document.getElementById("edition-range").textContent = `${state.data.years[0]}–${state.data.years.at(-1)}`;
  document.getElementById("team-count").textContent = `${countryCount} 个队名`;
}

function yearOptions(selected, all = true) {
  return `${all ? '<option value="all">全部</option>' : ""}${state.data.years.map((year) => (
    `<option value="${year}" ${String(selected) === String(year) ? "selected" : ""}>${year}</option>`
  )).join("")}`;
}

function renderLeaderboard() {
  setPageHeading("世界杯国家队进球与效率", "总进球反映累计产出；场均进球按国家队每次出场计算。");
  const rows = filteredRows();
  const metric = state.rank.metric;
  const minMatches = metric === "goals_per_match" ? Number(state.rank.minMatches) : 0;
  const eligible = aggregate(rows).filter((row) => row.matches >= minMatches);
  const summaries = eligible.slice().sort((a, b) => {
    const key = state.rank.sort;
    const diff = (a[key] ?? -Infinity) - (b[key] ?? -Infinity);
    return state.rank.dir * diff || a.country.localeCompare(b.country);
  });
  const top = eligible.slice().sort((a, b) => b[metric] - a[metric] || b.matches - a.matches).slice(0, 12);
  const chart = renderBarChart(top, metric);
  const tableRows = summaries.map((row, index) => `
    <tr>
      <td class="rank-cell">${index + 1}</td>
      <td class="country-name-cell"><button class="country-link" data-country="${esc(row.country)}">${esc(countryLabel(row.country))}</button></td>
      <td>${number(row.goals_for)}</td><td>${number(row.matches)}</td>
      <td>${number(row.goals_per_match, 2)}</td><td class="${row.goal_difference >= 0 ? "positive" : "negative"}">${row.goal_difference > 0 ? "+" : ""}${number(row.goal_difference)}</td>
      <td>${number(row.wins)} / ${number(row.draws)} / ${number(row.losses)}</td>
    </tr>`).join("");
  document.getElementById("view-root").innerHTML = `
    <section class="view-section">
      <div class="section-head">
        <div><h2>国家队进球排行榜</h2><p class="section-note">点选队名查看该队逐届表现</p></div>
        <div class="controls">
          <label class="control compact">从届次<select id="rank-from">${yearOptions(state.rank.from)}</select></label>
          <label class="control compact">至届次<select id="rank-to">${yearOptions(state.rank.to)}</select></label>
          <label class="control compact">比赛阶段<select id="rank-stage">${["全部", "小组赛", "淘汰赛"].map((stage) => `<option ${state.rank.stage === stage ? "selected" : ""}>${stage}</option>`).join("")}</select></label>
          <label class="control search-control">搜索国家队<input id="rank-search" type="search" value="${esc(state.rank.search)}" placeholder="输入国家队名称" autocomplete="off"></label>
          ${metric === "goals_per_match" ? `<label class="control compact">最少参赛<select id="rank-min-matches">${[0, 5, 10, 20].map((value) => `<option value="${value}" ${Number(state.rank.minMatches) === value ? "selected" : ""}>${value ? `${value} 场` : "不限"}</option>`).join("")}</select></label>` : ""}
          <div class="segmented" role="group" aria-label="排行榜指标"><button class="segment-button ${metric === "goals_for" ? "is-active" : ""}" data-rank-metric="goals_for" type="button">总进球</button><button class="segment-button ${metric === "goals_per_match" ? "is-active" : ""}" data-rank-metric="goals_per_match" type="button">场均进球</button></div>
          <span class="result-count">${summaries.length} 支</span>
        </div>
      </div>
      <div class="dashboard-grid">
        <section class="panel"><div class="panel-heading"><h3>${metric === "goals_for" ? "总进球前 12" : `场均进球前 12${minMatches ? `（至少 ${minMatches} 场）` : ""}`}</h3><span class="panel-unit">单位：${metric === "goals_for" ? "球" : "球/场"}</span></div>${chart}</section>
        <section class="panel table-panel"><div class="panel-heading"><h3>国家队表现</h3><span class="panel-unit">进球：球；场均：球/场</span></div>
          <div class="table-scroll"><table><thead><tr>
            <th>#</th><th>国家队</th><th><button class="sort-button" data-sort="goals_for">进球 ↕</button></th><th><button class="sort-button" data-sort="matches">场数 ↕</button></th><th><button class="sort-button" data-sort="goals_per_match">场均 ↕</button></th><th><button class="sort-button" data-sort="goal_difference">净胜球 ↕</button></th><th>胜 / 平 / 负</th>
          </tr></thead><tbody>${tableRows || '<tr><td colspan="7" class="empty-state">没有符合条件的记录</td></tr>'}</tbody></table></div>
        </section>
      </div>
    </section>`;
  bindLeaderboard();
}

function renderBarChart(rows, metric) {
  const width = 530;
  const height = Math.max(230, 54 + rows.length * 35);
  const left = 100, right = 54, top = 18, plotW = width - left - right;
  const maxValue = Math.max(1, ...rows.map((row) => row[metric]));
  const ticks = 4;
  const grid = Array.from({ length: ticks + 1 }, (_, index) => {
    const rawValue = maxValue * index / ticks;
    const value = metric === "goals_for" ? Math.round(rawValue) : Math.round(rawValue * 10) / 10;
    const x = left + plotW * index / ticks;
    return `<line class="axis-line" x1="${x}" y1="${top}" x2="${x}" y2="${height - 26}"/><text class="axis-label" x="${x}" y="${height - 8}" text-anchor="middle">${number(value, metric === "goals_for" ? 0 : 1)}</text>`;
  }).join("");
  const bars = rows.map((row, index) => {
    const y = top + index * 35 + 5;
    const value = row[metric];
    const barW = Math.max(2, plotW * value / maxValue);
    return `<text class="bar-label" x="${left - 9}" y="${y + 15}" text-anchor="end">${esc(countryLabel(row.country))}</text>
      <rect x="${left}" y="${y}" width="${barW}" height="20" rx="3" fill="${index === 0 ? "#cf7336" : "#087e83"}"/>
      <text class="bar-value" x="${left + barW + 7}" y="${y + 15}">${number(value, metric === "goals_for" ? 0 : 2)}</text>`;
  }).join("");
  return `<div class="chart-wrap"><svg role="img" aria-label="国家队${metric === "goals_for" ? "总进球" : "场均进球"}横向条形图" viewBox="0 0 ${width} ${height}">${grid}${bars}</svg></div>`;
}

function bindLeaderboard() {
  document.getElementById("rank-from").addEventListener("change", (event) => { state.rank.from = event.target.value; renderLeaderboard(); });
  document.getElementById("rank-to").addEventListener("change", (event) => { state.rank.to = event.target.value; renderLeaderboard(); });
  document.getElementById("rank-stage").addEventListener("change", (event) => { state.rank.stage = event.target.value; renderLeaderboard(); });
  document.getElementById("rank-search").addEventListener("input", (event) => { state.rank.search = event.target.value; renderLeaderboard(); const input = document.getElementById("rank-search"); input.focus(); input.setSelectionRange(input.value.length, input.value.length); });
  document.querySelectorAll("[data-sort]").forEach((button) => button.addEventListener("click", () => {
    const key = button.dataset.sort;
    if (state.rank.sort === key) state.rank.dir *= -1;
    else { state.rank.sort = key; state.rank.dir = -1; }
    if (key === "goals_for" || key === "goals_per_match") state.rank.metric = key;
    renderLeaderboard();
  }));
  document.querySelectorAll("[data-rank-metric]").forEach((button) => button.addEventListener("click", () => {
    state.rank.metric = button.dataset.rankMetric;
    state.rank.sort = button.dataset.rankMetric;
    state.rank.dir = -1;
    renderLeaderboard();
  }));
  const minMatches = document.getElementById("rank-min-matches");
  if (minMatches) minMatches.addEventListener("change", (event) => {
    state.rank.minMatches = Number(event.target.value);
    renderLeaderboard();
  });
  document.querySelectorAll("[data-country]").forEach((button) => button.addEventListener("click", () => {
    state.profileCountry = button.dataset.country;
    setView("profile");
  }));
}

function renderProfile() {
  setPageHeading("国家队档案", "查看单支国家队的世界杯进球、失球、胜平负和逐届变化。");
  const options = state.countries.slice().sort((a, b) => countryLabel(a).localeCompare(countryLabel(b), "zh-CN"));
  if (!options.includes(state.profileCountry)) state.profileCountry = options[0];
  const rows = state.rows.filter((row) => row.country === state.profileCountry);
  const summary = aggregate(rows)[0];
  const editions = editionStats(rows);
  const stageRows = [
    { label: "小组赛", stage: summary.group },
    { label: "淘汰赛", stage: summary.knockout },
  ];
  const stats = [
    ["世界杯进球", number(summary.goals_for), "球"], ["比赛场数", number(summary.matches), "场"],
    ["场均进球", number(summary.goals_per_match, 2), "球/场"], ["净胜球", `${summary.goal_difference > 0 ? "+" : ""}${number(summary.goal_difference)}`, "球"],
    ["参赛届数", number(summary.editions), "届"],
  ];
  const rowsHtml = editions.slice().reverse().map((row) => `
    <tr><td>${row.year}</td><td>${number(row.matches)}</td><td>${number(row.goals)}</td><td>${number(row.average, 2)}</td><td>${number(row.wins)} / ${number(row.draws)} / ${number(row.losses)}</td><td>${row.goal_difference > 0 ? "+" : ""}${number(row.goal_difference)}</td></tr>`).join("");
  document.getElementById("view-root").innerHTML = `
    <section class="view-section">
      <div class="section-head"><div><h2>国家队表现</h2><p class="section-note">队名沿用来源写法，历史名称单独统计</p></div>
        <label class="control primary-control">选择国家队<select class="profile-select" id="profile-select">${options.map((country) => `<option value="${esc(country)}" ${country === state.profileCountry ? "selected" : ""}>${esc(countryLabel(country))} · ${esc(country)}</option>`).join("")}</select></label>
      </div>
      <div class="profile-metrics">${stats.map(([label, value, unit]) => `<div class="profile-stat"><span>${label}</span><strong>${value}</strong><span>${unit}</span></div>`).join("")}</div>
      <div class="profile-grid">
        <section class="panel"><div class="panel-heading"><h3>逐届进球</h3><span class="panel-unit">单位：球/届</span></div>${renderLineChart([{ name: state.profileCountry, label: countryLabel(state.profileCountry), color: COLORS[0], points: state.data.years.map((year) => ({ year, value: editions.find((row) => row.year === year)?.goals ?? null })) }], state.data.years, "球/届")}</section>
        <section class="panel"><div class="panel-heading"><h3>比赛阶段</h3><span class="panel-unit">场均进球：球/场</span></div>${renderStageBars(stageRows)}</section>
      </div>
      <section class="panel table-panel profile-table"><div class="panel-heading"><h3>逐届明细</h3><span class="panel-unit">进球包含加时；胜负含点球大战结果</span></div>
        <div class="table-scroll"><table><thead><tr><th>届次年份</th><th>比赛场数</th><th>进球（球）</th><th>场均（球/场）</th><th>胜 / 平 / 负</th><th>净胜球</th></tr></thead><tbody>${rowsHtml}</tbody></table></div>
      </section>
    </section>`;
  document.getElementById("profile-select").addEventListener("change", (event) => { state.profileCountry = event.target.value; renderProfile(); });
}

function renderLineChart(series, years, unit) {
  const width = 900, height = 330, left = 48, right = 26, top = 22, bottom = 42;
  const plotW = width - left - right, plotH = height - top - bottom;
  const values = series.flatMap((item) => item.points.map((point) => point.value).filter((value) => value !== null && value !== undefined));
  const maxValue = Math.max(0, ...values);
  const step = maxValue <= 3 ? 0.5 : maxValue <= 8 ? 1 : maxValue <= 20 ? 5 : 10;
  const max = Math.max(step, Math.ceil(maxValue / step) * step);
  const xAt = (year) => left + plotW * years.indexOf(year) / Math.max(1, years.length - 1);
  const yAt = (value) => top + plotH * (1 - value / max);
  const ticks = 4;
  const grid = Array.from({ length: ticks + 1 }, (_, index) => {
    const value = max * index / ticks;
    const y = yAt(value);
    return `<line class="axis-line" x1="${left}" y1="${y}" x2="${left + plotW}" y2="${y}"/><text class="axis-label" x="${left - 9}" y="${y + 4}" text-anchor="end">${number(value, value % 1 ? 1 : 0)}</text>`;
  }).join("");
  const xLabels = years.filter((_, index) => index % 2 === 0 || index === years.length - 1).map((year) => (
    `<text class="axis-label" x="${xAt(year)}" y="${height - 10}" text-anchor="middle">${year}</text>`
  )).join("");
  const lines = series.map((item) => {
    const valuesByYear = new Map(item.points.map((point) => [point.year, point.value]));
    const points = years.map((year) => ({ year, value: valuesByYear.get(year) ?? null })).filter((point) => point.value !== null && point.value !== undefined);
    const segments = [];
    let segment = [];
    let lastIndex = -2;
    for (const point of points) {
      const index = years.indexOf(point.year);
      if (index !== lastIndex + 1 && segment.length) {
        segments.push(segment);
        segment = [];
      }
      segment.push(point);
      lastIndex = index;
    }
    if (segment.length) segments.push(segment);
    const paths = segments.map((part) => `<polyline points="${part.map((point) => `${xAt(point.year)},${yAt(point.value)}`).join(" ")}" fill="none" stroke="${item.color}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>`).join("");
    const circles = points.map((point) => `<circle cx="${xAt(point.year)}" cy="${yAt(point.value)}" r="4" fill="${item.color}"><title>${item.label} ${point.year}: ${number(point.value)} ${unit}</title></circle>`).join("");
    return `${paths}${circles}`;
  }).join("");
  return `<div class="chart-wrap"><svg class="line-svg" role="img" aria-label="逐届进球折线图，单位：${unit}" viewBox="0 0 ${width} ${height}">${grid}${lines}${xLabels}<text class="axis-label" x="${width - 4}" y="18" text-anchor="end">${unit}</text></svg></div>`;
}

function renderStageBars(stageRows) {
  const width = 540, height = 290, left = 48, right = 24, top = 28, bottom = 54;
  const plotW = width - left - right, plotH = height - top - bottom;
  const maxValue = Math.max(1, Math.ceil(Math.max(...stageRows.map((row) => row.stage.matches ? row.stage.goals / row.stage.matches : 0))));
  const grid = Array.from({ length: maxValue + 1 }, (_, value) => {
    const y = top + plotH * (1 - value / maxValue);
    return `<line class="axis-line" x1="${left}" y1="${y}" x2="${left + plotW}" y2="${y}"/><text class="axis-label" x="${left - 9}" y="${y + 4}" text-anchor="end">${value}</text>`;
  }).join("");
  const bars = stageRows.map((row, index) => {
    const avg = row.stage.matches ? row.stage.goals / row.stage.matches : 0;
    const barW = 112, x = left + plotW * (index + 0.5) / stageRows.length - barW / 2;
    const h = plotH * avg / maxValue, y = top + plotH - h;
    const fill = index === 0 ? COLORS[0] : COLORS[1];
    return `<rect x="${x}" y="${y}" width="${barW}" height="${h}" rx="4" fill="${fill}"/><text class="bar-value" x="${x + barW / 2}" y="${y - 9}" text-anchor="middle">${number(avg, 2)}</text><text class="axis-label" x="${x + barW / 2}" y="${height - 25}" text-anchor="middle">${row.label}</text><text class="axis-label" x="${x + barW / 2}" y="${height - 9}" text-anchor="middle">${row.stage.matches} 场</text>`;
  }).join("");
  return `<div class="chart-wrap"><svg role="img" aria-label="该国家队按阶段场均进球，单位球每场" viewBox="0 0 ${width} ${height}">${grid}${bars}</svg></div>`;
}

function renderCompare() {
  setPageHeading("多队比较", "选择几支国家队，对照逐届总进球或场均进球。");
  const all = aggregate(state.rows).sort((a, b) => a.country.localeCompare(b.country));
  const selectedRows = state.compareCountries.map((country) => all.find((row) => row.country === country)).filter(Boolean);
  const options = all.map((row) => `<option value="${esc(row.country)}">${esc(countryLabel(row.country))} · ${esc(row.country)}</option>`).join("");
  const table = selectedRows.map((row) => `<tr><td>${esc(countryLabel(row.country))}</td><td>${number(row.goals_for)}</td><td>${number(row.matches)}</td><td>${number(row.goals_per_match, 2)}</td><td>${number(row.wins)} / ${number(row.draws)} / ${number(row.losses)}</td></tr>`).join("");
  const series = selectedRows.map((row, index) => {
    const editions = editionStats(state.rows.filter((match) => match.country === row.country));
    return {
      name: row.country,
      label: countryLabel(row.country),
      color: COLORS[index % COLORS.length],
      points: state.data.years.map((year) => {
        const edition = editions.find((row) => row.year === year);
        return { year, value: edition ? (state.compareMode === "goals" ? edition.goals : edition.average) : null };
      }),
    };
  });
  const modeButtons = `<div class="segmented" role="group" aria-label="比较指标"><button class="segment-button ${state.compareMode === "goals" ? "is-active" : ""}" data-mode="goals" type="button">逐届总进球</button><button class="segment-button ${state.compareMode === "average" ? "is-active" : ""}" data-mode="average" type="button">逐届场均</button></div>`;
  document.getElementById("view-root").innerHTML = `
    <section class="view-section">
      <div class="section-head"><div><h2>国家队逐届趋势</h2><p class="section-note">最多比较 6 支；场均按该队该届进球数除以该队比赛场数</p></div>${modeButtons}</div>
      <div class="compare-layout">
        <section class="panel compare-picker"><h3>选择国家队</h3><p>添加或移除国家队。队名沿用数据来源写法。</p>
          <select id="compare-add" aria-label="选择要添加的国家队">${options}</select><button class="add-button" id="compare-add-button" type="button">添加到比较</button>
          <div class="selected-list">${selectedRows.map((row) => `<div class="selected-country"><span>${esc(countryLabel(row.country))}</span><button class="remove-country" data-remove="${esc(row.country)}" type="button" aria-label="移除${esc(countryLabel(row.country))}">×</button></div>`).join("") || '<span class="section-note">请选择国家队</span>'}</div>
        </section>
        <div class="compare-main">
          <section class="panel"><div class="panel-heading"><h3>${state.compareMode === "goals" ? "逐届进球趋势" : "逐届场均趋势"}</h3><span class="panel-unit">单位：${state.compareMode === "goals" ? "球/届" : "球/场"}</span></div>${renderLineChart(series, state.data.years, state.compareMode === "goals" ? "球/届" : "球/场")}<div class="chart-legend">${series.map((item) => `<span class="legend-item"><i class="legend-swatch" style="background:${item.color}"></i>${esc(item.label)}</span>`).join("")}</div></section>
          <section class="panel table-panel"><div class="panel-heading"><h3>累计表现</h3><span class="panel-unit">场均单位：球/场</span></div><div class="table-scroll"><table class="compare-summary"><thead><tr><th>国家队</th><th>总进球（球）</th><th>比赛场数</th><th>场均进球</th><th>胜 / 平 / 负</th></tr></thead><tbody>${table}</tbody></table></div></section>
        </div>
      </div>
    </section>`;
  document.getElementById("compare-add-button").addEventListener("click", () => {
    const country = document.getElementById("compare-add").value;
    if (!state.compareCountries.includes(country) && state.compareCountries.length < 6) state.compareCountries.push(country);
    renderCompare();
  });
  document.querySelectorAll("[data-remove]").forEach((button) => button.addEventListener("click", () => {
    state.compareCountries = state.compareCountries.filter((country) => country !== button.dataset.remove);
    renderCompare();
  }));
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => {
    state.compareMode = button.dataset.mode;
    renderCompare();
  }));
}

function renderHeatmap() {
  setPageHeading("国家队 × 届次热图", "比较进球最多的国家队在各届世界杯的进球分布。");
  const stage = state.heatStage;
  const rows = filteredRowsForStage(stage);
  const summaries = aggregate(rows).sort((a, b) => b.goals_for - a.goals_for);
  const top = summaries.slice(0, 20);
  const years = state.data.years;
  const byCountryYear = new Map();
  for (const row of rows) {
    const key = `${row.country}|${row.edition_year}`;
    const current = byCountryYear.get(key) || { matches: 0, goals: 0 };
    current.matches += 1;
    current.goals += row.goals_for;
    byCountryYear.set(key, current);
  }
  const max = Math.max(1, ...[...byCountryYear.values()].map((row) => row.goals));
  const header = `<tr><th>国家队</th>${years.map((year) => `<th>${year}</th>`).join("")}</tr>`;
  const body = top.map((country) => `<tr><td><button class="country-link" data-country="${esc(country.country)}">${esc(countryLabel(country.country))}</button></td>${years.map((year) => {
    const record = byCountryYear.get(`${country.country}|${year}`);
    if (!record) return '<td class="heat-cell not-played" title="该阶段无参赛记录">—</td>';
    if (!record.goals) return '<td class="heat-cell zero" title="参赛但未进球">0</td>';
    const ratio = record.goals / max;
    const hue = ratio < 0.35 ? `background:rgb(${Math.round(225 - ratio * 375)},${Math.round(238 - ratio * 170)},${Math.round(243 - ratio * 180)})` : ratio < 0.7 ? "background:#efbe67" : "background:#c75b4c;color:#fff";
    return `<td class="heat-cell" style="${hue}" title="${year}：${record.goals} 球，${record.matches} 场">${record.goals}</td>`;
  }).join("")}</tr>`).join("");
  document.getElementById("view-root").innerHTML = `
    <section class="view-section">
      <div class="section-head"><div><h2>国家队逐届进球</h2><p class="section-note">按当前筛选阶段的累计进球排列前 20 队；点击国家队名查看档案</p></div>
        <label class="control compact">比赛阶段<select id="heat-stage">${["全部", "小组赛", "淘汰赛"].map((value) => `<option ${stage === value ? "selected" : ""}>${value}</option>`).join("")}</select></label>
      </div>
      <section class="panel heatmap-panel"><div class="panel-heading"><h3>国家队进球热图</h3><span class="panel-unit">单位：球/届</span></div>
        <div class="heatmap-legend"><span>较少</span><span class="heat-ramp"></span><span>较多</span><span class="meta-separator"></span><span>— 未参赛</span></div>
        <div class="heatmap-table-wrap"><table class="heatmap-table"><thead>${header}</thead><tbody>${body}</tbody></table></div>
      </section>
    </section>`;
  document.getElementById("heat-stage").addEventListener("change", (event) => { state.heatStage = event.target.value; renderHeatmap(); });
  document.querySelectorAll("[data-country]").forEach((button) => button.addEventListener("click", () => { state.profileCountry = button.dataset.country; setView("profile"); }));
}

function filteredRowsForStage(stage) {
  return stage === "全部" ? state.rows : state.rows.filter((row) => row.stage === stage);
}

function renderPlayerGoalChart(rows) {
  const chartRows = rows.slice(0, 12).map((row) => ({ ...row, country: row.player, goals_for: row.goals }));
  return renderBarChart(chartRows, "goals_for");
}

function sourceCountryLabel(value) {
  return String(value || "").split("；").map((name) => countryLabel(name)).join(" / ");
}

function renderScorers() {
  setPageHeading("世界杯球员射手榜", "查看历届世界杯进球球员、点球和乌龙球记录。");
  const yearRows = state.scorerYear === "all"
    ? state.data.player_goals
    : state.data.player_goals_by_edition.filter((row) => row.edition_year === Number(state.scorerYear));
  const allCountries = [...new Set(state.data.player_goals.map((row) => row.country))].sort();
  const search = state.scorerSearch.trim().toLowerCase();
  const rows = yearRows.filter((row) => (
    (state.scorerCountry === "all" || row.country === state.scorerCountry)
    && (!search || row.player.toLowerCase().includes(search) || countryLabel(row.country).toLowerCase().includes(search))
  )).sort((a, b) => b.goals - a.goals || b.scoring_matches - a.scoring_matches || a.player.localeCompare(b.player));
  const tableRows = rows.map((row, index) => `
    <tr><td class="rank-cell">${index + 1}</td><td class="country-name-cell">${esc(row.player)}</td>
      <td>${esc(state.nameMode === "source" ? sourceCountryLabel(row.source_countries) : countryLabel(row.country))}</td>
      <td>${number(row.goals)}</td><td>${number(row.penalty_goals)}</td><td>${number(row.own_goals)}</td>
      <td>${number(row.scoring_matches)}</td><td>${state.scorerYear === "all" ? `${number(row.editions)} 届` : row.edition_year}</td></tr>`).join("");
  const scorerChart = renderPlayerGoalChart(rows);
  document.getElementById("view-root").innerHTML = `
    <section class="view-section">
      <div class="section-head">
        <div><h2>球员世界杯进球</h2><p class="section-note">只统计与比赛比分核对一致的进球事件；乌龙球单列，点球计入球员进球</p></div>
        <div class="controls">
          <label class="control compact">世界杯届次<select id="scorer-year"><option value="all" ${state.scorerYear === "all" ? "selected" : ""}>全部届次</option>${state.data.years.map((year) => `<option value="${year}" ${String(state.scorerYear) === String(year) ? "selected" : ""}>${year}</option>`).join("")}</select></label>
          <label class="control compact">国家队<select id="scorer-country"><option value="all">全部</option>${allCountries.map((country) => `<option value="${esc(country)}" ${country === state.scorerCountry ? "selected" : ""}>${esc(countryLabel(country))}</option>`).join("")}</select></label>
          <label class="control search-control">搜索球员<input id="scorer-search" type="search" value="${esc(state.scorerSearch)}" placeholder="输入球员姓名" autocomplete="off"></label>
          <span class="result-count">${rows.length} 名球员</span>
        </div>
      </div>
      <div class="scorer-layout">
        <section class="panel"><div class="panel-heading"><h3>进球最多的球员</h3><span class="panel-unit">单位：球</span></div>${scorerChart}</section>
        <section class="panel table-panel"><div class="panel-heading"><h3>射手明细</h3><div class="data-links"><a class="data-link" href="./data/player_goal_summary.csv" download>下载生涯汇总</a><a class="data-link" href="./data/player_goal_summary_by_edition.csv" download>下载逐届汇总</a></div></div>
          <div class="table-scroll"><table><thead><tr><th>#</th><th>球员</th><th>国家队</th><th>进球（球）</th><th>点球（球）</th><th>乌龙球（次）</th><th>进球场次</th><th>届次</th></tr></thead>
          <tbody>${tableRows || '<tr><td colspan="8" class="empty-state">没有符合筛选条件的球员</td></tr>'}</tbody></table></div>
        </section>
      </div>
      <p class="section-note scorer-method">汇总按球员姓名和国家队归并；数据源没有稳定球员ID，少数拼写差异或同名情况可能无法自动识别。</p>
    </section>`;
  document.getElementById("scorer-year").addEventListener("change", (event) => { state.scorerYear = event.target.value; renderScorers(); });
  document.getElementById("scorer-country").addEventListener("change", (event) => { state.scorerCountry = event.target.value; renderScorers(); });
  document.getElementById("scorer-search").addEventListener("input", (event) => {
    state.scorerSearch = event.target.value;
    renderScorers();
    const input = document.getElementById("scorer-search");
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  });
}

function setView(view) {
  state.view = view;
  document.querySelectorAll(".nav-item").forEach((button) => button.classList.toggle("is-active", button.dataset.view === view));
  renderView();
}

function renderView() {
  if (!state.data) return;
  if (state.view === "leaderboard") renderLeaderboard();
  else if (state.view === "profile") renderProfile();
  else if (state.view === "compare") renderCompare();
  else if (state.view === "heatmap") renderHeatmap();
  else renderScorers();
}

function render() {
  renderMetrics();
  renderView();
}

document.querySelectorAll(".nav-item").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
loadData();
