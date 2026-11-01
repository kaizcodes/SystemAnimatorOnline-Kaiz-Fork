# XR Animator (trimmed fork)

A Windows/Electron-only fork of [XR Animator v0.36.0](https://github.com/ButzYung/SystemAnimatorOnline) by ButzYung. It's a webcam mocap app that drives MMD (PMX/VMD) and VRM avatars using MediaPipe tracking and three.js, exports VMD/BVH/glTF, and streams over VMC/OSC.

This fork removes everything desktop webcam mocap doesn't use. 

Rebuilt for VTubers or people who needs full body tracking in other apps like Warudo / VSeeFace/ Any VMC receviers.

Face tracking, full-body mocap, VMC streaming and motion recording still work.

| | Upstream | This fork |
|---|---|---|
| Installed size | ~1.0 GB | ~380 MB |
| App folder | 586 MB | 110 MB |
| Files | 1,345 | 213 |
| `app.asar` | 19.0 MB | 1.2 MB |

## Run

1. Download from [Releases](https://github.com/kaizcodes/SystemAnimatorOnline-Kaiz-Fork/releases/tag/v1.0)
2. Extract the zip
3. Go to `XR-Animator_electron-v38.0.0-win32-x64_SA`
4. Run `electron.exe`.

Electron.exe can't be in the repo because it exceeds GitHub's 100 MB limit.

**Both the runtime folder and the sibling `AT_SystemAnimator_v110360.gadget/` folder must be present.
**

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

## Changed

- Skips the START screen. Set `auto_start = false` in `MMD_SA.js` to restore it.
- New toolbar, DOM menus and tooltips (`xra_ui.js`).
- Better tracking under occlusion: wrist, elbow and fingers keep tracking when the shoulder gate trips, and the forearm tracks from the wrist when the upper arm leaves the frame.
- `@mediapipe/tasks-vision` upgraded to 1.2.0; the existing `.task` models work with it.
- `SA_system_emulation.min.js` (camera/mocap pipeline) is prettier-formatted so it can be edited. It has no upstream source.

## Fixed

- Startup hanging at "(NN% loaded)": the counter included motions that can never load (`jThree/three.core.min.js`)
- Crash on close from unguarded WMI calls in the unload handler
- Renderer-crash dialog never firing (`crashed` → `render-process-gone`); popup windows now use `setWindowOpenHandler`
- Two `must_load` motions with wrong in-zip paths
- "Full Body Holistic" option pointing at a file deleted upstream; option removed, menus renumbered
- Wallpaper Engine regex typo (`bpm` → `bmp`) and a false "loading error(?)" boot message


## Kept

Face/pose/hand tracking with all quality options (including the 30 MB "Best" model), MMD/VRM rendering with physics, VMC/OSC streaming, motion recording, VMD/BVH/glTF export, UI sounds, dormant Wallpaper Engine/stay-on-desktop code, the pico/Laughing-Man detection files, and `scene_auto_fit.js`.

## Known issues

- Dropping a motion file before the model loads throws a TypeError (removed video-capture stub). The media bar's play/pause does the same.
- 7 pose-list entries point to VMDs that don't exist, including in upstream v0.36.0. Selecting one fails. Trimming the list broke boot, so it's unchanged. THIS IS AN ISSUE FROM ORIGINAL TOO, does not pose a threat so I'm not fixing it.
- No tray icon. Quit with the in-UI Close button or from the taskbar.
- No DevTools. To debug, uncomment `mainWindow.openDevTools()` in `js/electron_main.js` (don't commit it enabled).


## License

CC BY-NC-SA 4.0 (see `AT_SystemAnimator_v110360.gadget/readme.md`): non-commercial, attribution required, share alike. Third-party assets keep their own licenses. Include `electron/LICENSE` and `LICENSES.chromium.html` when redistributing.

## Comparision
**XRAnimator Original**

<img width="1207" height="660" alt="image" src="https://github.com/user-attachments/assets/235e9e5d-db2c-400b-aafe-59c3ed441a37" />


**XRAnimator Kaiz Fork**

<img width="1267" height="661" alt="image" src="https://github.com/user-attachments/assets/87aef1c0-62ab-48bf-b4ad-740cbbf752b2" />

<img width="592" height="340" alt="image" src="https://github.com/user-attachments/assets/8e9d2501-5758-4aab-bf6f-5f0b222e3a37" />

<img width="774" height="462" alt="image" src="https://github.com/user-attachments/assets/1d523e59-0164-49a3-b9a2-a569f3bc4e65" />

## Roadmap
I need to rework some of the tool tips not explaining what their parameter change does.


