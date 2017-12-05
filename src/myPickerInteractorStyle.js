import macro from 'vtk.js/Sources/macro';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';
import vtkConeSource from 'vtk.js/Sources/Filters/Sources/ConeSource';
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
  var curang = [1.0,0.0,0.0];

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

    const pickPoint = interactor.getPicker().getPickPosition();
    const pickedCellId = interactor.getPicker().getCellId();
    
    // compute normal for cursor
    if (global.image_dim && global.distance) {
      const ww = global.image_dim[0];
      const hh = global.image_dim[1];
      const dd = global.image_dim[2];
      const px = Math.min(Math.max(Math.round(pickPoint[0]) / global.spacing[0], 0), ww-1);
      const py = Math.min(Math.max(Math.round(pickPoint[1]) / global.spacing[1], 0), hh-1);
      const pz = Math.min(Math.max(Math.round(pickPoint[2]) / global.spacing[2], 0), dd-1);

      var arr = new Array(27).fill(0);
      for (let ii = 0; ii <= 2; ii++) {
        if ((px == 0 && ii == 0) || (px == ww-1 && ii == 2))
          continue;
        for (let jj = 0; jj <= 2; jj++) {
          if ((py == 0 && jj == 0) || (py == hh-1 && jj == 2))
            continue;
          for (let kk = 0; kk <= 2; kk++) {
            if ((pz == 0 && kk == 0) || (pz == kk-1 && kk == 2))
              continue;
            arr[ii + jj*3 + kk*9] = global.distance[px+ii-1 + ww*(py+jj-1) + ww*hh*(pz+kk-1)];
          }
        }
      }

      var mynormal = new Float32Array(3);
      mynormal[0] = arr[0 + 1*3 + 1*9] - arr[2 + 1*3 + 1*9];
      mynormal[1] = arr[1 + 0*3 + 1*9] - arr[1 + 2*3 + 1*9];
      mynormal[2] = arr[1 + 1*3 + 0*9] - arr[1 + 1*3 + 2*9];
      vtkMath.normalize(mynormal);
      var halfnormal = new Float32Array(3);
      halfnormal[0] = mynormal[0] + 1.0;
      halfnormal[1] = mynormal[1];
      halfnormal[2] = mynormal[2];
      vtkMath.normalize(halfnormal);
    }

    if (!(global.label_dim === undefined) && !(global.label === undefined)) {
      const ww = global.label_dim[0];
      const hh = global.label_dim[1];
      const dd = global.label_dim[2];
      const px = Math.min(Math.max(Math.round(pickPoint[0]), 0), ww - 1) / global.spacing[0];
      const py = Math.min(Math.max(Math.round(pickPoint[1]), 0), hh - 1) / global.spacing[1];
      const pz = Math.min(Math.max(Math.round(pickPoint[2]), 0), dd - 1) / global.spacing[2];

      // console.log(px, py, pz);
      // console.log(ww, hh, dd);
      // console.log(global.label[px + ww*py + ww*hh*pz]);
      const part_i = global.label[px + ww * py + ww * hh * pz];
      selectCompartment(part_i);
    }

    pickPoint[0] -= mynormal[0]*0.5;
    pickPoint[1] -= mynormal[1]*0.5;
    pickPoint[2] -= mynormal[2]*0.5;

    const cameraCenter = model.currentRenderer.getActiveCamera().getPosition();

    if (firstclick) {
      const cone = vtkConeSource.newInstance({ resolution: 20 });
      const mapper = vtkMapper.newInstance();

      mapper.setInputData(cone.getOutputData());
      actor.setMapper(mapper);
      actor.getProperty().setColor(1.0, 0.0, 0.0);
      actor.setPosition(pickPoint);
      model.currentRenderer.addActor(actor);
      firstclick = false;

      actor.rotateWXYZ(180, halfnormal[0], halfnormal[1], halfnormal[2]);
    } else {
      actor.rotateWXYZ(-180, curang[0], curang[1], curang[2]);
      actor.setPosition(pickPoint);
      actor.rotateWXYZ(180, halfnormal[0], halfnormal[1], halfnormal[2]);
    }
    console.log(mynormal);
    curang = halfnormal;
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
