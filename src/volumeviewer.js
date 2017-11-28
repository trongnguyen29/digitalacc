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
  console.log("VolumeRend : " + urlToLoad);
  // Create DIV for volume viewer
  var wrappercontainer = document.querySelector('#vtkjs');
  const vtkcontainer = document.createElement('div');
  vtkcontainer.id = div_id;
  wrappercontainer.appendChild(vtkcontainer);

  // Create window on left panel
  const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance({
    rootContainer: vtkcontainer,
    background: [0, 0, 0],
    containerStyle: { height: 'calc(100vh - 55px)', width: 'calc(50vw - 10px)', position: 'absolute' }
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

  // Create Label for preset
  const labelContainer = document.createElement('div');
  labelContainer.style.position = 'absolute';
  labelContainer.style.top = '5px';
  labelContainer.style.left = '5px';
  labelContainer.style.width = '50vw';
  labelContainer.style.color = 'white';
  labelContainer.style.textAlign = 'center';
  labelContainer.style.userSelect = 'none';
  labelContainer.style.cursor = 'pointer';
  vtkcontainer.appendChild(labelContainer);

  // Code for changing preset
  let presetIndex = 1;
  const globalDataRange = [0, 255];
  const lookupTable = vtkColorTransferFunction.newInstance();
  function changePreset(delta = 1) {
    presetIndex = (presetIndex + delta + vtkColorMaps.rgbPresetNames.length) % vtkColorMaps.rgbPresetNames.length;
    lookupTable.applyColorMap(vtkColorMaps.getPresetByName(vtkColorMaps.rgbPresetNames[presetIndex]));
    lookupTable.setMappingRange(...globalDataRange);
    lookupTable.updateRange();
    labelContainer.innerHTML = vtkColorMaps.rgbPresetNames[presetIndex];
  }

  let intervalID = null;
  function stopInterval() {
    if (intervalID !== null) {
      clearInterval(intervalID);
      intervalID = null;
    }
  }

  labelContainer.addEventListener('click', (event) => {
    if (event.pageX < 200) {
      stopInterval();
      changePreset(-1);
    } else {
      stopInterval();
      changePreset(1);
    }
  });

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
    iconSize: 20, // Can be 0 if you want to remove buttons (dblClick for (+) / rightClick for (-))
    padding: 10,
  });
  fullScreenRenderer.setResizeCallback(({ width, height }) => {
    widget.setSize(Math.min(450, width - 10), 150);
  });


  const piecewiseFunction = vtkPiecewiseFunction.newInstance();
  const actor = vtkVolume.newInstance();
  const mapper = vtkVolumeMapper.newInstance({ sampleDistance: 1.1 });

  // Load data with real-time loading progress
  const progressContainer = document.createElement('div');

  const progressCallback = (progressEvent) => {
    const percent = Math.floor(100 * progressEvent.loaded / progressEvent.total);
    progressContainer.innerHTML = `Loading ${percent}%`;
  };

  const vtiReader = vtkXMLImageDataReader.newInstance();
  HttpDataAccessHelper.fetchText({}, urlToLoad, { progressCallback }).then((txt) => {
    vtiReader.parse(txt);
    const source = vtiReader.getOutputData(0);

    // Read data
    const imageData = vtiReader.getOutputData(0);
    const dataArray = source.getPointData().getScalars() || source.getPointData().getArrays()[0];
    const dataRange = dataArray.getRange();

    globalDataRange[0] = dataRange[0];
    globalDataRange[1] = dataRange[1];
    // Update Lookup table
    changePreset();
    // Automatic switch to next preset every 5s
    if (!vtkcontainer) {
      intervalID = setInterval(changePreset, 5000);
    }
    widget.setDataArray(dataArray.getData());
    widget.applyOpacity(piecewiseFunction);
    widget.setColorTransferFunction(lookupTable);
    lookupTable.onModified(() => {
      widget.render();
      renderWindow.render();
    });

    // Add volume rendering to renderer
    renderer.addVolume(actor);
    renderer.getActiveCamera().set({ position: [0, 0, -1], viewUp: [0, -1, 0] });
    renderer.resetCamera();
    renderWindow.render();
  });

  // Configure VTK pipeline
  actor.setMapper(mapper);
  mapper.setInputConnection(vtiReader.getOutputPort());
  actor.getProperty().setRGBTransferFunction(0, lookupTable);
  actor.getProperty().setScalarOpacity(0, piecewiseFunction);
  actor.getProperty().setInterpolationTypeToFastLinear();

  // Default setting Piecewise function widget
  widget.addGaussian(0.425, 0.5, 0.2, 0.3, 0.2);
  widget.addGaussian(0.75, 1, 0.3, 0, 0);
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
  global.fullScreen = fullScreenRenderer;
  global.widget = widget;
  global.globalDataRange = globalDataRange;
  global.changePreset = changePreset;
  global.volfile = urlToLoad;
}


// ----------------------------------------------------------------------------
// Update volume viewer: change volume
// ----------------------------------------------------------------------------
export function updateVolumeViewer(urlToLoad) {
  if (urlToLoad != global.volfile) {
    console.log("New VolumeRend : " + urlToLoad);
    const renderWindow = global.fullScreen.getRenderWindow();
    // Load data with real-time loading progress
    const progressContainer = document.createElement('div');

    const progressCallback = (progressEvent) => {
      const percent = Math.floor(100 * progressEvent.loaded / progressEvent.total);
      progressContainer.innerHTML = `Loading ${percent}%`;
    };

    const vtiReader = vtkXMLImageDataReader.newInstance();
    HttpDataAccessHelper.fetchText({}, urlToLoad, { progressCallback }).then((txt) => {
      vtiReader.parse(txt);
      const source = vtiReader.getOutputData(0);

      // Read data
      const imageData = vtiReader.getOutputData(0);
      const dataArray = source.getPointData().getScalars() || source.getPointData().getArrays()[0];
      const dataRange = dataArray.getRange();

      global.globalDataRange[0] = dataRange[0];
      global.globalDataRange[1] = dataRange[1];
      // Update Lookup table
      global.changePreset();

      global.widget.setDataArray(dataArray.getData());

      // Update renderer
      global.widget.render();
      renderWindow.render();
    });


    global.volfile = urlToLoad;
  }
}