const video = document.getElementById("camera");
const resultCanvas = document.getElementById("result-canvas");

const canvas =
    document.getElementById("canvas") ||
    document.createElement("canvas");

const startCameraBtn =
    document.getElementById("start-camera");

const captureBtn =
    document.getElementById("capture-btn");

const switchCameraBtn =
    document.getElementById("switch-camera");

const retakeBtn =
    document.getElementById("retake-btn");

const downloadBtn =
    document.getElementById("download-btn");

const cameraPlaceholder =
    document.getElementById("camera-placeholder");

const previewPlaceholder =
    document.getElementById("preview-placeholder");

const countdown =
    document.getElementById("countdown");

const captureStatus =
    document.getElementById("capture-status");

const frameItems =
    document.querySelectorAll(".frame-item");

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

    captureBtn.textContent =
        `Chụp ảnh ${photos.length + 1}`;
}


async function startCamera() {

    try {

        if (
            !navigator.mediaDevices ||
            !navigator.mediaDevices.getUserMedia
        ) {
            throw new Error(
                "Trình duyệt không hỗ trợ camera."
            );
        }

        stopCamera();

        startCameraBtn.disabled = true;
        startCameraBtn.textContent =
            "Đang mở camera...";

        stream =
            await navigator.mediaDevices.getUserMedia({
                audio: false,

                video: {
                    facingMode: facingMode,

                    width: {
                        ideal: 1920
                    },

                    height: {
                        ideal: 1080
                    }
                }
            });

        video.srcObject = stream;

        video.muted = true;
        video.autoplay = true;
        video.playsInline = true;

        await video.play();

        cameraPlaceholder.style.display =
            "none";

        startCameraBtn.disabled = false;

        startCameraBtn.textContent =
            "Camera đang bật";

        switchCameraBtn.disabled = false;

        updateCaptureButton();

    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        startCameraBtn.disabled = false;

        startCameraBtn.textContent =
            "Bật camera";

        let message =
            "Không thể bật camera.";

        if (error.name === "NotAllowedError") {

            message =
                "Camera bị từ chối quyền.";

        } else if (
            error.name === "NotFoundError"
        ) {

            message =
                "Không tìm thấy camera.";

        } else if (
            error.name === "NotReadableError"
        ) {

            message =
                "Camera đang được ứng dụng khác sử dụng.";

        } else {

            message +=
                "\n\n" +
                error.name +
                "\n" +
                error.message;
        }

        alert(message);
    }
}


function stopCamera() {

    if (stream) {

        stream
            .getTracks()
            .forEach(track => {
                track.stop();
            });
    }

    stream = null;

    video.srcObject = null;

    switchCameraBtn.disabled = true;
}


async function switchCamera() {

    if (!stream || isCounting) {
        return;
    }

    facingMode =
        facingMode === "user"
            ? "environment"
            : "user";

    await startCamera();
}


function selectFrame(frameName) {

    selectedFrame = frameName;

    frameItems.forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.frame === frameName
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

        captureStatus.textContent =
            "Không thể tải khung ảnh.";

        captureBtn.disabled = true;
    };

    frameImage.src =
        FRAME_PATHS[frameName];
}


function wait(ms) {

    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}


async function countdownBeforePhoto(photoNumber) {

    isCounting = true;

    captureBtn.disabled = true;
    switchCameraBtn.disabled = true;
    startCameraBtn.disabled = true;

    captureStatus.textContent =
        `Đang chụp ảnh ${photoNumber}`;

    countdown.style.display = "flex";

    for (
        let number = 3;
        number >= 1;
        number--
    ) {

        countdown.textContent = number;

        await wait(1000);
    }

    countdown.textContent = "";

    countdown.style.display = "none";

    const success =
        takePhoto(photoNumber);

    isCounting = false;

    startCameraBtn.disabled = false;
    switchCameraBtn.disabled = false;

    if (!success) {

        captureStatus.textContent =
            "Không thể chụp ảnh. Vui lòng thử lại.";

        updateCaptureButton();

        return;
    }

    if (photos.length < 3) {

        captureStatus.textContent =
            `Ảnh ${photoNumber} đã chụp. Nhấn nút để chụp ảnh tiếp theo.`;

    } else {

        captureStatus.textContent =
            "Đã chụp đủ 3 ảnh. Đang ghép ảnh...";
    }

    updateCaptureButton();
}


function takePhoto(photoNumber) {

    const width =
        video.videoWidth;

    const height =
        video.videoHeight;

    if (!width || !height) {

        alert(
            "Không lấy được hình ảnh từ camera."
        );

        return false;
    }

    canvas.width = width;
    canvas.height = height;

    const ctx =
        canvas.getContext("2d");

    if (!ctx) {

        alert(
            "Không thể tạo Canvas."
        );

        return false;
    }

    ctx.clearRect(
        0,
        0,
        width,
        height
    );

    ctx.save();

    if (facingMode === "user") {

        ctx.translate(
            width,
            0
        );

        ctx.scale(
            -1,
            1
        );
    }

    ctx.drawImage(
        video,
        0,
        0,
        width,
        height
    );

    ctx.restore();

    const imageData =
        canvas.toDataURL(
            "image/jpeg",
            0.98
        );

    photos[photoNumber - 1] =
        imageData;

    const photoElement =
        photoElements[photoNumber - 1];

    if (photoElement) {

        photoElement.src =
            imageData;

        photoElement.style.display =
            "block";
    }

    if (photos.length === 3) {

        renderFinalImage();

        downloadBtn.disabled = false;

        retakeBtn.disabled = false;

        setTimeout(() => {

            document
                .querySelector(".preview-section")
                ?.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

        }, 300);
    }

    return true;
}


function loadImage(src) {

    return new Promise(
        (resolve, reject) => {

            const image =
                new Image();

            image.onload = () => {
                resolve(image);
            };

            image.onerror = reject;

            image.src = src;
        }
    );
}


function drawCoverImage(
    ctx,
    image,
    x,
    y,
    width,
    height
) {

    const imageRatio =
        image.naturalWidth /
        image.naturalHeight;

    const targetRatio =
        width / height;

    let sourceWidth =
        image.naturalWidth;

    let sourceHeight =
        image.naturalHeight;

    let sourceX = 0;
    let sourceY = 0;

    if (imageRatio > targetRatio) {

        sourceWidth =
            image.naturalHeight *
            targetRatio;

        sourceX =
            (
                image.naturalWidth -
                sourceWidth
            ) / 2;

    } else {

        sourceHeight =
            image.naturalWidth /
            targetRatio;

        sourceY =
            (
                image.naturalHeight -
                sourceHeight
            ) / 2;
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

        const images =
            await Promise.all(
                photos.map(
                    src => loadImage(src)
                )
            );

        const width =
            frameImage.naturalWidth;

        const height =
            frameImage.naturalHeight;

        if (!width || !height) {
            throw new Error(
                "Frame không có kích thước hợp lệ."
            );
        }

        resultCanvas.width =
            width;

        resultCanvas.height =
            height;

        const ctx =
            resultCanvas.getContext("2d");

        ctx.clearRect(
            0,
            0,
            width,
            height
        );

        const slotHeight =
            height / 3;

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            const y =
                Math.round(
                    i * slotHeight
                );

            const nextY =
                Math.round(
                    (i + 1) *
                    slotHeight
                );

            const slotHeightActual =
                nextY - y;

            drawCoverImage(
                ctx,
                images[i],
                0,
                y,
                width,
                slotHeightActual
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
            "Đã ghép xong 3 ảnh.";

    } catch (error) {

        console.error(
            "Render error:",
            error
        );

        alert(
            "Lỗi khi ghép ảnh:\n\n" +
            error.message
        );
    }
}


async function capturePhoto() {

    if (!selectedFrame) {

        alert(
            "Vui lòng chọn khung trước khi chụp."
        );

        return;
    }

    if (!stream) {

        alert(
            "Vui lòng bật camera trước."
        );

        return;
    }

    if (isCounting) {
        return;
    }

    if (photos.length >= 3) {
        return;
    }

    const photoNumber =
        photos.length + 1;

    await countdownBeforePhoto(
        photoNumber
    );
}


function resetPhotos() {

    photos = [];

    frameImage = frameImage;

    photoElements.forEach(image => {

        if (image) {

            image.removeAttribute("src");

            image.style.display =
                "none";
        }
    });

    resultCanvas.width = 1;
    resultCanvas.height = 1;

    previewPlaceholder.style.display =
        "flex";

    downloadBtn.disabled = true;
    retakeBtn.disabled = true;

    captureStatus.textContent =
        selectedFrame
            ? "Đã chọn khung. Bạn có thể bắt đầu chụp."
            : "Chọn khung trước khi chụp";

    updateCaptureButton();
}


function retakePhoto() {

    resetPhotos();

    if (!stream) {
        startCamera();
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function downloadPhoto() {

    if (
        photos.length !== 3 ||
        !resultCanvas.width ||
        !resultCanvas.height
    ) {

        alert(
            "Bạn chưa hoàn thành 3 ảnh."
        );

        return;
    }

    resultCanvas.toBlob(
        blob => {

            if (!blob) {

                alert(
                    "Không thể tạo ảnh."
                );

                return;
            }

            const url =
                URL.createObjectURL(blob);

            const link =
                document.createElement("a");

            const timestamp =
                new Date()
                    .toISOString()
                    .replace(
                        /[:.]/g,
                        "-"
                    );

            link.href = url;

            link.download =
                `photobooth-${timestamp}.png`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            setTimeout(() => {

                URL.revokeObjectURL(url);

            }, 1000);

        },
        "image/png"
    );
}


frameItems.forEach(item => {

    item.addEventListener(
        "click",
        () => {

            if (isCounting) {
                return;
            }

            selectFrame(
                item.dataset.frame
            );
        }
    );
});


startCameraBtn.addEventListener(
    "click",
    startCamera
);


captureBtn.addEventListener(
    "click",
    capturePhoto
);


switchCameraBtn.addEventListener(
    "click",
    switchCamera
);


retakeBtn.addEventListener(
    "click",
    retakePhoto
);


downloadBtn.addEventListener(
    "click",
    downloadPhoto
);


document.addEventListener(
    "visibilitychange",
    () => {

        if (document.hidden) {
            stopCamera();
        }
    }
);


window.addEventListener(
    "beforeunload",
    stopCamera
);


cameraPlaceholder.style.display =
    "flex";

countdown.style.display =
    "none";

previewPlaceholder.style.display =
    "flex";

captureStatus.textContent =
    "Chọn khung trước khi chụp";

captureBtn.disabled = true;

switchCameraBtn.disabled = true;

retakeBtn.disabled = true;

downloadBtn.disabled = true;

photoElements.forEach(image => {

    if (image) {
        image.style.display = "none";
    }
});
