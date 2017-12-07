import { viewVolumeRender, updateVolumeViewer } from 'volumeviewer';
import { viewIsoSurface, updateIsoSurface, updateProteinPair, loadLabel } from 'isoviewer';
import { getProteinPair, updateNetworkColor } from 'proteinnetwork';
import 'template';
import 'tutorial';
require(['volumeviewer', 'isoviewer', 'proteinnetwork', 'template', 'tutorial']);

// ----------------------------------------------------------------------------
// Function for getting filename
// ----------------------------------------------------------------------------
function getFileName(type, protein) {
  var vid = document.getElementById("selectedvolume").value;
  var volumename = document.getElementById("selectedvolume").options[vid].text;
  var volumetime = document.getElementById("volumetime").value.toString();

  volumetime = volumetime.length >= 3 ? volumetime : new Array(3 - volumetime.length + 1).join('0') + volumetime;
  if (protein === undefined) {
      // protein was not passed
    if (type == "INTENSITY") {
      return './data/volume/' + volumename + '/t' + volumetime + '/intensity/' + volumename + '.vti';
    } else if (type == "DISTANCE") {
      return './data/volume/' + volumename + '/t' + volumetime + '/distance/' + volumename + '.vti';
    } else if (type == "LABEL") {
      return './data/volume/' + volumename + '/t' + volumetime + '/label/' + volumename + '_label.vti';
    }
  } else if (protein.length == 2) {
    return './data/volume/' + volumename + '/t' + volumetime + '/' + protein[0] + protein[1] + '/' + volumename + '_ppi.vti';
  }
}

// ----------------------------------------------------------------------------
// Main code
// ----------------------------------------------------------------------------
var voltimenum;
var selectedvolume = document.getElementById("selectedvolume");
// Read list of volumes in our database
// volumelist.txt contain foldername and number of timesteps per line separated by space
var volumelist = new XMLHttpRequest();
volumelist.open("GET", 'volumelist.txt', true);
volumelist.onreadystatechange = function () {
  if (volumelist.readyState === 4) {
    if (volumelist.status === 200 || volumelist.status == 0) {
      // Read line by line
      var lines = volumelist.responseText.split('\n');
      voltimenum = new Array(lines.length);
      for (var line = 0; line < lines.length; line++) {
        var tokens = lines[line].split(' ');

        // Add option to volume selector
        var option = document.createElement("option");
        option.text = tokens[0];
        option.value = line;
        selectedvolume.add(option);
        voltimenum[line] = parseInt(tokens[1]);     // store number of timesteps

        console.log("Volume name : " + option.text + ", No. Timestep : " + voltimenum[line]);
      }

      // Initialize the time slider
      var vid = document.getElementById("selectedvolume").value;
      var volumetime = document.getElementById("volumetime");
      volumetime.max = voltimenum[vid];
      volumetime.value = 1;
      document.getElementById('volumetimeId').value = volumetime.value;
      document.getElementById('volumetimeMaxId').value = volumetime.max;

      // Initialize left panel (isosurface and volume rendering)
      viewVolumeRender(getFileName("INTENSITY"), 'volumerenderer');
      viewIsoSurface(getFileName("DISTANCE"), 'isorenderer');
      // updateProteinPair(getFileName(null, ['Cdc42', 'WASp']));
      loadLabel(getFileName("LABEL"));
      
      // Show isosurface first
      document.querySelector('#volumerenderer').style.display = "none";
    }
  }
}
volumelist.send(null);

updateNetworkColor();

// ----------------------------------------------------------------------------
// Add event listener
// ----------------------------------------------------------------------------
// Add onchange function for volume selector
selectedvolume.onchange = function () {
  var vid = document.getElementById("selectedvolume").value;
  var volumetime = document.getElementById("volumetime");
  volumetime.max = voltimenum[vid];
  volumetime.value = 1;
  document.getElementById('volumetimeId').value = volumetime.value;
  document.getElementById('volumetimeMaxId').value = volumetime.max; 

  var viewmode = document.getElementById("viewmode").value;
  if (viewmode == "VolumeRender") {
    updateVolumeViewer(getFileName("INTENSITY"));
  } else if (viewmode == "IsoSurface") {
    updateIsoSurface(getFileName("DISTANCE"));
    updateProteinPair(getFileName(null, getProteinPair()));
    loadLabel(getFileName("LABEL"));
  } else {
    console.error("Unknown View Mode");
  }
}

// Add onchange function for view mode
document.getElementById('viewmode').onchange = function () {
  var viewmode = document.getElementById("viewmode").value;
  if (viewmode == "VolumeRender") {
    console.log("Volume Rendering");
    updateVolumeViewer(getFileName("INTENSITY"));
    document.querySelector('#isorenderer').style.display = "none";
    document.querySelector('#volumerenderer').style.display = "inline";
    global.volscreen.resize();
  } else if (viewmode == "IsoSurface") {
    console.log("Iso Surface");
    updateIsoSurface(getFileName("DISTANCE"));
    updateProteinPair(getFileName(null, getProteinPair()));
    loadLabel(getFileName("LABEL"));
    document.querySelector('#volumerenderer').style.display = "none";
    document.querySelector('#isorenderer').style.display = "inline";
    global.isoscreen.resize();
  } else {
    console.error("Unknown View Mode");
  }
};

// Add onchange function for time slider
document.getElementById("volumetime").onchange = function () {
  var viewmode = document.getElementById("viewmode").value;
  if (viewmode == "VolumeRender") {
    updateVolumeViewer(getFileName("INTENSITY"));
  } else if (viewmode == "IsoSurface") {
    updateIsoSurface(getFileName("DISTANCE"));
    updateProteinPair(getFileName(null, getProteinPair()));
    loadLabel(getFileName("LABEL"));
  } else {
    console.error("Unknown View Mode");
  }
  var volumetime = document.getElementById("volumetime");
  document.getElementById('volumetimeId').value = volumetime.value;
  document.getElementById('volumetimeMaxId').value = volumetime.max;
};

// Network
window.network.on("click", function (params) {
  var pair = getProteinPair();
  var viewmode = document.getElementById("viewmode").value;
  if (!(pair === undefined) && viewmode == "IsoSurface") {
    updateProteinPair(getFileName(null, pair));
  }
});


