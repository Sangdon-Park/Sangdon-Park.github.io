/**
 * Dr. Sangdon Park - Academic Profile
 * Main JavaScript file for handling site functionality
 */

// 페이지 로드가 완료되면 실행
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    initNavigation();
    
    // Handle language switching
    initLanguageSwitcher();
    
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

/**
 * Initialize mobile navigation
 */
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
    
    // Close mobile nav when clicking on a link
    const links = document.querySelectorAll('.nav-links a');
    links.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            
            // Update active link
            links.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Set active nav link based on scroll position
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        document.querySelectorAll('section').forEach(section => {
            const sectionTop = section.offsetTop - 100;
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
    });
}

/**
 * Initialize language switcher
 */
function initLanguageSwitcher() {
    const langEn = document.getElementById('lang-en');
    const langKo = document.getElementById('lang-ko');
    
    if (langEn && langKo) {
        langEn.addEventListener('click', function() {
            document.body.classList.remove('ko');
            langEn.classList.add('active');
            langKo.classList.remove('active');
            localStorage.setItem('language', 'en');
        });
        
        langKo.addEventListener('click', function() {
            document.body.classList.add('ko');
            langKo.classList.add('active');
            langEn.classList.remove('active');
            localStorage.setItem('language', 'ko');
        });
        
        // Check for saved language preference
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage === 'ko') {
            langKo.click();
        }
    }
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Add header scroll effect
 */
function initHeaderScroll() {
    const header = document.querySelector('.header');
    
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
        if (filter === 'all' || pub.classList.contains(filter)) {
            pub.style.display = 'block';
        } else {
            pub.style.display = 'none';
        }
    });
}

/**
 * Load and parse publications from the markdown file
 */
function loadPublications() {
    const publicationsContainer = document.getElementById('publications-list');
    
    if (!publicationsContainer) return;
    
    // Sample parsed publications data structure from publications.md
    const publicationsData = [
        // Journals
        {
            title: "Differential Pricing-based Task Offloading for Delay-Sensitive IoT Applications in Mobile Edge Computing System",
            authors: "Hyeonseok Seo, Hyeontaek Oh, Jun Kyun Choi, <em>Sangdon Park*</em>",
            journal: "IEEE Internet of Things Journal, 2022",
            link: "#",
            type: "journal"
        },
        {
            title: "Energy scheduling scheme for a charging facility considering the satisfaction of electric vehicle users",
            authors: "Jangkyum Kim, Joohyung Lee*, <em>Sangdon Park</em>, Jun Kyun Choi",
            journal: "IEEE ACCESS, 2021",
            link: "#",
            type: "journal"
        },
        {
            title: "Lane Detection Aided Online Dead Reckoning for GNSS Denied Environments",
            authors: "Jinhwan Jeon, Yoonjin Hwang, Yongseop Jeong, <em>Sangdon Park</em>, In So Kweon, Seibum Choi*",
            journal: "Sensors, vol. 21, no. 20, pp. 6805, October, 2021",
            link: "#",
            type: "journal"
        },
        {
            title: "A Multivariate Time Series Prediction-Based Adaptive Data Transmission Period Control Algorithm for IoT Networks",
            authors: "Jaeseob Han, Gyeong Ho Lee, <em>Sangdon Park* (co-corresponding)</em>, Joohyung Lee*, Jun Kyun Choi",
            journal: "IEEE Internet of Things Journal, 2021",
            link: "https://ieeexplore.ieee.org/document/9598874",
            type: "journal"
        },
        {
            title: "Joint Subcarrier and Transmission Power Allocation in OFDMA-based WPT System for Mobile Edge Computing in IoT Environment",
            authors: "Jaeseob Han, Gyeong Ho Lee, <em>Sangdon Park*</em>, Jun Kyun Choi",
            journal: "IEEE Internet of Things Journal, 2021",
            link: "https://ieeexplore.ieee.org/abstract/document/9516698",
            type: "journal"
        },
        
        // Conferences
        {
            title: "Dynamics of Electricity Consumers for Classifying Power Consumption Data using PCA",
            authors: "Minkyung Kim, <em>Sangdon Park*</em>, Kireem Han, Nakyoung Kim and Junkyung Choi",
            journal: "IEEE International Conference on Big Data and Smart Computing (BigComp), Shanghai, China, January 15-18, 2018",
            link: "https://ieeexplore.ieee.org/document/8367209/",
            type: "conference"
        },
        {
            title: "An Adaptive Batch-Orchestration Algorithm for the Heterogeneous GPU Cluster Environment in Distributed Deep Learning System",
            authors: "Eunju Yang, Seong-Hwan Kim, Tae-Woo Kim, Minsu Jeon, <em>Sangdon Park</em>, and Chan-Hyun Youn",
            journal: "IEEE International Conference on Big Data and Smart Computing (BigComp), Shanghai, China, January 15-18, 2018",
            link: "https://ieeexplore.ieee.org/document/8367216/",
            type: "conference"
        },
        {
            title: "Energy Independence of Energy Trading System in Microgrid",
            authors: "Minkyung Kim, <em>Sangdon Park*</em>, Joohyung Lee and Jun Kyun Choi",
            journal: "IEEE PES Innovative Smart Grid Technologies Asia (ISGT Asia), Auckland, New Zealand, December 4-7, 2017",
            link: "https://ieeexplore.ieee.org/document/8378441/",
            type: "conference"
        },
        
        // Standards
        {
            title: "A proposal for definitions of energy efficiency class of network equipment (Y.energyECN)",
            authors: "<em>Sangdon Park</em>, Jaewon Ahn, Jun Kyun Choi, Gyu Myoung Lee",
            journal: "ITU-T SG13 Rapporteurs meeting (Geneva, 17 – 28 February 2014), SG13RGM-C-94, February 2014",
            link: "#",
            type: "standard"
        },
        {
            title: "Revised texts for a main chapter of draft recommendation Y.energyECN",
            authors: "<em>Sangdon Park</em>, Jaewon Ahn, Jun Kyun Choi, Gyu Myoung Lee",
            journal: "ITU-T SG13 Rapporteurs meeting (Geneva, 17 – 28 February 2014), SG13RGM-C-75, February 2014",
            link: "#",
            type: "standard"
        },
        
        // Patents
        {
            title: "와이파이 무선 접근 지점의 에너지 절약을 위한 슬립 방법 및 장치",
            authors: "최준균, 오현택, 이주형, <em>박상돈</em>",
            journal: "2015년 7월 31일, 등록번호: 10-1537895",
            link: "#",
            type: "patent"
        },
        {
            title: "에너지 효율 등급을 제공하는 방법 및 그 시스템",
            authors: "최준균, <em>박상돈</em>, 전승현, 박만선, 김준산",
            journal: "2015년 1월 6일, 출원번호: 10-2015-0001326",
            link: "#",
            type: "patent"
        }
    ];
    
    // Remove loading message
    publicationsContainer.innerHTML = '';
    
    // Add publications to the container
    publicationsData.forEach(pub => {
        const pubElement = document.createElement('div');
        pubElement.className = `publication-item ${pub.type}`;
        
        pubElement.innerHTML = `
            <h3>${pub.title}</h3>
            <p class="publication-authors">${pub.authors}</p>
            <p class="publication-journal">${pub.journal}</p>
            <a href="${pub.link}" class="publication-link" target="_blank">View Publication <i class="fas fa-external-link-alt"></i></a>
        `;
        
        publicationsContainer.appendChild(pubElement);
    });
}
