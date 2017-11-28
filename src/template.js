var container = document.getElementById('mytemplate');
var camera, scene, renderer;
var mouseX = 0, mouseY = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var objs = [];
var obj_idx = [];
var part_i = 0;

init();
animate();

setTimeout(function () { }, 2000);

function init() {
    console.log("Init Template");
    // get container to contain three.js canvas.
    var container = document.getElementById('mytemplate');

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 750;

    // scene
    scene = new THREE.Scene();

    var ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    scene.add(ambientLight);

    var pointLight = new THREE.PointLight(0xffffff, 0.8);
    camera.add(pointLight);
    scene.add(camera);

    // model
    var manager = new THREE.LoadingManager();
    manager.onProgress = function (item, loaded, total) {
        console.log('Loaded ' + loaded + '/' + total + ' : ' + item);
        var res = parseInt(item.match(/(\d+)(?=.obj)/gi));
        obj_idx.push(res);
    };

    var loader = new THREE.OBJLoader(manager);

    var onProgress = function (xhr) {
        if (xhr.lengthComputable) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log(Math.round(percentComplete, 2) + '% downloaded');
        }
    };

    var onError = function (xhr) {
    };

    var onLoad = function (object) {
        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = new THREE.MeshPhongMaterial({ color: 0xffaa00 });
            }
        });
        object.position.y = -145;
        object.position.x = -256;
        scene.add(object);
        objs.push(object);
    }


    for (let i = 1; i <= 10; i++) {
        var objname = './data/template_parts/p' + i + '.obj';
        loader.load(objname, onLoad, onProgress, onError);
    }

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    container.appendChild(renderer.domElement);

    var controls = new THREE.OrbitControls(camera, container);
    controls.addEventListener('change', render);

    window.addEventListener('resize', onWindowResize, false);

    // container.addEventListener('mousedown', onDocumentMouseDown, false);
}

export function selectCompartment(part_i) {
    var random_col = Math.floor(Math.random() * 16777215);
    for (let i = 0; i < objs.length; i++) {
        objs[i].traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                if (part_i == obj_idx[i]) {
                    child.material.color.setHex("0x4444ff");
                } else {
                    child.material.color.setHex("0xffaa00");
                }
            }
        });
    }
}

// function onDocumentMouseDown(event) {
//     // var random_col = Math.floor(Math.random() * 16777215);
//     // str = objs[part_i].materialLibraries[0];
//     // objs[part_i].traverse(function (child) {
//     //     if (child instanceof THREE.Mesh) {
//     //         child.material.color.setHex(random_col);
//     //         console.log('Compartment ' + obj_idx[part_i] + ' : color = 0x' + child.material.color.getHexString());
//     //     }
//     // });
//     selectCompartment(part_i+1)
//     part_i = ++part_i % objs.length;
// }

function onWindowResize() {
    windowHalfX = container.offsetWidth / 2;
    windowHalfY = container.offsetHeight / 2;

    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.offsetWidth, container.offsetHeight);
}

//
function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
}