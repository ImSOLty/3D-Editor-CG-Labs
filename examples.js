function examplesInitiate() {
    document.getElementById("example").addEventListener('click', (e) => {
        let example_data = [
            ["uvsphere", [-4, 0, 0], "#FFA7F3"],
            ["cone", [-2.57, 0, 2.82], "#0072BB"],
            ["cylinder", [3.87, 0, 1.34], "#FF00FF"],
            ["cone", [2.88, 0, -0.82], "#4CAF50"],
            ["torus", [-2, 0, -4.05], "#FF6F61"],
        ]
        for (let ex of example_data) {
            createObjectElement(document.getElementById("objects_controller"), Drawer.instance, {
                selected: ex[0],
                position: {x: ex[1][0], y: ex[1][1], z: -ex[1][2]},
                rotation: {x: 0, y: 0, z: 0},
                scale: {x: 1, y: 1, z: 1},
                shininess: 1,
                specular: "#555555",
                diffuse: "#555555",
                ambient: "#555555",
                color: ex[2],
                texture: ex[3]
            })
        }
        let bounds_data = [
            //Bounds
            [[-10, 0, 0], [0.5, 8, 10], "#FFFFFF"],
            [[0, 0, 5], [10, 8, 0.5], "#FFFFFF"],
            [[0, -2, 0], [10, 0.5, 10], "#FFFFFF"],
        ]
        //Bounds
        for (let ex of bounds_data) {
            createObjectElement(document.getElementById("objects_controller"), Drawer.instance, {
                selected: "cube",
                position: {x: ex[0][0], y: ex[0][1], z: -ex[0][2]},
                rotation: {x: 0, y: 0, z: 0},
                scale: {x: ex[1][0], y: ex[1][1], z: ex[1][2]},
                shininess: 1,
                specular: "#555555",
                diffuse: "#555555",
                ambient: "#555555",
                color: ex[2],
                texture: ex[3]
            })
        }

        document.getElementById('fov').value = 30;
        document.getElementById('camera_positionX').value = 14
        document.getElementById('camera_positionY').value = 8
        document.getElementById('camera_positionZ').value = 12
        document.getElementById('camera_lookatX').value = -4

        var event = new Event('change');
        for (let el of ['fov', 'camera_positionX', 'camera_positionY', 'camera_positionZ'])
            document.getElementById(el).dispatchEvent(event)

        //LightData
        createLightElement(document.getElementById("lights_controller"), Drawer.instance, {
            diffuse: "#AAAAAA",
            specular: "#AAAAAA",
            ambient: "#EEEEEE",
            lookAt: {x: -1, y: 0.01, z: 0.01},
            inner: 0,
            outer: 70,
            fov: 30,
            position: {x: 0.99, y: -0.01, z: 0.01},
        })
        // createLightElement(document.getElementById("lights_controller"), Drawer.instance, {
        //     diffuse: "#FFFFFF",
        //     specular: "#666666",
        //     ambient: "#666666",
        //     lookAt: {x: 0, y: 0, z: 0},
        //     inner: 30,
        //     outer: 75,
        //     far: 0.1,
        //     near: 1000,
        //     fov: 30,
        //     position: {x: 0, y: 0, z: 0},
        // })
    })

    document.getElementById("random").addEventListener('click', (e) => {
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', function (event) {
            const files = event.target.files;
            for (let element of Drawer.instance.objects) {
                document.getElementById("object" + element.id + "_usecolor").checked = false
                document.getElementById("object" + element.id + "_usecolor").dispatchEvent(new Event("change"))
                const file = files[element.id];
                const reader = new FileReader();
                reader.onload = function (event) {
                    let data = element.previousData
                    data.usecolor = false
                    data.texture = this.result
                    Drawer.instance.updateObject(data)
                };
                reader.readAsDataURL(file);
            }
        });
        fileInput.click();

    })

    document.getElementById("animation").addEventListener('click', function () {
        if (this.innerText === "Animation") {
            this.innerText = "Stop"
            let timer = setInterval(function () {
                if (document.getElementById("animation").innerText !== "Stop") {
                    clearInterval(timer);
                    return;
                }
                for (let obj of Drawer.instance.objects) {
                    obj.rotate([4, 4, 4])
                }
                Drawer.instance.render()
            }, 1);
            Drawer.instance.render()
        } else {
            this.innerText = "Animation"
        }
    })
    document.getElementById("example").dispatchEvent(new Event('click'))
}