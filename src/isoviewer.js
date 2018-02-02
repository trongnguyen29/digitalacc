import 'vtk.js/Sources/favicon';

import HttpDataAccessHelper from 'vtk.js/Sources/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkXMLImageDataReader from 'vtk.js/Sources/IO/XML/XMLImageDataReader';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkArrowSource from 'vtk.js/Sources/Filters/Sources/ArrowSource';
import vtkFullScreenRenderWindow from 'vtk.js/Sources/Rendering/Misc/FullScreenRenderWindow';
import vtkHttpDataSetReader from 'vtk.js/Sources/IO/Core/HttpDataSetReader';
import vtkImageMarchingCubes from 'vtk.js/Sources/Filters/General/ImageMarchingCubes';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkCalculator from 'vtk.js/Sources/Filters/General/Calculator';
import vtkColorTransferFunction from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction';
import vtkColorMaps from 'vtk.js/Sources/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkMath from 'vtk.js/Sources/Common/Core/Math';
import vtkCellPicker from 'vtk.js/Sources/Rendering/Core/CellPicker';

import { AttributeTypes } from 'vtk.js/Sources/Common/DataModel/DataSetAttributes/Constants';
import { FieldDataTypes } from 'vtk.js/Sources/Common/DataModel/DataSet/Constants';

import vtkPickerInteractorStyle from 'myPickerInteractorStyle';

import controlPanel from './controller.html';

global.spacing = new Array([0.2, 0.2, 1]);

// ----------------------------------------------------------------------------
// Initialize isosurface viewer
// ----------------------------------------------------------------------------
export function viewIsoSurface(urlToLoad, div_id) {
  console.log("Init IsoSurface");
  // Create DIV for isosurface viewer
  var wrappercontainer = document.querySelector('#vtkjs');
  const vtkcontainer = document.createElement('div');
  vtkcontainer.id = div_id;
  wrappercontainer.appendChild(vtkcontainer);

  // Create window on left panel
  const fullScreenRenderWindow = vtkFullScreenRenderWindow.newInstance({
    rootContainer: vtkcontainer,
    background: [0, 0, 0],
    containerStyle: { height: 'calc(100vh - 57px)', width: 'calc(50vw - 10px)', position: 'absolute' }
  });
  const renderWindow = fullScreenRenderWindow.getRenderWindow();
  const renderer = fullScreenRenderWindow.getRenderer();
  fullScreenRenderWindow.addController(controlPanel);

  const lookupTable = vtkColorTransferFunction.newInstance();
  lookupTable.setNanColor(1, 1, 1, 1);
  lookupTable.addRGBPoint(0, 1.0, 1.0, 1.0);
  lookupTable.addRGBPoint(100, 0.7, 0.7, 0.7);
  lookupTable.addRGBPoint(175, 0.7, 0.0, 0.7);
  lookupTable.addRGBPoint(255, 1.0, 0.0, 1.0);
  lookupTable.setMappingRange(0, 1);

  const actor = vtkActor.newInstance();
  const mapper = vtkMapper.newInstance({
    interpolateScalarsBeforeMapping: true,
    useLookupTableScalarRange: true,
    lookupTable
  });
  const marchingCube = vtkImageMarchingCubes.newInstance({ contourValue: 0.0, computeNormals: true, mergePoints: true });
  marchingCube.setComputeNormals(true);
  // Set isosurface color
  const filter = vtkCalculator.newInstance();

  // Add picker
  // Press shift+click to pick
  const picker = vtkCellPicker.newInstance();
  picker.setPickFromList(1);
  picker.initializePickList();
  // Only try to pick cone
  picker.addPickList(actor);
  // Add picker interactor
  const iStyle = vtkPickerInteractorStyle.newInstance();
  iStyle.setContainer(fullScreenRenderWindow.getContainer());
  renderWindow.getInteractor().setInteractorStyle(iStyle);
  renderWindow.getInteractor().setPicker(picker);

  filter.setInputConnection(marchingCube.getOutputPort());
  mapper.setInputConnection(filter.getOutputPort());
  actor.setMapper(mapper);

  document.querySelector('.isoValue').addEventListener('input', updateIsoValue);

  // Add isosurface to renderer
  renderer.addActor(actor);
  renderer.getActiveCamera().set({ position: [0, 0, -1], viewUp: [0, -1, 0] });

  // Add axes
  const arrowSource = vtkArrowSource.newInstance();
  const mapperArrow = vtkMapper.newInstance();
  mapperArrow.setInputConnection(arrowSource.getOutputPort());
  var actoraxes = vtkActor.newInstance();
  actoraxes.getProperty().setColor(1.0, 0.0, 0.0);
  actoraxes.setScale(20.0, 20.0, 20.0);
  actoraxes.setMapper(mapperArrow);
  renderer.addActor(actoraxes);
  
  actoraxes = vtkActor.newInstance();  
  actoraxes.getProperty().setColor(0.0, 1.0, 0.0);
  actoraxes.setScale(20.0, 20.0, 20.0);
  actoraxes.rotateZ(90);
  actoraxes.setMapper(mapperArrow);
  renderer.addActor(actoraxes);

  actoraxes = vtkActor.newInstance();
  actoraxes.getProperty().setColor(0.0, 0.0, 1.0);
  actoraxes.setScale(20.0, 20.0, 20.0);
  actoraxes.rotateY(-90);
  actoraxes.setMapper(mapperArrow);
  renderer.addActor(actoraxes);

  // Function for updating iso-value
  function updateIsoValue(e) {
    const isoValue = Number(e.target.value);
    marchingCube.setContourValue(isoValue);
    renderWindow.render();
  }

  // Global variables
  global.isoscreen = fullScreenRenderWindow;
  global.marchingCube = marchingCube;
  global.filter = filter;

  updateIsoSurface(urlToLoad);
  resertProteinPair();
}

// ----------------------------------------------------------------------------
// Update isosurface viewer: change isosurface volume
// ----------------------------------------------------------------------------
export function updateIsoSurface(urlToLoad) {
  // Update only when volume changes
  if (urlToLoad != global.isofile) {
    console.log("IsoSurface : " + urlToLoad);
    document.getElementById('spinner').style.display = 'block';
    
    const renderer = global.isoscreen.getRenderer();
    const renderWindow = global.isoscreen.getRenderWindow();
    // Create new DIV for showing real-time loading progress
    const progressContainer = document.createElement('div');

    const progressCallback = (progressEvent) => {
      const percent = Math.floor(100 * progressEvent.loaded / progressEvent.total);
      progressContainer.innerHTML = `Loading ${percent}%`;
    };

    const vtiReader = vtkXMLImageDataReader.newInstance();
    HttpDataAccessHelper.fetchBinary(urlToLoad, { progressCallback }).then((binary) => {
      vtiReader.parseArrayBuffer(binary);

      // Update VTK input pipeline
      const source = vtiReader.getOutputData(0);
      global.image_dim = source.getDimensions();
      global.marchingCube.setInputData(source);
      global.spacing = source.getSpacing();

      // Read data volume
      const dataArray = source.getPointData().getScalars() || source.getPointData().getArrays()[0];
      const dataRange = dataArray.getRange();
      const firstIsoValue = (dataRange[0] + dataRange[1]) / 3;
      global.distance = dataArray.getData();

      // Update iso-value slider
      const el = document.querySelector('.isoValue');
      el.setAttribute('min', dataRange[0]);
      el.setAttribute('max', dataRange[1]);
      el.setAttribute('value', firstIsoValue);
      global.marchingCube.setContourValue(firstIsoValue);

      // Update renderer
      renderer.resetCamera();
      renderWindow.render();
      document.getElementById('spinner').style.display = 'none';
    }).catch(function () {
      console.error('Error cannot load isosurface');
      delete global.distance;
      delete global.image_dim;
      document.getElementById('spinner').style.display = 'none';
    });

    // Save current volume name
    global.isofile = urlToLoad;
  }
}

// ----------------------------------------------------------------------------
// Update isosurface protein: change isosurface color
// ----------------------------------------------------------------------------
export function updateProteinPair(ppiToLoad) {
  if (ppiToLoad != global.ppifile) {
    console.log("ProteinPair : " + ppiToLoad);
    document.getElementById('spinner').style.display = 'block';
    
    // Load protein interaction
    const renderWindow = global.isoscreen.getRenderWindow();
    const progressContainer = document.createElement('div');

    const progressCallback = (progressEvent) => {
      const percent = Math.floor(100 * progressEvent.loaded / progressEvent.total);
      progressContainer.innerHTML = `Loading ${percent}%`;
    };

    const vtiReader = vtkXMLImageDataReader.newInstance();

    HttpDataAccessHelper.fetchBinary(ppiToLoad, { progressCallback }).then((binary) => {
      vtiReader.parseArrayBuffer(binary);

      const source = vtiReader.getOutputData(0);
      const dataArray = source.getPointData().getScalars() || source.getPointData().getArrays()[0];
      const mydata = dataArray.getData();
      const [ww, hh, dd] = source.getDimensions();
      // console.log(spacing);
      // console.log(dataArray.getRange());

      global.filter.setFormula({
        getArrays: inputDataSets => ({
          input: [
            { location: FieldDataTypes.COORDINATE }
          ],
          output: [
            { location: FieldDataTypes.POINT, name: 'Random', dataType: 'Float32Array', attribute: AttributeTypes.SCALARS },
          ],
        }),
        evaluate: (arraysIn, arraysOut) => {
          const [coords] = arraysIn.map(d => d.getData());
          const [scalars] = arraysOut.map(d => d.getData());

          // console.log(coords.length);

          var max_x = 0, min_x = 1000000;
          var max_y = 0, min_y = 1000000;
          var max_z = 0, min_z = 1000000;

          for (let i = 0; i < scalars.length; i++) {
            const dx = (coords[3 * i] / global.spacing[0]);
            const dy = (coords[(3 * i) + 1] / global.spacing[1]);
            const dz = (coords[(3 * i) + 2] - 1) / global.spacing[2];

            min_x = min_x <= dx ? min_x : dx;
            min_y = min_y <= dy ? min_y : dy;
            min_z = min_z <= dz ? min_z : dz;

            max_x = max_x >= dx ? max_x : dx;
            max_y = max_y >= dy ? max_y : dy;
            max_z = max_z >= dz ? max_z : dz;

            const px = Math.min(Math.max(Math.round(dx), 0), ww - 1);
            const py = Math.min(Math.max(Math.round(dy), 0), hh - 1);
            const pz = Math.min(Math.max(Math.round(dz), 0), dd - 1);

            scalars[i] = mydata[px + py * ww + pz * ww * hh] / 255.0;
          }
          // console.log(min_x, min_y, min_z);
          // console.log(max_x, max_y, max_z);
        },
      });

      renderWindow.render();
      document.getElementById('spinner').style.display = 'none';
    }).catch(function () {
      console.error('Error cannot load protein pair');
      resertProteinPair();
      renderWindow.render();
      document.getElementById('spinner').style.display = 'none';
    });

    global.ppifile = ppiToLoad;
  }
}

function resertProteinPair() {
  // reset to white color
  global.filter.setFormula({
    getArrays: inputDataSets => ({
      input: [],
      output: [
        { location: FieldDataTypes.POINT, name: 'Random', dataType: 'Float32Array', attribute: AttributeTypes.SCALARS },
      ],
    }),
    evaluate: (arraysIn, arraysOut) => {
      const [scalars] = arraysOut.map(d => d.getData());
      for (let i = 0; i < scalars.length; i++) {
        scalars[i] = vtkMath.Nan;
      }
    },
  });
}


// ----------------------------------------------------------------------------
// Load label
// ----------------------------------------------------------------------------
export function loadLabel(labelToLoad) {
  console.log("Label : " + labelToLoad);
  document.getElementById('spinner').style.display = 'block';
  
  // Load label
  const progressContainer = document.createElement('div');

  const progressCallback = (progressEvent) => {
    const percent = Math.floor(100 * progressEvent.loaded / progressEvent.total);
    progressContainer.innerHTML = `Loading ${percent}%`;
  };

  const vtiReader = vtkXMLImageDataReader.newInstance();

  HttpDataAccessHelper.fetchBinary(labelToLoad, { progressCallback }).then((binary) => {
    vtiReader.parseArrayBuffer(binary);

    const source = vtiReader.getOutputData(0);
    global.label_dim = source.getDimensions();
    const dataArray = source.getPointData().getScalars() || source.getPointData().getArrays()[0];
    global.label = dataArray.getData();
    // console.log(global.label_dim);
    // console.log(global.label);
    document.getElementById('spinner').style.display = 'none';
  }).catch(function () {
    console.error('Error cannot load label');
    delete global.label;
    delete global.label_dim;
    document.getElementById('spinner').style.display = 'none';
  });
}