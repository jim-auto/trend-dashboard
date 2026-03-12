// Shared utilities for trend site

function renderStars(count) {
  return '<span class="stars">' + '\u2605'.repeat(count) + '\u2606'.repeat(5 - count) + '</span>';
}

function getRankClass(rank) {
  if (rank === 1) return 'rank-1';
  if (rank === 2) return 'rank-2';
  if (rank === 3) return 'rank-3';
  return 'rank-default';
}

function renderTrendCard(item, categoryLabel) {
  const ageTags = item.ageGroup.map(function(a) {
    return '<span class="age-tag">' + a + '</span>';
  }).join('');

  const keywordTags = (item.keywords || []).map(function(k) {
    return '<span class="keyword-tag">' + k + '</span>';
  }).join('');

  return '<div class="trend-card">' +
    '<div class="card-header">' +
      '<span class="rank-badge ' + getRankClass(item.rank) + '">' + item.rank + '</span>' +
      (categoryLabel ? '<span class="category-badge">' + categoryLabel + '</span>' : '') +
    '</div>' +
    '<div class="trend-name">' + item.name + '</div>' +
    '<div class="trend-desc">' + item.description + '</div>' +
    '<div class="trend-meta">' +
      renderStars(item.popularity) +
      '<div class="age-tags">' + ageTags + '</div>' +
    '</div>' +
    '<div class="keywords">' + keywordTags + '</div>' +
    '<div class="trend-source">' + item.source + '</div>' +
  '</div>';
}

// -- Index page: load pickups --
function loadPickups() {
  var girlsContainer = document.getElementById('girls-pickup');
  var boysContainer = document.getElementById('boys-pickup');
  if (!girlsContainer || !boysContainer) return;

  var girlsFiles = [
    'data/girls-fashion.json',
    'data/girls-beauty.json',
    'data/girls-gourmet.json',
    'data/girls-music.json',
    'data/girls-sns.json',
    'data/girls-lifestyle.json',
    'data/girls-idol.json'
  ];

  var boysFiles = [
    'data/boys-fashion.json',
    'data/boys-beauty.json',
    'data/boys-gourmet.json',
    'data/boys-music.json',
    'data/boys-lifestyle.json',
    'data/boys-gadget.json'
  ];

  Promise.all(girlsFiles.map(function(f) { return fetch(f).then(function(r) { return r.json(); }); }))
    .then(function(datasets) {
      var html = '';
      datasets.forEach(function(data) {
        if (data.items && data.items.length > 0) {
          html += renderTrendCard(data.items[0], data.categoryLabel);
        }
      });
      girlsContainer.innerHTML = html;
    });

  Promise.all(boysFiles.map(function(f) { return fetch(f).then(function(r) { return r.json(); }); }))
    .then(function(datasets) {
      var html = '';
      datasets.forEach(function(data) {
        if (data.items && data.items.length > 0) {
          html += renderTrendCard(data.items[0], data.categoryLabel);
        }
      });
      boysContainer.innerHTML = html;
    });
}

// -- Detail page: load all categories --
function loadDetailPage(gender, files) {
  var grid = document.getElementById('trend-grid');
  var tabBar = document.getElementById('tab-bar');
  var ageFilter = document.getElementById('age-filter');
  if (!grid || !tabBar) return;

  var allData = [];
  var activeCategory = 'all';
  var activeAge = 'all';

  Promise.all(files.map(function(f) { return fetch(f).then(function(r) { return r.json(); }); }))
    .then(function(datasets) {
      allData = datasets;
      renderTabs(datasets);
      renderCards();
      handleHash();
    });

  function renderTabs(datasets) {
    var html = '<button class="tab-btn active" data-cat="all">全て</button>';
    datasets.forEach(function(data) {
      html += '<button class="tab-btn" data-cat="' + data.category + '">' + data.categoryLabel + '</button>';
    });
    tabBar.innerHTML = html;

    tabBar.addEventListener('click', function(e) {
      if (e.target.classList.contains('tab-btn')) {
        tabBar.querySelectorAll('.tab-btn').forEach(function(b) { b.classList.remove('active'); });
        e.target.classList.add('active');
        activeCategory = e.target.getAttribute('data-cat');
        renderCards();
      }
    });

    if (ageFilter) {
      ageFilter.addEventListener('click', function(e) {
        if (e.target.classList.contains('age-filter-btn')) {
          ageFilter.querySelectorAll('.age-filter-btn').forEach(function(b) { b.classList.remove('active'); });
          e.target.classList.add('active');
          activeAge = e.target.getAttribute('data-age');
          renderCards();
        }
      });
    }
  }

  function renderCards() {
    var html = '';
    allData.forEach(function(data) {
      if (activeCategory !== 'all' && data.category !== activeCategory) return;
      data.items.forEach(function(item) {
        if (activeAge !== 'all' && item.ageGroup.indexOf(activeAge) === -1) return;
        html += renderTrendCard(item, activeCategory === 'all' ? data.categoryLabel : null);
      });
    });
    grid.innerHTML = html || '<p style="color:#8b949e;">該当するトレンドがありません</p>';
  }

  function handleHash() {
    var hash = window.location.hash.replace('#', '');
    if (hash) {
      var btn = tabBar.querySelector('[data-cat="' + hash + '"]');
      if (btn) {
        btn.click();
      }
    }
  }
}

// Auto-init
document.addEventListener('DOMContentLoaded', function() {
  loadPickups();
});
