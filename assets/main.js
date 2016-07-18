(function startSurfaceViewer() {
  "use strict";

  BrainBrowser.SurfaceViewer.start('brainbrowser', handleBrainz);

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

})();