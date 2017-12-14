import vis from 'vis'

console.log("Init Protein Network");

var cols = ["#ffe5ff", "#ffccff", "#ffb2ff", "#ff99ff", "#ff7fff", "#ff66ff", "#ff4cff", "#ff32ff", "#ff19ff", "#ff00ff"];

// create an array with nodes
var nodes = new vis.DataSet([
  { id: 1, label: 'Cdc42', name: 'Cdc42' },
  { id: 2, label: 'WASp', name: 'WASp' },
  { id: 3, label: 'Pak1', name: 'Pak1' },
  { id: 4, label: 'Par6', name: 'Par6' },
  { id: 5, label: 'Integrin-β', name: 'Integrin' }
]);

// create an array with edges
var edges = new vis.DataSet([
  { from: 1, to: 2, label: '0.38', val: 1, color: { color: 'rgb(20,24,200)' } },
  { from: 2, to: 1, label: '0.38', val: 1, color: { color: 'rgb(20,24,200)' } },
  { from: 1, to: 3, label: '0.03', val: 0.10001, color: { color: 'rgba(30,30,30,0.2)' } },
  { from: 3, to: 1, label: '0.38', val: 1, color: { color: 'rgb(20,24,200)' } },
  { from: 1, to: 4, label: '0.00', val: 0.00, color: { color: 'rgba(30,30,30,0.2)' } },
  { from: 4, to: 1, label: '0.38', val: 1, color: { color: 'rgb(20,24,200)' } }
]);

// create a network
var container = document.getElementById('mynetwork');
var data = {
  nodes: nodes,
  edges: edges
};
var options = {
  interaction: {
    selectConnectedEdges: false,
    navigationButtons: true,
    hover: true
  },
  nodes: {
    borderWidth: 2,
    borderWidthSelected: 2,
    chosen: false,
    color: {
      border: '#bf00bf',
      background: '#f2e3f2',
    },
    font: {
      size: 20 // px
    }
  },
  edges: {
    arrows: {
      to: { enabled: true, scaleFactor: 1, type: 'arrow' }
    },
    width: 2,
    length: 150,
    color: {
      //   color:'#fdb2fc',
      highlight: '#444444'
    },
    font: {
      size: 16, // px
      strokeWidth: 2
    }
  }
};
window.network = new vis.Network(container, data, options);

// console.log(edges._data);
function ppifit() {
  window.network.fit();
}

export function getProteinPair() {
  var selectededge = edges.get(window.network.getSelectedEdges());
  if (typeof selectededge != 'undefined' && selectededge.length == 1) {
    var nodefrom = nodes.get(selectededge[0].from);
    var nodeto = nodes.get(selectededge[0].to);
    return [nodefrom.name, nodeto.name];
  }
}

updateNetworkColor();

export function updateNetworkColor() {
  // For debugging, randomly assign val to edges
  for (let variable in edges._data) {
    edges.update({ id: variable, val: Math.random() });
  }

  // Update edges color and label according to val.
  for (let variable in edges._data) {
    const idx = Math.min(Math.max(Math.ceil(edges._data[variable].val * 10) - 1, 0), 9);
    edges.update({ id: variable, label: edges._data[variable].val.toFixed(2).toString(), color: { color: cols[idx] } });
  }
}