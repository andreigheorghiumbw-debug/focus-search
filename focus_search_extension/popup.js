const filters = {
  social: " (site:reddit.com OR site:quora.com OR site:lemmy.world OR site:mastodon.social OR site:stackexchange.com OR site:discourse.org)",
  tech: " (site:stackoverflow.com OR site:github.com OR site:news.ycombinator.com OR site:dev.to OR site:hashnode.com OR site:medium.com/topic/technology)",
  all: " (site:reddit.com OR site:stackoverflow.com OR site:github.com OR site:news.ycombinator.com OR site:substack.com OR site:wikipedia.org OR site:quora.com OR site:stackexchange.com)",
  exclude: " -site:pinterest.com -site:expertvillage.com -site:ehow.com -site:answers.com -site:wikihow.com -site:geeksforgeeks.org -site:glassdoor.com -site:linkedin.com/jobs",
  detox: "&udm=14"
};

async function applyFilter(filterKey, manualSite = null, isExclusion = false) {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab.url.includes("google.")) {
    const url = new URL(tab.url);
    const params = new URLSearchParams(url.search);
    let query = params.get('q');
    if (!query) return;

    query = query.split(" (site:")[0].split(" -site:")[0];
    let filterString = "";
    if (manualSite) {
        const cleanSite = manualSite.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "").split('/')[0];
        filterString = ` (site:${cleanSite})`;
    } else if (isExclusion) {
        filterString = filters.exclude;
    } else {
        filterString = filters[filterKey];
    }
    
    if (filterKey === 'detox') {
      const newUrl = url.origin + url.pathname + '?' + params.toString() + filters.detox;
      chrome.tabs.update(tab.id, { url: newUrl });
      return;
    }
    
    params.set('q', query + filterString);
    chrome.tabs.update(tab.id, { url: url.origin + url.pathname + '?' + params.toString() });
  } else {
    alert("Please use this on a Google search results page!");
  }
}

document.getElementById('filterSocial').addEventListener('click', () => applyFilter('social'));
document.getElementById('filterTech').addEventListener('click', () => applyFilter('tech'));
document.getElementById('filterAll').addEventListener('click', () => applyFilter('all'));
document.getElementById('excludeSlop').addEventListener('click', () => applyFilter(null, null, true));
document.getElementById('filterDetox').addEventListener('click', () => applyFilter('detox'));
document.getElementById('filterManual').addEventListener('click', () => {
  const site = document.getElementById('manualSite').value.trim();
  if (site) applyFilter(null, site);
});
document.getElementById('manualSite').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') document.getElementById('filterManual').click();
});