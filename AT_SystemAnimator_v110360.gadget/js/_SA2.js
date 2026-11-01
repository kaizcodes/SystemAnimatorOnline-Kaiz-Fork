// (2025-08-24)

var IPC

(function () {
  document.addEventListener( "contextmenu", function ( event ) { event.preventDefault(); }, false );

  if (!webkit_electron_mode)
    return

  IPC = {
    _active_window_id: -1

   ,get active_window_id() {
if (!is_SA_child_animation) {
  if (this._active_window_id == -1)
    return -1
  return ((SA_child_animation[this._active_window_id]) ? this._active_window_id : -1)
  
}
else
  return parent.IPC.active_window_id
    }

   ,set active_window_id(id) {
((is_SA_child_animation) ? parent : self).IPC._active_window_id = id
    }

   ,get active_window() {
var id = this.active_window_id
if (id == -1)
  return SA_topmost_window;
return SA_topmost_window.document.getElementById("Ichild_animation" + id).contentWindow
    }

   ,get active_IPC() {
return this.active_window.IPC
    }

   ,ipcRenderer_capturePage: function (event, message) {
  SA_topmost_window.System._browser.capturePage_in_process = false

  var para = message.split("|")
  switch (para[0]) {
    case "FAILED":
      break

    case "RESULT":
      SA_topmost_window.System._browser.capturePage_pixel = JSON.parse("[" + para[1] + "]")
//      DEBUG_show(para[1])
      break
  }
    }

  }
})();

(function () {
  if (use_SVG_Clock)
    document.write('<script language="JavaScript" src="js/svg_clock.js"></scr'+'ipt>')

  if (!is_SA_child_animation && returnBoolean("UseWebcamHeadtracking"))
    document.write('<script language="JavaScript" src="js/headtracker_ar.js"></scr'+'ipt>')

  if (gallery.length && !gallery_cache_obj.SS_mode) {
    var galleries = (SEQ_gallery) ? SEQ_gallery : [{gallery:gallery}]

    for (var i = 0; i < galleries.length; i++)
      galleries[i].gallery.sort(function (a,b) { return a.frame - b.frame })
  }
})();

// "SA_GadgetLocalConfig()"
(function () {
  try {
    if (use_SA_browser_mode || !SystemEXT._default._settings)
      return

    if (!SA_HTA_folder) {
      var f = ValidatePath(loadFolder_CORE())
      SA_HTA_folder = (f) ? ((f.isFolder) ? Settings.f_path : Settings.f_path.replace(/[\/\\][^\/\\]+$/, "")) : "";
      SA_HTA_folder_parent = SA_HTA_folder.replace(/[\/\\][^\/\\]+$/, "")
    }

    var s = SystemEXT._default._settings
    var _func = function ($0, $1, $2) { return eval($1) }
    for (var n in s) {
      var v = s[n]
      System.Gadget.Settings.writeString(n, decodeURIComponent(v).replace(/\$([^\$]+)\$/g, _func))
    }
  }
  catch (err) {setTimeout('DEBUG_show("'+err.description+'",0,1)', 1000)}
})();

(function () {
  if (!use_SA_system_emulation || is_SA_child_animation)
    return

  if (webkit_mode) {
    try {
      if (WallpaperEngine_mode) {
        System.Gadget.Settings.writeString("AutoItStayOnDesktop", "non_default")
      }

      if (webkit_electron_mode) {
var ipcRenderer = require('electron').ipcRenderer

ipcRenderer.on('capturePage', function (event, message) {
  IPC.active_IPC.ipcRenderer_capturePage(event, message)
});

ipcRenderer.on('window_hidden', function (event, message) {
  System._browser.hidden = message;
});
      }

webkit_electron_mode && webkit_window.setIgnoreMouseEvents(false);
window.addEventListener("SA_resized_once", function () {
// In Electron 2.x, window has to get the focus when .setIgnoreMouseEvents() is set to true (after resizing).
  self.focus()
  if (webkit_electron_mode) {
    webkit_window.setIgnoreMouseEvents(false)
    if (windows_mode || linux_mode || mac_mode) {
      webkit_window.setFocusable(!WallpaperEngine_mode)
// have to set it here AFTER focus/setFocusable in newer version of Electron
      if (!WallpaperEngine_mode && webkit_window)
        webkit_window.setAlwaysOnTop(false)
    }
  }
// TEST mode for Electron
  if (WallpaperEngine_CEF_mode && webkit_electron_remote) {
    webkit_window.setIgnoreMouseEvents(false)
  }
});
    }
    catch (err) { console.error(err) }
  }
})();
