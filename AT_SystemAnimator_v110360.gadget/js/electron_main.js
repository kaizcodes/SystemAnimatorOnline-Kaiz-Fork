// SA Electron - Main EXTENDED
// (2025-05-01)

/*
eval on Electron v1.6.x has some scope issues/bugs which makes the global variables on this script inaccessible inside functions.
As a workaround, use anonymous self-invoking function to create its own scope.
*/

(function () {

// re-defined here for backward compatibility
if (windows_mode == undefined) {
  var windows_mode = (process.platform == "win32");
  var linux_mode   = (process.platform == "linux");
  var toLocalPath = function (url) {
    return decodeURIComponent(url.replace(/^file\:\/+/i, ((windows_mode)?"":"/")).replace(/^(\w)[\|\:]/i, "$1:").replace(/[\/\\]/g, ((windows_mode)?"\\":"/")).replace(/\?.+$/, ""));
  };
}


// https://stackoverflow.com/questions/54464276/how-to-force-discrete-gpu-in-electron-js
const { spawn } = require('child_process');

// Restart with force using the dedicated GPU
if (windows_mode && process.env.GPUSET !== 'true') {
  spawn(process.execPath, process.argv.slice(1), {
    env: {
      ...process.env,
      SHIM_MCCOMPAT: '0x800000001', // this forces windows to use the dedicated GPU for the process
      GPUSET: 'true'
    },
    detached: true,
  });
  process.exit(0);
}


const icon_name = (windows_mode) ? "icon_SA.ico" : "icon_SA_512x512.png";

// Module to control application life.
const app = electron.app

//app.commandLine.appendSwitch('no-sandbox');
//app.disableDomainBlockingFor3DAPIs()

// https://stackoverflow.com/questions/55898000/blocked-a-frame-with-origin-file-from-accessing-a-cross-origin-frame
app.commandLine.appendSwitch('disable-site-isolation-trials');

app.commandLine.appendSwitch('enable-features','SharedArrayBuffer');

app.commandLine.appendSwitch("ignore-gpu-blocklist");

// https://github.com/electron/electron/issues/9842
// https://www.electronjs.org/docs/latest/api/command-line-switches
app.commandLine.appendSwitch('force_high_performance_gpu');

//app.commandLine.appendSwitch('js-flags', '--experimental-wasm-simd');

// https://github.com/electron/electron/issues/2170
// transparency on Linux is broken, disabled for now
// NOTE: It seems the latest version electron supports transparent window without any flags
/*
if (linux_mode) {
//  app.disableHardwareAcceleration()
//  app.commandLine.appendSwitch("disable-gpu")
//  app.commandLine.appendSwitch("enable-transparent-visuals")
//  app.commandLine.appendSwitch("force-cpu-draw")
}
*/
//app.commandLine.appendSwitch("enable-native-gpu-memory-buffers");


// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

let webContents

const webPreferences_default = {
  nodeIntegration: true,
  enableRemoteModule: true,
// https://www.electronjs.org/docs/breaking-changes#default-changed-contextisolation-defaults-to-true
  contextIsolation: false,
//  nodeIntegrationInWorker: true,
//  preload: toLocalPath(SA_path + '\\' + 'js\\electron_preload.js'),
};


// Quit when all windows are closed.
/*
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});
*/

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {

  var path_demo_obj = global.path_demo()
  if (!path_demo_obj) {
    app.quit()
    return
  }

/*
  if (windows_mode && !electron.systemPreferences.isAeroGlassEnabled()) {
    global.is_natural_opaque = true
    global.is_transparent = false
  }
*/

  if (linux_mode) {
//    global.is_natural_opaque = true
//    global.is_transparent = false
  }

  var p = process.argv.slice(1)
  if (p) {
    if (p[0] == "-parentHWND") {
      global.WallpaperEngine_mode = true
      global.is_natural_opaque = true
      global.is_transparent = false
    }

    var wsh_index, hta_index
    wsh_index = hta_index = p.length - 1
    if (p[wsh_index] == "wsh") {
      hta_index -= 1
    }

    const _animation_path_default_ = toLocalPath(SA_path + '/TEMP/animation_path_default.txt');
    let animation_path_default;
    if (fs.existsSync(_animation_path_default_)) {
      try {
        animation_path_default = fs.readFileSync(_animation_path_default_, 'utf8').trim();
        if (/^[\/\\]/.test(animation_path_default))
          animation_path_default = SA_path + animation_path_default;
      }
      catch (err) {}
    }

    if (animation_path_default || ((hta_index >= 0) && /^(\/|[\w\-]+\:|demo\d+$)/.test(p[hta_index]))) {
      let SA_HTA_folder = p[hta_index] || animation_path_default;
      if (/^system-animator\:\/+/.test(SA_HTA_folder)) {
        SA_HTA_folder = decodeURIComponent(SA_HTA_folder.replace(/^system-animator\:\/+/, "")).replace(/[\/\\]$/, "")
      }
      SA_HTA_folder = path_demo_obj.path_demo[SA_HTA_folder] || SA_HTA_folder

var SA_HTA_folder_full = SA_HTA_folder
var isFile = fs.lstatSync(SA_HTA_folder).isFile()
if (isFile) {
  SA_HTA_folder = SA_HTA_folder.replace(/[\/\\][^\/\\]+$/, "")
}

if (isFile && /\.(mp4|mkv|webm)$/i.test(SA_HTA_folder_full)) {
  global.is_natural_opaque = true
  global.is_transparent = false
}

var SA_project_JSON
var p_js = toLocalPath(SA_HTA_folder + '\\SA_project.json')
if (fs.existsSync(p_js)) {
  try {
    SA_project_JSON = JSON.parse(fs.readFileSync(p_js, 'utf8'))
  }
  catch (err) {}
}

var c_js
if (path_demo_obj.path_demo_by_url[SA_HTA_folder]) {
  c_js = toLocalPath(SA_path + '\\TEMP\\_config_local\\' + SA_HTA_folder.replace(/^.+[\/\\]/, "") + '.js')
  if (!fs.existsSync(c_js))
    c_js = ""
}
else if (isFile) {
  c_js = toLocalPath(SA_path + '\\TEMP\\_config_local\\_SA_' + global.HASH_SHA256.hash(SA_HTA_folder_full) + '.js')
  if (!fs.existsSync(c_js))
    c_js = ""
}

if (!c_js) {
  c_js = toLocalPath(SA_HTA_folder + '\\_config_local.js')
  if (!fs.existsSync(c_js))
    c_js = ""
}

var c_json
if (c_js) {
  try {
    var txt = fs.readFileSync(c_js, 'utf8')
    if (/(\{[^\}]+})/.test(txt)) {
      c_json = JSON.parse(RegExp.$1)
    }
    if (c_json && SA_project_JSON && SA_project_JSON.config_default) {
      for (var s_name in SA_project_JSON.config_default)
        c_json[s_name] = SA_project_JSON.config_default[s_name]
    }
  }
  catch (err) {}
}

if (!c_json)
  c_json = SA_project_JSON && SA_project_JSON.config_default

if (c_json) {
//electron.dialog.showMessageBox(null, {type:"question", buttons:["OK", "Cancel"], defaultId:1, message:SA_HTA_folder+'\n\n'+c_js+'|'+!!c_js+'\n'+JSON.stringify(c_json)+'\n'+JSON.stringify(SA_project_JSON) });
// NOTE: .is_transparent should always be false for "Stay on desktop" mode, even when electron-as-wallpaper is used (.transparent doesn't help as the background is still black)
  if (c_json.DisableTransparency || c_json.AutoItStayOnDesktop) {
    global.is_transparent = false
  }
  if (c_json.DisableBackgroundThrottling) {
    global.is_backgroundThrottling_disabled = true;
    webPreferences_default.backgroundThrottling = false;
  }
}
    }
  }


  // Create the browser window.

//.workAreaSize
  const {width, height} = (global.WallpaperEngine_mode) ? electron.screen.getPrimaryDisplay().size : {width:160,height:160}

  if (1) {
    mainWindow = new BrowserWindow({icon:__dirname + toLocalPath("\\") + icon_name, width:width, height:height, resizable:false, frame:false, transparent:global.is_transparent, show:false,
webPreferences: webPreferences_default,
    });
    mainWindow.setIgnoreMouseEvents(true)
    mainWindow.loadURL((SA_path && toFileProtocol(SA_path + '\\' + 'SystemAnimator_webkit.html')) || 'file://' + __dirname + '/index.html');
  }
  else {
    mainWindow = new BrowserWindow({icon:__dirname + toLocalPath("\\") + icon_name, width: 1280, height: 720});
    mainWindow.loadURL('chrome://gpu/'); //'https://vladmandic.github.io/human/demo/index.html'); //'https://code.mediapipe.dev/codepen/holistic'); //toFileProtocol("F:\\Programs Portable\\node-webkit\\_TEMP\\test.html"));//
  }

//(SA_path && toFileProtocol(SA_path + '\\' + 'SystemAnimator_webkit.html')) || 'file://' + __dirname + '/index.html');
//toFileProtocol("F:\\Programs Portable\\node-webkit\\AT_SystemAnimator_v8402.gadget\\audio_BPM_detection_portable.html") + "?file=" + encodeURIComponent("C:\\Users\\user\\Desktop\\Youthful Days' Graffiti (Extended Mix).mp3"));
//"http://www.animetheme.com/temp/_tooltip.html");
//toFileProtocol("F:\\Programs Portable\\node-webkit\\_TEMP\\test.html"));

  mainWindow.on("ready-to-show", function () {
    mainWindow.show()

    mainWindow.on("hide", function () {
      webContents.send('window_hidden', true);
    });
    mainWindow.on("minimize", function () {
      webContents.send('window_hidden', true);
    });

    mainWindow.on("show", function () {
      webContents.send('window_hidden', false);
    });
    mainWindow.on("restore", function () {
      webContents.send('window_hidden', false);
    });
  });

  mainWindow.on("close", function () {
    global.electron_as_wallpaper();
  });

  // Open the DevTools.
//  mainWindow.openDevTools();


  webContents = mainWindow.webContents;

// https://www.electronjs.org/docs/breaking-changes#removed-remote-module
// https://www.npmjs.com/package/@electron/remote
if (parseInt(process.versions.electron) >= 14) {
  const e_main = require('@electron/remote/main');
  e_main.initialize();
  e_main.enable(webContents);
}

// upstream listened to 'new-window'/'crashed', both removed from Electron long
// before v38 and never fired — the modern equivalents keep the same behavior
  webContents.setWindowOpenHandler(function (details) {
    electron.shell.openExternal(details.url);
    return { action: 'deny' };
  });
  webContents.on('render-process-gone', function (event, details) {
    try {
      mainWindow.setAlwaysOnTop(false)
    }
    catch (err) {}

    var options = {type:"question", buttons:["OK", "Cancel"], defaultId:1, message:"ERROR: System Animator has crashed. Press OK to restart, or Cancel to quit."}
    if (!electron.dialog.showMessageBoxSync(null, options)) {
      app.relaunch()
      app.exit(0)
    }
    else {
      mainWindow.close()
    }
  });


  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
    webContents = null;
// in case any other window is still open
    app.quit()
  });

});


// global, for remote.getGlobal(name)

global.is_transparent = true;
global.is_natural_opaque = false;
global.WallpaperEngine_mode = false;

global.electron_as_wallpaper = (function () {
  const e = {};

  let attached;

  let initialized;
  function init() {
    if (initialized) return;
    initialized = true;

    const {attach, detach, refresh} = require('electron-as-wallpaper/node_modules/electron-as-wallpaper');
    e.attach = attach;
    e.detach = detach;
    e.refresh = refresh;

    app.on('quit', ()=>{
      if (attached)
        e.refresh?.();
    });
  }

  return function (attach) {
    if (!attach && !attached) return;

try {
    init();

    if (attach === true) {
      if (!attached) {
        attached = true;
        e.attach(mainWindow, {
          transparent: global.is_transparent,
        });
      }
    }
    else if (attach === false) {
      if (attached) {
        attached = false;
        e.detach(mainWindow);
        e.refresh();
      }
    }
    else {
      e.refresh();
    }
}
catch (err) {};
  }
})();

global.path_demo = (function () {
  var path_demo, path_demo_by_url

  return function () {
    if (!path_demo) {
      try {
        path_demo = JSON.parse(fs.readFileSync(toLocalPath(SA_path + '\\js\\path_demo.json'), 'utf8'))
      }
      catch (err) {}
//electron.dialog.showErrorBox("",toLocalPath(SA_path + '\\js\\path_demo.json'))
      if (!path_demo) {
        electron.dialog.showMessageBox(null, {type:"question", buttons:["OK", "Cancel"], defaultId:1, message:'ERROR: "path_demo.json" not found/readable/parsable\n'+err });
        return null
      }

      path_demo_by_url = {}
      for (var demo_name in path_demo) {
        path_demo[demo_name] = toLocalPath(SA_path + '\\images\\' + path_demo[demo_name])
        path_demo_by_url[path_demo[demo_name]] = demo_name
      }
    }

    return { path_demo:path_demo, path_demo_by_url:path_demo_by_url }
  }
})()

global.HASH_SHA256 = {
  _hash_cache: {}

 ,hash: function (str) {
var cache = this._hash_cache[str]
if (cache)
  return cache

var hash = require('crypto').createHash('sha256')
hash.update(str)
cache = this._hash_cache[str] = hash.digest('hex')

return cache
  }
}

global.mainWindow_handle = {
  _self_handle: null
 ,get self_handle() {
    if (!this._self_handle) {
      var hWindow_buf = mainWindow.getNativeWindowHandle()
      var hWindow_str = "0x"
      for (var i = hWindow_buf.length-1; i >= 0; i--)
        hWindow_str += hWindow_buf.toString("hex", i,i+1).toUpperCase()
      this._self_handle = hWindow_str
    }
    return this._self_handle
  }
 ,parent_handle: null
}

let capturePage_in_process
global.capturePage = function (x,y) {
  var win_dim = mainWindow.getSize()
  if (capturePage_in_process || (x >= win_dim[0]) || (y >= win_dim[1])) {
    webContents.send('capturePage', 'FAILED')
    return
  }

//var screen_size = electron.screen.getPrimaryDisplay().workAreaSize
  capturePage_in_process = true
  webContents.capturePage({x:x,y:y,width:1,height:1}).then(function(image) {
var buffer = image.getBitmap()
webContents.send('capturePage', 'RESULT|' + [buffer[0],buffer[1],buffer[2],buffer[3]])
// delay to reduce CPU usage
setTimeout(function () {capturePage_in_process = false}, 200)
  });
}

// For backward compatibility only. Use ipcRenderer instead.
// https://www.npmjs.com/package/@electron/remote
// https://www.electronjs.org/docs/latest/api/ipc-renderer
global.mainWindow_postMessage = function (channel, msg) {
  webContents.send(channel, msg)
}

global.relaunch = function (args, execPath) {
  var options = { args:args }
  if (execPath)
    options.execPath = execPath
  app.relaunch(options)
  app.quit()
//  mainWindow.close()
}

global.GetImageSize = function (filename) {
  if (!fs.existsSync(filename))
    return null
  var len = fs.lstatSync(filename).size
  if (len < 24)
    return null

  // Strategy:
  // reading GIF dimensions requires the first 10 bytes of the file
  // reading PNG dimensions requires the first 24 bytes of the file
  // reading JPEG dimensions requires scanning through jpeg chunks
  // In all formats, the file is at least 24 bytes big, so we'll read that always
  var x,y
  var buf = Buffer.alloc(24)//new Buffer(24)//

  var fd = fs.openSync(filename, "r")
  fs.readSync(fd, buf, 0, 24, 0)

  // For JPEGs, we need to read the first 12 bytes of each chunk.
  // We'll read those 12 bytes at buf+2...buf+14, i.e. overwriting the existing buf.
  if ((buf[0]==0xFF && buf[1]==0xD8 && buf[2]==0xFF && buf[3]==0xE0 && buf[6]=='J'.charCodeAt(0) && buf[7]=='F'.charCodeAt(0) && buf[8]=='I'.charCodeAt(0) && buf[9]=='F'.charCodeAt(0)) ||
        (buf[0]==0xFF && buf[1]==0xD8 && buf[2]==0xFF && buf[3]==0xE1 && buf[6]=='E'.charCodeAt(0) && buf[7]=='x'.charCodeAt(0) && buf[8]=='i'.charCodeAt(0) && buf[9]=='f'.charCodeAt(0)))
  {
    var pos=2;
    while (buf[2]==0xFF)
    {
      if (buf[3]==0xC0 || buf[3]==0xC1 || buf[3]==0xC2 || buf[3]==0xC3 || buf[3]==0xC9 || buf[3]==0xCA || buf[3]==0xCB) 
        break;

      pos += 2+(buf[4]<<8)+buf[5];
      if (pos+12>len) break;

      fs.readSync(fd, buf, 2, 12, pos)
    }
  }

  fs.closeSync(fd)

  // JPEG: (first two bytes of buf are first two bytes of the jpeg file; rest of buf is the DCT frame
  if (buf[0]==0xFF && buf[1]==0xD8 && buf[2]==0xFF)
  {
    y = (buf[7]<<8) + buf[8];
    x = (buf[9]<<8) + buf[10];
    return [x,y];
  }

  // GIF: first three bytes say "GIF", next three give version number. Then dimensions
  if (buf[0]=='G'.charCodeAt(0) && buf[1]=='I'.charCodeAt(0) && buf[2]=='F'.charCodeAt(0))
  {
    var x = buf[6] + (buf[7]<<8);
    var y = buf[8] + (buf[9]<<8);
    return [x,y];
  }

  if ( buf[0]==0x89 && buf[1]=='P'.charCodeAt(0) && buf[2]=='N'.charCodeAt(0) && buf[3]=='G'.charCodeAt(0) && buf[4]==0x0D && buf[5]==0x0A && buf[6]==0x1A && buf[7]==0x0A
    && buf[12]=='I'.charCodeAt(0) && buf[13]=='H'.charCodeAt(0) && buf[14]=='D'.charCodeAt(0) && buf[15]=='R'.charCodeAt(0))
  {
    x = (buf[16]<<24) + (buf[17]<<16) + (buf[18]<<8) + (buf[19]<<0);
    y = (buf[20]<<24) + (buf[21]<<16) + (buf[22]<<8) + (buf[23]<<0);
    return [x,y];
  }

  return null
}

})();
