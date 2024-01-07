window.addEventListener('load', function () {
    const dropZone = document.getElementById('dropzone');

    function showDropZone() {
        dropZone.style.display = "block";
    }

    function hideDropZone() {
        dropZone.style.display = "none";
    }

    function allowDrag(e) {

        if (true) {  // Test that the item being dragged is a valid one
            e.dataTransfer.dropEffect = 'copy';
            e.preventDefault();
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        hideDropZone();

        const file = e.dataTransfer.files[0];
        //console.log(file)
        if (!file.name.endsWith('.obj')) {
            alert('Wrong extension! Expected: .obj')
        } else {
            const reader = new FileReader();
            let fileText = ""
            reader.onload = (event) => {
                fileText = event.target.result;
                //console.log(fileText)
                createObjectElement(document.getElementById("objects_controller"), Drawer.instance, null, fileText)
            };

            reader.readAsText(file);
        }
    }

// 1
    window.addEventListener('dragenter', function (e) {
        showDropZone();
    });

// 2
    dropZone.addEventListener('dragenter', allowDrag);
    dropZone.addEventListener('dragover', allowDrag);

// 3
    dropZone.addEventListener('dragleave', function (e) {
        console.log('dragleave');
        hideDropZone();
    });

// 4
    dropZone.addEventListener('drop', handleDrop);
})


