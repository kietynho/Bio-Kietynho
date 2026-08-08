/* =========================
   ELEMENTS
========================= */
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const resultCanvas = document.getElementById("result-canvas");
const startCameraBtn = document.getElementById("start-camera");
const captureBtn = document.getElementById("capture-btn");
const switchCameraBtn = document.getElementById("switch-camera");
const retakeBtn = document.getElementById("retake-btn");
const downloadBtn = document.getElementById("download-btn");
const cameraPlaceholder = document.getElementById("camera-placeholder");
const previewPlaceholder = document.getElementById("preview-placeholder");
const frameItems = document.querySelectorAll(".frame-item");
/* =========================
   VARIABLES
========================= */
let stream = null;
let facingMode = "user";
let selectedFrame = "none";
let capturedImage = null;
let frameImage = null;
/* =========================
   CAMERA
========================= */
async function startCamera() {
    try {
        // Dừng camera cũ nếu đang chạy
        stopCamera();
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: facingMode,
                width: {
                    ideal: 4096
                },
                height: {
                    ideal: 2160
                }
            },
            audio: false
        });
        video.srcObject = stream;
        await video.play();
        cameraPlaceholder.style.display = "none";
        startCameraBtn.textContent = "Camera đang bật";
        captureBtn.disabled = false;
        switchCameraBtn.disabled = false;
    } catch (error) {
        console.error("Camera error:", error);
        alert(
            "Không thể truy cập camera.\n\n" +
            "Hãy cấp quyền sử dụng camera cho trình duyệt."
        );
    }
}
/* =========================
   STOP CAMERA
========================= */
function stopCamera() {
    if (!stream) return;
    stream.getTracks().forEach(track => {
        track.stop();
    });
    stream = null;
}
/* =========================
   SWITCH CAMERA
========================= */
async function switchCamera() {
    facingMode = facingMode === "user"
        ? "environment"
        : "user";
    await startCamera();
}
/* =========================
   CAPTURE PHOTO
========================= */
function capturePhoto() {
    if (!stream || video.readyState < 2) {
        return;
    }
    const width = video.videoWidth;
    const height = video.videoHeight;
    if (!width || !height) {
        return;
    }
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.save();
    /*
     * Camera trước thường cần lật ngang
     * để ảnh giống preview.
     */
    if (facingMode === "user") {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
    }
    ctx.drawImage(
        video,
        0,
        0,
        width,
        height
    );
    ctx.restore();
    capturedImage = new Image();
    capturedImage.onload = () => {
        renderResult();
    };
    capturedImage.src = canvas.toDataURL(
        "image/jpeg",
        0.98
    );
    previewPlaceholder.style.display = "none";
    retakeBtn.disabled = false;
    downloadBtn.disabled = false;
    // Cuộn xuống phần preview
    document.querySelector(".preview-section")
        .scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
}
/* =========================
   FRAME SELECTION
========================= */
frameItems.forEach(item => {
    item.addEventListener("click", () => {
        frameItems.forEach(frame => {
            frame.classList.remove("active");
        });
        item.classList.add("active");
        selectedFrame = item.dataset.frame;
        loadSelectedFrame();
    });
});
/* =========================
   LOAD FRAME
========================= */
function loadSelectedFrame() {
    if (selectedFrame === "none") {
        frameImage = null;
        renderResult();
        return;
    }
    const item = document.querySelector(
        `.frame-item[data-frame="${selectedFrame}"]`
    );
    if (!item) return;
    const img = item.querySelector("img");
    if (!img) return;
    frameImage = new Image();
    frameImage.onload = () => {
        renderResult();
    };
    frameImage.onerror = () => {
        console.error("Không thể tải frame:", img.src);
        frameImage = null;
        renderResult();
    };
    frameImage.src = img.src;
}
/* =========================
   RENDER RESULT
========================= */
function renderResult() {
    if (!capturedImage) {
        return;
    }
    const width = capturedImage.naturalWidth;
    const height = capturedImage.naturalHeight;
    if (!width || !height) {
        return;
    }
    resultCanvas.width = width;
    resultCanvas.height = height;
    const ctx = resultCanvas.getContext("2d");
    ctx.clearRect(
        0,
        0,
        width,
        height
    );
    /*
     * Vẽ ảnh gốc
     */
    ctx.drawImage(
        capturedImage,
        0,
        0,
        width,
        height
    );
    /*
     * Vẽ frame lên trên
     */
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
/* =========================
   RETAKE
========================= */
function retakePhoto() {
    capturedImage = null;
    frameImage = null;
    resultCanvas.width = 1;
    resultCanvas.height = 1;
    previewPlaceholder.style.display = "flex";
    retakeBtn.disabled = true;
    downloadBtn.disabled = true;
    if (!stream) {
        startCamera();
    }
    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}
/* =========================
   DOWNLOAD
========================= */
function downloadPhoto() {
    if (!capturedImage) {
        return;
    }
    /*
     * PNG giữ chất lượng tối đa.
     * Frame và ảnh được xuất đúng theo
     * độ phân giải canvas.
     */
    resultCanvas.toBlob(
        blob => {
            if (!blob) {
                alert("Không thể tạo ảnh.");
                return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const timestamp = new Date()
                .toISOString()
                .replace(/[:.]/g, "-");
            link.href = url;
            link.download = `photobooth-${timestamp}.png`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        },
        "image/png"
    );
}
/* =========================
   BUTTON EVENTS
========================= */
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
/* =========================
   PAGE VISIBILITY
========================= */
document.addEventListener(
    "visibilitychange",
    () => {
        if (document.hidden) {
            stopCamera();
        }
    }
);
/* =========================
   CLEANUP
========================= */
window.addEventListener(
    "beforeunload",
    stopCamera
);
/* =========================
   INITIAL STATE
========================= */
cameraPlaceholder.style.display = "flex";
previewPlaceholder.style.display = "flex";
captureBtn.disabled = true;
switchCameraBtn.disabled = true;
retakeBtn.disabled = true;
downloadBtn.disabled = true;
