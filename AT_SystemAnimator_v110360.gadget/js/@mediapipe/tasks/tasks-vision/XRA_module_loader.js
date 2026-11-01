// 2024-12-10
// 2026-10-30 @mediapipe/tasks-vision 1.2.0: vision_bundle.js is a classic IIFE bundle now,
// the ES module is vision_bundle.mjs (works in both window and worker contexts).
// Callers poll for 'FilesetResolver' in self, so log a failure instead of hanging silently.

(()=>{
  function load_module(m) {
//    console.log(m);
    for (const name of ['FilesetResolver', 'FaceLandmarker', 'PoseLandmarker', 'HandLandmarker'])//, 'HolisticLandmarker'])
      self[name] = m[name];
  }

  import('./vision_bundle.mjs').then(load_module, (err)=>{
    console.error('XRA_module_loader: failed to load vision_bundle.mjs', err);
  });
//https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0
})();
