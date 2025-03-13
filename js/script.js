/**
 * Dr. Sangdon Park - Academic Profile
 * Main JavaScript file for handling site functionality
 */

// 전역 오류 핸들러 설정
window.onerror = function(message, source, lineno, colno, error) {
    showErrorMessage('JavaScript 오류가 발생했습니다: ' + message);
    console.error('Global error:', message, source, lineno, colno, error);
    return true; // 오류 처리를 중단하지 않음
};

// 오류 메시지를 화면에 표시하는 함수
function showErrorMessage(message) {
    // 이미 오류 메시지가 있는지 확인
    if (document.getElementById('error-message')) return;
    
    // 오류 메시지 컨테이너 생성
    var errorDiv = document.createElement('div');
    errorDiv.id = 'error-message';
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '0';
    errorDiv.style.left = '0';
    errorDiv.style.right = '0';
    errorDiv.style.padding = '10px';
    errorDiv.style.backgroundColor = '#f44336';
    errorDiv.style.color = 'white';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.zIndex = '9999';
    errorDiv.innerHTML = message + ' <button onclick="this.parentNode.style.display=\'none\'">닫기</button>';
    
    document.body.insertBefore(errorDiv, document.body.firstChild);
}

// 로컬 스토리지 사용 가능 여부 확인
function isLocalStorageAvailable() {
    try {
        const test = 'test';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
    } catch (e) {
        return false;
    }
}

// 페이지 로드가 완료되면 실행
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 기본 언어를 영어로 설정 (안전 모드)
        try {
            document.body.classList.remove('ko');
        } catch (e) {
            console.error('Error removing ko class:', e);
        }
        
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
        
        // 마지막으로 언어 스위처 초기화 (문제가 있어도 다른 기능은 작동하도록)
        setTimeout(function() {
            try {
                initLanguageSwitcher();
            } catch (e) {
                console.error('Error initializing language switcher:', e);
                showErrorMessage('언어 전환 기능에 문제가 발생했습니다.');
            }
        }, 500);
        
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
    } catch (error) {
        console.error('Error during page initialization:', error);
        showErrorMessage('페이지 초기화 중 오류가 발생했습니다: ' + error.message);
    }
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
    try {
        const langEn = document.getElementById('lang-en');
        const langKo = document.getElementById('lang-ko');
        
        if (!langEn || !langKo) {
            console.error('Language switcher buttons not found');
            return;
        }
        
        // 영어 버튼 클릭 처리
        langEn.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                // 한국어 클래스 제거
                document.body.classList.remove('ko');
                
                // 버튼 활성화 상태 업데이트
                langEn.classList.add('active');
                langKo.classList.remove('active');
                
                // 로컬 스토리지에 저장 시도
                if (isLocalStorageAvailable()) {
                    localStorage.setItem('language', 'en');
                }
            } catch (error) {
                console.error('Error switching to English:', error);
                showErrorMessage('영어로 전환 중 오류가 발생했습니다.');
            }
        });
        
        // 한국어 버튼 클릭 처리
        langKo.addEventListener('click', function(e) {
            e.preventDefault();
            try {
                // 한국어 클래스 추가
                document.body.classList.add('ko');
                
                // 버튼 활성화 상태 업데이트
                langKo.classList.add('active');
                langEn.classList.remove('active');
                
                // 로컬 스토리지에 저장 시도
                if (isLocalStorageAvailable()) {
                    localStorage.setItem('language', 'ko');
                }
            } catch (error) {
                console.error('Error switching to Korean:', error);
                showErrorMessage('한국어로 전환 중 오류가 발생했습니다.');
            }
        });
        
        // 저장된 언어 설정 불러오기
        try {
            if (isLocalStorageAvailable()) {
                const savedLanguage = localStorage.getItem('language');
                if (savedLanguage === 'ko') {
                    // 직접 클래스 조작 (클릭 이벤트 발생시키지 않음)
                    document.body.classList.add('ko');
                    langKo.classList.add('active');
                    langEn.classList.remove('active');
                }
            }
        } catch (error) {
            console.error('Error loading language preference:', error);
            // 오류 발생 시 기본값으로 영어 사용
            document.body.classList.remove('ko');
            langEn.classList.add('active');
            langKo.classList.remove('active');
        }
    } catch (error) {
        console.error('Critical error in language switcher:', error);
        showErrorMessage('언어 전환 기능 초기화 중 심각한 오류가 발생했습니다.');
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
    try {
        const filterButtons = document.querySelectorAll('.pub-nav-btn');
        
        if (!filterButtons.length) {
            console.warn('Publication filter buttons not found');
            return;
        }
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                try {
                    // 모든 버튼에서 active 클래스 제거
                    filterButtons.forEach(btn => btn.classList.remove('active'));
                    
                    // 클릭한 버튼에 active 클래스 추가
                    this.classList.add('active');
                    
                    // 필터 속성 가져오기
                    const filter = this.getAttribute('data-filter') || 'all';
                    
                    // 필터링 실행
                    filterPublications(filter);
                } catch (error) {
                    console.error('Error in filter button click:', error);
                    showErrorMessage('발행물 필터링 중 오류가 발생했습니다.');
                }
            });
        });
    } catch (error) {
        console.error('Error initializing publication filters:', error);
        showErrorMessage('발행물 필터 초기화 중 오류가 발생했습니다.');
    }
}

/**
 * Filter publications by type
 */
function filterPublications(filter) {
    try {
        const publications = document.querySelectorAll('.publication-item');
        
        if (!publications.length) {
            console.warn('No publications to filter');
            return;
        }
        
        // 필터가 없으면 'all'로 설정
        const safeFilter = filter || 'all';
        
        publications.forEach(pub => {
            if (safeFilter === 'all' || pub.classList.contains(safeFilter)) {
                pub.style.display = 'block';
            } else {
                pub.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Error filtering publications:', error);
        showErrorMessage('발행물 필터링 중 오류가 발생했습니다.');
    }
}

/**
 * Load and parse publications from the markdown file
 */
function loadPublications() {
    try {
        const publicationsContainer = document.getElementById('publications-list');
        
        if (!publicationsContainer) {
            console.warn('Publications container not found');
            return;
        }
        
        // 로딩 메시지 표시
        publicationsContainer.innerHTML = `
            <p class="loading-text en">Loading publications...</p>
            <p class="loading-text ko" style="display: none;">논문 로딩 중...</p>
        `;
        
        // 발행물 데이터 로드 (출처: publications.md)
        const publicationsData = [
            // Journals
            {
                title: "Differential Pricing-based Task Offloading for Delay-Sensitive IoT Applications in Mobile Edge Computing System",
                authors: "Hyeonseok Seo, Hyeontaek Oh, Jun Kyun Choi, <em>Sangdon Park*</em>",
                journal: "IEEE Internet of Things Journal, 2022 (Impact Factor 9.471, 3.416% for 2020 JCR Ranking)",
                link: "#",
                type: "journal"
            },
            {
                title: "Energy scheduling scheme for a charging facility considering the satisfaction of electric vehicle users",
                authors: "Jangkyum Kim, Joohyung Lee*, <em>Sangdon Park</em>, Jun Kyun Choi",
                journal: "IEEE ACCESS, 2021 (Impact Factor 3.367, 34.249% for 2020 JCR Ranking)",
                link: "#",
                type: "journal"
            },
            {
                title: "Lane Detection Aided Online Dead Reckoning for GNSS Denied Environments",
                authors: "Jinhwan Jeon, Yoonjin Hwang, Yongseop Jeong, <em>Sangdon Park</em>, In So Kweon, Seibum Choi*",
                journal: "Sensors, vol. 21, no. 20, pp. 6805, October, 2021 (Impact Factor 3.576, 21.094% for 2020 JCR Ranking)",
                link: "#",
                type: "journal"
            },
            {
                title: "A Multivariate Time Series Prediction-Based Adaptive Data Transmission Period Control Algorithm for IoT Networks",
                authors: "Jaeseob Han, Gyeong Ho Lee, <em>Sangdon Park*(co-corresponding)</em>, Joohyung Lee*, Jun Kyun Choi",
                journal: "IEEE Internet of Things Journal, Early Access (Impact Factor 9.471, 3.416% for 2020 JCR Ranking)",
                link: "https://ieeexplore.ieee.org/document/9598874",
                type: "journal"
            },
            {
                title: "Joint Subcarrier and Transmission Power Allocation in OFDMA-based WPT System for Mobile Edge Computing in IoT Environment",
                authors: "Jaeseob Han, Gyeong Ho Lee, <em>Sangdon Park*</em>, Jun Kyun Choi",
                journal: "IEEE Internet of Things Journal, Early Access (Impact Factor 9.471, 1.613% for 2020 JCR Ranking)",
                link: "https://ieeexplore.ieee.org/abstract/document/9516698",
                type: "journal"
            },
            {
                title: "Three Dynamic Pricing Schemes for Resource Allocation of Edge Computing for IoT Environment",
                authors: "Beomhan Baek, Joohyung Lee, Yuyang Peng, <em>Sangdon Park*</em>",
                journal: "IEEE Internet of Things Journal, vol. 7, no. 05., pp. 4292-4303, May, 2020 (Impact Factor 9.471, 3.416% for 2020 JCR Ranking)",
                link: "https://ieeexplore.ieee.org/document/8959172",
                type: "journal"
            },
            {
                title: "Competitive Data Trading Model with Privacy Valuation for Multiple Stakeholders in IoT Data Markets",
                authors: "Hyeontaek Oh, <em>Sangdon Park*</em>, Gyu Myoung Lee, Jun Kyun Choi, and Sungkee Noh",
                journal: "IEEE Internet of Things Journal, vol. 7, no. 04., pp. 3623-3639, April, 2020 (Impact Factor 9.471, 3.416% for 2020 JCR Ranking)",
                link: "https://ieeexplore.ieee.org/document/8998246/",
                type: "journal"
            },
            {
                title: "Battery Wear Model based Energy Trading in Electric Vehicles: A Naive Auction Model and a Market Analysis",
                authors: "Jangkyum Kim, Joohyung Lee*, <em>Sangdon Park</em>, and Jun Kyun Choi",
                journal: "IEEE Transactions on industrial informatics, vol. 15, no. 07, pp. 4140 - 4151, July, 2019 (Impact Factor 5.43, 2.13% for 2017 JCR Ranking)",
                link: "https://ieeexplore.ieee.org/document/8546796",
                type: "journal"
            },
            {
                title: "Optimal Throughput Analysis of Multiple Channel Access in Cognitive Radio Networks",
                authors: "<em>Sangdon Park</em>, Ganguk Hwang*, and Jun Kyun Choi",
                journal: "Annals of Operations Research, vol. 277, no. 02, pp. 345-370, June, 2019 (Impact Factor 1.864, 38.55% for 2017 JCR Ranking)",
                link: "https://doi.org/10.1007/s10479-017-2648-3",
                type: "journal"
            },
            {
                title: "Energy-Efficient Cooperative Transmission for Intelligent Transportation Systems",
                authors: "Yuyang Peng, Jun Li*, <em>Sangdon Park</em>, Konglin Zhu, Mohammad Mehedi Hassan, and Ahmed Alsanad",
                journal: "Future Generation Computer Systems, vol. 94, pp. 634-640, May, 2019 (Impact Factor 4.639, 6.80% for 2017 JCR Ranking)",
                link: "https://www.sciencedirect.com/science/article/pii/S0167739X18321319",
                type: "journal"
            },
            {
                title: "Comparison Between Seller and Buyer Pricing Systems for Energy Trading in Microgrids",
                authors: "Sohee Bae, and <em>Sangdon Park*</em>",
                journal: "IEEE Access, vol. 07, pp. 54084-54096, April, 2019 (Impact Factor 3.557, 16.22% for 2017 JCR Ranking)",
                link: "https://ieeexplore.ieee.org/document/8695014",
                type: "journal"
            },
            {
                title: "Power Efficient Clustering Scheme for 5G Mobile Edge Computing Environment",
                authors: "Jaewon Ahn, Joohyung Lee*, <em>Sangdon Park</em>, and Hong-sik Park",
                journal: "Springer Mobile Networks & Applications, vol. 24, no. 02, pp 643–652, April, 2019 (Impact Factor 2.497, 25.00% for 2017 JCR Ranking)",
                link: "https://link.springer.com/article/10.1007/s11036-018-1164-2",
                type: "journal"
            },
            {
                title: "Personal Data Trading Scheme for Data Brokers in IoT Data Marketplaces",
                authors: "Hyeontaek Oh, <em>Sangdon Park*</em>, Gyu Myoung Lee, Hwanjo Heo, and Jun Kyun Choi",
                journal: "IEEE Access, vol. 07, pp. 40120-40132, March, 2019 (Impact Factor 3.557, 16.22% for 2017 JCR Ranking)",
                link: "https://ieeexplore.ieee.org/document/8664564",
                type: "journal"
            },
            {
                title: "Load Profile Extraction by Mean-Shift Clustering with Sample Pearson Correlation Coefficient Distance",
                authors: "Nakyoung Kim, <em>Sangdon Park*</em>, Joohyung Lee, and Jun Kyun Choi",
                journal: "Energies, vol. 11, no. 09, pp. 2397, September, 2018 (Impact Factor 2.676, 49.48% for 2017 JCR Ranking)",
                link: "https://www.mdpi.com/1996-1073/11/9/2397",
                type: "journal"
            },
            {
                title: "Energy Trading System in Microgrids with Future Forecasting and Forecasting Errors",
                authors: "Gyohun Jeong, <em>Sangdon Park*(co-corresponding)</em>, Joohyung Lee, and Ganguk Hwang*",
                journal: "IEEE Access, vol. 06, pp. 44094-44106, August, 2018",
                link: "https://ieeexplore.ieee.org/document/8424153/",
                type: "journal"
            },
            {
                title: "An Optimal Pricing Scheme for the Energy Efficient Mobile Edge Computation Offloading with OFDMA",
                authors: "Sunghwan Kim, <em>Sangdon Park*</em>, Min Chen, and Chan-hyun Youn",
                journal: "IEEE Communications Letter, vol. 22, no. 09, pp. 1922-1925, June, 2018 (Impact Factor 2.723, 35.63% for 2017 JCR Ranking)",
                link: "https://ieeexplore.ieee.org/document/8392375/",
                type: "journal"
            },
            {
                title: "Three Hierarchical Levels of Big-data Market Model over Multiple Data Sources for Internet of Things",
                authors: "Busik Jang, <em>Sangdon Park*(co-corresponding)</em>, Joohyung Lee*, and Sang Geun Hahn",
                journal: "IEEE Access, vol. 06, pp. 31269-31280, June, 2018 (Impact Factor 3.557, 16.22% for 2017 JCR Ranking)",
                link: "https://ieeexplore.ieee.org/document/8374410/",
                type: "journal"
            },
            {
                title: "Competitive Partial Computation Offloading for Maximizing Energy Efficiency in Mobile Cloud Computing",
                authors: "Sanghong Ahn, Joohyung Lee*, <em>Sangdon Park*(co-corresponding)</em>, S.H. Shah Newaz and Jun Kyun Choi",
                journal: "IEEE Access, vol. 06, pp. 899-912, November, 2017 (Impact Factor 3.557, 16.22% for 2017 JCR Ranking)",
                link: "http://ieeexplore.ieee.org/document/8119910/",
                type: "journal"
            },
            {
                title: "Event-Driven Energy Trading System in Microgrids: Aperiodic Market Model Analysis with a Game Theoretic Approach",
                authors: "<em>Sangdon Park</em>, Joohyung Lee*, Ganguk Hwang, and Jun Kyun Choi",
                journal: "IEEE Access, vol. 05, pp. 26291-26302, November, 2017 (Impact Factor 3.557, 16.22% for 2017 JCR Ranking)",
                link: "http://ieeexplore.ieee.org/document/8093758/",
                type: "journal"
            },
            {
                title: "Learning-Based Adaptive Imputation Method With kNN Algorithm for Missing Power Data",
                authors: "Minkyung Kim, <em>Sangdon Park</em>, Joohyung Lee*, Yongjae Joo, and Jun Kyun Choi",
                journal: "Energies, vol. 10, no. 10, pp. 1668, October, 2017 (Impact Factor 2.676, 49.48% for 2017 JCR Ranking)",
                link: "http://www.mdpi.com/1996-1073/10/10/1668",
                type: "journal"
            },
            {
                title: "Contribution Based Energy Trading Mechanism in Micro-Grids for Future Smart Grid: A Game Theoretic Approach",
                authors: "<em>Sangdon Park</em>, Joohyung Lee*, Sohee Bae, Ganguk Hwang, and Jun Kyun Choi",
                journal: "IEEE Transactions on Industrial Electronics, vol. 63, no. 07, pp. 4255-4265, July 2016 (Impact Factor 7.168, 1.67% for 2016 JCR Ranking)",
                link: "http://ieeexplore.ieee.org/abstract/document/7422059/",
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
            {
                title: "Optimal Throughput Analysis of Random Access Policies for Cognitive Radio Networks with Multiple Channel Access",
                authors: "<em>Sangdon Park</em>, Ganguk Hwang* and Jun Kyun Choi",
                journal: "11th International Conference on Queueing Theory and Network Applications (QTNA), Wellington, New Zealand, December 23-15, 2016 (Best Student Paper Award)",
                link: "http://dl.acm.org/citation.cfm?id=3016035",
                type: "conference"
            },
            {
                title: "Joint optimal access and sensing policy on distributed cognitive radio networks with channel aggregation",
                authors: "<em>Sangdon Park</em>, Jaedeok Kim, Ganguk Hwang* and Jun Kyun Choi",
                journal: "IEEE 9th International Conference on Ubiquitous and Future Networks (ICUFN), Vienna, Austria, July 5-8, 2016",
                link: "http://ieeexplore.ieee.org/abstract/document/7537027/",
                type: "conference"
            },
            {
                title: "Maximizing energy efficiency in off-peak hours: A novel sleep scheme for WLAN access points",
                authors: "Hyeontaek Oh, S. H. S. Newaz, <em>Sangdon Park</em> and Jun Kyun Choi*",
                journal: "IEEE/IFIP Network Operations and Management Symposium (NOMS), Turkey, Istanbul, April 25-29 2016",
                link: "http://ieeexplore.ieee.org/abstract/document/7502830/",
                type: "conference"
            },
            {
                title: "Energy efficient relay selection scheme with DRX mechanism in 3GPP LTE network",
                authors: "Seonghwa Yun, Kyeongmin Lee, <em>Sangdon Park</em> and Jun Kyun Choi*",
                journal: "IEEE International Conference on ICT Convergence (ICTC), Jeju Island, South Korea, October 14-16, 2013",
                link: "http://ieeexplore.ieee.org/abstract/document/6675296/",
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
            {
                title: "A proposal for definitions of energy efficiency class of network equipment (Y.energyECN)",
                authors: "<em>Sangdon Park</em>, Gyu Myoung Lee, Jun Kyun Choi",
                journal: "ITU-T SG13 meeting (Kampala, 4 – 15 November 2013), COM13-C401-E, November 2013",
                link: "#",
                type: "standard"
            },
            {
                title: "Consideration of classification of sleep mode control on network equipment",
                authors: "<em>Sangdon Park</em>, Seung Hyun Jeon, Jun Kyun Choi and Jeong Yun Kim",
                journal: "ITU-T SG13 Rapporteurs meeting (Geneva, 17-27 June 2013), SG13RGM-C-06, June 2013",
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
        
        // 컨테이너 비우기
        publicationsContainer.innerHTML = '';
        
        // 발행물 항목 없을 경우 메시지 표시
        if (publicationsData.length === 0) {
            publicationsContainer.innerHTML = `
                <p class="loading-text en">No publications found.</p>
                <p class="loading-text ko" style="display: none;">논문이 없습니다.</p>
            `;
            return;
        }
        
        // 각 발행물을 DOM에 추가
        publicationsData.forEach(pub => {
            try {
                const pubElement = document.createElement('div');
                pubElement.className = `publication-item ${pub.type || 'other'}`;
                
                // HTML 콘텐츠 생성
                pubElement.innerHTML = `
                    <h3>${pub.title || '제목 없음'}</h3>
                    <p class="publication-authors">${pub.authors || '저자 정보 없음'}</p>
                    <p class="publication-journal">${pub.journal || '출처 정보 없음'}</p>
                    <a href="${pub.link || '#'}" class="publication-link" target="_blank">
                        <span class="en">View Publication</span>
                        <span class="ko" style="display: none;">논문 보기</span>
                        <i class="fas fa-external-link-alt"></i>
                    </a>
                `;
                
                publicationsContainer.appendChild(pubElement);
            } catch (itemError) {
                console.error('Error creating publication item:', itemError, pub);
            }
        });
        
        // 현재 언어 설정에 맞게 표시 조정
        if (document.body.classList.contains('ko')) {
            const enElements = publicationsContainer.querySelectorAll('.en');
            const koElements = publicationsContainer.querySelectorAll('.ko');
            
            enElements.forEach(el => { el.style.display = 'none'; });
            koElements.forEach(el => { el.style.display = 'inline-block'; });
        }
        
    } catch (error) {
        console.error('Error loading publications:', error);
        
        // 에러 메시지 표시
        const container = document.getElementById('publications-list');
        if (container) {
            container.innerHTML = `
                <p class="loading-text en">Error loading publications. Please try again later.</p>
                <p class="loading-text ko" style="display: none;">논문 로드 중 오류가 발생했습니다. 나중에 다시 시도해주세요.</p>
            `;
            
            // 현재 언어 설정에 맞게 표시 조정
            if (document.body.classList.contains('ko')) {
                const enElements = container.querySelectorAll('.en');
                const koElements = container.querySelectorAll('.ko');
                
                enElements.forEach(el => { el.style.display = 'none'; });
                koElements.forEach(el => { el.style.display = 'block'; });
            }
        }
        
        showErrorMessage('발행물을 로드하는 중 오류가 발생했습니다.');
    }
}
