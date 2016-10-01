BrainBrowser.config.set("model_types.vtk.worker", "vtk.worker.js");
BrainBrowser.config.set("intensity_data_types.csv.worker", "csv.intensity.worker.js");
BrainBrowser.config.set("intensity_data_types.csvcolumn.worker", "csvcolumn.intensity.worker.js");
BrainBrowser.config.set('worker_dir', '../brainbrowser/src/brainbrowser/workers/');
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
var overlayUrl = inputs.overlay || './models/vertices.csv'
var colormaps = {}
BrainBrowser.config.get("color_maps").forEach(function(val, idx, arr){colormaps[val.name] = val.url})

// Pulled out this function from the start call so that it's not so nested.
function handleBrainz(viewer) {
  var meshgui;
  // alias BB's THREE
  var THREE = BrainBrowser.SurfaceViewer.THREE;
  var COLORS = {
    WHITE: 0xFFFFFF,
    BLACK: 0x101010
  };

  window.viewer = viewer;
  window.gui = gui;

  viewer.addEventListener('displaymodel', function(brainBrowserModel) {
    window.brainBrowserModel = brainBrowserModel;

    brainBrowserModel.model.children.forEach(function(shape){
      shape.material = new THREE.MeshLambertMaterial( {
        color: COLORS.WHITE,
        ambient: COLORS.WHITE,
        specular: COLORS.BLACK,
        vertexColors: THREE.VertexColors
      });
      
      meshgui = gui.addFolder(shape.name);

      var transparency = meshgui.add(shape.material, 'opacity',0,1);
      transparency.onChange(function(newT){
        viewer.setTransparency(newT, {shape_name: shape.name})
      });

      meshgui.open();
    });

  });

  viewer.addEventListener("loadintensitydata", function(event) {
    var model_data = event.model_data;
    var intensity_data = event.intensity_data;
    intensity_data.transparency = 1
    intensity_data.colormap_name = "Spectral"
    window.intensityData = intensity_data;

    overlayGui = meshgui.addFolder(intensity_data.name);
    overlayGui.open();

    var vmin = overlayGui.add(intensity_data, 'min');
    var vmax = overlayGui.add(intensity_data, 'max');
    var cmap = overlayGui.add(intensity_data, "colormap_name", Object.keys(colormaps))

    vmin.onChange(function(newMin){
      viewer.setIntensityRange(intensity_data, newMin, intensity_data.max)
    });
    vmax.onChange(function(newMax){
      viewer.setIntensityRange(intensity_data, intensity_data.min, newMax)
    });

    cmap.onChange(function(newC){
        viewer.loadColorMapFromURL(colormaps[newC])
    });
    
  });

  viewer.addEventListener("loadcolormap", function(event) {
    viewer.color_map.clamp = false; 
  });

  // Start rendering the scene.
  viewer.render();
  viewer.setClearColor(0XFFFFFF);
  viewer.loadColorMapFromURL(BrainBrowser.config.get("color_maps")[0].url);


  // Load a model into the scene.
  viewer.loadModelFromURL(modelUrl, {
    format: 'vtk',
    complete: function(){
      viewer.loadIntensityDataSetFromURL(overlayUrl, {
        format: "csv",
        parse: {
          columns: ['freesurfer convexity (sulc)', 'freesurfer thickness', 'freesurfer curvature']
        }
      });
    }
  });

}

// taken from https://css-tricks.com/snippets/jquery/get-query-params-object/
function queryStringToHash(str){
  return (str || document.location.search).replace(/(^\?)/,'').split("&").map(function(n){return n = n.split("="),this[n[0]] = n[1],this}.bind({}))[0];
}