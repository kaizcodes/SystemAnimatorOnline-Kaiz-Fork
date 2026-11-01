// XR Animator — "Native Refresh" UI layer (fork-only)
//
// Restyles the dungeon inventory tool bar into a glass pill with vector icons,
// mirrors speech-bubble menus into a DOM panel anchored above the bar, and
// re-skins the DEBUG status line / tooltips. All original logic is reused:
// menu rows forward synthetic SA_keydown events into the existing branch router,
// and tool-bar slots keep their original dblclick action handlers.
//
// Icons: lucide v0.469.0 (ISC license), embedded as inline SVG.

(function () {
// This file is loaded from the document.write script list (core_extra.js), which
// runs before animate.js defines MMD_SA_options — so everything is deferred until
// the XR Animator environment exists. In non-XR-Animator demos this bails silently.
  var MMD_SA_options = null;

  var _boot_ticks = 0;
  var _boot = setInterval(function () {
    if (++_boot_ticks > 600) { clearInterval(_boot); return; }
    if (!window.MMD_SA_options || !window.MMD_SA_options.is_XR_Animator) return;
    if (!window.MMD_SA || !MMD_SA.SpeechBubble || !MMD_SA.SpeechBubble.list || !MMD_SA.SpeechBubble.list.length) return;
    clearInterval(_boot);
    MMD_SA_options = window.MMD_SA_options;
    if (document.getElementById('Ldungeon_inventory')) init();
    window.addEventListener('MMDStarted', function () { init(); });
  }, 100);

// ------------------------------------------------------------------ icons

  var ICONS = {
    'crosshair': '<circle cx="12" cy="12" r="10"/><line x1="22" x2="18" y1="12" y2="12"/><line x1="6" x2="2" y1="12" y2="12"/><line x1="12" x2="12" y1="6" y2="2"/><line x1="12" x2="12" y1="22" y2="18"/>',
    'radio': '<path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/>',
    'person-standing': '<circle cx="12" cy="5" r="1"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/>',
    'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'activity': '<path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/>',
    'network': '<rect x="16" y="16" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="9" y="2" width="6" height="6" rx="1"/><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"/><path d="M12 12V8"/>',
    'settings-2': '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
    'hand': '<path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'check': '<path d="M20 6 9 17l-5-5"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>',
    'monitor': '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>',
    'sparkles': '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/><path d="M20 3v4"/><path d="M22 5h-4"/><path d="M4 17v2"/><path d="M5 18H3"/>',
    'power': '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
    'circle-dot': '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>'
  };

  function icon_svg(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || '') + '</svg>';
  }

  var icon_by_item = {
    calibrate_roll: 'crosshair',
    streamer_mode: 'radio',
    pose: 'person-standing',
    selfie: 'camera',
    facemesh: 'activity',
    VMC_protocol: 'network',
    XR_Animator_options: 'settings-2',
    hand_camera: 'hand',
    reticle: 'crosshair',
    snapshot: 'camera'
  };

  var row_icon_hints = [
    [/record/i, 'circle-dot', true],
    [/export/i, 'download', false],
    [/(mocap|motion)[ _]off/i, 'power', false],
    [/cancel|^(done|close)$/i, 'x', false],
    [/about/i, 'info', false],
    [/UI and overlays/i, 'monitor', false],
    [/visual effects/i, 'sparkles', false]
  ];

// ------------------------------------------------------------------ css

  var CSS =
    "@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');" +

  // tool bar — paper keycard with ink border and hard offset shadow
    '#XRA_inv_pill{position:absolute;z-index:0;background:#F9F8F3;border:1.5px solid #16150F;border-radius:10px;box-shadow:0 4px 0 #16150F;pointer-events:none;}' +
    '#Ldungeon_inventory > div:not(#XRA_inv_pill){background-color:transparent;border-radius:8px;cursor:pointer;transition:background-color .12s ease;}' +
    '#Ldungeon_inventory > div:not(#XRA_inv_pill):hover{background-color:#E8590C;}' +
    '#Ldungeon_inventory > div:not(#XRA_inv_pill):active{background-color:#C2410C;}' +
    '#Ldungeon_inventory > div:not(#XRA_inv_pill):active .XRA_icon{color:#FFFFFF;}' +
    '#Ldungeon_inventory > div:not(#XRA_inv_pill):hover .XRA_icon{color:#FFFFFF;}' +
    '.XRA_icon{position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:rgba(22,21,15,.75);pointer-events:none;transition:color .12s ease;}' +
    '.XRA_icon svg{width:19px;height:19px;}' +
    '.XRA_on{background-color:#16150F;}' +
    '.XRA_on .XRA_icon{color:#FFA347;}' +

  // tooltips (override the rules injected by dungeon.js; this sheet is kept last in <head>)
    '.Dungeon_inventory_item_info_short:hover:after{background:#F9F8F3;border:1px solid #16150F;border-radius:6px;padding:5px 9px;top:-34px;left:50%;transform:translateX(-50%);width:max-content;max-width:220px;height:auto;font-size:11px;font-family:"Space Grotesk","Segoe UI",system-ui,sans-serif;letter-spacing:.02em;color:#16150F;box-shadow:2px 3px 0 rgba(22,21,15,.85);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
    '.Dungeon_inventory_item_info:hover:after,.Dungeon_inventory_item_info_display::after{background:#F9F8F3;border:1px solid #16150F;border-radius:8px;font-family:"Space Grotesk","Segoe UI",system-ui,sans-serif;color:#16150F;box-shadow:3px 4px 0 rgba(22,21,15,.85);}' +
    '#SB_tooltip{background:#F9F8F3 !important;border:1px solid #16150F !important;border-radius:6px !important;color:#16150F !important;font-family:"Space Grotesk","Segoe UI",system-ui,sans-serif !important;font-size:11px !important;line-height:1.5 !important;width:max-content !important;max-width:320px;height:auto !important;padding:5px 9px !important;box-shadow:3px 4px 0 rgba(22,21,15,.85);pointer-events:none !important;}' +

  // status line (DEBUG_show toast, restyled; inline styles need !important)
    '#Ldebug{top:14px !important;left:16px !important;color:rgba(22,21,15,.82) !important;font-family:"JetBrains Mono",Consolas,monospace !important;font-size:10.5px !important;letter-spacing:.05em;line-height:1.6;background-color:#F9F8F3 !important;padding:6px 10px !important;border:1.5px solid #16150F !important;border-radius:6px !important;box-shadow:3px 3px 0 rgba(22,21,15,.85);white-space:pre-wrap;max-width:min(46vw,520px);}' +

  // menu mirror panel — paper sheet, ink hairline, offset print shadow
    '.XRA_panel{position:absolute;z-index:6;width:324px;border-radius:8px;background:#FBFAF6;border:1.5px solid #16150F;box-shadow:6px 6px 0 rgba(22,21,15,.85);padding:6px;font-family:"Space Grotesk","Segoe UI",system-ui,sans-serif;color:#16150F;}' +
    '.XRA_panel header{display:flex;align-items:center;gap:8px;padding:7px 10px 5px;font-size:12.5px;font-weight:600;}' +
    '.XRA_panel header span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    '.XRA_panel.XRA_notitle .XRA_close{position:absolute;top:6px;right:6px;}' +
    '.XRA_close{flex:none;margin-left:auto;width:22px;height:22px;border-radius:5px;display:flex;align-items:center;justify-content:center;color:rgba(22,21,15,.55);cursor:pointer;transition:background-color .12s ease,color .12s ease;}' +
    '.XRA_close:hover{background-color:#16150F;color:#FFA347;}' +
    '.XRA_close svg{width:12px;height:12px;}' +
    '.XRA_info{padding:2px 10px 6px;font-size:10.5px;line-height:1.5;color:rgba(22,21,15,.62);white-space:pre-wrap;}' +
    '.XRA_rows{display:flex;flex-direction:column;gap:2px;}' +
    '.XRA_row{position:relative;display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:6px;font-size:12.5px;font-weight:500;color:rgba(22,21,15,.85);text-align:left;cursor:pointer;transition:background-color .12s ease,color .12s ease;}' +
    '.XRA_row:hover{background-color:#E8590C;color:#FFFFFF;}' +
    '.XRA_row:active{background-color:#C2410C;}' +
    '.XRA_row kbd{flex:none;min-width:16px;text-align:center;font-family:"JetBrains Mono",monospace;font-size:9px;font-weight:500;color:rgba(22,21,15,.65);background:#F9F8F3;border:1px solid rgba(22,21,15,.5);border-radius:4px;padding:1px 4px;line-height:12px;box-shadow:0 2px 0 rgba(22,21,15,.7);}' +
    '.XRA_row > svg{flex:none;width:15px;height:15px;color:rgba(22,21,15,.5);}' +
    '.XRA_row.XRA_red > svg{color:#C2410C;}' +
    '.XRA_row:hover > svg{color:#FFFFFF;}' +
    '.XRA_row:hover kbd{color:#FFFFFF;background:transparent;border-color:rgba(255,255,255,.55);box-shadow:0 2px 0 rgba(255,255,255,.35);}' +
    '.XRA_row span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}' +
    '.XRA_input{flex:none;width:96px;padding:3px 7px;border:1px solid rgba(22,21,15,.6);border-radius:4px;background:#FFFFFF;color:#16150F;font-family:"JetBrains Mono",Consolas,monospace;font-size:11.5px;text-align:right;}' +
    '.XRA_input:focus{outline:2px solid #E8590C;outline-offset:1px;}' +
    '.XRA_valwrap{position:relative;flex:none;}' +
    '.XRA_row[data-hint]:hover::after{content:attr(data-hint);position:absolute;bottom:calc(100% + 9px);right:0;background:#F9F8F3;border:1px solid #16150F;border-radius:6px;padding:5px 9px;font-family:"Space Grotesk","Segoe UI",system-ui,sans-serif;font-size:11px;line-height:1.5;color:#16150F;white-space:normal;width:max-content;max-width:300px;box-shadow:2px 3px 0 rgba(22,21,15,.85);z-index:70;pointer-events:none;}';

  var style_el = document.createElement('style');
  style_el.id = 'XRA_refresh_css';
  style_el.textContent = CSS;
  document.head.appendChild(style_el);

// ------------------------------------------------------------------ tool bar

  var SLOT = 50, GAP = 5, PAD = 6;

  function slot_area_width(inv) {
    return inv.max_base * SLOT + (inv.max_base - 1) * GAP;
  }

  function restyle_bar() {
    var bar = document.getElementById('Ldungeon_inventory');
    if (!bar || bar._xra_done) return;
    bar._xra_done = true;

  // re-append the stylesheet so it wins the tie against the rules dungeon.js
  // inserts at MMDStarted (equal specificity, later sheet order wins)
    document.head.appendChild(style_el);

    var pill = document.createElement('div');
    pill.id = 'XRA_inv_pill';
    bar.insertBefore(pill, bar.firstChild);

    var inv = MMD_SA_options.Dungeon.inventory;
    for (var i = 0; i < inv.max_base; i++) {
      var slot = document.getElementById('Ldungeon_inventory_item' + i);
      if (!slot) continue;
      var s = slot.style;
      s.left = (i * (SLOT + GAP)) + 'px';
      s.top = '0px';
      s.width = SLOT + 'px';
      s.height = SLOT + 'px';
      s.backgroundImage = 'none';
      apply_slot_icon(slot, i);
    }
    recenter_bar();
    layout_pill();
  }

  function layout_pill() {
    var bar = document.getElementById('Ldungeon_inventory');
    if (!bar) return;
    var pill = document.getElementById('XRA_inv_pill');
    if (!pill) return;
    var inv = MMD_SA_options.Dungeon.inventory;
    var w = slot_area_width(inv);
    pill.style.left = (-PAD) + 'px';
    pill.style.top = (-PAD) + 'px';
    pill.style.width = (w + PAD * 2) + 'px';
    pill.style.height = (SLOT + PAD * 2) + 'px';
  }

  function apply_slot_icon(slot, i) {
    var inv = MMD_SA_options.Dungeon.inventory;
    var _idx = inv.get_inventory_index(i);
    var inv_item = inv.list[_idx];
    var item_id = inv_item && inv_item.item_id;
    var icon_name = icon_by_item[item_id];
    if (!icon_name) return;

    var img = document.getElementById('Ldungeon_inventory_item' + i + '_icon');
    var border = document.getElementById('Ldungeon_inventory_item' + i + '_border');
    var stock = document.getElementById('Ldungeon_inventory_item' + i + '_stock');
    if (img) img.style.display = 'none';
    if (border) border.style.display = 'none';
    if (stock) stock.style.display = 'none';

    var holder = null;
    for (var c = 0; c < slot.children.length; c++) {
      if (slot.children[c].className == 'XRA_icon') { holder = slot.children[c]; break; }
    }
    if (!holder) {
      holder = document.createElement('div');
      holder.className = 'XRA_icon';
      slot.appendChild(holder);
    }
    holder.innerHTML = icon_svg(icon_name);
  }

  function recenter_bar() {
    var bar = document.getElementById('Ldungeon_inventory');
    if (!bar) return;
  // place_inventory centers the legacy 512px container; the relaid-out slot
  // area is narrower, so re-center it (same overlay-mode right-pin rule)
    var inv = MMD_SA_options.Dungeon.inventory;
    var factor = ((System._browser.overlay_mode && (bar.style.visibility == 'hidden')) ? 1 : 0.5);
    bar.style.posLeft = (B_content_width - slot_area_width(inv)) * factor;
  }

  function watch_bar() {
    var bar = document.getElementById('Ldungeon_inventory');
    if (!bar || bar._xra_watched) return;
    bar._xra_watched = true;
    var timer = null;
    new MutationObserver(function () {
      if (timer) return;
      timer = setTimeout(function () {
        timer = null;
        var inv = MMD_SA_options.Dungeon.inventory;
        for (var i = 0; i < inv.max_base; i++) {
          var slot = document.getElementById('Ldungeon_inventory_item' + i);
          if (slot) apply_slot_icon(slot, i);
        }
        layout_pill();
      }, 100);
    }).observe(bar, { childList: true, attributes: true, subtree: true });
  }

// ------------------------------------------------------------------ live slot states

  function start_states() {
    setInterval(function () {
      var bar = document.getElementById('Ldungeon_inventory');
      if (!bar) return;
      var cam = (window.System && System._browser && System._browser.camera) || {};
      var ib = (MMD_SA_options.Dungeon_options && MMD_SA_options.Dungeon_options.item_base) || {};
      var on = {
        facemesh: !!cam.ML_enabled,
        hand_camera: !!(ib.hand_camera && ib.hand_camera._hand_camera_side)
      };
      var inv = MMD_SA_options.Dungeon.inventory;
      for (var i = 0; i < inv.max_base; i++) {
        var slot = document.getElementById('Ldungeon_inventory_item' + i);
        if (!slot) continue;
        var _idx = inv.get_inventory_index(i);
        var item_id = inv.list[_idx] && inv.list[_idx].item_id;
        slot.classList.toggle('XRA_on', !!on[item_id]);
      }
    }, 500);
  }

// ------------------------------------------------------------------ menu mirror

  var ROW_RE = /^([\dA-Z])[\.::]\s*(.*)$/;
  var EMOJI_LEAD = /^[\s·・]*[\p{Extended_Pictographic}\uFE0F\u200D]+[\s·・]*/u;

  function clean_label(s) {
    return s.replace(EMOJI_LEAD, '').trim();
  }

  function parse_bubble(sb, branches) {
    if (!sb || !Array.isArray(sb.msg_line) || !sb.msg_line.length) return null;

    var rows = [];
    branches.forEach(function (b) {
      if (b.key == 'any') return;
      var keys = Array.isArray(b.key) ? b.key : [b.key];
      keys.forEach(function (key) {
        if (key == 'Esc') return;
        var label = null;
        for (var i = 0; i < sb.msg_line.length; i++) {
          var m = ROW_RE.exec(sb.msg_line[i]);
          if (m && m[1] == String(key)) { label = m[2]; break; }
        }
        if (label == null) return;
        rows.push({ key: key, label: label, branch: b });
      });
    });

  // options without an explicit branch (B/N/X-style lines, or the webcam
  // picker's numbered camera list) — a catch-all ('any') branch handles their
  // keys, so forwarding the key is exactly what pressing it does
    var has_any = branches.some(function (b) { return b.key == 'any'; });
    if (has_any) {
      for (var j = 0; j < sb.msg_line.length; j++) {
        var m2 = ROW_RE.exec(sb.msg_line[j]);
        if (m2 && /^[\dA-Z]$/.test(m2[1]) && !rows.some(function (r) { return String(r.key) == m2[1]; })) {
          rows.push({ key: m2[1], label: m2[2] });
        }
      }
    }

    var title = null, infos = [];
    for (var k = 0; k < sb.msg_line.length; k++) {
      var line = sb.msg_line[k];
      if (ROW_RE.test(line)) continue;
      if (/^[・\s]/.test(line)) { infos.push(line.replace(/^[・\s]+/, '')); continue; }
      if (title == null) title = line;
      else infos.push(line);
    }

    return { rows: rows, title: title, infos: infos };
  }

// The XR Animator menu layout pins one speech bubble to each side of the screen
// during dialogue_branch_mode (options page on one, info page on the other) —
// the mirror renders one panel per visible bubble, ordered like the bubbles.
  function current_menu() {
    var d = MMD_SA_options.Dungeon;
    if (!d || !Array.isArray(d.dialogue_branch_mode) || !d.dialogue_branch_mode.length) return null;
    var branches = d.dialogue_branch_mode;

    var panels = [];
    var list = MMD_SA.SpeechBubble.list;
    for (var i = 0; i < list.length; i++) {
      if (!list[i].visible) continue;
      var parsed = parse_bubble(list[i], branches);
      if (!parsed) continue;
      if (!parsed.rows.length && !parsed.title && !parsed.infos.length) continue;
      panels.push({ index: (list[i].index || 0), rows: parsed.rows, title: parsed.title, infos: parsed.infos, para: list[i].para });
    }
    if (!panels.length) return null;
    if (!panels.some(function (p) { return p.rows.length; })) return null;
    panels.sort(function (a, b) { return a.index - b.index; });
    return { panels: panels };
  }

  function menu_mode_active() {
    var d = MMD_SA_options.Dungeon;
    if (!d || !Array.isArray(d.dialogue_branch_mode) || !d.dialogue_branch_mode.length) return false;
    var branches = d.dialogue_branch_mode;
    var list = MMD_SA.SpeechBubble.list;
    for (var i = 0; i < list.length; i++) {
      if (!list[i].visible) continue;
      var parsed = parse_bubble(list[i], branches);
      if (parsed && parsed.rows.length) return true;
    }
    return false;
  }

  function forward_key(key) {
    var k, kv, code;
    if (typeof key == 'number') { k = 48 + key; kv = String(key); code = 'Digit' + key; }
    else if (key == 'Esc') { k = 27; kv = 'Escape'; code = 'Escape'; }
    else if (/^\d$/.test(key)) { k = 48 + parseInt(key); kv = key; code = 'Digit' + key; }
    else if (key == '.') { k = 190; kv = '.'; code = 'Period'; }
    else if (key == 'Enter') { k = 13; kv = 'Enter'; code = 'Enter'; }
    else { k = key.charCodeAt(0); kv = key; code = 'Key' + key; }
    var fake = {
      key: kv, keyCode: k, code: code,
      ctrlKey: false, shiftKey: false, altKey: false, metaKey: false,
      shift_location: 0, ctrl_location: 0, alt_location: 0,
      preventDefault: function () {}, stopPropagation: function () {}
    };
    window.dispatchEvent(new CustomEvent('SA_keydown', { detail: { e: fake, keyCode: k, shift_location: 0, ctrl_location: 0, alt_location: 0, result: {} } }));
  }

  function row_icon(label) {
    for (var i = 0; i < row_icon_hints.length; i++) {
      if (row_icon_hints[i][0].test(label)) return row_icon_hints[i];
    }
    return null;
  }

  function hide_row_tooltip() {
    var t = document.getElementById('SB_tooltip');
    if (t) t.style.visibility = 'hidden';
  }

  // the app tooltip always pops 40px below the cursor; the panels sit at the
  // window bottom, so flip it above the cursor when it would clip, or clamp it
  // inside the viewport
  function clamp_row_tooltip(cursor_y) {
    var t = document.getElementById('SB_tooltip');
    if (!t || t.style.visibility == 'hidden') return;
    var r = t.getBoundingClientRect();
    if (!r.height) return;
    var m = 8, dy = 0, dx = 0;
    if (r.bottom > window.innerHeight - m) {
      var top_above = cursor_y - r.height - 14;
      dy = (top_above >= m) ? (top_above - r.top) : ((window.innerHeight - m) - r.bottom);
    }
    if (r.right > window.innerWidth - m) dx = (window.innerWidth - m) - r.right;
    if (r.top + dy < m) dy = m - r.top;
    if (r.left + dx < m) dx = m - r.left;
    if (!dx && !dy) return;
  // style px and visual px differ when ancestor/UI-scale transforms are active
    var sx = (t.offsetWidth > 0) ? (r.width / t.offsetWidth) : 1;
    var sy = (t.offsetHeight > 0) ? (r.height / t.offsetHeight) : 1;
    t.style.left = (t.offsetLeft + dx / sx) + 'px';
    t.style.top = (t.offsetTop + dy / sy) + 'px';
  }

  var panel_els = [], mirror_sig = '', mirror_active = false;
  var PANEL_W = 324, PANEL_GAP = 10;

  function ensure_panels(count) {
    var host = document.getElementById('SL_Host') || document.body;
    while (panel_els.length < count) {
      var el = document.createElement('div');
      el.className = 'XRA_panel';
      el.style.display = 'none';
      ['mousedown', 'click', 'dblclick', 'mouseover', 'keydown', 'keyup', 'keypress'].forEach(function (ev) {
        el.addEventListener(ev, function (e) { e.stopPropagation(); });
      });
      host.appendChild(el);
      panel_els.push(el);
    }
    while (panel_els.length > count) {
      var el_last = panel_els.pop();
      if (el_last.parentNode) el_last.parentNode.removeChild(el_last);
    }
  }

  function position_panels(count) {
    var bar = document.getElementById('Ldungeon_inventory');
    if (!bar || !panel_els.length) return;
  // viewport-anchored: the 3D layer stack may carry transforms, so layout
  // offsets are not trustworthy — measure the rendered slot rects instead
    var inv = MMD_SA_options.Dungeon.inventory;
    var s0 = document.getElementById('Ldungeon_inventory_item0');
    var sn = document.getElementById('Ldungeon_inventory_item' + (inv.max_base - 1));
    var center;
    if (s0 && sn && s0.getBoundingClientRect && sn.getBoundingClientRect) {
      var r0 = s0.getBoundingClientRect(), rn = sn.getBoundingClientRect();
      center = (r0.left + rn.right) / 2;
    } else {
      var br = bar.getBoundingClientRect();
      center = br.left + br.width / 2;
    }
    var top = (s0 || bar).getBoundingClientRect().top;
    var pw = (window.innerWidth < 760) ? 280 : PANEL_W;
    var total = count * pw + (count - 1) * PANEL_GAP;
    var left0 = center - total / 2;
    panel_els.forEach(function (el, i) {
      el.style.position = 'fixed';
      el.style.width = pw + 'px';
      el.style.left = (left0 + i * (pw + PANEL_GAP)) + 'px';
      el.style.top = '';
      el.style.bottom = (window.innerHeight - top + 8) + 'px';
    });
  }

// value rows (VMC port/host) — an input bridged to the app's own entry flow:
// the box commit forwards the option key, then the characters, then Enter, so
// all of the app's validation and socket-restart logic stays in charge
  var VALUE_ROW = /^(.*?[:：])\s*([\d.]{1,15}|[A-Za-z]{1,20})\s*$/;

  function replay_keys(seq, gap) {
    seq.forEach(function (k, i) {
      setTimeout(function () { forward_key(k); }, i * gap);
    });
  }

  function commit_value(kind, value, initial) {
    if (value == initial) return;
    var seq;
    if (kind == 'A') {
      if (!/^\d+$/.test(value)) return;
      seq = [kind].concat(value.split(''), ['Enter']);
    }
    else {
      if (/^[\d.]+$/.test(value)) seq = [kind].concat(value.split(''), ['Enter']);
    // named hosts (localhost) — the entry flow only types digits/dots, so reset
    // to the app's default host via its own R command, then commit
      else if (/^[A-Za-z]+$/.test(value)) seq = [kind, 'R', 'Enter'];
      else return;
    }
    replay_keys(seq, 40);
  }

  function make_value_input(row_key, value) {
    var input = document.createElement('input');
    input.type = 'text';
    input.className = 'XRA_input';
    input.value = value;
    input.maxLength = (row_key == 'A') ? 5 : 15;
    input.spellcheck = false;
    var initial = value;
    input.addEventListener('keydown', function (e) {
      if (e.key == 'Enter') { commit_value(row_key, input.value, initial); input.blur(); }
      else if (e.key == 'Escape') { input.value = initial; input.blur(); }
      e.stopPropagation();
    });
    input.addEventListener('blur', function () { input.value = initial; });

    var wrap = document.createElement('span');
    wrap.className = 'XRA_valwrap';
    wrap.appendChild(input);
    return wrap;
  }

  function build_panel(el, p) {
    el.innerHTML = '';
    el.classList.toggle('XRA_notitle', !p.title);

    var close = document.createElement('div');
    close.className = 'XRA_close';
    close.setAttribute('role', 'button');
    close.setAttribute('aria-label', 'Close (Esc)');
    close.innerHTML = icon_svg('x');
    close.addEventListener('click', function () { forward_key('Esc'); });

    if (p.title) {
      var head = document.createElement('header');
      var t = document.createElement('span');
      t.textContent = clean_label(p.title);
      head.appendChild(t);
      head.appendChild(close);
      el.appendChild(head);
    }
    else {
      el.appendChild(close);
    }

    p.infos.forEach(function (info) {
      if (!info) return;
      var el_i = document.createElement('div');
      el_i.className = 'XRA_info';
      el_i.textContent = clean_label(info);
      el.appendChild(el_i);
    });

  // every menu renders as a vertical list, rows in their original order
    var rows_el = document.createElement('div');
    rows_el.className = 'XRA_rows';

    p.rows.forEach(function (r) {
      var row = document.createElement('div');
      row.className = 'XRA_row';
      row.setAttribute('role', 'button');
      var kbd = document.createElement('kbd');
      kbd.textContent = String(r.key);
      row.appendChild(kbd);
      var hint = row_icon(r.label);
      if (hint) {
        var tmp = document.createElement('div');
        tmp.innerHTML = icon_svg(hint[1]);
        if (tmp.firstChild) row.appendChild(tmp.firstChild);
        if (hint[2]) row.classList.add('XRA_red');
      }
      var label = clean_label(r.label);
      var vm = VALUE_ROW.exec(label);
      if (vm && /\b(port|host)\b/i.test(vm[1])) {
      // hint lives on the row: the valwrap span gets overflow:hidden from the
        // label-ellipsis rule, which clips a ::after anchored above it
        row.setAttribute('data-hint', 'Type a valid address here then Enter to save · Right-click to reset to default');
        var lab = document.createElement('span');
        lab.textContent = vm[1];
        row.appendChild(lab);
        var input = make_value_input(r.key, vm[2]);
        row.appendChild(input);
        row.addEventListener('click', function () { input.querySelector('input').focus(); });
      // right-click anywhere on the row reverts to the app's default value via
        // its own R command; wide gaps let the app's deferred re-render land
        // between the forwarded keys
        row.addEventListener('contextmenu', function (e) {
          e.preventDefault();
          e.stopPropagation();
          replay_keys([r.key, 'R', 'Enter'], 120);
        });
      }
      else {
        var span = document.createElement('span');
        span.textContent = label;
        span.title = label;
        row.appendChild(span);
        row.addEventListener('click', function () { forward_key(r.key); });
      }
      // option tooltips — the app fires branch.onmouseover (which shows SB_tooltip
      // at the cursor) from bubble mousemove in device pixels; the mirrored menu
      // suppresses bubbles, so re-fire from the rows instead
      if (r.branch && typeof r.branch.onmouseover == 'function') {
        var fire_row_tooltip = function (e) {
          r.branch.onmouseover({ clientX: e.clientX * window.devicePixelRatio, clientY: e.clientY * window.devicePixelRatio });
          clamp_row_tooltip(e.clientY);
        };
        row.addEventListener('mouseenter', fire_row_tooltip);
      // re-fire while the cursor moves within the row so the tooltip stays
        // glued to it and recovers if anything else hides it
        row.addEventListener('mousemove', fire_row_tooltip);
        row.addEventListener('mouseleave', hide_row_tooltip);
      }
      row.addEventListener('click', hide_row_tooltip);
      rows_el.appendChild(row);
    });

    if (p.rows.length) el.appendChild(rows_el);
  }

  function render_menu(menu) {
    ensure_panels(menu.panels.length);
  // per-panel signatures — untouched panels keep their DOM (and input focus)
    var sig = menu.panels.map(function (p) {
      return p.index + '#' + (p.title || '') + '#' + p.rows.map(function (r) { return r.key + '=' + r.label; }).join('|') + '#' + p.infos.join('|');
    }).join('||');
    if (mirror_active && sig === mirror_sig) { position_panels(menu.panels.length); return; }
    mirror_sig = sig;

    menu.panels.forEach(function (p, i) {
      var el = panel_els[i];
      var p_sig = sig.split('||')[i];
      if (el._xra_sig !== p_sig) {
        el._xra_sig = p_sig;
        build_panel(el, p);
      }
      el.style.display = 'block';
    });
    position_panels(menu.panels.length);
  }

  function hide_panel() {
    mirror_active = false;
    mirror_sig = '';
    hide_row_tooltip();
    MMD_SA.SpeechBubble.list.forEach(function (sb) { sb._xra_menu = false; });
    panel_els.forEach(function (el) { el._xra_sig = null; el.style.display = 'none'; });
  }

  function start_mirror() {
    setInterval(function () {
      var menu = null;
      try { menu = current_menu(); }
      catch (err) { console.log('(XRA menu mirror error: ' + (err && err.message) + ')'); return; }
      if (menu) {
      // every speech bubble is menu chrome while a mirrorable menu is up —
      // keep all sprites off (covers anything shown outside the wrapped path)
        var list = MMD_SA.SpeechBubble.list;
        for (var i = 0; i < list.length; i++) {
          if (list[i]._mesh && list[i]._mesh.visible) list[i]._mesh.visible = false;
        }
        mirror_active = true;
        render_menu(menu);
      }
      else if (mirror_active) {
        hide_panel();
      }
    }, 120);
  }

  function wrap_speech_bubble() {
    if (!window.MMD_SA || !MMD_SA.SpeechBubble || !MMD_SA.SpeechBubble.list || !MMD_SA.SpeechBubble.list.length) return;
    if (MMD_SA.SpeechBubble._xra_wrapped) return;
    var proto = Object.getPrototypeOf(MMD_SA.SpeechBubble.list[0]);
    if (!proto || !proto.show) return;
    var _show = proto.show;
    proto.show = function () {
      var d = MMD_SA_options.Dungeon;
      if (d && Array.isArray(d.dialogue_branch_mode) && d.dialogue_branch_mode.length) {
      // this bubble's own lines already carry the menu (msg_line is built before
      // show() runs), or another bubble of the same menu is already up
        var own = parse_bubble(this, d.dialogue_branch_mode);
        if ((own && own.rows.length) || menu_mode_active()) {
        // flagged so MMD_SA's bubble hit-test skips the phantom — it would
        // otherwise fight the panel rows over SB_tooltip
          this.visible = true;
          this._xra_menu = true;
          return;
        }
      }
      this._xra_menu = false;
      return _show.apply(this, arguments);
    };
    MMD_SA.SpeechBubble._xra_wrapped = true;
  }

// ------------------------------------------------------------------ init

  function init() {
    if (!MMD_SA_options.Dungeon || !MMD_SA_options.Dungeon.inventory) return;
    restyle_bar();
    watch_bar();
    console.log("(XRA UI refresh active)");

    if (!init._done) {
      init._done = true;
      wrap_speech_bubble();
      start_mirror();
      start_states();
      window.addEventListener('SA_resize', function () { recenter_bar(); layout_pill(); });
    }
  }

})();
