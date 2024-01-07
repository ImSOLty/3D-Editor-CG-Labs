function initShaderProgram(gl) {
    let shaderProgram = gl.createProgram();
    //Adding both created shaders
    gl.attachShader(shaderProgram, createShader(gl, gl.VERTEX_SHADER, vertex_shader_code));
    gl.attachShader(shaderProgram, createShader(gl, gl.FRAGMENT_SHADER, fragment_shader_code));
    //Linking

    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shaderProgram)}`);
        return null;
    }
    return shaderProgram;
}

function initShadowShaderProgram(gl) {
    let shadowShaderProgram = gl.createProgram();
    //Adding both created shaders
    gl.attachShader(shadowShaderProgram, createShader(gl, gl.VERTEX_SHADER, shadowmap_vertex_shader_code));
    gl.attachShader(shadowShaderProgram, createShader(gl, gl.FRAGMENT_SHADER, shadowmap_fragment_shader_code));
    //Linking

    gl.linkProgram(shadowShaderProgram);
    gl.useProgram(shadowShaderProgram);
    if (!gl.getProgramParameter(shadowShaderProgram, gl.LINK_STATUS)) {
        console.error(`Unable to initialize the shader program: ${gl.getProgramInfoLog(shadowShaderProgram)}`);
        return null;
    }
    return shadowShaderProgram;
}

function createShader(gl, shader_type, shader_source) {
    let shader = gl.createShader(shader_type);

    gl.shaderSource(shader, shader_source)
    gl.compileShader(shader)
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) {
        console.error(gl.getShaderInfoLog(shader));
    }
    return shader
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function randomHexColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);

    const rHex = r.toString(16).padStart(2, '0');
    const gHex = g.toString(16).padStart(2, '0');
    const bHex = b.toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
}

function parseObjFromBlender(data) {
    const obj_lines = data.split('\n');
    const vertices = [];
    const normals = [];
    const textures = [];
    const indices = [];
    const textureIndices = [];
    const normalIndices = [];

    for (const line of obj_lines) {
        if (line.startsWith('v ')) {
            const values = line.split(' ').slice(1).map(parseFloat);
            vertices.push(...values);
        } else if (line.startsWith('vn ')) {
            const normalValues = line.split(' ').slice(1).map(parseFloat);
            normals.push(...normalValues);
        } else if (line.startsWith('vt ')) {
            const textureValues = line.split(' ').slice(1).map(parseFloat);
            textures.push(...textureValues);
        } else if (line.startsWith('f ')) {
            const faceData = line.split(' ').slice(1);
            const vertexIndices = [];
            const textureIndicesForFace = [];
            const normalIndicesForFace = [];

            for (const val of faceData) {
                const indices = val.split('/').map((v) => parseInt(v) - 1);
                vertexIndices.push(indices[0]);
                if (indices[1] !== undefined) {
                    textureIndicesForFace.push(indices[1]);
                }
                if (indices[2] !== undefined) {
                    normalIndicesForFace.push(indices[2]);
                }
            }

            if (vertexIndices.length >= 3) {
                for (let i = 2; i < vertexIndices.length; i++) {
                    indices.push(vertexIndices[0], vertexIndices[i - 1], vertexIndices[i]);
                }
            }

            textureIndices.push(...textureIndicesForFace); // Store texture indices
            normalIndices.push(...normalIndicesForFace); // Store normal indices
        }
    }

    // Correct the order of vertices
    const correctedVertices = [];
    const correctedTextures = [];
    for (let i = 0; i < indices.length; i++) {
        const vertexIndex = indices[i];
        const textureIndex = textureIndices[i];
        correctedVertices.push(vertices[vertexIndex * 3], vertices[vertexIndex * 3 + 1], vertices[vertexIndex * 3 + 2]);
        correctedTextures.push(textures[textureIndex * 2], textures[textureIndex * 2 + 1]);
    }

    const parsedNormals = normalIndices.map((index) => normals.slice(index * 3, (index + 1) * 3)).flat();
    return {
        vertices: correctedVertices,
        normals: parsedNormals,
        textures: correctedTextures,
        indices: indices
    };
}

function genTextureFromColor(gl, color) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(color));
    return texture;
}

function loadTexture(gl, url) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 20, 147, 100]));

    const image = new Image();

    function isPowerOf2(value) {
        return (value & (value - 1)) === 0;
    }

    image.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        Drawer.instance.render()
    };


    image.src = url;

    return texture;
}

function initShadowMapTexture(gl) {
    const depthTexture = gl.createTexture();
    const depthTextureSize = 8192;
    gl.bindTexture(gl.TEXTURE_2D, depthTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, depthTextureSize, depthTextureSize, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const depthFramebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthTexture, 0);

    return [depthTexture, depthTextureSize, depthFramebuffer]
}