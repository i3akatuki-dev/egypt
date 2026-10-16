/* ==========================================================================
   埃及漫游 · 应用逻辑（无框架、无构建）
   hash 路由：#/  地图主页    #/city/<region>  城市页    #/site/<id>  景点详情    #/about  关于
   ========================================================================== */
(function () {
  'use strict';

  var DATA = window.EGYPT || { regions: [], attractions: [] };
  var CREDITS = window.EGYPT_CREDITS || {};

  var REGIONS = DATA.regions.slice();
  var SITES = DATA.attractions.slice();

  var regionById = {};
  REGIONS.forEach(function (r) { r.sites = []; regionById[r.id] = r; });
  SITES.forEach(function (a) { regionById[a.region] && regionById[a.region].sites.push(a); });

  /* ------------------------------------------------------------- 别名表 --- */
  var ALIAS = {
    a01: '金字塔 大金字塔 狮身人面像 胡夫 吉萨 giza sphinx pyramid khufu',
    a02: '阶梯金字塔 左塞尔 伊姆霍特普 djoser saqqara step',
    a03: '埃及博物馆 老馆 解放广场 图坦卡蒙 tahrir museum',
    a04: '大埃及博物馆 gem 吉萨新馆 grand egyptian museum',
    a05: '哈利利 汗哈利利 集市 市场 老开罗 bazaar khan',
    a06: '萨拉丁 城堡 阿里清真寺 穆罕默德阿里 citadel saladin mosque',
    a07: '卡纳克 卡纳克神庙 阿蒙 karnak amun hypostyle',
    a08: '卢克索神庙 luxor temple',
    a09: '帝王谷 国王谷 图坦卡蒙 kv62 valley kings',
    a10: '王后谷 奈菲尔塔利 奈费尔塔里 nefertari queens',
    a11: '哈特谢普苏特 女王神庙 代尔巴哈里 hatshepsut deir bahari',
    a12: '门农 门农巨像 memnon colossi',
    a13: '菲莱 伊西斯 菲莱神庙 philae isis',
    a14: '阿布辛贝 拉美西斯二世 大神庙 abu simbel ramesses',
    a15: '努比亚 村落 阿斯旺 象岛 nubian aswan elephantine',
    a16: '未完成方尖碑 采石场 obelisk quarry',
    a17: '三桅帆船 帆船 尼罗河 felucca nile sail',
    a18: '亚历山大图书馆 图书馆 bibliotheca alexandrina library',
    a19: '盖贝依 凯特贝 城堡 灯塔 法罗斯 qaitbay citadel lighthouse',
    a20: '庞贝柱 萨拉皮雍 pompey pillar',
    a21: '地下墓穴 考姆舒卡法 舒卡法 catacombs kom shoqafa',
    a22: '红海 浮潜 珊瑚 潜水 snorkeling coral diving red sea',
    a23: '吉夫顿 吉夫顿岛 giftun island hurghada',
    a24: '拉斯穆罕默德 国家公园 ras mohammed muhammad national park'
  };

  /* --------------------------------------------------------------- 工具 --- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function imgPath(a, k) { return 'img/' + a.id + '/' + (k || 1) + '.webp'; }
  function thumb(a) { return imgPath(a, 1); }
  function creditOf(a) { return CREDITS[a.id] || []; }
  function siteByNo(no) { return SITES.filter(function (a) { return a.no === no; })[0]; }

  var TOPBAR_H = 50;
  function scrollTop() { window.scrollTo(0, 0); }

  /* --------------------------------------------------------------- 路由 --- */
  var view = null, topbar = null, titleEl = null, backBtn = null;

  function parseHash() {
    var h = (location.hash || '').replace(/^#/, '');
    if (!h || h === '/') return { name: 'home' };
    var parts = h.split('/').filter(Boolean);
    if (parts[0] === 'city') return { name: 'city', id: parts[1] };
    if (parts[0] === 'site') return { name: 'site', id: parts[1] };
    if (parts[0] === 'about') return { name: 'about' };
    return { name: 'home' };
  }

  function go(hash, replace) {
    if (replace) location.replace(hash);
    else location.hash = hash;
  }

  var lastRoute = null;
  function onRoute() {
    var r = parseHash();
    var sameDepth = lastRoute && lastRoute.name === r.name && lastRoute.id === r.id;
    lastRoute = r;
    render(r);
    if (!sameDepth) scrollTop();
  }

  function render(r) {
    document.body.classList.remove('no-topbar');
    if (r.name === 'home') renderHome();
    else if (r.name === 'city') renderCity(r.id);
    else if (r.name === 'site') renderSite(r.id);
    else if (r.name === 'about') renderAbout();
    syncTopButton();
  }

  function setTopbar(title, showBack) {
    titleEl.textContent = title;
    backBtn.classList.toggle('hidden', !showBack);
  }

  /* ----------------------------------------------------------- 首页视图 --- */
  function renderHome() {
    setTopbar('埃及漫游', false);

    var chips = REGIONS.map(function (reg) {
      return '<button class="chip" data-goto="#/city/' + reg.id + '">' + esc(reg.name) +
        '<span class="n">' + reg.sites.length + '</span></button>';
    }).join('');

    view.innerHTML =
      '<section class="hero fade-in">' +
        '<div class="kicker">Ancient Egypt</div>' +
        '<h2>埃及漫游</h2>' +
        '<p>一张手绘的古地图，二十四处的神庙、金字塔与海。点开一座城，就能一路读到它的来处。</p>' +
      '</section>' +
      '<button class="home-search" id="home-search" type="button">' +
        '<svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.2" fill="none" stroke="currentColor" stroke-width="2.2"/><path d="M15.2 15.2 L20.5 20.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>' +
        '<span>搜景点名，中英文都行</span>' +
      '</button>' +
      '<div class="map-wrap fade-in">' + window.EgyptMap.svg() + '</div>' +
      '<div class="map-legend">' +
        '<span><i style="background:#F0E2BA;border:1px solid #C9A227"></i>埃及</span>' +
        '<span><i style="background:#1F7A8C"></i>尼罗河 · 海洋</span>' +
        '<span><i style="background:#C9A227;border-radius:50%"></i>可点开的城市</span>' +
      '</div>' +
      '<div class="chips">' + chips + '</div>' +
      '<div class="home-foot">' +
        '<p style="margin:0 0 6px">共 ' + SITES.length + ' 处景点 · 5 个地区 · 可离线使用</p>' +
        '<p style="margin:0">照片来自 Wikimedia Commons，逐处署名见景点页与' +
        ' <a href="#/about">「关于 · 来源与版权」</a></p>' +
      '</div>';

    $('#home-search', view).addEventListener('click', openSearch);
    Array.prototype.forEach.call(view.querySelectorAll('.city-hit'), function (g) {
      g.addEventListener('click', function () { go('#/city/' + g.getAttribute('data-city')); });
      g.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go('#/city/' + g.getAttribute('data-city')); }
      });
    });
    Array.prototype.forEach.call(view.querySelectorAll('.chip'), function (b) {
      b.addEventListener('click', function () { go(b.getAttribute('data-goto')); });
    });
  }

  /* ----------------------------------------------------------- 城市视图 --- */
  function renderCity(regionId) {
    var reg = regionById[regionId];
    if (!reg) { go('#/', true); return; }
    setTopbar(reg.name, true);

    var cards = reg.sites.map(function (a) {
      return '<button class="card" data-goto="#/site/' + a.id + '">' +
        '<span class="thumb"><img loading="lazy" src="' + imgPath(a, 1) + '" alt="" width="84" height="84"></span>' +
        '<span class="body">' +
          '<span class="no">' + pad(a.no) + '</span>' +
          '<h3>' + esc(a.name) + '</h3>' +
          '<div class="en">' + esc(a.en) + '</div>' +
          '<div class="one">' + esc(a.summary) + '</div>' +
        '</span></button>';
    }).join('');

    view.innerHTML =
      '<section class="city-hero fade-in">' +
        '<div class="en">' + esc(reg.en) + '</div>' +
        '<h2>' + esc(reg.name) + '</h2>' +
        '<p>' + esc(reg.intro) + '</p>' +
        '<div class="city-count">共 ' + reg.sites.length + ' 处景点</div>' +
      '</section>' +
      '<div class="cards">' + cards + '</div>' +
      '<div class="pager" style="border-top:0;margin-top:16px">' +
        '<a href="#/"><span class="lab">返回</span><span class="t">地图</span></a>' +
      '</div>';

    bindGoto();
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function bindGoto() {
    Array.prototype.forEach.call(view.querySelectorAll('[data-goto]'), function (b) {
      b.addEventListener('click', function () { go(b.getAttribute('data-goto')); });
    });
  }

  /* ----------------------------------------------------------- 景点视图 --- */
  function renderSite(id) {
    var a = SITES.filter(function (s) { return s.id === id; })[0];
    if (!a) { go('#/', true); return; }
    setTopbar(a.name.replace(/[（(].*?[）)]/g, '').trim(), true);

    var creds = creditOf(a);
    var nImg = Math.max(creds.length, 1);

    var slides = '';
    for (var i = 1; i <= nImg; i++) {
      slides += '<div class="slide"><img src="' + imgPath(a, i) + '" alt="' + esc(a.name) + ' 图 ' + i + '"' +
        (i === 1 ? '' : ' loading="lazy"') + '></div>';
    }
    var dots = '';
    for (var d = 1; d <= nImg; d++) dots += '<i class="' + (d === 1 ? 'on' : '') + '"></i>';

    var hist = a.history.map(function (h) {
      return '<div class="hist-item"><h4>' + esc(h.title) + '</h4><p>' + esc(h.text) + '</p></div>';
    }).join('');

    var infoRows = Object.keys(a.practical).map(function (k) {
      return '<div class="row"><b>' + esc(k) + '</b><span>' + esc(a.practical[k]) + '</span></div>';
    }).join('');

    var creditHtml = creds.length
      ? '<ol>' + creds.map(function (c) {
          var who = esc(c.author);
          var lic = esc(c.license);
          var link = c.page ? '<a href="' + esc(c.page) + '" target="_blank" rel="noopener">' + who + '</a>' : who;
          var licLink = c.licenseUrl
            ? '<a href="' + esc(c.licenseUrl) + '" target="_blank" rel="noopener">' + lic + '</a>'
            : lic;
          return '<li>' + link + ' · <span class="lic">' + licLink + '</span>' +
            (c.title ? ' · ' + esc(c.title) : '') + '</li>';
        }).join('') + '</ol>'
      : '<p style="font-size:12px;color:#6B563F;margin:0">本页照片来自 Wikimedia Commons，详见「关于 · 来源与版权」。</p>';

    var prev = siteByNo(a.no - 1), next = siteByNo(a.no + 1);

    view.innerHTML =
      '<div class="gallery fade-in"><div class="track" id="gal">' + slides + '</div>' +
        '<div class="dots" id="gal-dots">' + dots + '</div>' +
        '<div class="idx" id="gal-idx">1 / ' + nImg + '</div></div>' +

      '<div class="site-head">' +
        '<div class="no">' + pad(a.no) + ' · ' + esc(regionById[a.region] ? regionById[a.region].name : '') + '</div>' +
        '<h2>' + esc(a.name) + '</h2>' +
        '<div class="en">' + esc(a.en) + '</div>' +
        '<div class="meta">' +
          (a.location ? '<span class="tag">' + esc(a.location) + '</span>' : '') +
          (a.period ? '<span class="tag">' + esc(a.period) + '</span>' : '') +
        '</div>' +
      '</div>' +

      (a.note ? '<div class="note-box">' + esc(a.note) + '</div>' : '') +

      '<section class="section"><h3>简介</h3>' +
        a.description.split('\n\n').map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '</section>' +

      '<section class="section"><h3>历史讲解</h3>' + hist + '</section>' +

      '<section class="section"><h3>实用信息</h3></section>' +
      '<div class="info-card">' + infoRows +
        '<div class="warn">⚠️ 信息可能变动，出行前请以官方公布为准。</div>' +
      '</div>' +

      '<section class="section"><h3>图片来源</h3></section>' +
      '<div class="credits">' + creditHtml +
        '<p style="font-size:11.6px;color:#6B563F;margin:8px 0 0">' +
        '完整来源与许可说明见 <a href="#/about" style="color:#155C6B">「关于 · 来源与版权」</a>。</p>' +
      '</div>' +

      '<div class="pager">' +
        (prev ? '<a href="#/site/' + prev.id + '"><span class="lab">上一处</span><span class="t">' + esc(prev.name) + '</span></a>' : '<span style="flex:1"></span>') +
        (next ? '<a class="next" href="#/site/' + next.id + '"><span class="lab">下一处</span><span class="t">' + esc(next.name) + '</span></a>' : '<span style="flex:1"></span>') +
      '</div>' +
      '<div class="pager" style="border-top:0;margin-top:10px">' +
        '<a href="#/city/' + a.region + '"><span class="lab">返回</span><span class="t">' +
        esc(regionById[a.region] ? regionById[a.region].name : '城市') + '</span></a>' +
      '</div>';

    bindGallery();
    bindGoto();
  }

  function bindGallery() {
    var track = $('#gal'), dots = $('#gal-dots'), idx = $('#gal-idx');
    if (!track) return;
    var items = track.querySelectorAll('.slide');
    var total = items.length;
    var ticking = false;

    track.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        ticking = false;
        var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        i = Math.max(0, Math.min(total - 1, i));
        if (idx) idx.textContent = (i + 1) + ' / ' + total;
        if (dots) {
          Array.prototype.forEach.call(dots.children, function (el, k) {
            el.classList.toggle('on', k === i);
          });
        }
      });
    }, { passive: true });
  }

  /* ----------------------------------------------------------- 关于视图 --- */
  function renderAbout() {
    setTopbar('关于 · 来源与版权', true);

    var groups = REGIONS.map(function (reg) {
      var items = [];
      reg.sites.forEach(function (a) {
        var creds = creditOf(a);
        creds.forEach(function (c) {
          var who = esc(c.author);
          var link = c.page ? '<a href="' + esc(c.page) + '" target="_blank" rel="noopener">' + who + '</a>' : who;
          items.push('<li>' + pad(a.no) + ' ' + esc(a.name) + '：' + link +
            ' · <span class="lic">' + esc(c.license) + '</span>' +
            (c.title ? ' · <span style="opacity:.8">' + esc(c.title) + '</span>' : '') + '</li>');
        });
      });
      if (!items.length) return '';
      return '<div class="src-group"><h4>' + esc(reg.name) + '</h4><ul>' + items.join('') + '</ul></div>';
    }).join('');

    view.innerHTML =
      '<section class="section about fade-in">' +
        '<div class="sub">About &amp; Credits</div>' +
        '<h2>埃及漫游</h2>' +
        '<p>这是一份送给即将启程的朋友的随身导览：一张手绘风格的埃及地图，' + SITES.length +
        ' 处景点，每处配照片、简介、四段式的历史讲解与实用信息。做成可「添加到主屏幕」的网页应用，' +
        '装上之后断网也能打开。</p>' +

        '<h3>内容与史实</h3>' +
        '<p>历史讲解依据公开的考古与文献资料整理（维基百科条目、博物馆与大英百科全书等公开来源），' +
        '尽量标注王朝、年代与中英专名。年代多采用学界通行说法，仍可能有争议；如果发现错误，' +
        '以官方与学术资料为准。</p>' +

        '<h3>开放时间与实用信息</h3>' +
        '<p>开放时间、交通与最佳时段均为编写时的通行情况，<b>随时可能变动</b>，出行前请以官方公布为准。</p>' +

        '<h3>照片</h3>' +
        '<p>全部照片来自 <a href="https://commons.wikimedia.org/" target="_blank" rel="noopener" style="color:#155C6B">Wikimedia Commons</a>，' +
        '以公有领域（Public Domain）与知识共享（CC BY / CC BY-SA）授权为主。' +
        '每张照片的作者与许可协议列在下方；下载后统一压缩为 WebP 以便离线保存。' +
        '如果某张照片的署名有遗漏或不当，请告知以便更正或移除。</p>' +
        '<p style="font-size:12.5px;color:#6B563F">本站为个人非商业使用，不含任何广告、账号与追踪。</p>' +

        '<h3>逐处照片署名</h3>' +
      '</section>' +
      '<div class="credits" style="margin-top:14px">' + (groups || '<p style="font-size:12px">照片信息尚未生成。</p>') + '</div>' +
      '<div class="pager" style="margin-top:18px">' +
        '<a href="#/"><span class="lab">返回</span><span class="t">地图</span></a>' +
      '</div>';
  }

  /* --------------------------------------------------------------- 搜索 --- */
  var searchPanel = null, searchInput = null, searchResults = null;
  var INDEX = SITES.map(function (a) {
    var reg = regionById[a.region];
    var hay = [a.name, a.en, a.location, reg ? reg.name : '', reg ? reg.en : '', ALIAS[a.id] || '']
      .join(' ').replace(/[（）()·、，,]/g, ' ').toLowerCase();
    return { a: a, hay: hay };
  });

  function openSearch() {
    searchPanel.classList.remove('hidden');
    searchPanel.setAttribute('aria-hidden', 'false');
    renderSearch('');
    setTimeout(function () { searchInput.focus(); }, 60);
  }
  function closeSearch() {
    searchPanel.classList.add('hidden');
    searchPanel.setAttribute('aria-hidden', 'true');
    searchInput.value = '';
    searchInput.blur();
  }

  function highlight(text, q) {
    if (!q) return esc(text);
    var i = text.toLowerCase().indexOf(q);
    if (i < 0) return esc(text);
    return esc(text.slice(0, i)) + '<em>' + esc(text.slice(i, i + q.length)) + '</em>' + esc(text.slice(i + q.length));
  }

  function renderSearch(q) {
    var query = (q || '').trim().toLowerCase();
    if (!query) {
      searchResults.innerHTML =
        '<div class="sr-hint">输入景点名就能直接跳过去，不用先在地图上找。<br>' +
        '试试 <b>卡纳克</b>、<b>金字塔</b>、<b>abu simbel</b>，或者输入城市名 <b>卢克索</b>。</div>' +
        cityChipsHtml();
      bindSearchChips();
      return;
    }
    var hits = INDEX.filter(function (e) { return e.hay.indexOf(query) >= 0; });
    hits.sort(function (x, y) {
      var xn = x.a.name.toLowerCase().indexOf(query) >= 0 ? 0 : 1;
      var yn = y.a.name.toLowerCase().indexOf(query) >= 0 ? 0 : 1;
      return xn - yn || x.a.no - y.a.no;
    });

    if (!hits.length) {
      searchResults.innerHTML =
        '<div class="sr-hint">没有找到「' + esc(q) + '」。<br>换个说法试试，或直接进城市页面看看：</div>' +
        cityChipsHtml();
      bindSearchChips();
      return;
    }

    searchResults.innerHTML = hits.map(function (e) {
      var a = e.a, reg = regionById[a.region];
      return '<button class="sr-row" data-goto="#/site/' + a.id + '">' +
        '<span class="thumb"><img loading="lazy" src="' + imgPath(a, 1) + '" alt=""></span>' +
        '<span class="body">' +
          '<span class="t">' + highlight(a.name, query) + '</span>' +
          '<span class="s"><span class="citytag">' + esc(reg ? reg.name : '') + '</span>' + esc(a.en) + '</span>' +
        '</span></button>';
    }).join('');

    Array.prototype.forEach.call(searchResults.querySelectorAll('[data-goto]'), function (b) {
      b.addEventListener('click', function () {
        closeSearch();
        go(b.getAttribute('data-goto'));
      });
    });
  }

  function cityChipsHtml() {
    return '<div class="sr-city">' + REGIONS.map(function (r) {
      return '<button class="chip" data-goto="#/city/' + r.id + '">' + esc(r.name) +
        '<span class="n">' + r.sites.length + '</span></button>';
    }).join('') + '</div>';
  }
  function bindSearchChips() {
    Array.prototype.forEach.call(searchResults.querySelectorAll('[data-goto]'), function (b) {
      b.addEventListener('click', function () {
        closeSearch();
        go(b.getAttribute('data-goto'));
      });
    });
  }

  /* ----------------------------------------------------------- 回到顶部 --- */
  var btnTop = null;
  function syncTopButton() {
    var show = window.scrollY > 500;
    btnTop.classList.toggle('hidden', !show);
  }

  /* --------------------------------------------------------------- 初始化 --- */
  function init() {
    view = $('#view');
    topbar = $('#topbar');
    titleEl = $('#topbar-title');
    backBtn = $('#btn-back');
    searchPanel = $('#search-panel');
    searchInput = $('#search-input');
    searchResults = $('#search-results');
    btnTop = $('#btn-top');

    backBtn.addEventListener('click', function () {
      if (history.length > 1) history.back();
      else go('#/');
    });

    $('#btn-search').addEventListener('click', openSearch);
    $('#btn-search-close').addEventListener('click', closeSearch);

    searchInput.addEventListener('input', function () { renderSearch(searchInput.value); });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeSearch();
      if (e.key === 'Enter') {
        var first = searchResults.querySelector('[data-goto]');
        if (first) { closeSearch(); go(first.getAttribute('data-goto')); }
      }
    });

    btnTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', syncTopButton, { passive: true });

    window.addEventListener('hashchange', onRoute);

    // 开屏结束后揭示界面
    var splash = $('#splash');
    function reveal() {
      if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
      topbar.classList.remove('hidden');
      view.classList.remove('hidden');
    }
    if (splash) {
      splash.addEventListener('animationend', reveal);
      setTimeout(reveal, 900); // 兜底
    } else {
      reveal();
    }

    onRoute();
    syncTopButton();

    // 注册 Service Worker（离线可用）
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      navigator.serviceWorker.register('sw.js').catch(function () { /* 忽略 */ });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
