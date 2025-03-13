// 페이지 로드가 완료되면 실행
document.addEventListener('DOMContentLoaded', function() {
    // 프로필 이미지가 없을 경우 플레이스홀더 표시
    const profileImage = document.getElementById('profile-placeholder');
    
    profileImage.onerror = function() {
        this.src = ''; // 이미지 로드 실패 시 소스 비우기
        this.style.backgroundColor = '#f4f4f4';
        this.style.display = 'flex';
        this.style.alignItems = 'center';
        this.style.justifyContent = 'center';
        
        // 이니셜 또는 아이콘 추가
        const initial = document.createElement('span');
        initial.textContent = 'SP'; // 박상돈의 이니셜
        initial.style.fontSize = '3rem';
        initial.style.color = '#999';
        this.appendChild(initial);
    };
    
    // 내비게이션에서 클릭하면 해당 섹션으로 스무스 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // 스크롤 시 헤더에 그림자 효과 추가
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        
        if (window.scrollY > 50) {
            header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = 'none';
        }
    });
});
