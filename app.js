// Trend Feed Reader App

(function () {
  'use strict';

  var GIRLS_FILES = [
    'data/girls-fashion.json',
    'data/girls-beauty.json',
    'data/girls-gourmet.json',
    'data/girls-music.json',
    'data/girls-sns.json',
    'data/girls-lifestyle.json',
    'data/girls-idol.json',
    'data/girls-spot.json'
  ];

  var BOYS_FILES = [
    'data/boys-fashion.json',
    'data/boys-beauty.json',
    'data/boys-gourmet.json',
    'data/boys-music.json',
    'data/boys-lifestyle.json',
    'data/boys-gadget.json',
    'data/boys-spot.json'
  ];

  var CATEGORY_ICONS = {
    fashion: '\uD83D\uDC57',
    beauty: '\u2728',
    gourmet: '\uD83C\uDF7D\uFE0F',
    music: '\uD83C\uDFB5',
    sns: '\uD83D\uDCF1',
    lifestyle: '\uD83C\uDFE0',
    idol: '\uD83C\uDF1F',
    gadget: '\uD83D\uDD27',
    spot: '\uD83D\uDCCD'
  };

  // Category accent colors
  var CATEGORY_COLORS = {
    fashion: { bg: 'rgba(168, 85, 247, 0.12)', color: '#a855f7', border: 'rgba(168, 85, 247, 0.3)' },
    beauty: { bg: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' },
    gourmet: { bg: 'rgba(251, 146, 60, 0.12)', color: '#fb923c', border: 'rgba(251, 146, 60, 0.3)' },
    music: { bg: 'rgba(52, 211, 153, 0.12)', color: '#34d399', border: 'rgba(52, 211, 153, 0.3)' },
    sns: { bg: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)' },
    lifestyle: { bg: 'rgba(250, 204, 21, 0.12)', color: '#facc15', border: 'rgba(250, 204, 21, 0.3)' },
    idol: { bg: 'rgba(251, 113, 133, 0.12)', color: '#fb7185', border: 'rgba(251, 113, 133, 0.3)' },
    gadget: { bg: 'rgba(148, 163, 184, 0.12)', color: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' },
    spot: { bg: 'rgba(244, 114, 182, 0.12)', color: '#f472b6', border: 'rgba(244, 114, 182, 0.3)' }
  };

  var allData = [];
  var activeFilter = 'all';
  var searchQuery = '';
  var activeKeyword = '';
  var cardView = false;

  // DOM refs
  var feedList, feedTitle, feedEmpty, searchInput, viewToggle, viewIcon;
  var sidebar, sidebarToggle, sidebarOverlay;
  var activeKeywordEl;

  function init() {
    feedList = document.getElementById('feed-list');
    feedTitle = document.getElementById('feed-title');
    feedEmpty = document.getElementById('feed-empty');
    searchInput = document.getElementById('search-input');
    viewToggle = document.getElementById('view-toggle');
    viewIcon = document.getElementById('view-icon');
    sidebar = document.getElementById('sidebar');
    sidebarToggle = document.getElementById('sidebar-toggle');
    sidebarOverlay = document.getElementById('sidebar-overlay');
    activeKeywordEl = document.getElementById('active-keyword');

    if (!feedList) return;

    setupSidebar();
    setupSearch();
    setupViewToggle();
    setupKeywordClear();
    loadAllData();
  }

  function loadAllData() {
    var allFiles = GIRLS_FILES.concat(BOYS_FILES);
    Promise.all(allFiles.map(function (f) {
      return fetch(f).then(function (r) { return r.json(); });
    })).then(function (datasets) {
      allData = datasets;
      buildSidebarNav();
      renderFeed();
    });
  }

  // ===== Sidebar =====

  function setupSidebar() {
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', function () {
        sidebar.classList.toggle('open');
        sidebarOverlay.classList.toggle('open');
      });
    }
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', function () {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('open');
      });
    }

    // Group collapse/expand
    document.querySelectorAll('.nav-group-header').forEach(function (header) {
      header.addEventListener('click', function () {
        header.parentElement.classList.toggle('collapsed');
      });
    });
  }

  function buildSidebarNav() {
    var girlsNav = document.getElementById('nav-girls');
    var boysNav = document.getElementById('nav-boys');
    var totalCount = 0;

    allData.forEach(function (data) {
      var count = data.items.length;
      totalCount += count;
      var icon = CATEGORY_ICONS[data.category] || '\uD83D\uDCC1';
      var filterKey = data.gender + '-' + data.category;
      var catColor = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.fashion;

      var btn = document.createElement('button');
      btn.className = 'nav-item';
      btn.setAttribute('data-filter', filterKey);
      btn.setAttribute('data-gender', data.gender);
      btn.setAttribute('data-category', data.category);
      btn.innerHTML =
        '<span class="nav-icon">' + icon + '</span>' +
        '<span class="nav-label">' + data.categoryLabel + '</span>' +
        '<span class="nav-count">' + count + '</span>';

      btn.addEventListener('click', function () {
        setActiveFilter(filterKey, icon + ' ' + data.categoryLabel);
      });

      if (data.gender === 'girls') {
        girlsNav.appendChild(btn);
      } else {
        boysNav.appendChild(btn);
      }
    });

    document.getElementById('count-all').textContent = totalCount;

    // "All" button
    document.querySelector('.nav-item[data-filter="all"]').addEventListener('click', function () {
      setActiveFilter('all', 'すべてのフィード');
    });

    // Gender group headers as filters
    document.querySelectorAll('.nav-group-header').forEach(function (header) {
      var group = header.getAttribute('data-group');
      header.addEventListener('dblclick', function () {
        var label = group === 'girls' ? '\uD83D\uDC69 女子トレンド' : '\uD83D\uDC68 男子トレンド';
        setActiveFilter(group, label);
      });
    });
  }

  function setActiveFilter(filter, label) {
    activeFilter = filter;
    feedTitle.textContent = label;

    document.querySelectorAll('.nav-item').forEach(function (btn) {
      btn.classList.remove('active');
    });

    var activeBtn = document.querySelector('.nav-item[data-filter="' + filter + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    renderFeed();

    // Close mobile sidebar
    sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('open');
  }

  // ===== Search =====

  function setupSearch() {
    var debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        searchQuery = searchInput.value.toLowerCase().trim();
        renderFeed();
      }, 200);
    });
  }

  // ===== Keyword Filter =====

  function setupKeywordClear() {
    var clearBtn = document.getElementById('keyword-clear');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        activeKeyword = '';
        updateKeywordBar();
        renderFeed();
      });
    }
  }

  function setKeywordFilter(keyword) {
    if (activeKeyword === keyword) {
      activeKeyword = '';
    } else {
      activeKeyword = keyword;
    }
    updateKeywordBar();
    renderFeed();
  }

  function updateKeywordBar() {
    var bar = document.getElementById('keyword-bar');
    var label = document.getElementById('keyword-label');
    if (!bar) return;
    if (activeKeyword) {
      bar.style.display = 'flex';
      label.textContent = '#' + activeKeyword;
    } else {
      bar.style.display = 'none';
    }
  }

  // ===== View Toggle =====

  function setupViewToggle() {
    viewToggle.addEventListener('click', function () {
      cardView = !cardView;
      feedList.classList.toggle('card-view', cardView);
      viewIcon.innerHTML = cardView ? '&#9776;' : '&#9638;';
      viewToggle.title = cardView ? 'リスト表示' : 'カード表示';
    });
  }

  // ===== Rendering =====

  function renderStars(count) {
    return '<span class="stars">' + '\u2605'.repeat(count) + '\u2606'.repeat(5 - count) + '</span>';
  }

  function getRankClass(rank) {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'rank-default';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return parts[1].replace(/^0/, '') + '月' + parts[2].replace(/^0/, '') + '日';
  }

  function matchesFilter(data) {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'girls' || activeFilter === 'boys') {
      return data.gender === activeFilter;
    }
    return (data.gender + '-' + data.category) === activeFilter;
  }

  function matchesSearch(item) {
    if (!searchQuery) return true;
    var haystack = (
      item.name + ' ' +
      item.description + ' ' +
      (item.keywords || []).join(' ') +
      item.source
    ).toLowerCase();
    return haystack.indexOf(searchQuery) !== -1;
  }

  function matchesKeyword(item) {
    if (!activeKeyword) return true;
    return (item.keywords || []).indexOf(activeKeyword) !== -1;
  }

  function renderFeed() {
    var html = '';
    var count = 0;
    var lastCategory = '';

    allData.forEach(function (data) {
      if (!matchesFilter(data)) return;

      var categoryItems = data.items.filter(function (item) {
        return matchesSearch(item) && matchesKeyword(item);
      });
      if (categoryItems.length === 0) return;

      var catColor = CATEGORY_COLORS[data.category] || CATEGORY_COLORS.fashion;
      var sectionColor = catColor.color;

      // Section divider
      var sectionLabel = (data.gender === 'girls' ? '\uD83D\uDC69 ' : '\uD83D\uDC68 ') + data.categoryLabel;
      if (sectionLabel !== lastCategory) {
        html += '<div class="feed-section" style="border-left: 3px solid ' + sectionColor + ';">' +
          '<span style="color:' + sectionColor + ';">' + sectionLabel + '</span>' +
          '<span class="feed-section-date">' + formatDate(data.lastUpdated) + ' 更新</span>' +
          '</div>';
        lastCategory = sectionLabel;
      }

      categoryItems.forEach(function (item) {
        count++;
        var genderClass = 'gender-' + data.gender;

        var catStyle = 'background:' + catColor.bg + ';color:' + catColor.color + ';border:1px solid ' + catColor.border;

        var ageTags = item.ageGroup.map(function (a) {
          return '<span class="age-tag">' + a + '</span>';
        }).join('');

        var keywordTags = (item.keywords || []).map(function (k) {
          var activeClass = (k === activeKeyword) ? ' keyword-active' : '';
          return '<span class="keyword-tag clickable' + activeClass + '" data-keyword="' + k + '">#' + k + '</span>';
        }).join('');

        var dateHtml = data.lastUpdated
          ? '<span class="feed-item-date">' + formatDate(data.lastUpdated) + '</span>'
          : '';

        html +=
          '<div class="feed-item ' + genderClass + '" data-id="' + data.gender + '-' + data.category + '-' + item.rank + '" data-category="' + data.category + '">' +
            '<div class="feed-item-rank ' + getRankClass(item.rank) + '">' + item.rank + '</div>' +
            '<div class="feed-item-body">' +
              '<div class="feed-item-header">' +
                '<span class="feed-item-category" style="' + catStyle + '">' + data.categoryLabel + '</span>' +
                dateHtml +
                '<span class="feed-item-source">' + item.source + '</span>' +
              '</div>' +
              '<div class="feed-item-name">' + item.name + '</div>' +
              '<div class="feed-item-desc">' + item.description + '</div>' +
              '<div class="feed-item-meta">' +
                renderStars(item.popularity) + ' ' +
                ageTags + ' ' +
                keywordTags +
              '</div>' +
            '</div>' +
          '</div>';
      });
    });

    feedList.innerHTML = html;
    feedEmpty.style.display = count === 0 ? 'block' : 'none';

    // Click to expand/collapse (but not on keyword tags)
    feedList.querySelectorAll('.feed-item').forEach(function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.classList.contains('keyword-tag')) return;
        el.classList.toggle('expanded');
      });
    });

    // Keyword tag click
    feedList.querySelectorAll('.keyword-tag.clickable').forEach(function (tag) {
      tag.addEventListener('click', function (e) {
        e.stopPropagation();
        setKeywordFilter(tag.getAttribute('data-keyword'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
