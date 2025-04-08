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
    // Determine the current page to decide which lists to populate
    const currentPage = window.location.pathname.split('/').pop(); // e.g., "ko.html", "publications.html"
    const isMainPage = currentPage === 'ko.html' || currentPage === 'en.html' || currentPage === ''; // Index might resolve to empty
    const isPublicationsPage = currentPage === 'publications.html';

    const allPublicationsContainer = document.getElementById('publications-list');
    const selectedPublicationsContainer = document.getElementById('selected-publications-list');

    // Ensure required containers exist based on the page
    if (isMainPage && !selectedPublicationsContainer) {
        console.error("Selected publications container not found on main page!");
        // Optional: Don't stop execution, just skip this part
    }
    if (isPublicationsPage && !allPublicationsContainer) {
        console.error("All publications container not found on publications page!");
        return; // Stop if the main container for this page is missing
    }
    // If neither container exists on a page where it's expected, log error
    if (!allPublicationsContainer && !selectedPublicationsContainer) {
         console.error("Publication containers not found!");
         return;
    }

    // Helper function to parse author string (ensure it's defined before use)
    function parseAuthors(authorString, role) {
        if (!authorString) return '';
        const authors = authorString.split('; ').map(part => {
            part = part.trim();
            const matchFull = part.match(/^.*\[([^\]]+)\]$/);
            let name = '';
            let isTargetAuthor = false;

            if (matchFull) {
                name = matchFull[1].trim(); // Extract full name from brackets
            } else {
                 const commaIndex = part.indexOf(',');
                 name = commaIndex !== -1 ? part.substring(0, commaIndex).trim() : part;
            }

            // Check if this is the target author (Sangdon Park)
            if (name.toLowerCase() === 'park, sangdon' || name.toLowerCase() === 'sangdon park' || part.toLowerCase().startsWith('park, s')) {
                isTargetAuthor = true;
                name = 'Sangdon Park'; // Standardize the name
            }

            // Specific correction based on file data
            if (part.startsWith('김성환') && name === 'Kim, Seong-Hwan') name = 'Seong-Hwan Kim';
            if (part.startsWith('An, S') && name === 'An, Sanghong') name = 'Sanghong An';
            if (part.startsWith('Jang, B') && name === 'Jang, Busik') name = 'Busik Jang';
            if (part.startsWith('Kim, M') && name === 'Kim, Minkyung') name = 'Minkyung Kim';
            if (part.startsWith('Kim, N') && name === 'Kim, Nakyoung') name = 'Nakyoung Kim';
            if (part.startsWith('Jeong, G') && name === 'Jeong, Gyohun') name = 'Gyohun Jeong';
            if (part.startsWith('Ahn, J') && name === 'Ahn, Jaewon') name = 'Jaewon Ahn';
            if (part.startsWith('Peng, YY') && name === 'Peng, Yuyang') name = 'Yuyang Peng';
            if (part.startsWith('Bae, S') && name === 'Bae, Sohee') name = 'Sohee Bae';
            if (part.startsWith('Oh, H') && name === 'Oh, Hyeontaek') name = 'Hyeontaek Oh';
            if (part.startsWith('Jeon, J') && name === 'Jeon, Jinhwan') name = 'Jinhwan Jeon';
            if (part.startsWith('Han, J') && name === 'Han, Jaeseob') name = 'Jaeseob Han';
            if (part.startsWith('Kim, J') && name === 'Kim, Jangkyum') name = 'Jangkyum Kim';
            if (part.startsWith('Seo, H') && name === 'Seo, Hyeonseok') name = 'Hyeonseok Seo';
            if (part.startsWith('Mohammed, A') && name === 'Mohammed, Alaelddin F. Y.') name = 'Alaelddin F. Y. Mohammed';

            // Attempt to reverse names like 'Lee, Joohyung' -> 'Joohyung Lee' if not already handled
            if (name.includes(', ')) {
                const nameParts = name.split(', ');
                if (nameParts.length === 2 && !isTargetAuthor) {
                     name = `${nameParts[1]} ${nameParts[0]}`;
                }
            }

            // Apply marker *directly* to the target author
            if (isTargetAuthor) {
                let marker = '';
                if (role === '교신저자') {
                    marker = '*';
                } else if (role === '제1저자') {
                    marker = '†';
                }
                return `<em>${name}${marker}</em>`; // Add marker inside <em>
            }

            return name; // Return the processed name
        }).filter(name => name && name.trim() !== '').join(', ');

        return authors;
    }

    // Helper function to format journal info string (ensure it's defined before use)
    function formatJournalInfo(name, year, vol, no, startPage, endPage) {
        let rawName = name ? name.trim() : '';
        let formattedName = '';
        if (rawName) {
             formattedName = rawName.toLowerCase().split(' ').map((word, index, arr) => {
                 if (['ieee', 'ifip', 'acm', 'itu-t'].includes(word)) {
                     return word.toUpperCase();
                 }
                 if (word === '5g') {
                    return '5G';
                 }
                 const shortWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'in', 'of', 'on', 'or', 'the', 'to', 'via', 'with'];
                  if (index === 0 || index === arr.length - 1 || !shortWords.includes(word)) {
                      if (word.includes('&')) {
                          return word.split('&').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('&');
                      }
                      return word.charAt(0).toUpperCase() + word.slice(1);
                  }
                  return word;
             }).join(' ');
            formattedName = formattedName.replace(/-([a-z])/g, (match, char) => `-${char.toUpperCase()}`);
        }

        let info = formattedName;
        if (vol) {
            info += `, Vol. ${vol.trim()}`;
            if (no && no.trim() !== '') {
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

    // Publications data strictly based on my_journal.txt (Parsed in previous step)
    const publicationsData = [
      {
        title: "Dynamic Bandwidth Slicing in Passive Optical Networks to Empower Federated Learning",
        rawAuthors: "Mohammed, A[Mohammed, Alaelddin F. Y.]; Lee, J[Lee, Joohyung]; Park, S[Park, Sangdon]", role: "교신저자",
        journal: "SENSORS", year: "2024", vol: "24", no: "15", startPage: "", endPage: "",
        link: "https://doi.org/10.3390/s24155000", type: "journal", citations: 0
      },
      {
        title: "Real-Time Dynamic Pricing for Edge Computing Services: A Market Perspective",
        rawAuthors: "Park, SD[Park, Sangdon]; Bae, S[Bae, Sohee]; Lee, J[Lee, Joohyung]; Sung, Y[Sung, Youngchul]", role: "제1저자",
        journal: "IEEE ACCESS", year: "2024", vol: "12", no: "", startPage: "134754", endPage: "134769",
        link: "https://doi.org/10.1109/ACCESS.2024.3462499", type: "journal", citations: 0
      },
      {
        title: "Differential Pricing-Based Task Offloading for Delay-Sensitive IoT Applications in Mobile Edge Computing System",
        rawAuthors: "Seo, H[Seo, Hyeonseok]; Oh, H[Oh, Hyeontaek]; Choi, JK[Choi, Jun Kyun]; Park, S[Park, Sangdon]", role: "교신저자",
        journal: "IEEE INTERNET OF THINGS JOURNAL", year: "2022", vol: "9", no: "19", startPage: "19116", endPage: "19131",
        link: "https://doi.org/10.1109/JIOT.2022.3163820", type: "journal", citations: 21
      },
      {
        title: "Joint Subcarrier and Transmission Power Allocation in OFDMA-Based WPT System for Mobile-Edge Computing in IoT Environment",
        rawAuthors: "Han, J[Han, Jaeseob]; Lee, GH[Lee, Gyeong Ho]; Park, S[Park, Sangdon]; Choi, JK[Choi, Jun Kyun]", role: "교신저자",
        journal: "IEEE INTERNET OF THINGS JOURNAL", year: "2022", vol: "9", no: "16", startPage: "15039", endPage: "15052",
        link: "https://doi.org/10.1109/JIOT.2021.3103768", type: "journal", citations: 27
      },
      {
        title: "A Novel Cooperative Transmission Scheme in UAV-Assisted Wireless Sensor Networks",
        rawAuthors: "Zang, Y[Zang, Yue]; Peng, YY[Peng, Yuyang]; Park, S[Park, Sangdon]; Hai, H[Hai, Han]; AL-Hazemi, F[AL-Hazemi, Fawaz]; Mirza, MM[Mirza, Mohammad Meraj]", role: "공동저자",
        journal: "ELECTRONICS", year: "2022", vol: "11", no: "4", startPage: "", endPage: "",
        link: "https://doi.org/10.3390/electronics11040600", type: "journal", citations: 2
      },
      {
        title: "Power Scheduling Scheme for a Charging Facility Considering the Satisfaction of Electric Vehicle Users",
        rawAuthors: "Kim, J[Kim, Jangkyum]; Lee, J[Lee, Joohyung]; Park, S[Park, Sangdon]; Choi, JK[Choi, Jun Kyun]", role: "공동저자",
        journal: "IEEE ACCESS", year: "2022", vol: "10", no: "", startPage: "25153", endPage: "25164",
        link: "https://doi.org/10.1109/ACCESS.2022.3151355", type: "journal", citations: 14
      },
      {
        title: "A Multivariate-Time-Series-Prediction-Based Adaptive Data Transmission Period Control Algorithm for IoT Networks",
        rawAuthors: "Han, J[Han, Jaeseob]; Lee, GH[Lee, Gyeong Ho]; Park, S[Park, Sangdon]; Lee, J[Lee, Joohyung]; Choi, JK[Choi, Jun Kyun]", role: "교신저자",
        journal: "IEEE INTERNET OF THINGS JOURNAL", year: "2022", vol: "9", no: "1", startPage: "419", endPage: "436",
        link: "https://doi.org/10.1109/JIOT.2021.3124673", type: "journal", citations: 24
      },
      {
        title: "Lane Detection Aided Online Dead Reckoning for GNSS Denied Environments",
        rawAuthors: "Jeon, J[Jeon, Jinhwan]; Hwang, Y[Hwang, Yoonjin]; Jeong, Y[Jeong, Yongseop]; Park, S[Park, Sangdon]; Kweon, IS[Kweon, In So]; Choi, SB[Choi, Seibum B.]", role: "공동저자",
        journal: "SENSORS", year: "2021", vol: "21", no: "20", startPage: "", endPage: "", // 6805 is article number
        link: "https://doi.org/10.3390/s21206805", type: "journal", citations: 7
      },
       {
        title: "Cost optimization of distributed data centers via computing workload distribution for next generation network systems",
        rawAuthors: "Peng, YY[Peng, Yuyang]; Li, J[Li, Jun]; Hai, H[Hai, Han]; Jiang, XQ[Jiang, Xue-Qin]; Al-Hazemi, F[Al-Hazemi, Fawaz]; Park, S[Park, Sangdon]", role: "공동저자",
        journal: "PHYSICAL COMMUNICATION", year: "2021", vol: "46", no: "", startPage: "", endPage: "", // 101340 is article number
        link: "https://doi.org/10.1016/j.phycom.2021.101340", type: "journal", citations: 4
      },
      {
        title: "Deposit Decision Model for Data Brokers in Distributed Personal Data Markets Using Blockchain",
        rawAuthors: "Oh, H[Oh, Hyeontaek]; Park, S[Park, Sangdon]; Choi, JK[Choi, Jun Kyun]; Noh, S[Noh, Sungkee]", role: "교신저자",
        journal: "IEEE ACCESS", year: "2021", vol: "9", no: "", startPage: "114715", endPage: "114726",
        link: "https://doi.org/10.1109/ACCESS.2021.3104870", type: "journal", citations: 5
      },
      {
        title: "Three Dynamic Pricing Schemes for Resource Allocation of Edge Computing for IoT Environment",
        rawAuthors: "Baek, B[Baek, Beomhan]; Lee, J[Lee, Joohyung]; Peng, YY[Peng, Yuyang]; Park, S[Park, Sangdon]", role: "교신저자",
        journal: "IEEE INTERNET OF THINGS JOURNAL", year: "2020", vol: "7", no: "5", startPage: "4292", endPage: "4303",
        link: "https://doi.org/10.1109/JIOT.2020.2966627", type: "journal", citations: 81
      },
      {
        title: "Competitive Data Trading Model With Privacy Valuation for Multiple Stakeholders in IoT Data Markets",
        rawAuthors: "Oh, H[Oh, Hyeontaek]; Park, S[Park, Sangdon]; Lee, GM[Lee, Gyu Myoung]; Choi, JK[Choi, Jun Kyun]; Noh, S[Noh, Sungkee]", role: "교신저자",
        journal: "IEEE INTERNET OF THINGS JOURNAL", year: "2020", vol: "7", no: "4", startPage: "3623", endPage: "3639",
        link: "https://doi.org/10.1109/JIOT.2020.2973662", type: "journal", citations: 58
      },
      {
        title: "Time Series Forecasting Based Day-Ahead Energy Trading in Microgrids: Mathematical Analysis and Simulation",
        rawAuthors: "Jeong, G[Jeong, Gyohun]; Park, S[Park, Sangdon]; Hwang, G[Hwang, Ganguk]", role: "공동저자",
        journal: "IEEE ACCESS", year: "2020", vol: "8", no: "", startPage: "63885", endPage: "63900",
        link: "https://doi.org/10.1109/ACCESS.2020.2985258", type: "journal", citations: 6
      },
       {
        title: "Battery-Wear-Model-Based Energy Trading in Electric Vehicles: A Naive Auction Model and a Market Analysis",
        rawAuthors: "Kim, J[Kim, Jangkyum]; Lee, J[Lee, Joohyung]; Park, S[Park, Sangdon]; Choi, JK[Choi, Jun Kyun]", role: "공동저자",
        journal: "IEEE TRANSACTIONS ON INDUSTRIAL INFORMATICS", year: "2019", vol: "15", no: "7", startPage: "4140", endPage: "4151",
        link: "https://doi.org/10.1109/TII.2018.2883655", type: "journal", citations: 36
      },
      {
        title: "Optimal throughput analysis of multiple channel access in cognitive radio networks",
        rawAuthors: "Park, S[Park, Sangdon]; Hwang, G[Hwang, Ganguk]; Choi, JK[Choi, Jun Kyun]", role: "제1저자",
        journal: "ANNALS OF OPERATIONS RESEARCH", year: "2019", vol: "277", no: "2", startPage: "345", endPage: "370",
        link: "https://doi.org/10.1007/s10479-017-2648-3", type: "journal", citations: 3
      },
      {
        title: "Energy-efficient cooperative transmission for intelligent transportation systems",
        rawAuthors: "Peng, YY[Peng, Yuyang]; Li, J[Li, Jun]; Park, S[Park, Sangdon]; Zhu, KL[Zhu, Konglin]; Hassan, MM[Hassan, Mohammad Mehedi]; Alsanad, A[Alsanad, Ahmed]", role: "공동저자",
        journal: "FUTURE GENERATION COMPUTER SYSTEMS-THE INTERNATIONAL JOURNAL OF ESCIENCE", year: "2019", vol: "94", no: "", startPage: "634", endPage: "640",
        link: "https://doi.org/10.1016/j.future.2018.11.053", type: "journal", citations: 22
      },
      {
        title: "Power Efficient Clustering Scheme for 5G Mobile Edge Computing Environment",
        rawAuthors: "Ahn, J[Ahn, Jaewon]; Lee, J[Lee, Joohyung]; Park, S[Park, Sangdon]; Park, HS[Park, Hong-Shik]", role: "공동저자",
        journal: "MOBILE NETWORKS & APPLICATIONS", year: "2019", vol: "24", no: "2", startPage: "643", endPage: "652",
        link: "https://doi.org/10.1007/s11036-018-1164-2", type: "journal", citations: 14
      },
       {
        title: "Personal Data Trading Scheme for Data Brokers in IoT Data Marketplaces",
        rawAuthors: "Oh, H[Oh, Hyeontaek]; Park, S[Park, Sangdon]; Lee, GM[Lee, Gyu Myoung]; Heo, H[Heo, Hwanjo]; Choi, JK[Choi, Jun Kyun]", role: "교신저자",
        journal: "IEEE ACCESS", year: "2019", vol: "7", no: "", startPage: "40120", endPage: "40132",
        link: "https://doi.org/10.1109/ACCESS.2019.2904248", type: "journal", citations: 56
      },
      {
        title: "Comparison Between Seller and Buyer Pricing Systems for Energy Trading in Microgrids",
        rawAuthors: "Bae, S[Bae, Sohee]; Park, S[Park, Sangdon]", role: "교신저자",
        journal: "IEEE ACCESS", year: "2019", vol: "7", no: "", startPage: "54084", endPage: "54096",
        link: "https://doi.org/10.1109/ACCESS.2019.2912758", type: "journal", citations: 2
      },
       {
        title: "Load Profile Extraction by Mean-Shift Clustering with Sample Pearson Correlation Coefficient Distance",
        rawAuthors: "Kim, N[Kim, Nakyoung]; Park, S[Park, Sangdon]; Lee, J[Lee, Joohyung]; Choi, JK[Choi, Jun Kyun]", role: "교신저자",
        journal: "ENERGIES", year: "2018", vol: "11", no: "9", startPage: "", endPage: "", // 2397 is article number
        link: "https://doi.org/10.3390/en11092397", type: "journal", citations: 14
      },
      {
        title: "An Optimal Pricing Scheme for the Energy-Efficient Mobile Edge Computation Offloading With OFDMA",
        rawAuthors: "김성환[Kim, Seong-Hwan]; Park, S[Park, Sangdon]; Chen, M[Chen, Min]; Youn, CH[Youn, Chan-Hyun]", role: "교신저자",
        journal: "IEEE COMMUNICATIONS LETTERS", year: "2018", vol: "22", no: "9", startPage: "1922", endPage: "1925",
        link: "https://doi.org/10.1109/LCOMM.2018.2849401", type: "journal", citations: 59
      },
      {
        title: "Three Hierarchical Levels of Big-Data Market Model Over Multiple Data Sources for Internet of Things",
        rawAuthors: "Jang, B[Jang, Busik]; Park, SD[Park, Sangdon]; Lee, J[Lee, Joohyung]; Hahn, SG[Hahn, Sang-Geun]", role: "교신저자",
        journal: "IEEE ACCESS", year: "2018", vol: "6", no: "", startPage: "31269", endPage: "31280",
        link: "https://doi.org/10.1109/ACCESS.2018.2845105", type: "journal", citations: 25
      },
       {
        title: "Competitive Partial Computation Offloading for Maximizing Energy Efficiency in Mobile Cloud Computing",
        rawAuthors: "An, S[An, Sanghong]; Lee, J[Lee, Joohyung]; Park, S[Park, Sangdon]; Newaz, SHS[Newaz, S. H. Shah]; Choi, JK[Choi, Jun Kyun]", role: "교신저자",
        journal: "IEEE ACCESS", year: "2018", vol: "6", no: "", startPage: "899", endPage: "912",
        link: "https://doi.org/10.1109/ACCESS.2017.2776323", type: "journal", citations: 30
      },
       {
        title: "Event-Driven Energy Trading System in Microgrids: Aperiodic Market Model Analysis with a Game Theoretic Approach",
        rawAuthors: "Park, S[Park, Sangdon]; Lee, J[Lee, Joohyung]; Hwang, G[Hwang, Ganguk]; Choi, JK[Choi, Jun Kyun]", role: "제1저자",
        journal: "IEEE ACCESS", year: "2017", vol: "5", no: "", startPage: "26291", endPage: "26302",
        link: "https://doi.org/10.1109/ACCESS.2017.2766233", type: "journal", citations: 40
      },
      {
        title: "Learning-Based Adaptive Imputation Method with kNN Algorithm for Missing Power Data",
        rawAuthors: "Kim, M[Kim, Minkyung]; Park, S[Park, Sangdon]; Lee, J[Lee, Joohyung]; Joo, Y[Joo, Yongjae]; Choi, JK[Choi, Jun Kyun]", role: "공동저자",
        journal: "ENERGIES", year: "2017", vol: "10", no: "10", startPage: "", endPage: "", // 1668 is article number
        link: "https://doi.org/10.3390/en10101668", type: "journal", citations: 60
      },
      {
        title: "Contribution-Based Energy-Trading Mechanism in Microgrids for Future Smart Grid: A Game Theoretic Approach",
        rawAuthors: "Park, SD[Park, Sangdon]; Lee, J[Lee, Joohyung]; Bae, S[Bae, Sohee]; Hwang, GU[Hwang, Ganguk]; Choi, JK[Choi, Jun Kyun]", role: "제1저자",
        journal: "IEEE TRANSACTIONS ON INDUSTRIAL ELECTRONICS", year: "2016", vol: "63", no: "7", startPage: "4255", endPage: "4265",
        link: "https://doi.org/10.1109/TIE.2016.2532842", type: "journal", citations: 175
      }
      // Note: The data structure now holds raw author strings and role, parsing happens during display
    ];

    // Function to generate HTML for a single publication item
    function createPublicationElement(pub) {
        const pubElement = document.createElement('div');
        // Determine type for CSS class (handle missing type)
        let pubType = 'unknown';
        if (pub.type === 'journal' || pub.type === 'Journal Classification' || pub.journalClassification === '국제전문학술지') { // Check multiple possible fields for type
            pubType = 'journal';
        } else if (pub.type === 'conference') {
             pubType = 'conference';
        } // Add other types like preprint if needed
        pubElement.className = `publication-item ${pubType}`;

        // Parse authors and format journal info here
        const authors = parseAuthors(pub.rawAuthors, pub.role);
        const journalInfo = formatJournalInfo(pub.journal, pub.year, pub.vol, pub.no, pub.startPage, pub.endPage);

        pubElement.innerHTML = `
            <h3>${pub.title}</h3>
            <p class="publication-authors">${authors}</p>
            <p class="publication-journal">${journalInfo}</p>
            <div class="publication-footer">
                 <a href="${pub.link || '#'}" class="publication-link" target="_blank" rel="noopener noreferrer">
                    ${pub.link && pub.link !== '#' ? 'DOI 링크' : '링크 없음'} <i class="fas fa-external-link-alt"></i>
                 </a>
                 ${pub.citations !== undefined && pub.citations !== null ?
                    `<span class="publication-citations"><i class="fas fa-quote-left"></i> 인용 (SCOPUS): ${pub.citations}</span>` : ''
                 }
            </div>
        `;
        return pubElement;
    }

    // --- Populate lists based on the current page ---

    if (isMainPage && selectedPublicationsContainer) {
        selectedPublicationsContainer.innerHTML = ''; // Clear loading message

        const tiePaperTitle = "Contribution-Based Energy-Trading Mechanism in Microgrids for Future Smart Grid: A Game Theoretic Approach";

        // 1. Filter by base criteria: Role (Corr/First) AND Citations >= 10
        let baseSelectedPubs = publicationsData.filter(pub => {
            const isEligibleRole = pub.role === '교신저자' || pub.role === '제1저자';
            const hasEnoughCitations = pub.citations >= 10;
            return isEligibleRole && hasEnoughCitations;
        });

        // 2. Find the specific TIE 2016 paper
        const tiePaper = publicationsData.find(pub => pub.title === tiePaperTitle);

        // 3. Ensure TIE paper is included if it exists and meets the role criteria (even if citations < 10 for some reason, as per user request feel)
        let combinedList = [...baseSelectedPubs];
        if (tiePaper && (tiePaper.role === '교신저자' || tiePaper.role === '제1저자')) {
            const isTieAlreadyIncluded = baseSelectedPubs.some(pub => pub.title === tiePaperTitle);
            if (!isTieAlreadyIncluded) {
                combinedList.push(tiePaper); // Add TIE paper if not already in the citation-filtered list
            }
        }

        // 4. Sort the combined list by citations descending
        combinedList.sort((a, b) => b.citations - a.citations);

        // 5. Take the top 6
        const finalSelectedPubs = combinedList.slice(0, 6);

        // 6. Display the final 6 papers
        if (finalSelectedPubs.length > 0) {
             finalSelectedPubs.forEach(pub => {
                 selectedPublicationsContainer.appendChild(createPublicationElement(pub));
             });
        } else {
            selectedPublicationsContainer.innerHTML = '<p>선별된 대표 논문이 없습니다. 전체 목록을 확인해주세요.</p>';
        }
    }

    if (isPublicationsPage && allPublicationsContainer) {
        allPublicationsContainer.innerHTML = ''; // Clear loading message
        if (publicationsData.length === 0) {
            allPublicationsContainer.innerHTML = '<p>게재된 논문이 없습니다.</p>';
        } else {
            // Add filters if needed on this page
            const publicationsNav = document.querySelector('.publications-nav'); // Find filters on this page
             if(publicationsNav) initPublicationFilters(); // Initialize filters if they exist

            publicationsData.forEach(pub => {
                 allPublicationsContainer.appendChild(createPublicationElement(pub));
            });
             // Apply initial filter if filters exist
             if(publicationsNav) filterPublications('all');
        }
    }

    // Initialize filters only if they exist on the current page (relevant for publications.html)
    // Moved filter initialization inside the condition for publications page
    // const publicationsNav = document.querySelector('.publications-nav');
    // if (publicationsNav) {
    //     initPublicationFilters();
    //     filterPublications('all'); // Apply 'all' filter initially
    // }
}

// Ensure filter functions are defined globally or passed correctly if needed elsewhere
function initPublicationFilters() {
    const filterButtons = document.querySelectorAll('.pub-nav-btn');
    if (filterButtons.length === 0) return;
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            filterPublications(filter);
        });
    });
}

function filterPublications(filter) {
    const publications = document.querySelectorAll('#publications-list .publication-item'); // Target only items in the full list
     if (!publications || publications.length === 0) return;
    publications.forEach(pub => {
        let type = 'unknown';
        if (pub.classList.contains('journal')) type = 'journal';
        else if (pub.classList.contains('conference')) type = 'conference';
        // Add other type checks if needed

        if (filter === 'all' || type === filter) {
            pub.style.display = 'block';
        } else {
            pub.style.display = 'none';
        }
    });
}

// Make sure the DOMContentLoaded listener calls loadPublications
document.addEventListener('DOMContentLoaded', function() {
    initNavigation(); // Keep other initializations
    loadPublications(); // This now handles page-specific loading
    initSmoothScroll();
    initHeaderScroll();
    // Filters are now initialized within loadPublications if needed
});

// ... other functions like initNavigation, initSmoothScroll, initHeaderScroll ...