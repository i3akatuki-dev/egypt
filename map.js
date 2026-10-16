/* ==========================================================================
   埃及漫游 · 手绘风 SVG 埃及地图
   --------------------------------------------------------------------------
   地理准确性优先：经度/纬度 -> 等距圆柱投影（按 27°N 的 cos 做横向压缩），
   尼罗河走向、地中海与红海海岸线、西奈半岛、各城市相对方位都与真实一致。
   风格化只体现在配色、描边、装饰元素上。
   ========================================================================== */
(function () {
  'use strict';

  var LON0 = 24.0, LON1 = 37.6;   // 经度范围（含利比亚 / 苏丹 / 红海东岸）
  var LAT0 = 21.6, LAT1 = 32.4;   // 纬度范围
  var KX = Math.cos(27 * Math.PI / 180); // 0.891 —— 横向压缩，避免埃及被拉宽
  var W = 1000;
  var K = W / ((LON1 - LON0) * KX);
  var H = Math.round((LAT1 - LAT0) * K);

  function px(lon) { return (lon - LON0) * KX * K; }
  function py(lat) { return (LAT1 - lat) * K; }

  /** [[lon,lat], ...] -> "M x y L x y ..." */
  function path(points, close) {
    var d = '';
    for (var i = 0; i < points.length; i++) {
      d += (i === 0 ? 'M' : 'L') + px(points[i][0]).toFixed(1) + ' ' + py(points[i][1]).toFixed(1) + ' ';
    }
    return d + (close ? 'Z' : '');
  }

  /* ------------------------------------------------------------ 地理数据 --- */

  // 埃及本土（含西奈以西的大陆部分）
  var EGYPT_MAINLAND = [
    [25.00, 31.62], [26.50, 31.52], [27.50, 31.42], [28.50, 31.22], [29.30, 31.10],
    [29.92, 31.20], [30.50, 31.45], [31.20, 31.58], [32.00, 31.55], [32.35, 31.28],
    [32.45, 30.40], [32.60, 29.50], [32.95, 28.70], [33.30, 28.05], [33.75, 27.35],
    [34.30, 26.55], [34.78, 25.70], [35.30, 24.85], [35.90, 23.75], [36.50, 22.70],
    [36.90, 22.00],
    [35.00, 22.00], [33.00, 22.00], [31.00, 22.00], [29.00, 22.00], [27.00, 22.00],
    [25.00, 22.00],
    [25.00, 24.00], [24.95, 26.00], [24.95, 28.00], [25.00, 29.50], [25.00, 31.62]
  ];

  // 西奈半岛
  var SINAI = [
    [32.35, 31.28], [32.42, 30.55], [32.55, 29.97],
    [32.62, 29.55], [32.78, 29.15], [32.95, 28.80], [33.15, 28.45], [33.45, 28.05],
    [33.75, 27.85], [34.02, 27.75], [34.25, 27.72],
    [34.35, 28.10], [34.45, 28.50], [34.58, 28.92], [34.72, 29.25], [34.90, 29.50],
    [34.56, 30.05], [34.36, 30.60], [34.26, 31.00], [34.22, 31.28],
    [33.60, 31.24], [33.00, 31.20], [32.60, 31.22], [32.35, 31.28]
  ];

  // 地中海（埃及与利比亚北部海岸线以上）
  var MEDITERRANEAN = [
    [LON0, LAT1], [LON0, 31.68],
    [25.00, 31.62], [26.50, 31.52], [27.50, 31.42], [28.50, 31.22], [29.30, 31.10],
    [29.92, 31.20], [30.50, 31.45], [31.20, 31.58], [32.00, 31.55], [32.35, 31.28],
    [32.60, 31.22], [33.00, 31.20], [33.60, 31.24], [34.22, 31.28],
    [34.50, 31.60], [34.66, 31.85], [34.78, 32.10], [34.90, LAT1]
  ];

  // 红海 + 苏伊士湾 + 亚喀巴湾（一个连通水体，绕开西奈半岛）
  var RED_SEA = [
    [32.55, 29.97], [32.62, 29.55], [32.78, 29.15], [32.95, 28.80], [33.30, 28.05],
    [33.75, 27.35], [34.30, 26.55], [34.78, 25.70], [35.30, 24.85], [35.90, 23.75],
    [36.50, 22.70], [36.90, 22.00],
    [37.60, 22.00], [37.60, 25.90], [37.30, 25.60], [36.60, 26.60], [35.90, 27.60],
    [35.20, 28.45], [34.90, 29.50],
    [34.72, 29.25], [34.58, 28.92], [34.45, 28.50], [34.35, 28.10], [34.25, 27.72],
    [34.02, 27.75], [33.75, 27.85], [33.45, 28.05], [33.15, 28.45], [32.95, 28.80],
    [32.78, 29.15], [32.62, 29.55], [32.55, 29.97]
  ];

  // 尼罗河：从南（纳赛尔湖）一路向北到开罗，再分罗塞塔 / 达米埃塔两支入海
  var NILE_MAIN = [
    [31.30, 22.00], [31.40, 22.40], [31.55, 22.80], [31.85, 23.15], [32.20, 23.45],
    [32.55, 23.75], [32.82, 23.95], [32.88, 24.09], [32.84, 24.60], [32.72, 25.05],
    [32.64, 25.69], [32.72, 26.16], [32.20, 26.40], [31.70, 26.56], [31.40, 26.90],
    [31.18, 27.18], [30.98, 27.62], [30.78, 28.10], [30.95, 28.62], [31.09, 29.08],
    [31.18, 29.60], [31.23, 30.05]
  ];
  var NILE_ROSETTA = [
    [31.23, 30.05], [31.05, 30.38], [30.85, 30.72], [30.60, 31.05], [30.42, 31.42]
  ];
  var NILE_DAMIETTA = [
    [31.23, 30.05], [31.32, 30.45], [31.50, 30.85], [31.68, 31.18], [31.82, 31.48]
  ];

  /* ---------------------------------------------------------------- 城市 --- */
  var CITIES = [
    {
      id: 'alexandria', city: '亚历山大', en: 'Alexandria',
      lon: 29.92, lat: 31.20, lx: 6, ly: -26, anchor: 'middle', glyph: 'lighthouse'
    },
    {
      id: 'cairo', city: '开罗 · 吉萨', en: 'Cairo & Giza',
      lon: 31.13, lat: 30.01, lx: -16, ly: 30, anchor: 'middle', glyph: 'pyramid'
    },
    {
      id: 'redsea', city: '红海', en: 'Red Sea',
      lon: 33.81, lat: 27.26, lx: 30, ly: 6, anchor: 'start', glyph: 'fish'
    },
    {
      id: 'luxor', city: '卢克索', en: 'Luxor',
      lon: 32.64, lat: 25.69, lx: -30, ly: 4, anchor: 'end', glyph: 'obelisk'
    },
    {
      id: 'aswan', city: '阿斯旺', en: 'Aswan',
      lon: 32.88, lat: 24.09, lx: -30, ly: 4, anchor: 'end', glyph: 'sail'
    },
    {
      id: 'aswan', city: '阿布辛贝', en: 'Abu Simbel', minor: true,
      lon: 31.35, lat: 22.35, lx: -28, ly: 4, anchor: 'end', glyph: ''
    }
  ];

  var GLYPHS = {
    pyramid:    'M-17 11 L0 -13 L17 11 Z M-8.5 11 L0 -2 L8.5 11',
    obelisk:    'M-5 13 L-5 -5 L0 -17 L5 -5 L5 13 Z M-7 13 L7 13',
    sail:       'M0 -17 L0 11 M0 -14 C11 -7 12 4 1 8',
    lighthouse: 'M-9 13 L-6 -7 L6 -7 L9 13 Z M-7 -11 L7 -11 L5 -7 L-5 -7 Z M0 -14 L0 -11',
    fish:       'M-15 0 C-7 -10 6 -10 14 0 C6 10 -7 10 -15 0 Z M14 0 L22 -7 L20 0 L22 7 Z'
  };

  /* ------------------------------------------------------------ 装饰曲线 --- */
  function waves(x1, y1, x2, y2, count, step) {
    var out = '';
    for (var i = 0; i < count; i++) {
      var y = y1 + i * step;
      if (y > y2) break;
      var d = '';
      for (var x = x1; x < x2; x += 26) {
        d += (d ? 'q' : 'M' + x.toFixed(0) + ' ' + y.toFixed(1) + ' q') + '6.5 -5 13 0 q6.5 5 13 0 ';
      }
      out += '<path d="' + d + '" fill="none" stroke="#155C6B" stroke-width="1.4" opacity=".38"/>';
    }
    return out;
  }

  function dunes() {
    var out = '';
    var seeds = [
      [150, 300, 90, 26], [110, 400, 120, 30], [200, 500, 100, 22], [140, 620, 130, 28],
      [90, 720, 110, 24], [250, 760, 95, 20], [400, 690, 105, 22], [330, 560, 88, 18],
      [480, 470, 96, 20], [230, 210, 84, 18], [330, 250, 78, 16], [520, 300, 90, 18],
      [620, 250, 70, 15], [700, 330, 80, 16]
    ];
    for (var i = 0; i < seeds.length; i++) {
      var s = seeds[i];
      out += '<path d="M' + s[0] + ' ' + s[1] +
        ' q' + (s[2] / 2) + ' -' + s[3] + ' ' + s[2] + ' 0" fill="none" stroke="#9C7C1A" stroke-width="1.6" opacity=".3"/>';
    }
    return out;
  }

  function compass(cx, cy, r) {
    var pts = '';
    for (var a = 0; a < 360; a += 45) {
      var rad = a * Math.PI / 180;
      var x1 = cx + Math.sin(rad) * r * 0.58, y1 = cy - Math.cos(rad) * r * 0.58;
      var x2 = cx + Math.sin(rad) * r, y2 = cy - Math.cos(rad) * r;
      pts += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) +
        '" y2="' + y2.toFixed(1) + '" stroke="#9C7C1A" stroke-width="1.6" opacity=".55"/>';
    }
    return '<g opacity=".85">' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="#C9A227" stroke-width="1.6" opacity=".6"/>' +
      '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r * 0.57).toFixed(1) + '" fill="none" stroke="#C9A227" stroke-width="1.1" opacity=".5"/>' +
      pts +
      '<path d="M' + cx + ' ' + (cy - r * 0.62) + ' L' + (cx + r * 0.15) + ' ' + cy + ' L' + cx + ' ' + (cy + r * 0.62) +
      ' L' + (cx - r * 0.15) + ' ' + cy + ' Z" fill="#C9A227" opacity=".8"/>' +
      '<text x="' + cx + '" y="' + (cy - r - 7) + '" text-anchor="middle" font-family="Cinzel, serif" font-size="17" fill="#9C7C1A" letter-spacing="2">N</text>' +
      '</g>';
  }

  function cartouche(x, y) {
    return '<g opacity=".9">' +
      '<rect x="' + x + '" y="' + y + '" width="196" height="52" rx="26" fill="none" stroke="#C9A227" stroke-width="2.2" opacity=".75"/>' +
      '<line x1="' + (x + 10) + '" y1="' + (y + 26) + '" x2="' + (x + 30) + '" y2="' + (y + 26) + '" stroke="#C9A227" stroke-width="2" opacity=".6"/>' +
      '<text x="' + (x + 98) + '" y="' + (y + 34) + '" text-anchor="middle" font-family="Cinzel, serif" font-size="20" letter-spacing="4" fill="#9C7C1A">EGYPT</text>' +
      '<text x="' + (x + 176) + '" y="' + (y + 34) + '" text-anchor="middle" font-family="Songti SC, serif" font-size="19" fill="#9C7C1A">埃及</text>' +
      '</g>';
  }

  function border() {
    return '<rect x="9" y="9" width="' + (W - 18) + '" height="' + (H - 18) + '" rx="8" ' +
      'fill="none" stroke="#C9A227" stroke-width="2.4" opacity=".5"/>' +
      '<rect x="17" y="17" width="' + (W - 34) + '" height="' + (H - 34) + '" rx="5" ' +
      'fill="none" stroke="#C9A227" stroke-width="1" opacity=".38"/>';
  }

  /* ------------------------------------------------------------- 生成 SVG --- */
  function marker(c) {
    var x = px(c.lon), y = py(c.lat);
    var r = c.minor ? 16 : 22;
    var fs = c.minor ? 32 : 42;
    var fsEn = c.minor ? 19 : 25;
    var glyph = c.glyph && GLYPHS[c.glyph]
      ? '<path d="' + GLYPHS[c.glyph] + '" transform="translate(' + x.toFixed(1) + ' ' + (y - r - 22).toFixed(1) + ')" ' +
        'fill="none" stroke="#3B2A1A" stroke-width="' + (c.minor ? 1.9 : 2.4) + '" stroke-linejoin="round" stroke-linecap="round" opacity=".8"/>'
      : '';
    var labelX = x + c.lx, labelY = y + c.ly;
    return '<g class="city-hit" data-city="' + c.id + '" data-name="' + c.city + '" tabindex="0" role="button" aria-label="' + c.city + '">' +
      '<circle class="halo" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r + 16) + '" fill="#C9A227"/>' +
      '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r + 44) + '" fill="transparent"/>' +
      glyph +
      '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="#F7EED3" stroke="#3B2A1A" stroke-width="' + (c.minor ? 2 : 2.6) + '"/>' +
      '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r * 0.5).toFixed(1) + '" fill="#C9A227" stroke="#9C7C1A" stroke-width="1.2"/>' +
      '<text x="' + labelX.toFixed(1) + '" y="' + labelY.toFixed(1) + '" text-anchor="' + c.anchor + '" ' +
      'font-family="Songti SC, Songti, serif" font-size="' + fs + '" fill="#3B2A1A" letter-spacing="1" ' +
      'stroke="#F7EED3" stroke-width="6" stroke-linejoin="round" paint-order="stroke">' + c.city + '</text>' +
      '<text x="' + (labelX).toFixed(1) + '" y="' + (labelY + fsEn + 6).toFixed(1) + '" text-anchor="' + c.anchor + '" ' +
      'font-family="Cinzel, serif" font-size="' + fsEn + '" fill="#9C7C1A" letter-spacing="1" ' +
      'stroke="#F7EED3" stroke-width="4" stroke-linejoin="round" paint-order="stroke">' + c.en + '</text>' +
      '</g>';
  }

  function svg() {
    var s = [];
    s.push('<svg viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="风格化的埃及地图：尼罗河自南向北贯穿，标注亚历山大、开罗与吉萨、卢克索、阿斯旺与阿布辛贝、红海">');
    s.push('<defs>');
    s.push('<linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0" stop-color="#2E8FA0"/><stop offset="1" stop-color="#1F7A8C"/></linearGradient>');
    s.push('<linearGradient id="landGrad" x1="0" y1="0" x2="0.4" y2="1">' +
      '<stop offset="0" stop-color="#FBF4DE"/><stop offset="1" stop-color="#F0E2BA"/></linearGradient>');
    s.push('<filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>');
    s.push('</defs>');

    // 底层：邻国陆地（留白，仅压暗一点）
    s.push('<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#EADCB6"/>');

    // 海洋
    s.push('<path d="' + path(MEDITERRANEAN, true) + '" fill="url(#seaGrad)" opacity=".92"/>');
    s.push('<path d="' + path(RED_SEA, true) + '" fill="url(#seaGrad)" opacity=".92"/>');
    s.push(waves(px(25.4), py(31.86), px(34.0), py(31.98), 2, 26));
    s.push(waves(px(33.1), py(28.4), px(36.4), py(23.4), 12, 46));

    // 埃及陆地
    s.push('<path d="' + path(EGYPT_MAINLAND, true) + '" fill="url(#landGrad)" stroke="#C9A227" stroke-width="2.6" stroke-linejoin="round"/>');
    s.push('<path d="' + path(SINAI, true) + '" fill="url(#landGrad)" stroke="#C9A227" stroke-width="2.6" stroke-linejoin="round"/>');

    // 沙漠装饰
    s.push(dunes());

    // 尼罗河
    s.push('<path d="' + path(NILE_MAIN) + '" fill="none" stroke="#1F7A8C" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".95"/>');
    s.push('<path d="' + path(NILE_ROSETTA) + '" fill="none" stroke="#1F7A8C" stroke-width="4.6" stroke-linecap="round" opacity=".9"/>');
    s.push('<path d="' + path(NILE_DAMIETTA) + '" fill="none" stroke="#1F7A8C" stroke-width="4.6" stroke-linecap="round" opacity=".9"/>');
    // 三角洲湿地
    s.push('<path d="M' + px(31.23) + ' ' + py(30.05) + ' L' + px(30.42) + ' ' + py(31.42) +
      ' L' + px(31.82) + ' ' + py(31.48) + ' Z" fill="#1F7A8C" opacity=".14"/>');

    // 海域名称
    s.push('<text x="' + px(27.4).toFixed(0) + '" y="' + py(32.15).toFixed(0) + '" text-anchor="middle" ' +
      'font-family="Songti SC, serif" font-size="26" fill="#EAF6F8" opacity=".95" letter-spacing="3">地中海</text>');
    s.push('<text x="' + px(35.9).toFixed(0) + '" y="' + py(24.3).toFixed(0) + '" text-anchor="middle" transform="rotate(59 ' +
      px(35.9).toFixed(0) + ' ' + py(24.3).toFixed(0) + ')" ' +
      'font-family="Songti SC, serif" font-size="26" fill="#EAF6F8" opacity=".95" letter-spacing="3">红海</text>');
    s.push('<text x="' + px(26.4).toFixed(0) + '" y="' + py(26.0).toFixed(0) + '" text-anchor="middle" ' +
      'font-family="Songti SC, serif" font-size="24" fill="#B9A476" opacity=".9" letter-spacing="3">利 比 亚</text>');
    s.push('<text x="' + px(29.6).toFixed(0) + '" y="' + py(22.5).toFixed(0) + '" text-anchor="middle" ' +
      'font-family="Songti SC, serif" font-size="24" fill="#B9A476" opacity=".9" letter-spacing="3">苏 丹</text>');

    // 装饰
    s.push(compass(px(26.2), py(28.6), 46));
    s.push(cartouche(W - 226, H - 74));
    s.push(border());

    // 城市
    for (var i = 0; i < CITIES.length; i++) s.push(marker(CITIES[i]));

    s.push('</svg>');
    return s.join('');
  }

  window.EgyptMap = { svg: svg, CITIES: CITIES, W: W, H: H };
})();
