import 'vtk.js/Sources/favicon';
import HttpDataAccessHelper from 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkXMLImageDataReader from 'vtk.js/Sources/IO/XML/XMLImageDataReader';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkHttpDataSetReader from 'vtk.js/Sources/IO/Core/HttpDataSetReader';
import vtkPiecewiseFunction from 'vtk.js/Sources/Common/DataModel/PiecewiseFunction';
import vtkPiecewiseGaussianWidget from 'vtk.js/Sources/Interaction/Widgets/PiecewiseGaussianWidget';
import vtkVolume from 'vtk.js/Sources/Rendering/Core/Volume';
import vtkVolumeMapper from 'vtk.js/Sources/Rendering/Core/VolumeMapper';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';

// ----------------------------------------------------------------------------
// Initialize volume viewer
// ----------------------------------------------------------------------------
export function viewVolumeRender(urlToLoad, div_id) {
  console.log("Init Volume Rendering");
  // Create DIV for volume viewer
  var wrappercontainer = document.querySelector('#vtkjs');
  const vtkcontainer = document.createElement('div');
  vtkcontainer.id = div_id;
  wrappercontainer.appendChild(vtkcontainer);

  // Create window on left panel
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    rootContainer: vtkcontainer,
    background: [0, 0, 0],
    containerStyle: { height: 'calc(100vh - 57px)', width: 'calc(50vw - 10px)', position: 'absolute' }
  });
  const renderWindow = fullScreenRenderer.getRenderWindow();
  const renderer = fullScreenRenderer.getRenderer();
  renderWindow.getInteractor().setDesiredUpdateRate(15.0);

  // Create Widget container
  const widgetContainer = document.createElement('div');
  widgetContainer.style.position = 'absolute';
  widgetContainer.style.top = 'calc(10px + 1em)';
  widgetContainer.style.left = '5px';
  widgetContainer.style.background = 'rgba(255, 255, 255, 0.3)';
  vtkcontainer.appendChild(widgetContainer);

  const widgetXlabel = document.createElement('div');
  widgetXlabel.innerHTML = "Voxel value";
  widgetXlabel.style.position = "fixed";
  widgetXlabel.style.top = 'calc(1em + 149px)';
  widgetXlabel.style.color = "white";
  widgetContainer.appendChild(widgetXlabel);

  const widgetYlabel = document.createElement('div');
  widgetYlabel.innerHTML = "Opacity";
  widgetYlabel.style.position = "fixed";
  widgetYlabel.style.transform = "rotate(90deg)";
  widgetYlabel.style.top = '90px';
  widgetYlabel.style.color = "white";
  widgetContainer.appendChild(widgetYlabel);

  // Code for changing preset
  const globalDataRange = [0, 255];
  const lookupTable = vtkColorTransferFunction.newInstance();
  lookupTable.applyColorMap(vtkColorMaps.getPresetByName("Grayscale"));
  lookupTable.setMappingRange(...globalDataRange);
  lookupTable.updateRange();

  // Create widget
  const widget = vtkPiecewiseGaussianWidget.newInstance({ numberOfBins: 256, size: [400, 150] });
  widget.updateStyle({
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    histogramColor: 'rgba(100, 100, 100, 0.5)',
    strokeColor: 'rgb(0, 0, 0)',
    activeColor: 'rgb(255, 255, 255)',
    handleColor: 'rgb(50, 150, 50)',
    buttonDisableFillColor: 'rgba(255, 255, 255, 0.5)',
    buttonDisableStrokeColor: 'rgba(0, 0, 0, 0.5)',
    buttonStrokeColor: 'rgba(0, 0, 0, 1)',
    buttonFillColor: 'rgba(255, 255, 255, 1)',
    strokeWidth: 2,
    activeStrokeWidth: 3,
    buttonStrokeWidth: 1.5,
    handleWidth: 3,
    iconSize: 25, // Can be 0 if you want to remove buttons (dblClick for (+) / rightClick for (-))
    padding: 15,
  });
  
  widget.setColorTransferFunction(lookupTable);
  lookupTable.onModified(() => {
    widget.render();
    renderWindow.render();
  });

  fullScreenRenderer.setResizeCallback(({ width, height }) => {
    if (width - 10 >= 0) {
      var widwidth = Math.min(450, width - 10);
      widget.setSize(widwidth, 150);
      widgetXlabel.style.left = 'calc(1em + ' + (widwidth/2 - 40) + 'px)';
      widgetYlabel.style.left = 'calc(1em + ' + Math.min(407, width - 53) + 'px)';
      widget.render();
      renderWindow.render();
    }
  });
  
  const piecewiseFunction = vtkPiecewiseFunction.newInstance();

  // create actor
  const actor = vtkVolume.newInstance();
  const mapper = vtkVolumeMapper.newInstance({ sampleDistance: 1.0 });
  const volumeReader = vtkXMLImageDataReader.newInstance(); 

  // Configure VTK pipeline
  actor.setMapper(mapper);
  mapper.setInputConnection(volumeReader.getOutputPort());
  actor.getProperty().setRGBTransferFunction(0, lookupTable);
  actor.getProperty().setScalarOpacity(0, piecewiseFunction);
  actor.getProperty().setInterpolationTypeToLinear();

  renderer.addVolume(actor);
  renderer.getActiveCamera().set({ position: [0, 0, -1], viewUp: [0, -1, 0] });

  // Default setting Piecewise function widget
  widget.addGaussian(0.525, 0.5, 0.2, 0.3, 0.2);
  widget.addGaussian(0.85, 1, 0.3, 0, 0);
  widget.setContainer(widgetContainer);
  widget.bindMouseListeners();
  widget.onAnimation((start) => {
    if (start) {
      renderWindow.getInteractor().requestAnimation(widget);
    } else {
      renderWindow.getInteractor().cancelAnimation(widget);
    }
  });
  widget.onOpacityChange(() => {
    widget.applyOpacity(piecewiseFunction);
    if (!renderWindow.getInteractor().isAnimating()) {
      renderWindow.render();
    }
  });

  // Expose variable to global namespace
  global.volscreen = fullScreenRenderer;
  global.widget = widget;
  global.piecewiseFunction = piecewiseFunction;
  global.volumeReader = volumeReader;
  global.globalDataRange = globalDataRange;
  
  updateVolumeViewer(urlToLoad);
}

// ----------------------------------------------------------------------------
// Update volume viewer: change volume
// ----------------------------------------------------------------------------
export function updateVolumeViewer(urlToLoad) {
  if (urlToLoad != global.volfile) {
    console.log("VolumeRend : " + urlToLoad);
    document.getElementById('spinner').style.display = 'block';
    
    const renderer = global.volscreen.getRenderer();
    const renderWindow = global.volscreen.getRenderWindow();
    // Load data with real-time loading progress
    const progressContainer = document.createElement('div');

    const progressCallback = (progressEvent) => {
      const percent = Math.floor(100 * progressEvent.loaded / progressEvent.total);
      progressContainer.innerHTML = `Loading ${percent}%`;
    };

    HttpDataAccessHelper.fetchText({}, urlToLoad, { progressCallback }).then((txt) => {
      global.volumeReader.parse(txt);
      const source = global.volumeReader.getOutputData(0);

      // Read data
      const imageData = global.volumeReader.getOutputData(0);
      const dataArray = source.getPointData().getScalars() || source.getPointData().getArrays()[0];
      const dataRange = dataArray.getRange();

      global.globalDataRange[0] = dataRange[0];
      global.globalDataRange[1] = dataRange[1];
      // Update Lookup table
      global.widget.setDataArray(dataArray.getData());
      global.widget.applyOpacity(global.piecewiseFunction);
      
      // Update renderer
      global.widget.render();
      renderer.resetCamera();
      renderWindow.render();
      document.getElementById('spinner').style.display = 'none';
    }).catch(function () {
      console.error('Error cannot load volume intensity');
      document.getElementById('spinner').style.display = 'none';
    });

    global.volfile = urlToLoad;
  }
}