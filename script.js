const video = document.getElementById("camera");

const resultCanvas = document.getElementById("result-canvas");

const captureCanvas = document.createElement("canvas");

const startCameraBtn = document.getElementById("start-camera");

const captureBtn = document.getElementById("capture-btn");

const switchCameraBtn = document.getElementById("switch-camera");

const retakeBtn = document.getElementById("retake-btn");

const downloadBtn = document.getElementById("download-btn");

const cameraPlaceholder = document.getElementById("camera-placeholder");

const previewPlaceholder = document.getElementById("preview-placeholder");

const countdown = document.getElementById("countdown");

const captureStatus = document.getElementById("capture-status");

const frameItems = document.querySelectorAll(".frame-item");

const photoElements = [

    document.getElementById("photo-1"),

    document.getElementById("photo-2"),

    document.getElementById("photo-3")

];

let stream = null;

let facingMode = "user";

let selectedFrame = null;

let frameImage = null;

let photos = [];

let isCounting = false;

const FRAME_PATHS = {

    frame1: "images/frame1.png",

    frame2: "images/frame2.png",

    frame3: "images/frame3.png"

};

function updateCaptureButton() {

    if (isCounting) {

        captureBtn.disabled = true;

        return;

    }

    if (!selectedFrame) {

        captureBtn.disabled = true;

        captureBtn.textContent = "Chọn khung trước";

        return;

    }

    if (!stream) {

        captureBtn.disabled = true;

        captureBtn.textContent = "Bật camera trước";

        return;

    }

    if (photos.length >= 3) {

        captureBtn.disabled = true;

        captureBtn.textContent = "Đã chụp đủ 3 ảnh";

        return;

    }

    captureBtn.disabled = false;

    captureBtn.textContent = `Chụp ảnh ${photos.length + 1}`;

}

async function startCamera() {

    try {

        if (!navigator.mediaDevices?.getUserMedia) {

            throw new Error("Trình duyệt không hỗ trợ camera.");

        }

        if (stream) {

            stream.getTracks().forEach(track => track.stop());

            stream = null;

        }

        startCameraBtn.disabled = true;

        startCameraBtn.textContent = "Đang mở camera...";

        const newStream = await navigator.mediaDevices.getUserMedia({

            audio: false,

            video: {

                facingMode: {

                    ideal: facingMode

                },

                width: {

                    ideal: 1920

                },

                height: {

                    ideal: 1080

                }

            }

        });

        stream = newStream;

        video.srcObject = stream;

        video.muted = true;

        video.playsInline = true;

        video.autoplay = true;

        await video.play();

        cameraPlaceholder.style.display = "none";

        startCameraBtn.disabled = false;

        startCameraBtn.textContent = "Camera đang bật";

        switchCameraBtn.disabled = false;

        updateCaptureButton();

    } catch (error) {

        console.error(error);

        stream = null;

        startCameraBtn.disabled = false;

        startCameraBtn.textContent = "Bật camera";

        updateCaptureButton();

        alert(

            "Không thể bật camera.\n\n" +

            error.name +

            "\n" +

            error.message

        );

    }

}

function stopCamera() {

    if (stream) {

        stream.getTracks().forEach(track => track.stop());

    }

    stream = null;

    video.srcObject = null;

    switchCameraBtn.disabled = true;

    updateCaptureButton();

}

async function switchCamera() {

    if (isCounting) return;

    facingMode =

        facingMode === "user"

            ? "environment"

            : "user";

    await startCamera();

}

function selectFrame(name) {

    selectedFrame = name;

    frameItems.forEach(item => {

        item.classList.toggle(

            "active",

            item.dataset.frame === name

        );

    });

    frameImage = new Image();

    frameImage.onload = () => {

        captureStatus.textContent =

            "Đã chọn khung. Bạn có thể bắt đầu chụp.";

        updateCaptureButton();

    };

    frameImage.onerror = () => {

        frameImage = null;

        captureBtn.disabled = true;

        captureStatus.textContent =

            "Không tải được khung ảnh.";

    };

    frameImage.src = FRAME_PATHS[name];

}

function sleep(ms) {

    return new Promise(resolve => setTimeout(resolve, ms));

}

async function startCountdown(photoNumber) {

    if (isCounting) return;

    if (!stream) {

        alert("Camera chưa được bật.");

        return;

    }

    if (!selectedFrame) {

        alert("Vui lòng chọn khung trước khi chụp.");

        return;

    }

    isCounting = true;

    updateCaptureButton();

    captureStatus.textContent =

        `Đang chụp ảnh ${photoNumber}`;

    countdown.style.display = "flex";

    countdown.style.zIndex = "100";

    for (let i = 3; i >= 1; i--) {

        countdown.textContent = i;

        await sleep(1000);

    }

    countdown.textContent = "📸";

    await sleep(250);

    countdown.textContent = "";

    countdown.style.display = "none";

    const success = takePhoto(photoNumber);

    isCounting = false;

    if (!success) {

        captureStatus.textContent =

            "Chụp ảnh thất bại. Hãy thử lại.";

    } else if (photos.length < 3) {

        captureStatus.textContent =

            `Đã chụp ảnh ${photoNumber}. Nhấn nút để chụp ảnh tiếp theo.`;

    } else {

        captureStatus.textContent =

            "Đã chụp đủ 3 ảnh. Đang ghép ảnh...";

    }

    updateCaptureButton();

}

function takePhoto(number) {

    if (!video.videoWidth || !video.videoHeight) {

        return false;

    }

    const width = video.videoWidth;

    const height = video.videoHeight;

    captureCanvas.width = width;

    captureCanvas.height = height;

    const ctx = captureCanvas.getContext("2d");

    ctx.clearRect(0, 0, width, height);

    if (facingMode === "user") {

        ctx.save();

        ctx.translate(width, 0);

        ctx.scale(-1, 1);

        ctx.drawImage(

            video,

            0,

            0,

            width,

            height

        );

        ctx.restore();

    } else {

        ctx.drawImage(

            video,

            0,

            0,

            width,

            height

        );

    }

    const image = captureCanvas.toDataURL(

        "image/jpeg",

        0.95

    );

    photos[number - 1] = image;

    if (photoElements[number - 1]) {

        photoElements[number - 1].src = image;

        photoElements[number - 1].style.display = "block";

    }

    if (photos.length === 3) {

        renderFinalImage();

        downloadBtn.disabled = false;

        retakeBtn.disabled = false;

    }

    return true;

}

function loadImage(src) {

    return new Promise((resolve, reject) => {

        const img = new Image();

        img.onload = () => resolve(img);

        img.onerror = () => reject();

        img.src = src;

    });

}

function drawCover(ctx, image, x, y, width, height) {

    const sourceRatio =

        image.naturalWidth /

        image.naturalHeight;

    const targetRatio =

        width / height;

    let sourceWidth = image.naturalWidth;

    let sourceHeight = image.naturalHeight;

    let sourceX = 0;

    let sourceY = 0;

    if (sourceRatio > targetRatio) {

        sourceWidth =

            image.naturalHeight *

            targetRatio;

        sourceX =

            (image.naturalWidth - sourceWidth) / 2;

    } else {

        sourceHeight =

            image.naturalWidth /

            targetRatio;

        sourceY =

            (image.naturalHeight - sourceHeight) / 2;

    }

    ctx.drawImage(

        image,

        sourceX,

        sourceY,

        sourceWidth,

        sourceHeight,

        x,

        y,

        width,

        height

    );

}

async function renderFinalImage() {

    if (

        photos.length !== 3 ||

        !frameImage

    ) {

        return;

    }

    try {

        const images = await Promise.all(

            photos.map(loadImage)

        );

        const width =

            frameImage.naturalWidth;

        const height =

            frameImage.naturalHeight;

        resultCanvas.width = width;

        resultCanvas.height = height;

        const ctx =

            resultCanvas.getContext("2d");

        const slotHeight =

            height / 3;

        for (let i = 0; i < 3; i++) {

            drawCover(

                ctx,

                images[i],

                0,

                i * slotHeight,

                width,

                slotHeight

            );

        }

        ctx.drawImage(

            frameImage,

            0,

            0,

            width,

            height

        );

        previewPlaceholder.style.display =

            "none";

        captureStatus.textContent =

            "Đã ghép xong ảnh.";

    } catch (error) {

        console.error(error);

        alert("Không thể ghép ảnh.");

    }

}

function resetPhotos() {

    photos = [];

    photoElements.forEach(img => {

        if (img) {

            img.removeAttribute("src");

            img.style.display = "none";

        }

    });

    resultCanvas.width = 1;

    resultCanvas.height = 1;

    previewPlaceholder.style.display = "flex";

    downloadBtn.disabled = true;

    retakeBtn.disabled = true;

    captureStatus.textContent =

        selectedFrame

            ? "Đã chọn khung. Bạn có thể bắt đầu chụp."

            : "Chọn khung trước khi chụp.";

    updateCaptureButton();

}

function downloadPhoto() {

    resultCanvas.toBlob(blob => {

        if (!blob) return;

        const url =

            URL.createObjectURL(blob);

        const link =

            document.createElement("a");

        link.href = url;

        link.download =

            `photobooth-${Date.now()}.png`;

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(() => {

            URL.revokeObjectURL(url);

        }, 1000);

    }, "image/png");

}

frameItems.forEach(item => {

    item.addEventListener("click", () => {

        if (!isCounting) {

            selectFrame(item.dataset.frame);

        }

    });

});

startCameraBtn.addEventListener(

    "click",

    startCamera

);

captureBtn.addEventListener(

    "click",

    () => {

        startCountdown(photos.length + 1);

    }

);

switchCameraBtn.addEventListener(

    "click",

    switchCamera

);

retakeBtn.addEventListener(

    "click",

    () => {

        resetPhotos();

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    }

);

downloadBtn.addEventListener(

    "click",

    downloadPhoto

);

cameraPlaceholder.style.display = "flex";

countdown.style.display = "none";

previewPlaceholder.style.display = "flex";

captureBtn.disabled = true;

switchCameraBtn.disabled = true;

retakeBtn.disabled = true;

downloadBtn.disabled = true;

photoElements.forEach(img => {

    if (img) {

        img.style.display = "none";

    }

});

updateCaptureButton();
