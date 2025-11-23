document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.particles-container');
    const minParticles = 50; // Số lượng hạt tối thiểu

    // Hàm tạo một số ngẫu nhiên trong khoảng min/max
    const getRandom = (min, max) => Math.random() * (max - min) + min;

    // Hàm tạo và khởi tạo một hạt
    const createParticle = () => {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        container.appendChild(particle);

        // Kích thước ngẫu nhiên (từ 2px đến 6px)
        const size = getRandom(10, 20); 
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Vị trí ngẫu nhiên trên toàn màn hình
        const xStart = getRandom(0, window.innerWidth);
        const yStart = getRandom(0, window.innerHeight);
        particle.style.left = `${xStart}px`;
        particle.style.top = `${yStart}px`;

        // Thời gian tồn tại ngẫu nhiên (không quá 2s)
        const duration = getRandom(1, 2); 
        particle.style.animationDuration = `${duration}s`;

        // Thêm độ trễ ngẫu nhiên để các hạt không bắt đầu cùng lúc
        const delay = getRandom(0, 5); // Độ trễ từ 0 đến 5 giây
        particle.style.animationDelay = `${delay}s`;

        // Vị trí kết thúc ngẫu nhiên (để hạt di chuyển một chút)
        // Ví dụ: di chuyển ngẫu nhiên trong khoảng -50px đến +50px so với vị trí ban đầu
        const xEndOffset = getRandom(-50, 50);
        const yEndOffset = getRandom(-50, 50);

        // Gán biến CSS cho keyframes
        particle.style.setProperty('--x-end', `${xEndOffset}px`);
        particle.style.setProperty('--y-end', `${yEndOffset}px`);
        
        // Loại bỏ hạt sau khi animation kết thúc
        particle.onanimationend = () => {
            particle.remove();
        };

        return particle;
    };
    
    // Hàm sinh ngẫu nhiên số lượng hạt (không dưới 50)
    const generateParticles = () => {
        const totalParticles = Math.floor(getRandom(minParticles, 200)); // Ví dụ: từ 50 đến 100 hạt

        for (let i = 0; i < totalParticles; i++) {
            createParticle();
        }
    };
    
    // Bắt đầu tạo hạt ban đầu
    generateParticles();

    // Lặp lại việc tạo hạt sau mỗi 5 giây để duy trì hiệu ứng "spam"
    setInterval(generateParticles, 5000); 
});