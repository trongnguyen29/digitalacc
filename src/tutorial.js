console.log("Init Tutorial");

// Contents of tutorial slides 
var titles = [
    "<h2>Welcome to Digital aCC</h2>",
    "<h2>Viewer</h2>",
    "<h2>Template</h2>",
    "<h2>Protein Network</h2>",
    "<h2>Menu</h2>"];

var descs = [
    `<p>Digital aCC is an interactive single-neuron imaging platform for proteome-to-phenome 
        analysis. The nanometer-scale protein interactions and micrometer-scale cellular morphogenesis 
        are intimately linked with each other. This viewer displays neuron volume morphology/complexity 
        and protein interactions over time.</p>`,
    `<p>The left panel is the viewer. It has two modes: isosurface and volume rendering.</p>
        <p>In isosurface mode, the boundary of the neuron is displayed as a surface. The color encodes 
        the concentration of protein interaction.
        <p>In volume rendering mode, the intensity of neuron volume is displayed. The opacity can be adjusted 
        to view the inside of the neuron volume.`,
    `<p>The top-right panel is the prototype aCC. It composes of ten compartments. It is used as the 
        reference for providing an intuitive two-way mapping between protein interactions and an aCC volume</p>`,
    `<p>The bottom-left panel is the protein network. It shows the pair of proteins that co-express on the neuron.
        The user can select the edge to see the protein interaction concentration level of the protein pair
        (must be in isosurface view mode).</p>`,
    `<p>The menu at the bottom lets you change the neuron, view mode, and timestep. </p>
        <p>Click ? for help. </p>
        <p>This page uses VTK.js, Vis.js, Three.js, Node.js, Webpack. It was tested on Chrome and Safari.</p>`];

// Positions of highlight box
var hlbox = [
    ["", "", "", ""]
    , ["5px", "5px", "calc(100vh - 60px)", "calc(50vw - 15px)"]
    , ["5px", "50vw", "calc(50vh - 30px)", "calc(50vw - 15px)"]
    , ["calc(50vh - 20px)", "50vw", "calc(50vh - 40px)", "calc(50vw - 15px)"]
    , ["calc(100vh - 50px)", "5px", "40px", "calc(100vw - 20px)"]];
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
var dots = document.getElementsByClassName("dot");
for (let ii = 0; ii < dots.length; ii++) {
    dots[ii].onclick = function (event) {
        showSlides(ii);
    }
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