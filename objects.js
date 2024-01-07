class Object {
    constructor(gl, data) {
        this.id = data.id;
        this.previousImageTexture = undefined
        this.previousData = data
        let parsed
        this.type = data.type
        if (!["cube", "icosphere", "uvsphere", "cylinder", "torus", "cone", "plane", "grid", "circle"].includes((data.type.toLowerCase()))) {
            parsed = parseObjFromBlender(data.type)
        } else {
            parsed = parseObjFromBlender(objects_data_highres[data.type.toLowerCase()])
        }

        this.vertices = parsed.vertices
        this.indices = parsed.indices
        this.normals = parsed.normals
        this.textures = parsed.textures

        this.colors = []
        this.shininess = data.shininess
        this.specular = hexToRgb(data.specular)
        this.diffuse = hexToRgb(data.diffuse)
        this.ambient = hexToRgb(data.ambient)
        let customColor = hexToRgb(data.color)
        for (let i = 0; i < this.vertices.length; i++) {
            this.colors.push(customColor.r / 255, customColor.g / 255, customColor.b / 255, 1.0)
        }
        if (data.texture !== undefined) {
            this.previousImageTexture = loadTexture(gl, data.texture)
        }

        if (data.usecolor) {
            this.texture = genTextureFromColor(gl, [customColor.r, customColor.g, customColor.b, 255])
        } else {
            if (data.texture !== undefined)
                this.texture = loadTexture(gl, data.texture)
            else
                this.texture = this.previousImageTexture
        }

        this.rotation = quat.create()
        quat.fromEuler(this.rotation, data.rotation.x, data.rotation.y, data.rotation.z)
        this.scale = [data.scale.x, data.scale.y, data.scale.z]
        this.position = [data.position.x, data.position.y, data.position.z]

        //Create Buffers for object
        //Creating Array Buffer of vertices
        this.vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        //Same with Index Buffer
        this.index_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
        //Same with normals buffer
        this.normals_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normals_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        //Same with Color buffer
        this.color_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        //Same with Texture buffer
        this.texture_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textures), gl.STATIC_DRAW);
    }

    static fromData(gl, data) {
        return new Object(gl, data);
    }

    updateFromData(gl, data) {
        this.previousData = data
        let parsed
        if (!["cube", "icosphere", "uvsphere", "cylinder", "torus", "cone", "plane", "grid", "circle"].includes((data.type.toLowerCase()))) {
            parsed = parseObjFromBlender(data.type)
        } else {
            parsed = parseObjFromBlender(objects_data_highres[data.type.toLowerCase()])
        }

        this.vertices = parsed.vertices
        this.indices = parsed.indices
        this.normals = parsed.normals
        this.textures = parsed.textures

        let customColor = hexToRgb(data.color)
        this.colors = []
        this.shininess = data.shininess
        this.specular = hexToRgb(data.specular)
        this.diffuse = hexToRgb(data.diffuse)
        this.ambient = hexToRgb(data.ambient)
        for (let i = 0; i < this.vertices.length; i++) {
            this.colors.push(customColor.r / 255, customColor.g / 255, customColor.b / 255, 1.0)
        }
        if (data.texture !== undefined) {
            this.previousImageTexture = loadTexture(gl, data.texture)
        }

        if (data.usecolor) {
            this.texture = genTextureFromColor(gl, [customColor.r, customColor.g, customColor.b, 255])
        } else {
            if (data.texture !== undefined)
                this.texture = loadTexture(gl, data.texture)
            else
                this.texture = this.previousImageTexture
        }

        quat.fromEuler(this.rotation, data.rotation.x, data.rotation.y, data.rotation.z)
        this.scale = [data.scale.x, data.scale.y, data.scale.z]
        this.position = [data.position.x, data.position.y, data.position.z]

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index_buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.colors), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normals_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.normals), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.texture_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textures), gl.STATIC_DRAW);
    }

    getMatrix() {
        const matrix = mat4.create()
        mat4.fromRotationTranslationScale(matrix, this.rotation, this.position, this.scale)
        return matrix
    }

    rotate(rotationVector) {
        document.getElementById(`object${this.id}_rotationX`).value =
            (parseFloat(document.getElementById(`object${this.id}_rotationX`).value) + rotationVector[0]) % 360;
        document.getElementById(`object${this.id}_rotationY`).value =
            (parseFloat(document.getElementById(`object${this.id}_rotationY`).value) + rotationVector[1]) % 360;
        document.getElementById(`object${this.id}_rotationZ`).value =
            (parseFloat(document.getElementById(`object${this.id}_rotationZ`).value) + rotationVector[2]) % 360;
        document.getElementById(`object${this.id}_rotationX`).dispatchEvent(new Event('change'))
    }
}

class Light {
    constructor(data) {
        this.id = data.id;
        this.specular = hexToRgb(data.specular)
        this.diffuse = hexToRgb(data.diffuse)
        this.ambient = hexToRgb(data.ambient)
        this.position = [parseFloat(data.position.x), parseFloat(data.position.y), parseFloat(data.position.z), 1]
        this.lookAt = [parseFloat(data.lookAt.x), parseFloat(data.lookAt.y), parseFloat(data.lookAt.z)]
        this.fov = data.fov != undefined ? data.fov : 30
        this.inner = parseFloat(data.inner)
        this.outer =parseFloat(data.outer)
    }

    static fromData(data) {
        return new Light(data);
    }

    updateFromData(data) {
        this.specular = hexToRgb(data.specular)
        this.diffuse = hexToRgb(data.diffuse)
        this.ambient = hexToRgb(data.ambient)
        this.position = [parseFloat(data.position.x), parseFloat(data.position.y), parseFloat(data.position.z), 1]
        this.lookAt = [parseFloat(data.lookAt.x), parseFloat(data.lookAt.y), parseFloat(data.lookAt.z)]
        this.inner = parseFloat(data.inner)
        this.outer =parseFloat(data.outer)
        this.fov = data.fov != undefined ? data.fov : 30
    }
}