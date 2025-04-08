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

    // Helper function to parse author string
    function parseAuthors(authorString, role) {
        if (!authorString) return '';
        const authors = authorString.split('; ').map(part => {
            part = part.trim();
            const matchFull = part.match(/^.*\[([^\]]+)\]$/);
            let name = '';
            if (matchFull) {
                name = matchFull[1].trim(); // Extract full name from brackets
            } else {
                 // Fallback if no brackets - use the part before the first comma if possible
                 const commaIndex = part.indexOf(',');
                 name = commaIndex !== -1 ? part.substring(0, commaIndex).trim() : part;
                 // This fallback might need more refinement depending on data consistency
            }

            // Highlight 'Sangdon Park'
            if (name.toLowerCase() === 'park, sangdon' || name.toLowerCase() === 'sangdon park' || part.toLowerCase().startsWith('park, s')) {
                return `<em>Sangdon Park</em>`;
            }
            // Specific correction based on file data
            if (part.startsWith('김성환') && name === 'Kim, Seong-Hwan') return 'Seong-Hwan Kim';
            if (part.startsWith('An, S') && name === 'An, Sanghong') return 'Sanghong An';
            if (part.startsWith('Jang, B') && name === 'Jang, Busik') return 'Busik Jang';
            if (part.startsWith('Kim, M') && name === 'Kim, Minkyung') return 'Minkyung Kim';
            if (part.startsWith('Kim, N') && name === 'Kim, Nakyoung') return 'Nakyoung Kim';
            if (part.startsWith('Jeong, G') && name === 'Jeong, Gyohun') return 'Gyohun Jeong';
            if (part.startsWith('Ahn, J') && name === 'Ahn, Jaewon') return 'Jaewon Ahn';
            if (part.startsWith('Peng, YY') && name === 'Peng, Yuyang') return 'Yuyang Peng';
            if (part.startsWith('Bae, S') && name === 'Bae, Sohee') return 'Sohee Bae';
            if (part.startsWith('Oh, H') && name === 'Oh, Hyeontaek') return 'Hyeontaek Oh';
            if (part.startsWith('Jeon, J') && name === 'Jeon, Jinhwan') return 'Jinhwan Jeon';
            if (part.startsWith('Han, J') && name === 'Han, Jaeseob') return 'Jaeseob Han';
            if (part.startsWith('Kim, J') && name === 'Kim, Jangkyum') return 'Jangkyum Kim';
            if (part.startsWith('Seo, H') && name === 'Seo, Hyeonseok') return 'Hyeonseok Seo';
            if (part.startsWith('Mohammed, A') && name === 'Mohammed, Alaelddin F. Y.') return 'Alaelddin F. Y. Mohammed';
            // Add other known mappings if necessary...

            // Attempt to reverse names like 'Lee, Joohyung' -> 'Joohyung Lee'
            const nameParts = name.split(', ');
            if (nameParts.length === 2) {
                return `${nameParts[1]} ${nameParts[0]}`;
            }

            return name; // Return the extracted name or fallback
        }).filter(name => name).join(', ');

        // Add role marker
        if (role === '교신저자') {
            return authors + '*';
        } else if (role === '제1저자') {
            return authors + '†';
        }
        return authors;
    }

    // Helper function to format journal info string
    function formatJournalInfo(name, year, vol, no, startPage, endPage) {
        let info = name ? name.trim() : '';
        if (vol) {
            info += `, Vol. ${vol.trim()}`;
            if (no && no.trim() !== '') { // Check if 'no' is not empty
                info += `(${no.trim()})`;
            }
        }
        if (startPage && startPage.trim() !== '' && endPage && endPage.trim() !== '') {
            info += `, pp. ${startPage.trim()}-${endPage.trim()}`;
        } else if (startPage && startPage.trim() !== '') {
            info += `, p. ${startPage.trim()}`;
        }
        if (year) {
            info += `, ${year.trim()}`;
        }
        return info;
    }

    // Publications data strictly based on my_journal.txt
    const publicationsData = [
      {
        title: "Dynamic Bandwidth Slicing in Passive Optical Networks to Empower Federated Learning",
        authors: parseAuthors("Mohammed, A[Mohammed, Alaelddin F. Y.]; Lee, J[Lee, Joohyung]; Park, S[Park, Sangdon]", "교신저자"),
        journalInfo: formatJournalInfo("SENSORS", "2024", "24", "15", "", ""),
        link: "https://doi.org/10.3390/s24155000",
        type: "journal",
        citations: 0 // SCOPUS TC: 0
      },
      {
        title: "Real-Time Dynamic Pricing for Edge Computing Services: A Market Perspective",
        authors: parseAuthors("Park, SD[Park, Sangdon]; Bae, S[Bae, Sohee]; Lee, J[Lee, Joohyung]; Sung, Y[Sung, Youngchul]", "제1저자"),
        journalInfo: formatJournalInfo("IEEE ACCESS", "2024", "12", "", "134754", "134769"),
        link: "https://doi.org/10.1109/ACCESS.2024.3462499",
        type: "journal",
        citations: 0 // SCOPUS TC: 0
      },
      {
        title: "Differential Pricing-Based Task Offloading for Delay-Sensitive IoT Applications in Mobile Edge Computing System",
        authors: parseAuthors("Seo, H[Seo, Hyeonseok]; Oh, H[Oh, Hyeontaek]; Choi, JK[Choi, Jun Kyun]; Park, S[Park, Sangdon]", "교신저자"),
        journalInfo: formatJournalInfo("IEEE INTERNET OF THINGS JOURNAL", "2022", "9", "19", "19116", "19131"),
        link: "https://doi.org/10.1109/JIOT.2022.3163820",
        type: "journal",
        citations: 21 // SCOPUS TC: 21
      },
      {
        title: "Joint Subcarrier and Transmission Power Allocation in OFDMA-Based WPT System for Mobile-Edge Computing in IoT Environment",
        authors: parseAuthors("Han, J[Han, Jaeseob]; Lee, GH[Lee, Gyeong Ho]; Park, S[Park, Sangdon]; Choi, JK[Choi, Jun Kyun]", "교신저자"),
        journalInfo: formatJournalInfo("IEEE INTERNET OF THINGS JOURNAL", "2022", "9", "16", "15039", "15052"),
        link: "https://doi.org/10.1109/JIOT.2021.3103768",
        type: "journal",
        citations: 27 // SCOPUS TC: 27
      },
      {
        title: "A Novel Cooperative Transmission Scheme in UAV-Assisted Wireless Sensor Networks",
        authors: parseAuthors("Zang, Y[Zang, Yue]; Peng, YY[Peng, Yuyang]; Park, S[Park, Sangdon]; Hai, H[Hai, Han]; AL-Hazemi, F[AL-Hazemi, Fawaz]; Mirza, MM[Mirza, Mohammad Meraj]", "공동저자"),
        journalInfo: formatJournalInfo("ELECTRONICS", "2022", "11", "4", "", ""),
        link: "https://doi.org/10.3390/electronics11040600",
        type: "journal",
        citations: 2 // SCOPUS TC: 2
      },
      {
        title: "Power Scheduling Scheme for a Charging Facility Considering the Satisfaction of Electric Vehicle Users",
        authors: parseAuthors("Kim, J[Kim, Jangkyum]; Lee, J[Lee, Joohyung]; Park, S[Park, Sangdon]; Choi, JK[Choi, Jun Kyun]", "공동저자"),
        journalInfo: formatJournalInfo("IEEE ACCESS", "2022", "10", "", "25153", "25164"),
        link: "https://doi.org/10.1109/ACCESS.2022.3151355",
        type: "journal",
        citations: 14 // SCOPUS TC: 14
      },
      {
        title: "A Multivariate-Time-Series-Prediction-Based Adaptive Data Transmission Period Control Algorithm for IoT Networks",
        authors: parseAuthors("Han, J[Han, Jaeseob]; Lee, GH[Lee, Gyeong Ho]; Park, S[Park, Sangdon]; Lee, J[Lee, Joohyung]; Choi, JK[Choi, Jun Kyun]", "교신저자"),
        journalInfo: formatJournalInfo("IEEE INTERNET OF THINGS JOURNAL", "2022", "9", "1", "419", "436"),
        link: "https://doi.org/10.1109/JIOT.2021.3124673",
        type: "journal",
        citations: 24 // SCOPUS TC: 24
      },
      {
        title: "Lane Detection Aided Online Dead Reckoning for GNSS Denied Environments",
        authors: parseAuthors("Jeon, J[Jeon, Jinhwan]; Hwang, Y[Hwang, Yoonjin]; Jeong, Y[Jeong, Yongseop]; Park, S[Park, Sangdon]; Kweon, IS[Kweon, In So]; Choi, SB[Choi, Seibum B.]", "공동저자"),
        journalInfo: formatJournalInfo("SENSORS", "2021", "21", "20", "", ""),
        link: "https://doi.org/10.3390/s21206805",
        type: "journal",
        citations: 7 // SCOPUS TC: 7
      },
       {
        title: "Cost optimization of distributed data centers via computing workload distribution for next generation network systems",
        authors: parseAuthors("Peng, YY[Peng, Yuyang]; Li, J[Li, Jun]; Hai, H[Hai, Han]; Jiang, XQ[Jiang, Xue-Qin]; Al-Hazemi, F[Al-Hazemi, Fawaz]; Park, S[Park, Sangdon]", "공동저자"),
        journalInfo: formatJournalInfo("PHYSICAL COMMUNICATION", "2021", "46", "", "", ""), // Page numbers seem missing (101340 looks like article number)
        link: "https://doi.org/10.1016/j.phycom.2021.101340",
        type: "journal",
        citations: 4 // SCOPUS TC: 4
      },
      {
        title: "Deposit Decision Model for Data Brokers in Distributed Personal Data Markets Using Blockchain",
        authors: parseAuthors("Oh, H[Oh, Hyeontaek]; Park, S[Park, Sangdon]; Choi, JK[Choi, Jun Kyun]; Noh, S[Noh, Sungkee]", "교신저자"),
        journalInfo: formatJournalInfo("IEEE ACCESS", "2021", "9", "", "114715", "114726"),
        link: "https://doi.org/10.1109/ACCESS.2021.3104870",
        type: "journal",
        citations: 5 // SCOPUS TC: 5
      },
      {
        title: "Three Dynamic Pricing Schemes for Resource Allocation of Edge Computing for IoT Environment",
        authors: parseAuthors("Baek, B[Baek, Beomhan]; Lee, J[Lee, Joohyung]; Peng, YY[Peng, Yuyang]; Park, S[Park, Sangdon]", "교신저자"),
        journalInfo: formatJournalInfo("IEEE INTERNET OF THINGS JOURNAL", "2020", "7", "5", "4292", "4303"),
        link: "https://doi.org/10.1109/JIOT.2020.2966627",
        type: "journal",
        citations: 81 // SCOPUS TC: 81
      },
      {
        title: "Competitive Data Trading Model With Privacy Valuation for Multiple Stakeholders in IoT Data Markets",
        authors: parseAuthors("Oh, H[Oh, Hyeontaek]; Park, S[Park, Sangdon]; Lee, GM[Lee, Gyu Myoung]; Choi, JK[Choi, Jun Kyun]; Noh, S[Noh, Sungkee]", "교신저자"),
        journalInfo: formatJournalInfo("IEEE INTERNET OF THINGS JOURNAL", "2020", "7", "4", "3623", "3639"),
        link: "https://doi.org/10.1109/JIOT.2020.2973662",
        type: "journal",
        citations: 58 // SCOPUS TC: 58
      },
      {
        title: "Time Series Forecasting Based Day-Ahead Energy Trading in Microgrids: Mathematical Analysis and Simulation",
        authors: parseAuthors("Jeong, G[Jeong, Gyohun]; Park, S[Park, Sangdon]; Hwang, G[Hwang, Ganguk]", "공동저자"),
        journalInfo: formatJournalInfo("IEEE ACCESS", "2020", "8", "", "63885", "63900"),
        link: "https://doi.org/10.1109/ACCESS.2020.2985258",
        type: "journal",
        citations: 6 // SCOPUS TC: 6
      },
       {
        title: "Battery-Wear-Model-Based Energy Trading in Electric Vehicles: A Naive Auction Model and a Market Analysis",
        authors: parseAuthors("Kim, J[Kim, Jangkyum]; Lee, J[Lee, Joohyung]; Park, S[Park, Sangdon]; Choi, JK[Choi, Jun Kyun]", "공동저자"),
        journalInfo: formatJournalInfo("IEEE TRANSACTIONS ON INDUSTRIAL INFORMATICS", "2019", "15", "7", "4140", "4151"),
        link: "https://doi.org/10.1109/TII.2018.2883655",
        type: "journal",
        citations: 36 // SCOPUS TC: 36
      },
      {
        title: "Optimal throughput analysis of multiple channel access in cognitive radio networks",
        authors: parseAuthors("Park, S[Park, Sangdon]; Hwang, G[Hwang, Ganguk]; Choi, JK[Choi, Jun Kyun]", "제1저자"),
        journalInfo: formatJournalInfo("ANNALS OF OPERATIONS RESEARCH", "2019", "277", "2", "345", "370"),
        link: "https://doi.org/10.1007/s10479-017-2648-3",
        type: "journal",
        citations: 3 // SCOPUS TC: 3
      },
      {
        title: "Energy-efficient cooperative transmission for intelligent transportation systems",
        authors: parseAuthors("Peng, YY[Peng, Yuyang]; Li, J[Li, Jun]; Park, S[Park, Sangdon]; Zhu, KL[Zhu, Konglin]; Hassan, MM[Hassan, Mohammad Mehedi]; Alsanad, A[Alsanad, Ahmed]", "공동저자"),
        journalInfo: formatJournalInfo("FUTURE GENERATION COMPUTER SYSTEMS-THE INTERNATIONAL JOURNAL OF ESCIENCE", "2019", "94", "", "634", "640"),
        link: "https://doi.org/10.1016/j.future.2018.11.053",
        type: "journal",
        citations: 22 // SCOPUS TC: 22
      },
      {
        title: "Power Efficient Clustering Scheme for 5G Mobile Edge Computing Environment",
        authors: parseAuthors("Ahn, J[Ahn, Jaewon]; Lee, J[Lee, Joohyung]; Park, S[Park, Sangdon]; Park, HS[Park, Hong-Shik]", "공동저자"),
        journalInfo: formatJournalInfo("MOBILE NETWORKS & APPLICATIONS", "2019", "24", "2", "643", "652"),
        link: "https://doi.org/10.1007/s11036-018-1164-2",
        type: "journal",
        citations: 14 // SCOPUS TC: 14
      },
       {
        title: "Personal Data Trading Scheme for Data Brokers in IoT Data Marketplaces",
        authors: parseAuthors("Oh, H[Oh, Hyeontaek]; Park, S[Park, Sangdon]; Lee, GM[Lee, Gyu Myoung]; Heo, H[Heo, Hwanjo]; Choi, JK[Choi, Jun Kyun]", "교신저자"),
        journalInfo: formatJournalInfo("IEEE ACCESS", "2019", "7", "", "40120", "40132"),
        link: "https://doi.org/10.1109/ACCESS.2019.2904248",
        type: "journal",
        citations: 56 // SCOPUS TC: 56
      },
      {
        title: "Comparison Between Seller and Buyer Pricing Systems for Energy Trading in Microgrids",
        authors: parseAuthors("Bae, S[Bae, Sohee]; Park, S[Park, Sangdon]", "교신저자"),
        journalInfo: formatJournalInfo("IEEE ACCESS", "2019", "7", "", "54084", "54096"),
        link: "https://doi.org/10.1109/ACCESS.2019.2912758",
        type: "journal",
        citations: 2 // SCOPUS TC: 2
      },
       {
        title: "Load Profile Extraction by Mean-Shift Clustering with Sample Pearson Correlation Coefficient Distance",
        authors: parseAuthors("Kim, N[Kim, Nakyoung]; Park, S[Park, Sangdon]; Lee, J[Lee, Joohyung]; Choi, JK[Choi, Jun Kyun]", "교신저자"),
        journalInfo: formatJournalInfo("ENERGIES", "2018", "11", "9", "", ""), // Page numbers seem missing (2397 looks like article number)
        link: "https://doi.org/10.3390/en11092397",
        type: "journal",
        citations: 14 // SCOPUS TC: 14
      },
      {
        title: "An Optimal Pricing Scheme for the Energy-Efficient Mobile Edge Computation Offloading With OFDMA",
        authors: parseAuthors("김성환[Kim, Seong-Hwan]; Park, S[Park, Sangdon]; Chen, M[Chen, Min]; Youn, CH[Youn, Chan-Hyun]", "교신저자"), // Corrected author parsing for Korean name
        journalInfo: formatJournalInfo("IEEE COMMUNICATIONS LETTERS", "2018", "22", "9", "1922", "1925"),
        link: "https://doi.org/10.1109/LCOMM.2018.2849401",
        type: "journal",
        citations: 59 // SCOPUS TC: 59
      },
      {
        title: "Three Hierarchical Levels of Big-Data Market Model Over Multiple Data Sources for Internet of Things",
        authors: parseAuthors("Jang, B[Jang, Busik]; Park, SD[Park, Sangdon]; Lee, J[Lee, Joohyung]; Hahn, SG[Hahn, Sang-Geun]", "교신저자"),
        journalInfo: formatJournalInfo("IEEE ACCESS", "2018", "6", "", "31269", "31280"),
        link: "https://doi.org/10.1109/ACCESS.2018.2845105",
        type: "journal",
        citations: 25 // SCOPUS TC: 25
      },
       {
        title: "Competitive Partial Computation Offloading for Maximizing Energy Efficiency in Mobile Cloud Computing",
        authors: parseAuthors("An, S[An, Sanghong]; Lee, J[Lee, Joohyung]; Park, S[Park, Sangdon]; Newaz, SHS[Newaz, S. H. Shah]; Choi, JK[Choi, Jun Kyun]", "교신저자"),
        journalInfo: formatJournalInfo("IEEE ACCESS", "2018", "6", "", "899", "912"),
        link: "https://doi.org/10.1109/ACCESS.2017.2776323",
        type: "journal",
        citations: 30 // SCOPUS TC: 30
      },
       {
        title: "Event-Driven Energy Trading System in Microgrids: Aperiodic Market Model Analysis with a Game Theoretic Approach",
        authors: parseAuthors("Park, S[Park, Sangdon]; Lee, J[Lee, Joohyung]; Hwang, G[Hwang, Ganguk]; Choi, JK[Choi, Jun Kyun]", "제1저자"),
        journalInfo: formatJournalInfo("IEEE ACCESS", "2017", "5", "", "26291", "26302"),
        link: "https://doi.org/10.1109/ACCESS.2017.2766233",
        type: "journal",
        citations: 40 // SCOPUS TC: 40
      },
      {
        title: "Learning-Based Adaptive Imputation Method with kNN Algorithm for Missing Power Data",
        authors: parseAuthors("Kim, M[Kim, Minkyung]; Park, S[Park, Sangdon]; Lee, J[Lee, Joohyung]; Joo, Y[Joo, Yongjae]; Choi, JK[Choi, Jun Kyun]", "공동저자"),
        journalInfo: formatJournalInfo("ENERGIES", "2017", "10", "10", "", ""), // Page numbers seem missing (1668 looks like article number)
        link: "https://doi.org/10.3390/en10101668",
        type: "journal",
        citations: 60 // SCOPUS TC: 60
      },
      {
        title: "Contribution-Based Energy-Trading Mechanism in Microgrids for Future Smart Grid: A Game Theoretic Approach",
        authors: parseAuthors("Park, SD[Park, Sangdon]; Lee, J[Lee, Joohyung]; Bae, S[Bae, Sohee]; Hwang, GU[Hwang, Ganguk]; Choi, JK[Choi, Jun Kyun]", "제1저자"),
        journalInfo: formatJournalInfo("IEEE TRANSACTIONS ON INDUSTRIAL ELECTRONICS", "2016", "63", "7", "4255", "4265"),
        link: "https://doi.org/10.1109/TIE.2016.2532842",
        type: "journal",
        citations: 175 // SCOPUS TC: 175
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
        pubElement.className = `publication-item ${pub.type || 'unknown'}`;

        // Use journalInfo for the main publication details line
        pubElement.innerHTML = `
            <h3>${pub.title}</h3>
            <p class="publication-authors">${pub.authors}</p>
            <p class="publication-journal">${pub.journalInfo}</p>
            <div class="publication-footer">
                 <a href="${pub.link || '#'}" class="publication-link" target="_blank" rel="noopener noreferrer">
                    ${pub.link && pub.link !== '#' ? 'DOI 링크' : '링크 없음'} <i class="fas fa-external-link-alt"></i>
                 </a>
                 ${pub.citations !== undefined && pub.citations !== null ?
                    `<span class="publication-citations"><i class="fas fa-quote-left"></i> 인용 (SCOPUS): ${pub.citations}</span>` : ''
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

// Function to format journal info string
function formatJournalInfo(name, year, vol, no, startPage, endPage) {
    let info = name ? name.trim() : '';
    if (vol) {
        info += `, Vol. ${vol.trim()}`;
        if (no && no.trim() !== '') { // Check if 'no' is not empty
            info += `(${no.trim()})`;
        }
    }
    if (startPage && startPage.trim() !== '' && endPage && endPage.trim() !== '') {
        info += `, pp. ${startPage.trim()}-${endPage.trim()}`;
    } else if (startPage && startPage.trim() !== '') {
        info += `, p. ${startPage.trim()}`;
    }
    if (year) {
        info += `, ${year.trim()}`;
    }
    return info;
}