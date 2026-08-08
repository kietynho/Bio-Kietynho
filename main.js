const video = document.getElementById("camera");

const canvas = document.getElementById("canvas");

const resultCanvas = document.getElementById("result-canvas");

const startCameraBtn = document.getElementById("start-camera");

const captureBtn = document.getElementById("capture-btn");

const switchCameraBtn = document.getElementById("switch-camera");

const retakeBtn = document.getElementById("retake-btn");

const downloadBtn = document.getElementById("download-btn");

const cameraPlaceholder =

    document.getElementById("camera-placeholder");

const previewPlaceholder =

    document.getElementById("preview-placeholder");

const frameItems =

    document.querySelectorAll(".frame-item");

// ==========================================

// VARIABLES

// ==========================================

let stream = null;

let facingMode = "user";

let selectedFrame = "none";

let capturedImage = null;

let frameImage = null;

// ==========================================

// CAMERA

// ==========================================

async function startCamera() {

    try {

        // Kiểm tra trình duyệt

        if (!navigator.mediaDevices) {

            throw new Error(

                "Trình duyệt không hỗ trợ mediaDevices."

            );

        }

        if (!navigator.mediaDevices.getUserMedia) {

            throw new Error(

                "Trình duyệt không hỗ trợ getUserMedia."

            );

        }

        // Dừng camera cũ

        stopCamera();

        startCameraBtn.disabled = true;

        startCameraBtn.textContent = "Đang mở camera...";

        // Cấu hình camera đơn giản,

        // tương thích tốt hơn với Safari iPhone

        const constraints = {

            audio: false,

            video: {

                facingMode: facingMode

            }

        };

        console.log(

            "Đang yêu cầu camera:",

            constraints

        );

        // Xin quyền camera

        stream =

            await navigator.mediaDevices.getUserMedia(

                constraints

            );

        console.log(

            "Camera stream:",

            stream

        );

        // Gắn stream vào video

        video.srcObject = stream;

        video.muted = true;

        video.autoplay = true;

        video.playsInline = true;

        // Safari đôi khi cần play()

        await video.play();

        // Camera đã hoạt động

        cameraPlaceholder.style.display = "none";

        startCameraBtn.textContent =

            "Camera đang bật";

        startCameraBtn.disabled = false;

        captureBtn.disabled = false;

        switchCameraBtn.disabled = false;

    } catch (error) {

        console.error(

            "CAMERA ERROR:",

            error

        );

        startCameraBtn.disabled = false;

        startCameraBtn.textContent =

            "Bật camera";

        let message =

            "Không thể bật camera.";

        switch (error.name) {

            case "NotAllowedError":

                message =

                    "Camera bị từ chối quyền.\n\n" +

                    "Hãy kiểm tra quyền Camera của Safari.";

                break;

            case "NotFoundError":

                message =

                    "Không tìm thấy camera trên thiết bị.";

                break;

            case "NotReadableError":

                message =

                    "Camera đang được ứng dụng khác sử dụng.";

                break;

            case "SecurityError":

                message =

                    "Trình duyệt chặn camera vì lý do bảo mật.";

                break;

            case "AbortError":

                message =

                    "Safari đã hủy việc mở camera.";

                break;

            case "OverconstrainedError":

                message =

                    "Camera không hỗ trợ cấu hình yêu cầu.";

                break;

            default:

                message =

                    "Lỗi camera:\n\n" +

                    error.name +

                    "\n" +

                    error.message;

                break;

        }

        alert(message);

    }

}

// ==========================================

// STOP CAMERA

// ==========================================

function stopCamera() {

    if (!stream) {

        return;

    }

    stream

        .getTracks()

        .forEach(track => {

            track.stop();

        });

    stream = null;

    if (video.srcObject) {

        video.srcObject = null;

    }

}

// ==========================================

// SWITCH CAMERA

// ==========================================

async function switchCamera() {

    if (!stream) {

        return;

    }

    facingMode =

        facingMode === "user"

            ? "environment"

            : "user";

    await startCamera();

}

// ==========================================

// CAPTURE PHOTO

// ==========================================

function capturePhoto() {

    if (!stream) {

        alert("Hãy bật camera trước.");

        return;

    }

    if (video.readyState < 2) {

        alert("Camera chưa sẵn sàng.");

        return;

    }

    const width = video.videoWidth;

    const height = video.videoHeight;

    if (!width || !height) {

        alert(

            "Không lấy được độ phân giải camera."

        );

        return;

    }

    // Canvas ảnh gốc

    canvas.width = width;

    canvas.height = height;

    const ctx =

        canvas.getContext("2d");

    ctx.clearRect(

        0,

        0,

        width,

        height

    );

    ctx.save();

    // Camera trước: lật ảnh giống preview

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

    // Chuyển thành Image

    capturedImage =

        new Image();

    capturedImage.onload = () => {

        renderResult();

    };

    capturedImage.src =

        canvas.toDataURL(

            "image/jpeg",

            0.98

        );

    // Hiển thị preview

    previewPlaceholder.style.display =

        "none";

    retakeBtn.disabled = false;

    downloadBtn.disabled = false;

    // Cuộn xuống ảnh

    document

        .querySelector(".preview-section")

        ?.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

}

// ==========================================

// FRAME SELECTION

// ==========================================

frameItems.forEach(item => {

    item.addEventListener(

        "click",

        () => {

            // Bỏ active khỏi tất cả

            frameItems.forEach(

                frame => {

                    frame.classList.remove(

                        "active"

                    );

                }

            );

            // Active frame hiện tại

            item.classList.add(

                "active"

            );

            selectedFrame =

                item.dataset.frame;

            loadSelectedFrame();

        }

    );

});

// ==========================================

// LOAD FRAME

// ==========================================

function loadSelectedFrame() {

    // Không sử dụng frame

    if (selectedFrame === "none") {

        frameImage = null;

        renderResult();

        return;

    }

    const item =

        document.querySelector(

            `.frame-item[data-frame="${selectedFrame}"]`

        );

    if (!item) {

        return;

    }

    const img =

        item.querySelector("img");

    if (!img) {

        return;

    }

    frameImage =

        new Image();

    frameImage.onload = () => {

        renderResult();

    };

    frameImage.onerror = () => {

        console.error(

            "Không thể tải frame:",

            img.src

        );

        frameImage = null;

        renderResult();

    };

    frameImage.src =

        img.src;

}

// ==========================================

// RENDER RESULT

// ==========================================

function renderResult() {

    // Chưa chụp ảnh

    if (!capturedImage) {

        return;

    }

    const width =

        capturedImage.naturalWidth;

    const height =

        capturedImage.naturalHeight;

    if (!width || !height) {

        return;

    }

    // Canvas kết quả giữ nguyên

    // độ phân giải ảnh camera

    resultCanvas.width = width;

    resultCanvas.height = height;

    const ctx =

        resultCanvas.getContext("2d");

    ctx.clearRect(

        0,

        0,

        width,

        height

    );

    // Vẽ ảnh

    ctx.drawImage(

        capturedImage,

        0,

        0,

        width,

        height

    );

    // Vẽ frame lên trên

    if (frameImage) {

        ctx.drawImage(

            frameImage,

            0,

            0,

            width,

            height

        );

    }

}

// ==========================================

// RETAKE

// ==========================================

function retakePhoto() {

    capturedImage = null;

    frameImage = null;

    resultCanvas.width = 1;

    resultCanvas.height = 1;

    previewPlaceholder.style.display =

        "flex";

    retakeBtn.disabled = true;

    downloadBtn.disabled = true;

    // Nếu camera đã bị tắt

    if (!stream) {

        startCamera();

    }

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}

// ==========================================

// DOWNLOAD PHOTO

// ==========================================

function downloadPhoto() {

    if (!capturedImage) {

        alert(

            "Bạn chưa chụp ảnh."

        );

        return;

    }

    if (

        !resultCanvas.width ||

        !resultCanvas.height

    ) {

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

            const now =

                new Date();

            const timestamp =

                now

                    .toISOString()

                    .replace(

                        /[:.]/g,

                        "-"

                    );

            link.href = url;

            link.download =

                `photobooth-${timestamp}.png`;

            document.body.appendChild(

                link

            );

            link.click();

            link.remove();

            setTimeout(() => {

                URL.revokeObjectURL(url);

            }, 1000);

        },

        "image/png"

    );

}

// ==========================================

// BUTTON EVENTS

// ==========================================

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

// ==========================================

// PAGE VISIBILITY

// ==========================================

document.addEventListener(

    "visibilitychange",

    () => {

        if (document.hidden) {

            stopCamera();

        }

    }

);

// ==========================================

// CLEANUP

// ==========================================

window.addEventListener(

    "beforeunload",

    () => {

        stopCamera();

    }

);

// ==========================================

// INITIAL STATE

// ==========================================

cameraPlaceholder.style.display =

    "flex";

previewPlaceholder.style.display =

    "flex";

captureBtn.disabled = true;

switchCameraBtn.disabled = true;

retakeBtn.disabled = true;

downloadBtn.disabled = true;
