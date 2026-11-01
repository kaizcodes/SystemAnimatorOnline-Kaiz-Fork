# XR Animator (trimmed fork)

A Windows/Electron-only fork of [XR Animator v0.36.0](https://github.com/ButzYung/SystemAnimatorOnline) (System Animator v11.0.3.6) by ButzYung. It's a webcam mocap app that drives MMD (PMX/VMD) and VRM avatars using MediaPipe tracking and three.js, exports VMD/BVH/glTF, and streams over VMC/OSC.

This fork removes everything desktop webcam mocap doesn't use. Face tracking, full-body mocap, VMC streaming and motion recording still work.

| | Upstream | This fork |
|---|---|---|
| Installed size | ~1.0 GB | ~380 MB |
| App folder | 586 MB | 110 MB |
| Files | 1,345 | 213 |
| `app.asar` | 19.0 MB | 1.2 MB |

## Removed

- Web/localhost server mode and non-Electron hosts (IE/HTA, XUL, Silverlight, NW.js), plus the `docs/`, `au3/` and `accessories/` folders
- 3D wallpaper mode, background menu, skybox/HDRI
- Post-processing (bloom, SAO/N8AO, depth of field, diffusion)
- Music playback, audio visualizer, BPM detection (UI sounds are kept)
- Tray widget, Settings dialog, Quick-Menu buttons
- Backpack, bag/map/tome items, video recorder item, air blower, segmentation AI
- Object detection and emotion classification (EfficientDet/EfficientNet, `@huggingface/transformers`)
- Multiplayer (PeerJS, chatbox)
- Unused assets: legacy MediaPipe Holistic (~80 MB) and Solutions WASM, HDRI textures (~94 MB), object-detection `.tflite` models, unused models and demo motions, duplicate textures, sourcemaps, non-en-US locales, `default_app.asar`, and Rust build leftovers in `app.asar`

## Fixed

- Startup hanging at "(NN% loaded)": the counter included motions that can never load (`jThree/three.core.min.js`)
- Crash on close from unguarded WMI calls in the unload handler
- Renderer-crash dialog never firing (`crashed` → `render-process-gone`); popup windows now use `setWindowOpenHandler`
- Two `must_load` motions with wrong in-zip paths
- "Full Body Holistic" option pointing at a file deleted upstream; option removed, menus renumbered
- Wallpaper Engine regex typo (`bpm` → `bmp`) and a false "loading error(?)" boot message

## Changed

- Skips the START screen. Set `auto_start = false` in `MMD_SA.js` to restore it.
- New toolbar, DOM menus and tooltips (`xra_ui.js`).
- Better tracking under occlusion: wrist, elbow and fingers keep tracking when the shoulder gate trips, and the forearm tracks from the wrist when the upper arm leaves the frame.
- `@mediapipe/tasks-vision` upgraded to 1.2.0; the existing `.task` models work with it.
- `SA_system_emulation.min.js` (camera/mocap pipeline) is prettier-formatted so it can be edited. It has no upstream source.

## Kept

Face/pose/hand tracking with all quality options (including the 30 MB "Best" model), MMD/VRM rendering with physics, VMC/OSC streaming, motion recording, VMD/BVH/glTF export, UI sounds, dormant Wallpaper Engine/stay-on-desktop code, the pico/Laughing-Man detection files, and `scene_auto_fit.js`.

## Known issues

- Dropping a motion file before the model loads throws a TypeError (removed video-capture stub). The media bar's play/pause does the same.
- 7 pose-list entries point to VMDs that don't exist, including in upstream v0.36.0. Selecting one fails. Trimming the list broke boot, so it's unchanged.
- No tray icon. Quit with the in-UI Close button or from the taskbar.
- No DevTools. To debug, uncomment `mainWindow.openDevTools()` in `js/electron_main.js` (don't commit it enabled).

## Run

Electron isn't in the repo because `electron.exe` exceeds GitHub's 100 MB limit.

1. Download `electron-v38.0.0-win32-x64.zip` from the [Electron v38.0.0 release](https://github.com/electron/electron/releases/tag/v38.0.0).
2. Extract it into `XR-Animator_electron-v38.0.0-win32-x64_SA/`, keeping this repo's `resources/` folder so the repo's `app.asar` replaces Electron's default.
3. Run `electron.exe`. The app loads on its own.

Both the runtime folder and the sibling `AT_SystemAnimator_v110360.gadget/` folder must be present.

| Path | Contents |
|---|---|
| `AT_SystemAnimator_v110360.gadget/` | The application (engine and XR Animator app) |
| `XR-Animator_electron-v38.0.0-win32-x64_SA/resources/` | `app.asar` stub that locates the gadget and runs `js/electron_main.js` |
| `AGENTS.md` | Full change log: layout, conventions, every removal with file lists |

If something you need turns out to depend on a removed file, restore it from the upstream release zip.

## License

CC BY-NC-SA 4.0 (see `AT_SystemAnimator_v110360.gadget/readme.md`): non-commercial, attribution required, share alike. Third-party assets keep their own licenses. Include `electron/LICENSE` and `LICENSES.chromium.html` when redistributing.
