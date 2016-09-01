BrainBrowser.config.set("model_types.vtk.worker", "vtk.worker.js");
BrainBrowser.config.set("model_types.vtk.worker", "vtk.worker.js");
BrainBrowser.config.set("intensity_data_types.csv.worker", "csv.intensity.worker.js");
BrainBrowser.config.set('worker_dir', './brainbrowser-2.5.0/workers/');
BrainBrowser.config.set("color_maps", [
  {
    name: "Spectral",
    url: "color-maps/spectral.txt",
  },
  {
    name: "Thermal",
    url: "color-maps/thermal.txt",
  },
  {
    name: "Gray",
    url: "color-maps/gray-scale.txt",
  },
  {
    name: "Blue",
    url: "color-maps/blue.txt",
  },
  {
    name: "Green",
    url: "color-maps/green.txt",
  }
]);

BrainBrowser.SurfaceViewer.start('brainbrowser', handleBrainz);

var gui = new dat.GUI();
var inputs = queryStringToHash();

var modelUrl = inputs.model || './models/vtk/freesurfer_curvature.vtk'
var curvatureUrl = inputs.curv || './models/vertices.csv'


// Pulled out this function from the start call so that it's not so nested.
function handleBrainz(viewer) {
  var meshgui;
  window.viewer = viewer;
  window.gui = gui;

  //Add an event listener.
  viewer.addEventListener('displaymodel', function(brainBrowserModel) {
    window.brainBrowserModel = brainBrowserModel;

    meshgui = gui.addFolder(brainBrowserModel.model_data.name);
    meshgui.open();
    viewer.setClearColor(0XFFFFFF);

  });

  viewer.addEventListener("loadintensitydata", function(event) {
    var model_data = event.model_data;
    var intensity_data = event.intensity_data;
    window.intensityData = intensity_data;
    overlayGui = meshgui.addFolder(intensity_data.name);
    overlayGui.open();
    var vmin = overlayGui.add(intensity_data, 'min');
    var vmax = overlayGui.add(intensity_data, 'max');

    vmin.onChange(function(newMin){
      viewer.setIntensityRange(newMin, intensity_data.max)
    })
    vmax.onChange(function(newMax){
      viewer.setIntensityRange(intensity_data.min, newMax)
    })
  });

  viewer.addEventListener("loadcolormap", function(event) {
    viewer.color_map.clamp = false;      
  });

  // Start rendering the scene.
  viewer.render();
  viewer.loadColorMapFromURL(BrainBrowser.config.get("color_maps")[0].url);


  // Load a model into the scene.
  viewer.loadModelFromURL(modelUrl, {
    format: 'vtk',
    complete: function(){
      viewer.loadIntensityDataFromURL(curvatureUrl, {
        format: "csv",
        name: "Cortical Thickness"
      });
    }
  });

}

// taken from https://css-tricks.com/snippets/jquery/get-query-params-object/
function queryStringToHash(str){
  return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
}