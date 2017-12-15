console.log("Init Tutorial");

// Contents of tutorial slides 
var titles = [
    "<h2>Quick Tutorial</h2>",
    "<h2>Viewer</h2>",
    "<h2>Template</h2>",
    "<h2>Network</h2>",
    "<h2>Menu</h2>"];

var descs = [
    `<p><b>Welcome to Digital aCC</b>. It is an interactive single-neuron imaging platform for 
        proteome-to-phenome analysis. The nanometer-scale protein interactions and micrometer-scale 
        cellular morphogenesis are intimately linked with each other. This platform depicts the 
        neuron volume morphology/complexity with the protein interactions over time.</p>
        <p>The layout follows the <i>three-pane interface</i> with the menu at the bottom.</p>
        <p>On the left, it is the <b>Viewer</b> pane. It displays the neuron volume in either 
        surface or voxel modes. The option of each mode is on the top-left.</p>
        <p>The <b>Template</b> pane on the top-right shows the compartments of aCC prototype 
        of different instars.</p>
        <p>The <b>Network</b> pane on the bottom-right shows the collection of co-expressed 
        proteins over neurons.</p>`,
    `<p>The Viewer pane has two modes: surface and voxel.</p>
        <p>In the surface mode, the boundary of the neuron is displayed as a surface. While, colors encode 
        the concentration of protein interaction. The <b>Depth</b> parameter adjusts the depth from the surface.
        <p>The voxel mode displays the inside of neuron volumes using the 
        <a href="https://en.wikipedia.org/wiki/Volume_rendering" target="_blank">volume rendering technique</a>. 
        The voxel's opacity can be adjusted using the graph, where Y-axis is the opacity and X-axis is the value
        of voxels.
        <center>
        <table class="tuttab">
          <tr>
            <th>Control</th>
            <th align='left'>Description</th> 
          </tr>
          <tr>
            <td align="center"><img src="img/drag.png" alt="left click and drag"></td>
            <td>Rotate</td> 
          </tr>
          <tr>
            <td align="center"><img src="img/shiftdrag.png" alt="shift + left click and drag"></td>
            <td>Move</td> 
          </tr>
          <tr>
            <td align="center"><img src="img/wheel.png" alt="wheel"></td>
            <td>Zoom in/out</td> 
          </tr>
          <tr>
            <td align="center"><img src="img/rightclick.png" alt="right click"></td>
            <td>Select voxel <br>(only in surface mode)</td> 
          </tr>
        </table>
        </center>
        `,
    `<p>The Template pane shows the aCC prototype of the corresponding instar. 
        The compartment of the selected voxel is highlighted with blue color.</p>
        <center>
        <table class="tuttab">
        <tr>
            <th>Control</th>
            <th align='left'>Description</th> 
        </tr>
        <tr>
            <td align="center"><img src="img/drag.png" alt="left click and drag"></td>
            <td>Rotate</td> 
        </tr>
        <tr>
            <td align="center"><img src="img/wheel.png" alt="wheel"></td>
            <td>Zoom in/out</td> 
        </tr>
        </table>
        </center>`,
    `<p>The Network pane displays the protein network. Nodes/vertices are proteins 
        and edges join pairs of co-localized proteins. The user can select the edge 
        to see the protein interaction concentration level of corresponding protein 
        pair (only in surface mode).</p>
        <center>
        <table class="tuttab">
          <tr>
            <th>Control</th>
            <th align='left'>Description</th> 
          </tr>
          <tr>
            <td align="center"><img src="img/drag.png" alt="left click and drag" valign="middle"> or Arrows</td>
            <td>Move</td> 
          </tr>
          <tr>
            <td align="center"><img src="img/wheel.png" alt="wheel" valign="middle"> or +/-</td>
            <td>Zoom in/out</td> 
          </tr>
          <tr>
            <td align="center"><img src="img/leftclick.png" alt="left click"></td>
            <td>Select a protein pair</td> 
          </tr>
          <tr>
            <td align="center"><img src="img/zoomExtends.png" alt="fit screen"></td>
            <td>Fit screen to all nodes</td> 
          </tr>
        </table>
        </center>`,
    `<p>The menu lets you change the Viewer mode (surface/voxel), neuron, and timestep. </p>
        <p>Click ? for help. </p>
        <p>This page uses VTK.js, Vis.js, Three.js, Node.js, Webpack. It was tested on Chrome.</p>`];

// Positions of highlight box
var hlbox = [
    ["", "", "", ""],
    ["5px", "5px", "calc(100vh - 60px)", "calc(50vw - 15px)"],
    ["5px", "50vw", "calc(50vh - 30px)", "calc(50vw - 15px)"],
    ["calc(50vh - 20px)", "50vw", "calc(50vh - 40px)", "calc(50vw - 15px)"],
    ["calc(100vh - 50px)", "5px", "40px", "calc(100vw - 20px)"]];
// Starting slide
var slideIndex = 0;

// Get the modal
var modal = document.getElementById('model-tut');
// Get the highlight box element
var hldiv = document.getElementById("tutbox");

// When the user clicks the button, open the modal 
document.getElementById("helpbtn").onclick = function () {
    modal.style.display = "block";
    showSlides(0);
}

// When the user clicks on <span> (x), close the modal
document.getElementsByClassName("close")[0].onclick = function () {
    modal.style.display = "none";
    hldiv.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
        hldiv.style.display = "none";
    }
}

// When the user clicks on left arrow, go back one slide
document.getElementsByClassName("prev")[0].onclick = function (event) {
    showSlides(slideIndex - 1);
}

// When the user clicks on right arrow, go forward one slide
document.getElementsByClassName("next")[0].onclick = function (event) {
    showSlides(slideIndex + 1);
}

// When the user clicks on dots, go to the corresponding slide
var tutnav = document.getElementById("tutnav");
var nextbutton = document.getElementsByClassName("next");
for (let ii = 0; ii < titles.length; ii++) {
    var dot = document.createElement('span');
    dot.classList.add('dot');
    dot.onclick = function (event) {
        showSlides(ii);
    }
    tutnav.insertBefore(dot, nextbutton[0]);
}

// show the tutorial slide and the corresponding highlight box
var slides = document.getElementsByClassName("dot");
function showSlides(n) {
    slides[slideIndex].className = "dot";
    slideIndex = n;
    if (n >= slides.length) { slideIndex = slides.length - 1 }
    if (n < 0) { slideIndex = 0 }
    slides[slideIndex].className = "dot active";

    document.getElementById("modal-title").innerHTML = titles[slideIndex];
    document.getElementById("modal-desc").innerHTML = descs[slideIndex];

    if (!hlbox[slideIndex][0]) {
        hldiv.style.display = 'none';
    } else {
        hldiv.style.display = 'block';
        hldiv.style.top = hlbox[slideIndex][0];
        hldiv.style.left = hlbox[slideIndex][1];
        hldiv.style.height = hlbox[slideIndex][2];
        hldiv.style.width = hlbox[slideIndex][3];
    }
}

showSlides(0);