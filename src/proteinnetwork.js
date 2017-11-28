import vis from 'vis'

console.log("Protein Network");

// create an array with nodes
var nodes = new vis.DataSet([
  { id: 1, label: 'Cdc42', name:'Cdc42' },
  { id: 2, label: 'WASp', name:'WASp' },
  { id: 3, label: 'Pak1', name:'Pak1' },
  { id: 4, label: 'Par6', name:'Par6' },
  { id: 5, label: 'Integrin-β', name:'Integrin' }
]);

// create an array with edges
var edges = new vis.DataSet([
  { from: 1, to: 2, label: '0.38' },
  { from: 1, to: 3, label: '0.03' },
  { from: 1, to: 4, label: '0.00' }
]);

// create a network
var container = document.getElementById('mynetwork');
var data = {
  nodes: nodes,
  edges: edges
};
var options = {};
window.network = new vis.Network(container, data, options);

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