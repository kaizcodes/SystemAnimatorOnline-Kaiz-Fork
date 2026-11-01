// Media control for Silverlight and HTML5 Canvas
// (2025-05-01)

var SL_MC_timerID
var SL_MC_timeout = 10*1000

function SL_Media_MouseEnter(sender, args) {
  SL_MC_MouseEnter()

  var mc = SL_root.FindName("C_media_control")
  if (mc.Visibility == "Visible")
    return

  SL_MC_video_obj = sender

  SL_MC_Update()

  mc.Visibility = "Visible"

  SL_MC_timerID = setTimeout('SL_MC_timerID=null; SL_root.FindName("C_media_control").Visibility = "Collapsed";', SL_MC_timeout)
}

var SL_tooltip_msg_custom

function SL_MC_MouseEnter(sender, args) {
  if (SL_MC_timerID) {
    clearTimeout(SL_MC_timerID)
    SL_MC_timerID = null
  }

  if (!sender)
    return

  var name = sender.Name
  if (!/^MC_(.+)$/.test(name))
    return

  name = RegExp.$1

const result = { tooltip_msg:'' };
window.dispatchEvent(new CustomEvent('SL_MC_MouseEnter', { detail:{ name:name, result:result } }));
SL_tooltip_msg_custom = result.tooltip_msg;

if (!SL_tooltip_msg_custom) {
  switch (name) {
    case "play":
      SL_tooltip_msg_custom = 'Play / Pause'
      break
    case "stop":
      SL_tooltip_msg_custom = 'Stop'
      break
    case "forward":
      SL_tooltip_msg_custom = 'Seek forward'
      break
    case "backward":
      SL_tooltip_msg_custom = 'Seek backward'
      break
    case "sound":
      SL_tooltip_msg_custom = 'Mute / Unmute'
      break
    case "seek":
      SL_tooltip_msg_custom = "Seek"
      break
  }
}

  if (SL_tooltip_msg_custom) {
    if (use_HTML5)
      document.getElementById("MC_" + name).setAttribute("data-title", SL_tooltip_msg_custom)
    else
      SL_Tooltip_Show(SL_tooltip_msg_custom)
  }
}

function SL_MC_Timeupdate(media_obj) {
  MC_seek._media_obj = media_obj
  if (MC_seek._update_disabled)
    return

  var v_now = parseInt(MC_seek.value)
  var v = parseInt(media_obj.currentTime / media_obj.duration * 100)
  if (v_now != v)
    MC_seek.value = v
}


// Media control

function SL_MC_MouseLeave(timeout) {
  SL_MC_MouseEnter()
  SL_MC_timerID = setTimeout('SL_MC_timerID=null; SL_root.FindName("C_media_control").Visibility = "Collapsed";', timeout||SL_MC_timeout)
}

var SL_MC_video_obj

function SL_MC_Update() {
  if (!SL_MC_video_obj)
    return

  SL_root.FindName("MC_sound").Text = (SL_MC_video_obj.muted) ? "\ud83d\udd07" : "\ud83d\udd0a"
}

var SL_MC_Place = (function () {
  var scale_last, x_offset_last, y_offset_last;

  return function (scale=scale_last||1, x_offset=x_offset_last||0, y_offset=y_offset_last||0) {
    if (scale == -1) {
      SL_MC_video_obj = null
      C_media_control.style.visibility = "hidden"
      return
    }

    scale_last = scale
    x_offset_last = x_offset
    y_offset_last = y_offset

    var w = 150 * scale
    var h = 45  * scale

    setTimeout(function () {
C_media_control.style.posLeft = Math.round((((browser_native_mode) ? screen.availWidth : B_content_width) - w) / 2) + x_offset;
C_media_control.style.posTop  = (((browser_native_mode) ? screen.availHeight: B_content_height) - h) - 20 - ((B_content_height > screen.availHeight-45) ? B_content_height - (screen.availHeight-45) : 0) + y_offset;
    }, 0);

    var mcs = C_media_control.style
    if (scale == 1) {
      mcs.transform = mcs.transformOrigin = "none";
    }
    else {
      mcs.transform = "scale(" + scale + ")";
      mcs.transformOrigin = "0% 0%";
    }
  };
})();

function SL_MC_Play() {
//play=52,4, pause=59,;
  if (SL_MC_video_obj.paused) {
    SL_MC_video_obj.play();

    System._browser.video_capture.resume();
  }
  else {
    SL_MC_video_obj.pause()
    var m = parseInt(SL_MC_video_obj.currentTime/60)
    var s = parseInt((SL_MC_video_obj.currentTime - m*60)*1000)/1000
    DEBUG_show('PAUSED(' + m + 'm' + s + 's)', 2)

    System._browser.video_capture.pause();
  }

  setTimeout('SL_MC_Update()', 0)
}

function SL_MC_Stop() {
  SL_MC_video_obj.pause()
  SL_MC_video_obj.currentTime = 0

  setTimeout('SL_MC_Update()', 0)
}

function SL_MC_Forward() {
  const result = { return_value:null };
  window.dispatchEvent(new CustomEvent("SL_MC_forward_backward", { detail:{ dir:1, result:result } }));
  if (result.return_value) return;

  SL_MC_Seek(1, true)
}

function SL_MC_Backward() {
  const result = { return_value:null };
  window.dispatchEvent(new CustomEvent("SL_MC_forward_backward", { detail:{ dir:-1, result:result } }));
  if (result.return_value) return;

  SL_MC_Seek(-1, true)
}

function SL_MC_Seek(mod, forced_seek, from_seek_bar) {
  SL_MC_video_obj.currentTime += ((!from_seek_bar && self.MMD_SA && MMD_SA_options.user_camera.ML_models.enabled) ? 1 : 30) * mod
}

function SL_MC_Sound() {
//sound=85,U, mute=86,V
  SL_MC_video_obj.muted = !SL_MC_video_obj.muted

  setTimeout('SL_MC_Update()', 0)
}


// Silverlight emulation START
(function () {
  if (!("SL_root" in self)) {
self.SL_root = {
  SL_root_object: {}

 ,FindName: function (name) {
var obj = this.SL_root_object[name]
if (!obj) {
  obj = {}

  if (name == "C_media_control") {
    Object.defineProperty(obj, "Visibility",
{
  get: function () {
return (C_media_control.style.visibility == "hidden") ? "Collapsed" : "Visible";
  }

 ,set: function(v) {
C_media_control.style.visibility = (v == "Collapsed") ? "hidden" : "inherit"
  }
});
  }
  else if (/^MC_/.test(name)) {
    obj.object = document.getElementById(name)
    Object.defineProperty(obj, "Text",
{
  get: function () {
return this.object.innerText;
  }

 ,set: function(v) {
this.object.innerText = v
  }
});
  }

  this.SL_root_object[name] = obj
}

return obj
  }
}
  }
})();
// END