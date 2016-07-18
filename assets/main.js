BrainBrowser.config.set("worker_dir", "./brainbrowser-2.5.0/workers/");
BrainBrowser.SurfaceViewer.start('brainbrowser', handleBrainz);

// Pulled out this function from the start call so that it's not so nested.
function handleBrainz(viewer) {
  //Add an event listener.
  viewer.addEventListener('displaymodel', function(brainBrowserModel) {
    console.log('We have a model!');
  });

  // Start rendering the scene.
  viewer.render();

  // Load a model into the scene.
  viewer.loadModelFromURL('./models/brain-surface.obj.gz');

}