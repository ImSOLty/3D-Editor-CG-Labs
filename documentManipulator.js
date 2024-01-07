function createObjectElement(element, drawer, data = null, custom = null) {
    if (data === null) {
        data = {
            selected: "cube",
            shininess: 1,
            diffuse: "#000000",
            specular: "#000000",
            ambient: "#000000",
            position: {x: 0, y: 0, z: 0},
            rotation: {x: 0, y: 0, z: 0},
            scale: {x: 1, y: 1, z: 1},
            color: "#FF0000"
        }
    }
    let id = Drawer.next_object_id++;
    // Create a container div element
    let objectContainer = document.createElement("div");
    objectContainer.classList.add("object");
    objectContainer.id = `object${id}}`
    let objname = custom === null ? null : (custom.split('\n').find(line => line.trim().startsWith('o ')) || '').slice(2);
    // Create the Name part
    let namePart = document.createElement("div");
    namePart.classList.add("part");
    namePart.innerHTML = `
            <label for="object${id}_name">Name:</label>
            <div>
                <select id="object${id}_name">
                    <option value="Cube"${data.selected === "cube" && custom === null ? 'selected="selected"' : ""}>Cube</option>
                    <option value="ICOSphere"${data.selected === "icosphere" ? 'selected="selected"' : ""}>Icosphere</option>
                    <option value="UVSphere"${data.selected === "uvsphere" ? 'selected="selected"' : ""}>UV Sphere</option>
                    <option value="Cylinder"${data.selected === "cylinder" ? 'selected="selected"' : ""}>Cylinder</option>
                    <option value="Torus"${data.selected === "torus" ? 'selected="selected"' : ""}>Torus</option>
                    <option value="Cone"${data.selected === "cone" ? 'selected="selected"' : ""}>Cone</option>
                    <option value="Plane"${data.selected === "plane" ? 'selected="selected"' : ""}>Plane</option>
                    <option value="Grid"${data.selected === "grid" ? 'selected="selected"' : ""}>Grid</option>
                    <option value="Circle"${data.selected === "circle" ? 'selected="selected"' : ""}>Circle</option>
                    ${custom === null ? '' : '<option value="' + custom + '" selected="selected">' + objname + '.obj</option>'}
                </select>
            </div>
        `;
    // Create the Position part
    let positionPart = document.createElement("div");
    positionPart.classList.add("part");
    positionPart.innerHTML = `
            <label>Position:</label>
            <div>
                <input id="object${id}_positionX" type="number" step="0.01" value="${data.position.x}">
                <input id="object${id}_positionY" type="number" step="0.01" value="${data.position.y}">
                <input id="object${id}_positionZ" type="number" step="0.01" value="${data.position.z}">
            </div>
        `;
    // Create the Rotation part
    let rotationPart = document.createElement("div");
    rotationPart.classList.add("part");
    rotationPart.innerHTML = `
            <label>Rotation:</label>
            <div>
                <input id="object${id}_rotationX" type="number" step="1" value="${data.rotation.x}">
                <input id="object${id}_rotationY" type="number" step="1" value="${data.rotation.y}">
                <input id="object${id}_rotationZ" type="number" step="1" value="${data.rotation.z}">
            </div>
        `;
    // Create the Scale part
    let scalePart = document.createElement("div");
    scalePart.classList.add("part");
    scalePart.innerHTML = `
            <label>Scale:</label>
            <div>
                <input id="object${id}_scaleX" type="number" step="0.01" value="${data.scale.x}">
                <input id="object${id}_scaleY" type="number" step="0.01" value="${data.scale.y}">
                <input id="object${id}_scaleZ" type="number" step="0.01" value="${data.scale.z}">
            </div>
        `;

    // Material
    let materialName = document.createElement("div")
    materialName.innerHTML = `<p style="margin: 0">&#160;</p>`
    // Create the Shininess part
    let shininessPart = document.createElement("div");
    shininessPart.classList.add("part");
    shininessPart.innerHTML = `
            <label for="object${id}_shininess">Shininess:</label>
            <input type="number" id="object${id}_shininess" value="${data.shininess}">
        `;
    // Create the Color part
    let colorPart = document.createElement("div");
    colorPart.classList.add("part");
    colorPart.innerHTML = `
            <label for="object${id}_color">Color:</label>
            <input type="checkbox" id="object${id}_usecolor" checked="checked" style="width: 100px">
            <input type="color" id="object${id}_color" value="${data.color}" style="width: 100px">
        `;
    // Create the Texture part
    let texturePart = document.createElement("div");
    texturePart.classList.add("part");
    texturePart.innerHTML = `
            <label for="texture${id}">Texture:</label>
            <button onclick="document.getElementById('object${id}_texture').click()" class="custom-button">Choose File</button>
            <input type="file" id="object${id}_texture" class="file-input-hidden">
        `;
    // Create the Specular part
    let specularPart = document.createElement("div");
    specularPart.classList.add("part");
    specularPart.innerHTML = `
            <label for="object${id}_specular">Specular:</label>
            <input type="color" id="object${id}_specular" value="${data.specular}" style="width: 100px">
        `;
    // Create the Diffuse part
    let diffusePart = document.createElement("div");
    diffusePart.classList.add("part");
    diffusePart.innerHTML = `
            <label for="object${id}_diffuse">Diffuse:</label>
            <input type="color" id="object${id}_diffuse" value="${data.diffuse}" style="width: 100px">
        `;
    // Create the Ambient part
    let ambientPart = document.createElement("div");
    ambientPart.classList.add("part");
    ambientPart.innerHTML = `
            <label for="object${id}_ambient">Ambient:</label>
            <input type="color" id="object${id}_ambient" value="${data.ambient}" style="width: 100px">
        `;

    let buttons = document.createElement("div");
    buttons.classList.add("part");

    let removeButton = document.createElement("button");
    removeButton.innerText = "Remove"
    removeButton.addEventListener('click', (e) => {
        objectContainer.remove()
        drawer.removeObject(id)
    })
    let lookAtButton = document.createElement("button");
    lookAtButton.innerText = "Look At"
    lookAtButton.addEventListener('click', (e) => {
        drawer.lookAtObject(id)
    })
    buttons.appendChild(removeButton);
    buttons.appendChild(lookAtButton);

    // Append all parts to the container
    objectContainer.appendChild(namePart);
    objectContainer.appendChild(positionPart);
    objectContainer.appendChild(rotationPart);
    objectContainer.appendChild(scalePart);
    objectContainer.appendChild(materialName);
    objectContainer.appendChild(colorPart);
    objectContainer.appendChild(texturePart);
    objectContainer.appendChild(shininessPart);
    objectContainer.appendChild(specularPart);
    objectContainer.appendChild(diffusePart);
    objectContainer.appendChild(ambientPart);
    objectContainer.appendChild(buttons);

    // Append the container to the target element
    element.insertBefore(objectContainer, element.firstChild);
    const inputs = {
        'color': document.getElementById(`object${id}_color`),
        'shininess': document.getElementById(`object${id}_shininess`),
        'specular': document.getElementById(`object${id}_specular`),
        'diffuse': document.getElementById(`object${id}_diffuse`),
        'ambient': document.getElementById(`object${id}_ambient`),
        'positionX': document.getElementById(`object${id}_positionX`),
        'positionY': document.getElementById(`object${id}_positionY`),
        'positionZ': document.getElementById(`object${id}_positionZ`),
        'rotationX': document.getElementById(`object${id}_rotationX`),
        'rotationY': document.getElementById(`object${id}_rotationY`),
        'rotationZ': document.getElementById(`object${id}_rotationZ`),
        'scaleX': document.getElementById(`object${id}_scaleX`),
        'scaleY': document.getElementById(`object${id}_scaleY`),
        'scaleZ': document.getElementById(`object${id}_scaleZ`),
        'type': document.getElementById(`object${id}_name`),
        'usecolor': document.getElementById(`object${id}_usecolor`),
        'texture': document.getElementById(`object${id}_texture`)
    }


    for (const inp in inputs) {
        inputs[inp].addEventListener('change', function () {
            let data = {
                id: id,
                color: inputs['color'].value,
                shininess: inputs['shininess'].value,
                specular: inputs['specular'].value,
                diffuse: inputs['diffuse'].value,
                ambient: inputs['ambient'].value,
                position: {x: inputs['positionX'].value, y: inputs['positionY'].value, z: inputs['positionZ'].value},
                rotation: {x: inputs['rotationX'].value, y: inputs['rotationY'].value, z: inputs['rotationZ'].value},
                scale: {x: inputs['scaleX'].value, y: inputs['scaleY'].value, z: inputs['scaleZ'].value},
                type: inputs['type'].value,
                usecolor: inputs['usecolor'].checked,
            }
            if (inp === "texture") {
                const file = this.files[0];
                const reader = new FileReader();
                reader.onload = function (e) {
                    data.texture = this.result;
                    drawer.updateObject(data)
                };
                reader.readAsDataURL(file);
            } else {
                drawer.updateObject(data)
            }
        });
    }
    drawer.updateObject({
        id: id,
        color: inputs['color'].value,
        shininess: inputs['shininess'].value,
        specular: inputs['specular'].value,
        diffuse: inputs['diffuse'].value,
        ambient: inputs['ambient'].value,
        position: {x: inputs['positionX'].value, y: inputs['positionY'].value, z: inputs['positionZ'].value},
        rotation: {x: inputs['rotationX'].value, y: inputs['rotationY'].value, z: inputs['rotationZ'].value},
        scale: {x: inputs['scaleX'].value, y: inputs['scaleY'].value, z: inputs['scaleZ'].value},
        type: inputs['type'].value,
        usecolor: inputs['usecolor'].checked,
    })
}

function createLightElement(element, drawer, data = null) {
    if (data === null) {
        data = {
            diffuse: "#000000",
            specular: "#000000",
            ambient: "#000000",
            lookAt: {x: 0, y: 0, z: 0},
            inner: 30,
            outer: 75,
            far: 0.1,
            near: 1000,
            fov: 30,
            position: {x: 0, y: 0, z: 0},
        }
    }
    let id = Drawer.next_light_id++;
    // Create a container div element
    let objectContainer = document.createElement("div");
    objectContainer.classList.add("object");
    objectContainer.id = `light${id}}`
    let lightname = `Light ${id}`;
    // Create the Name part
    let namePart = document.createElement("div");
    namePart.classList.add("part");
    namePart.innerHTML = `
            <label for="light${id}_name">Name:</label>
            <div id="light${id}_name">${lightname}</div>
        `;
    // Create the Position part
    let positionPart = document.createElement("div");
    positionPart.classList.add("part");
    positionPart.innerHTML = `
            <label>Position:</label>
            <div>
                <input id="light${id}_positionX" type="number" step="0.01" value="${data.position.x}">
                <input id="light${id}_positionY" type="number" step="0.01" value="${data.position.y}">
                <input id="light${id}_positionZ" type="number" step="0.01" value="${data.position.z}">
            </div>
        `;
    // Create the LookAt part
    let lookAtPart = document.createElement("div");
    lookAtPart.classList.add("part");
    lookAtPart.innerHTML = `
            <label>Look at:</label>
            <div>
                <input id="light${id}_lookAtX" type="number" step="0.01" value="${data.lookAt.x}">
                <input id="light${id}_lookAtY" type="number" step="0.01" value="${data.lookAt.y}">
                <input id="light${id}_lookAtZ" type="number" step="0.01" value="${data.lookAt.z}">
            </div>
        `;
    // Create the Inner part
    let innerPart = document.createElement("div");
    innerPart.classList.add("part");
    innerPart.innerHTML = `
            <label for="light${id}_inner">Inner:</label>
            <input type="number" id="light${id}_inner" value="${data.inner}">
        `;
    // Create the Outer part
    let outerPart = document.createElement("div");
    outerPart.classList.add("part");
    outerPart.innerHTML = `
            <label for="light${id}_outer">Outer:</label>
            <input type="number" id="light${id}_outer" value="${data.outer}">
        `;
    // Material
    let materialName = document.createElement("div")
    materialName.innerHTML = `<p style="margin: 0">&#160;</p>`
    // Create the Specular part
    let specularPart = document.createElement("div");
    specularPart.classList.add("part");
    specularPart.innerHTML = `
            <label for="light${id}_specular">Specular:</label>
            <input type="color" id="light${id}_specular" value="${data.specular}" style="width: 100px">
        `;
    // Create the Diffuse part
    let diffusePart = document.createElement("div");
    diffusePart.classList.add("part");
    diffusePart.innerHTML = `
            <label for="light${id}_diffuse">Diffuse:</label>
            <input type="color" id="light${id}_diffuse" value="${data.diffuse}" style="width: 100px">
        `;
    // Create the Ambient part
    let ambientPart = document.createElement("div");
    ambientPart.classList.add("part");
    ambientPart.innerHTML = `
            <label for="light${id}_ambient">Ambient:</label>
            <input type="color" id="light${id}_ambient" value="${data.ambient}" style="width: 100px">
        `;

    // Append all parts to the container
    objectContainer.appendChild(namePart);
    objectContainer.appendChild(positionPart);
    objectContainer.appendChild(materialName);
    objectContainer.appendChild(specularPart);
    objectContainer.appendChild(diffusePart);
    objectContainer.appendChild(ambientPart);
    objectContainer.appendChild(lookAtPart);
    objectContainer.appendChild(innerPart);
    objectContainer.appendChild(outerPart);

    // Append the container to the target element
    element.insertBefore(objectContainer, element.firstChild);
    const inputs = {
        'specular': document.getElementById(`light${id}_specular`),
        'diffuse': document.getElementById(`light${id}_diffuse`),
        'ambient': document.getElementById(`light${id}_ambient`),
        'positionX': document.getElementById(`light${id}_positionX`),
        'positionY': document.getElementById(`light${id}_positionY`),
        'positionZ': document.getElementById(`light${id}_positionZ`),
        'lookAtX': document.getElementById(`light${id}_lookAtX`),
        'lookAtY': document.getElementById(`light${id}_lookAtY`),
        'lookAtZ': document.getElementById(`light${id}_lookAtZ`),
        'inner': document.getElementById(`light${id}_inner`),
        'outer': document.getElementById(`light${id}_outer`),
    }

    for (const inp in inputs) {
        inputs[inp].addEventListener('change', function () {
            let data = {
                id: id,
                specular: inputs['specular'].value,
                diffuse: inputs['diffuse'].value,
                ambient: inputs['ambient'].value,
                position: {x: inputs['positionX'].value, y: inputs['positionY'].value, z: inputs['positionZ'].value},
                lookAt: {x: inputs['lookAtX'].value, y: inputs['lookAtY'].value, z: inputs['lookAtZ'].value},
                outer: inputs['outer'].value,
                inner: inputs['inner'].value,
            }
            drawer.updateLight(data)
        });
    }
    drawer.updateLight({
        id: id,
        specular: inputs['specular'].value,
        diffuse: inputs['diffuse'].value,
        ambient: inputs['ambient'].value,
        position: {x: inputs['positionX'].value, y: inputs['positionY'].value, z: inputs['positionZ'].value},
        lookAt: {x: inputs['lookAtX'].value, y: inputs['lookAtY'].value, z: inputs['lookAtZ'].value},
        outer: inputs['outer'].value,
        inner: inputs['inner'].value,
    })
}



