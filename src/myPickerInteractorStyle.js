import macro from 'vtk.js/Sources/macro';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';
import vtkSphereSource from 'vtk.js/Sources/Filters/Sources/SphereSource';
import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkMath from 'vtk.js/Sources/Common/Core/Math';


import { selectCompartment } from 'template';
require('template');

// ----------------------------------------------------------------------------
// vtkInteractorStyleTrackballCamera2 methods
// ----------------------------------------------------------------------------
function vtkPickerInteractorStyle(publicAPI, model) {
  // Set our className
  model.classHierarchy.push('vtkPickerInteractorStyle');

  // Capture "parentClass" api for internal use
  const superClass = Object.assign({}, publicAPI);
  var firstclick = true;

  const actor = vtkActor.newInstance();

  publicAPI.handleRightButtonPress = () => {
    const pos = model.interactor.getEventPosition(model.interactor.getPointerIndex());
    publicAPI.findPokedRenderer(pos.x, pos.y);
    if (model.currentRenderer === null) {
      return;
    }

    const renderer = model.currentRenderer;
    const interactor = model.interactor;
    const boundingContainer = model.container.getBoundingClientRect();
    const point = [pos.x - boundingContainer.left, pos.y + boundingContainer.top, 0.0];
    interactor.getPicker().pick(point, renderer);

    const pickedPoints = interactor.getPicker().getPickedPositions();
    const pickedCellId = interactor.getPicker().getCellId();
    // console.log('cell id : ', pickedCellId);
    // console.log(pickedPoints);

    if (!(global.label_dim === undefined) && !(global.label === undefined)) {
      const ww = global.label_dim[0];
      const hh = global.label_dim[1];
      const dd = global.label_dim[2];
      const px = Math.min(Math.max(Math.round(pickedPoints[0][0]), 0), ww-1) / global.spacing[0];
      const py = Math.min(Math.max(Math.round(pickedPoints[0][1]), 0), hh-1) / global.spacing[1];
      const pz = Math.min(Math.max(Math.round(pickedPoints[0][2]), 0), dd-1) / global.spacing[2];
      
      // console.log(px, py, pz);
      // console.log(ww, hh, dd);
      // console.log(global.label[px + ww*py + ww*hh*pz]);
      const part_i = global.label[px + ww*py + ww*hh*pz];
      selectCompartment(part_i);
  }


    const cameraCenter = model.currentRenderer.getActiveCamera().getPosition();
    let minDistance = Number.MAX_VALUE;
    for (let i = 0; i < pickedPoints.length; i++) {
      const dist = Math.sqrt(vtkMath.distance2BetweenPoints(cameraCenter, pickedPoints[i]));
      if (dist < minDistance) {
        minDistance = dist;
      }
      if (firstclick) {
        const sphere = vtkSphereSource.newInstance();
        const mapper = vtkMapper.newInstance();

        // sphere.setCenter(pickedPoints[i]);
        sphere.setRadius(1);

        mapper.setInputData(sphere.getOutputData());
        actor.setMapper(mapper);
        actor.getProperty().setColor(1.0, 0.0, 0.0);
        actor.setPosition(pickedPoints[i]);
        model.currentRenderer.addActor(actor);
        firstclick = false;
        // console.log(actor);
      } else {
        actor.setPosition(pickedPoints[i]);
      }
    }
    model.interactor.render();

  };
}

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------
const DEFAULT_VALUES = {
  container: null,
};

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  // Inheritance
  vtkInteractorStyleTrackballCamera.extend(publicAPI, model, initialValues);

  macro.setGet(publicAPI, model, ['container']);

  // Object specific methods
  vtkPickerInteractorStyle(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = macro.newInstance(extend, 'vtkPickerInteractorStyle');

// ----------------------------------------------------------------------------

export default Object.assign({ newInstance, extend });
