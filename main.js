class Drawer {

    static next_object_id = 0;
    static next_light_id = 1;
    static instance;
    bg_color = null;
    camera = {
        fov: 45,
        near: 0.1,
        far: 1000,
        position: {x: 0, y: 0, z: 5},
        lookAt: {x: 0, y: 0, z: 0},
    }

    render() {
        if(this.objects.length==0 || this.lights.length==0){
            return
        }
        let gl = this.gl
        gl.enable(gl.CULL_FACE);
        gl.enable(gl.DEPTH_TEST);

        gl.bindFramebuffer(gl.FRAMEBUFFER, this.sm_texture[2]);
        gl.viewport(0, 0, this.sm_texture[1], this.sm_texture[1]);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.enable(gl.POLYGON_OFFSET_FILL)
        gl.polygonOffset(2.5, 20.0)
        this.drawShadowMap();
        gl.disable(gl.POLYGON_OFFSET_FILL)

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.drawObjects();
        // this.drawShadowMap();
    }

    drawObjects() {
        let gl = this.gl
        gl.clearColor(this.bg_color.r / 255, this.bg_color.g / 255, this.bg_color.b / 255, 1);
        gl.clearDepth(1)
        gl.enable(gl.DEPTH_TEST);
        // Near things > far things
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        // gl.viewport(0, 0, this.canvas.width, this.canvas.height); ?

        let projectionMatrix = mat4.create();
        let viewMatrix = mat4.create();

        let FOV = this.camera.fov * Math.PI / 180,
            aspectRatio = gl.canvas.clientWidth / gl.canvas.clientHeight,
            near = this.camera.near,
            far = this.camera.far

        if (this.camera.projection === 'perspective') {
            mat4.perspective(projectionMatrix, FOV, aspectRatio, near, far)
        } else {
            let left = -this.camera.projection_size / 2;
            let right = this.camera.projection_size / 2;
            let bottom = -this.camera.projection_size / 2;
            let top = this.camera.projection_size / 2;
            mat4.ortho(projectionMatrix, left, right, bottom, top, near, far);
        }


        // Set up the view matrix (position and orientation of the camera)
        let eye = [this.camera.position.x, this.camera.position.y, this.camera.position.z]; // Camera position
        let center = [this.camera.lookAt.x, this.camera.lookAt.y, this.camera.lookAt.z]; // Point the camera is looking at
        let up = [0, 1, 0]; // Up direction

        mat4.lookAt(viewMatrix, eye, center, up);

        // Combine the projection and view matrices
        let projectionViewMatrix = mat4.create();
        mat4.multiply(projectionViewMatrix, projectionMatrix, viewMatrix);


        gl.useProgram(this.shaderProgram)

        gl.uniform3fv(gl.getUniformLocation(this.shaderProgram, 'uLightLookAt'),
            [-this.lights[0].lookAt[0], -this.lights[0].lookAt[1], this.lights[0].lookAt[2]])
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, 'innerAngle'), Math.cos(this.lights[0].inner * Math.PI / 180.0))
        gl.uniform1f(gl.getUniformLocation(this.shaderProgram, 'outerAngle'), Math.cos(this.lights[0].outer * Math.PI / 180.0))

        for (let light of this.lights) {
            gl.uniform4fv(gl.getUniformLocation(this.shaderProgram, `light[${light.id - 1}].position`), light.position)
            gl.uniform4fv(gl.getUniformLocation(this.shaderProgram, `light[${light.id - 1}].specular`),
                [light.specular.r / 255, light.specular.g / 255, light.specular.b / 255, 1])
            gl.uniform4fv(gl.getUniformLocation(this.shaderProgram, `light[${light.id - 1}].diffuse`),
                [light.diffuse.r / 255, light.diffuse.g / 255, light.diffuse.b / 255, 1])
            gl.uniform4fv(gl.getUniformLocation(this.shaderProgram, `light[${light.id - 1}].ambient`),
                [light.ambient.r / 255, light.ambient.g / 255, light.ambient.b / 255, 1])
        }

        let lightProjectionMatrix = mat4.create();
        const lightFieldOfView = 120 * Math.PI / 180; // in radians
         aspectRatio = 1; // Adjust this if needed
         near = 0.5;
         far = 20;
        mat4.perspective(lightProjectionMatrix, lightFieldOfView, aspectRatio, near, far);

        let lightViewMatrix = mat4.create();
        const position = this.lights[0].position;
        const lookAt = this.lights[0].lookAt;
         up = [0, 1, 0]; // Use an appropriate up vector

        mat4.lookAt(lightViewMatrix, position, lookAt, up);

        let lightMatrix = mat4.create();
        let invertViewMatrix = mat4.create();
        mat4.invert(invertViewMatrix, viewMatrix);

// Concatenate the matrices in the correct order

        mat4.multiply(lightMatrix, lightMatrix, invertViewMatrix);
        mat4.multiply(lightMatrix, lightProjectionMatrix, lightViewMatrix);

        for (let obj of this.objects) {
            //Setting program info

            // Get the attribute location
            let coord = gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertex_buffer);
            // Point an attribute to the currently bound Vertex Buffer
            gl.vertexAttribPointer(coord, 3, gl.FLOAT, true, 0, 0);
            // Enable the attribute
            gl.enableVertexAttribArray(coord);

            //Nearly the same with normals buffer
            let nor = gl.getAttribLocation(this.shaderProgram, "aVertexNormal");
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.normals_buffer);
            gl.vertexAttribPointer(nor, 3, gl.FLOAT, true, 0, 0);
            gl.enableVertexAttribArray(nor);


            let tcord = gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.texture_buffer);
            gl.vertexAttribPointer(tcord, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(tcord);

            gl.activeTexture(gl.TEXTURE0) //?
            gl.bindTexture(gl.TEXTURE_2D, obj.texture) //?
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); //?
            gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uSampler"), 0) //?

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.sm_texture[0]);
            gl.uniform1i(gl.getUniformLocation(this.shaderProgram, "uShadowMap"), 1);

            let modelMatrix = obj.getMatrix()

            gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "uProjectionMatrix"), false, projectionMatrix);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "uModelMatrix"), false, modelMatrix);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "uViewMatrix"), false, viewMatrix);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderProgram, "uLightMatrix"), false, lightMatrix);

            gl.uniform1f(gl.getUniformLocation(this.shaderProgram, "material.shininess"), obj.shininess)
            gl.uniform4fv(gl.getUniformLocation(this.shaderProgram, "material.specular"),
                [obj.specular.r / 255, obj.specular.g / 255, obj.specular.b / 255, 1])
            gl.uniform4fv(gl.getUniformLocation(this.shaderProgram, "material.diffuse"),
                [obj.diffuse.r / 255, obj.diffuse.g / 255, obj.diffuse.b / 255, 1])
            gl.uniform4fv(gl.getUniformLocation(this.shaderProgram, "material.ambient"),
                [obj.ambient.r / 255, obj.ambient.g / 255, obj.ambient.b / 255, 1])

            gl.drawArrays(gl.TRIANGLES, 0, obj.indices.length);
        }
    }

    drawShadowMap() {
        let gl = this.gl
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clearColor(0, 0, 0, 1);
        let FOV = 120 * Math.PI / 180,
            near = 0.5,//this.lights[0].near,
            far = 20//this.lights[0].far

        let projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, FOV, 1, near, far)
        let viewMatrix = mat4.create();

        console.log(this.lights[0])
        // Set up the view matrix (position and orientation of the camera)
        let eye = this.lights[0].position
        let center = [this.lights[0].lookAt[0], this.lights[0].lookAt[1], this.lights[0].lookAt[2]]
        let up = [0, 1, 0]; // Up direction

        // Set up the view matrix (position and orientation of the camera)
        // let eye = [this.camera.position.x, this.camera.position.y, this.camera.position.z]; // Camera position
        // let center = [this.camera.lookAt.x, this.camera.lookAt.y, this.camera.lookAt.z]; // Point the camera is looking at
        // let up = [0, 1, 0]; // Up direction

        mat4.lookAt(viewMatrix, eye, center, up);

        gl.useProgram(this.shadowShaderProgram)
        for (let obj of this.objects) {
            let coord = gl.getAttribLocation(this.shadowShaderProgram, "aVertexPosition");
            gl.bindBuffer(gl.ARRAY_BUFFER, obj.vertex_buffer);
            gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(coord);

            let modelViewMatrix = mat4.create()
            mat4.multiply(modelViewMatrix, viewMatrix, obj.getMatrix())
            gl.uniformMatrix4fv(gl.getUniformLocation(this.shadowShaderProgram, "uProjectionMatrix"), false, projectionMatrix);
            gl.uniformMatrix4fv(gl.getUniformLocation(this.shadowShaderProgram, "uModelViewMatrix"), false, modelViewMatrix);
            gl.drawArrays(gl.TRIANGLES, 0, obj.indices.length)
        }
    }

    constructor(canvas, gl) {
        Drawer.instance = this;
        this.canvas = canvas
        // Initialize GL context
        this.gl = gl
        if (this.gl == null) {
            console.log("Initialization unable. Browser may not support WebGL")
            return
        }
        this.gl.getError();

        this.sm_texture = initShadowMapTexture(this.gl)
        this.shaderProgram = initShaderProgram(this.gl)
        this.shadowShaderProgram = initShadowShaderProgram(this.gl)
        this.objects = []
        this.lights = []
    }

    updateObject(data) {
        let obj = this.objects.find(obj => obj.id === data.id)
        if (obj === undefined) {
            this.objects.push(Object.fromData(this.gl, data))
        } else {
            obj.updateFromData(this.gl, data)
        }
        //console.log(this.objects)
        this.render()
    }

    updateCamera(data) {
        this.camera = data
        this.render()
    }

    updateLight(data) {
        let l = this.lights.find(l => l.id === data.id)

        if (l === undefined) {
            this.lights.push(Light.fromData(data))
        } else {
            l.updateFromData(data)
        }
        this.render()
    }

    lookAtObject(id) {
        let obj = this.objects.find(obj => obj.id === id)
        document.getElementById('camera_lookatX').value = obj.position[0]
        document.getElementById('camera_lookatY').value = obj.position[1]
        document.getElementById('camera_lookatZ').value = obj.position[2]
        document.getElementById('camera_lookatY').dispatchEvent(new Event('change'))
    }

    removeObject(id) {
        let index = this.objects.findIndex(obj => obj.id === id)
        if (index !== -1) {
            this.objects.splice(index, 1);
        }
        this.render()
    }
}

function main() {
    let canvas = document.getElementById('gl_canvas');
    let gl = canvas.getContext('webgl2');
    let drawer = new Drawer(canvas, gl);
    drawer.bg_color = hexToRgb(document.getElementById('background_color').value)
    drawer.shading_type = document.getElementById('shading_type').value.toLowerCase()


    //setup event handlers
    document.getElementById('shading_type').addEventListener('change', function () {
        drawer.shading_type = this.value.toLowerCase()
        drawer.render()
    })
    document.getElementById('background_color').addEventListener('change', function () {
        drawer.bg_color = hexToRgb(this.value)
        drawer.render()
    })

    for (let id of ['fov', 'near', 'far',
        'camera_positionX', 'camera_positionY', 'camera_positionZ',
        'camera_lookatX', 'camera_lookatY', 'camera_lookatZ',
        'projection', 'projection_size']) {
        document.getElementById(id).addEventListener('change', function () {
            drawer.updateCamera({
                fov: parseFloat(document.getElementById('fov').value),
                near: parseFloat(document.getElementById('near').value),
                far: parseFloat(document.getElementById('far').value),
                position: {
                    x: parseFloat(document.getElementById('camera_positionX').value),
                    y: parseFloat(document.getElementById('camera_positionY').value),
                    z: parseFloat(document.getElementById('camera_positionZ').value)
                },
                lookAt: {
                    x: parseFloat(document.getElementById('camera_lookatX').value),
                    y: parseFloat(document.getElementById('camera_lookatY').value),
                    z: parseFloat(document.getElementById('camera_lookatZ').value)
                },
                projection: document.getElementById('projection').value.toLowerCase(),
                projection_size: parseFloat(document.getElementById('projection_size').value)
            })
            drawer.render()
        })
    }

    document.getElementById("add_object").addEventListener('click', (e) => {
        createObjectElement(document.getElementById("objects_controller"), drawer)
    })

    examplesInitiate()

    drawer.render()
}

window.onload = main;