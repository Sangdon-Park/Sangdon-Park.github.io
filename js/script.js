/**
 * Dr. Sangdon Park - Academic Profile
 * Main JavaScript file for handling site functionality
 */

// 페이지 로드가 완료되면 실행
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();

    // Load publications data
    loadPublications();

    // Handle publication filters
    initPublicationFilters();

    // Handle smooth scrolling
    initSmoothScroll();

    // Handle header scroll effect
    initHeaderScroll();

    // 프로필 이미지가 없을 경우 플레이스홀더 표시
    const profileImage = document.getElementById('profile-placeholder');

    if (profileImage) {
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
    }

    // 내비게이션에서 클릭하면 해당 섹션으로 스무스 스크롤 (initSmoothScroll에서 처리하므로 중복 제거 가능)
    // document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    //     anchor.addEventListener('click', function(e) {
    //         e.preventDefault();
    //         const targetId = this.getAttribute('href');
    //         const targetSection = document.querySelector(targetId);
    //         if (targetSection) {
    //             targetSection.scrollIntoView({
    //                 behavior: 'smooth',
    //                 block: 'start'
    //             });
    //         }
    //     });
    // });

    // 스크롤 시 헤더에 그림자 효과 추가 (initHeaderScroll에서 처리하므로 중복 제거 가능)
    // window.addEventListener('scroll', function() {
    //     const header = document.querySelector('header');
    //     if (window.scrollY > 50) {
    //         header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    //     } else {
    //         header.style.boxShadow = 'none';
    //     }
    // });
});

/**
 * Initialize mobile navigation
 */
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) { // 요소 존재 여부 확인 추가
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Close mobile nav when clicking on a link
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            if (navLinks) { // 요소 존재 여부 확인 추가
              navLinks.classList.remove('active');
            }

            // Update active link
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Set active nav link based on scroll position
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        const sections = document.querySelectorAll('section[id]'); // ID가 있는 섹션만 선택

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100; // 헤더 높이 등을 고려하여 offset 조정
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                links.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });

        // 홈 섹션 활성화 로직 추가 (스크롤이 맨 위에 있을 때)
        const homeLink = document.querySelector('.nav-links a[href="#home"]');
        if (scrollPosition < sections[0].offsetTop - 100 && homeLink) {
             links.forEach(link => link.classList.remove('active'));
             homeLink.classList.add('active');
        }
    });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            if (targetId === '#' || !targetId.startsWith('#')) return; // 유효한 ID인지 확인

            try {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = document.querySelector('.header')?.offsetHeight || 80; // 헤더 높이 동적 계산
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            } catch (error) {
                console.error("Error finding element for smooth scroll:", targetId, error);
            }
        });
    });
}


/**
 * Add header scroll effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    if (!header) return; // 헤더 요소 확인

    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/**
 * Initialize publication filters
 */
function initPublicationFilters() {
    const filterButtons = document.querySelectorAll('.pub-nav-btn');
    if (filterButtons.length === 0) return; // 버튼 존재 여부 확인

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const filter = this.getAttribute('data-filter');
            filterPublications(filter);
        });
    });
}

/**
 * Filter publications by type
 */
function filterPublications(filter) {
    const publications = document.querySelectorAll('.publication-item');

    publications.forEach(pub => {
        // 'all' 이거나 해당 filter 클래스를 포함하면 보이게 함
        if (filter === 'all' || pub.classList.contains(filter)) {
            pub.style.display = 'block'; // 또는 'flex', 'grid' 등 원래 display 속성으로
        } else {
            pub.style.display = 'none';
        }
    });
}


/**
 * Load and parse publications from the data structure
 */
function loadPublications() {
    const publicationsContainer = document.getElementById('publications-list');

    if (!publicationsContainer) {
        console.error("Publications container not found!");
        return;
    }

    // Publications data based *strictly* on the user-provided screenshot (20 items)
    const publicationsData = [
        {
            title: "Real-Time Dynamic Pricing for Edge Computing Services: A Market Perspective",
            authors: "<em>S Park</em>, S Bae, J Lee, Y Sung",
            journal: "IEEE Access, 2024",
            link: "#", // Link needs verification
            type: "journal",
            citations: null
        },
        {
            title: "Dynamic Bandwidth Slicing in Passive Optical Networks to Empower Federated Learning",
            authors: "AFY Mohammed, J Lee, <em>S Park</em>",
            journal: "Sensors 24 (15), 5000, 2024",
            link: "#", // Link needs verification
            type: "journal",
            citations: 1
        },
        {
            title: "Power and Frequency Band Allocation Mechanisms for WPT System with Logarithmic-Based Nonlinear Energy Harvesting Model",
            authors: "J Han, SH Jeon, GH Lee, <em>S Park</em>, JK Choi",
            journal: "Sustainability 15 (13), 10567, 2023",
            link: "#", // Link needs verification
            type: "journal",
            citations: 2
        },
        {
            title: "Differential pricing-based task offloading for delay-sensitive IoT applications in mobile edge computing system",
            authors: "H Seo, H Oh, JK Choi, <em>S Park</em>",
            journal: "IEEE Internet of Things Journal 9 (19), 19116-19131, 2022",
            link: "#", // Link needs verification
            type: "journal",
            citations: 26
        },
        {
            title: "A novel cooperative transmission scheme in uav-assisted wireless sensor networks",
            authors: "Y Zang, Y Peng, <em>S Park</em>, H Hai, F AL-Hazemi, MM Mirza",
            journal: "Electronics 11 (4), 600, 2022",
            link: "#", // Link needs verification
            type: "journal",
            citations: 4
        },
        {
            title: "Power scheduling scheme for a charging facility considering the satisfaction of electric vehicle users",
            authors: "J Kim, J Lee, <em>S Park</em>, JK Choi",
            journal: "IEEE Access 10, 25153-25164, 2022",
            link: "#", // Link needs verification
            type: "journal",
            citations: 15
        },
        {
            title: "A multivariate-time-series-prediction-based adaptive data transmission period control algorithm for IoT networks",
            authors: "J Han, GH Lee, <em>S Park</em>, J Lee, JK Choi",
            journal: "IEEE Internet of Things Journal 9 (1), 419-436, 2021",
            link: "#", // Link needs verification
            type: "journal",
            citations: 33
        },
        {
            title: "Lane detection aided online dead reckoning for GNSS denied environments",
            authors: "J Jeon, Y Hwang, Y Jeong, <em>S Park</em>, IS Kweon, SB Choi",
            journal: "Sensors 21 (20), 6805, 2021",
            link: "#", // Link needs verification
            type: "journal",
            citations: 7
        },
        {
            title: "Joint subcarrier and transmission power allocation in OFDMA-based WPT system for mobile-edge computing in IoT environment",
            authors: "J Han, GH Lee, <em>S Park</em>, JK Choi",
            journal: "IEEE Internet of Things Journal 9 (16), 15039-15052, 2021",
            link: "#", // Link needs verification
            type: "journal",
            citations: 29
        },
        {
            title: "Deposit decision model for data brokers in distributed personal data markets using blockchain",
            authors: "H Oh, <em>S Park</em>, JK Choi, S Noh",
            journal: "IEEE Access 9, 114715-114726, 2021",
            link: "#", // Link needs verification
            type: "journal",
            citations: 6
        },
        {
            title: "Driver identification for different road shapes using vehicle IoT sensing data",
            authors: "J Lee, M Kim, <em>S Park</em>, JK Choi, Y Hwang",
            journal: "2021 IEEE International Conference on Consumer Electronics (ICCE), 1-5",
            link: "#", // Link needs verification
            type: "conference",
            citations: 7
        },
        {
            title: "Time series forecasting based day-ahead energy trading in microgrids: Mathematical analysis and simulation",
            authors: "G Jeong, <em>S Park</em>, G Hwang",
            journal: "IEEE Access 8, 63885-63900, 2020",
            link: "#", // Link needs verification
            type: "journal",
            citations: 9
        },
        {
            title: "Joint orthogonal band and power allocation for energy fairness in WPT system with nonlinear logarithmic energy harvesting model",
            authors: "J Han, GH Lee, <em>S Park</em>, JK Choi",
            journal: "arXiv preprint arXiv:2003.13255, 2020",
            link: "#", // Link needs verification
            type: "preprint",
            citations: 3
        },
        {
            title: "Competitive data trading model with privacy valuation for multiple stakeholders in IoT data markets",
            authors: "H Oh, <em>S Park</em>, GM Lee, JK Choi, S Noh",
            journal: "IEEE Internet of Things Journal 7 (4), 3623-3639, 2020",
            link: "#", // Link needs verification
            type: "journal",
            citations: 77
        },
        {
            title: "Three dynamic pricing schemes for resource allocation of edge computing for IoT environment",
            authors: "B Baek, J Lee, Y Peng, <em>S Park</em>",
            journal: "IEEE Internet of Things Journal 7 (5), 4292-4303, 2020",
            link: "#", // Link needs verification
            type: "journal",
            citations: 89
        },
        {
            title: "Optimal throughput analysis of multiple channel access in cognitive radio networks",
            authors: "<em>S Park</em>, G Hwang, JK Choi",
            journal: "Annals of Operations Research 277, 345-370, 2019",
            link: "#", // Link needs verification
            type: "journal",
            citations: 4
        },
        {
            title: "Energy-efficient cooperative transmission for intelligent transportation systems",
            authors: "Y Peng, J Li, <em>S Park</em>, K Zhu, MM Hassan, A Alsanad",
            journal: "Future Generation Computer Systems 94, 634-640, 2019",
            link: "#", // Link needs verification
            type: "journal",
            citations: 25
        },
        {
            title: "Comparison between seller and buyer pricing systems for energy trading in microgrids",
            authors: "S Bae, <em>S Park</em>",
            journal: "IEEE Access 7, 54084-54096, 2019",
            link: "#", // Link needs verification
            type: "journal",
            citations: 4
        },
        {
            title: "Power efficient clustering scheme for 5G mobile edge computing environment",
            authors: "J Ahn, J Lee, <em>S Park</em>, HS Park",
            journal: "Mobile Networks and Applications 24, 643-652, 2019",
            link: "#", // Link needs verification
            type: "journal",
            citations: 19
        },
        {
            title: "Personal data trading scheme for data brokers in IoT data marketplaces",
            authors: "H Oh, <em>S Park</em>, GM Lee, H Heo, JK Choi",
            journal: "IEEE Access 7, 40120-40132, 2019",
            link: "#", // Link needs verification
            type: "journal",
            citations: 90
        }
    ];

    // Remove loading message
    publicationsContainer.innerHTML = ''; // Clear existing content or loading message

    // Check if there are publications to display
    if (publicationsData.length === 0) {
        publicationsContainer.innerHTML = '<p>게재된 논문이 없습니다.</p>'; // Show a message if no publications
        return;
    }

    // Add publications to the container
    publicationsData.forEach(pub => {
        const pubElement = document.createElement('div');
        // Add base class and specific type class (ensure 'type' is defined)
        pubElement.className = `publication-item ${pub.type || 'unknown'}`;

        // Build HTML structure for the publication item
        // Using template literals for better readability
        // Ensure links have rel="noopener noreferrer" for security
        pubElement.innerHTML = `
            <h3>${pub.title}</h3>
            <p class="publication-authors">${pub.authors}</p>
            <p class="publication-journal">${pub.journal}</p>
            <div class="publication-footer">
                 <a href="${pub.link || '#'}" class="publication-link" target="_blank" rel="noopener noreferrer">
                    자세히 보기 <i class="fas fa-external-link-alt"></i>
                 </a>
                 ${pub.citations !== undefined && pub.citations !== null ?
                    `<span class="publication-citations"><i class="fas fa-quote-left"></i> 인용: ${pub.citations}</span>` : ''
                 }
            </div>
        `;

        publicationsContainer.appendChild(pubElement);
    });

    // After loading, trigger the filter to show 'all' initially
    filterPublications('all');
    // Ensure the 'all' button is marked as active
    const allButton = document.querySelector('.pub-nav-btn[data-filter="all"]');
    if(allButton) {
        document.querySelectorAll('.pub-nav-btn').forEach(btn => btn.classList.remove('active'));
        allButton.classList.add('active');
    }
}