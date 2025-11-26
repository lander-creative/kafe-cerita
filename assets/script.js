// assets/script.js

const NAV_ACTIVE = ['font-bold', 'text-coffee-900'];
const NAV_INACTIVE = ['font-medium', 'text-coffee-700'];

// 1. Load Component
async function loadComponent(id, file, callback) {
  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error(`Gagal memuat ${file}`);
    const html = await response.text();
    document.getElementById(id).innerHTML = html;
    if (callback) callback();
  } catch (error) {
    console.error(error);
  }
}

// 2. Helper Style
function setLinkState(link, isActive) {
  if (isActive) {
    link.classList.remove(...NAV_INACTIVE);
    link.classList.add(...NAV_ACTIVE);
  } else {
    link.classList.remove(...NAV_ACTIVE);
    link.classList.add(...NAV_INACTIVE);
  }
}

// 3. Logika Navbar
function initNavbarLogic() {
  const pathName = window.location.pathname;
  // Deteksi folder repo (kafe-cerita) jika ada
  const isInMenuFolder = pathName.includes('/menu/');
  // Homepage adalah root repo ATAU index.html
  const isHomePage = !isInMenuFolder && (pathName.endsWith('/') || pathName.endsWith('index.html'));

  // A. PATH FIXER (Kunci agar link tidak rusak di GitHub Pages)
  if (isInMenuFolder) {
    const dynamicLinks = document.querySelectorAll('.nav-link-dynamic');
    dynamicLinks.forEach(link => {
      const originalHref = link.getAttribute('href');
      // Jangan ubah link eksternal atau hash murni
      if(originalHref && !originalHref.startsWith('http') && !originalHref.startsWith('#')) {
         // Jika link belum punya ../, tambahkan
         if(!originalHref.startsWith('../')) {
             link.setAttribute('href', '../' + originalHref);
         }
      }
    });
  }

  // B. Mobile Menu & Scroll Lock
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const icon = document.getElementById('menu-icon');
  
  if (btn && menu && icon) {
      const newBtn = btn.cloneNode(true); 
      btn.parentNode.replaceChild(newBtn, btn);
      
      const toggleMenu = () => {
          menu.classList.toggle('hidden');
          const isMenuOpen = !menu.classList.contains('hidden');
          icon.textContent = isMenuOpen ? 'close' : 'menu';
          if (isMenuOpen) {
              document.body.style.overflow = 'hidden'; 
          } else {
              document.body.style.overflow = ''; 
          }
      };

      newBtn.addEventListener('click', toggleMenu);

      const mobileLinks = menu.querySelectorAll('a');
      mobileLinks.forEach(link => {
          link.addEventListener('click', () => {
              if (!menu.classList.contains('hidden')) {
                  toggleMenu(); 
              }
          });
      });
  }

  // C. Active State Logic
  const navLinks = document.querySelectorAll('#desktop-nav a.nav-item, #mobile-menu a');

  if (isInMenuFolder) {
      // Logic statis halaman Menu
      navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.includes('menu')) {
              setLinkState(link, true);
          } else {
              setLinkState(link, false);
          }
      });
  } else if (isHomePage) {
      // Logic dinamis Beranda
      initHomepageScrollspy(navLinks);
  }
}

// 4. Scrollspy Homepage
function initHomepageScrollspy(navLinks) {
  const sections = document.querySelectorAll('section[id]'); 
  const observerOptions = { root: null, rootMargin: "-30% 0px -60% 0px", threshold: 0 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        navLinks.forEach(link => {
           const href = link.getAttribute('href');
           let shouldActive = false;
           
           // Cek link beranda (./ atau index.html)
           if (id === 'home' || id === 'header-placeholder') { 
               if (href === './' || href === 'index.html' || href === '') shouldActive = true;
           } else {
               if (href && href.includes('#' + id)) shouldActive = true;
           }

           if (shouldActive) setLinkState(link, true);
        });
        
        cleanUpActiveClasses(navLinks, id);
      }
    });
  }, observerOptions);

  sections.forEach(section => { observer.observe(section); });
}

function cleanUpActiveClasses(navLinks, activeId) {
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        let isMatch = false;
        if ((activeId === 'home' || activeId === 'header-placeholder') && (href === './' || href === 'index.html' || href === '')) {
            isMatch = true;
        } else if (href && href.includes('#' + activeId)) {
            isMatch = true;
        }
        if (!isMatch) setLinkState(link, false);
    });
}

// 5. Animasi Reveal
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal');
  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 100;
    reveals.forEach((reveal) => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });
  };
  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll();
}

// --- EKSEKUSI UTAMA ---
document.addEventListener('DOMContentLoaded', () => {
  const isInMenuFolder = window.location.pathname.includes('/menu/');
  const prefix = isInMenuFolder ? '../' : ''; 

  loadComponent('header-placeholder', prefix + 'layouts/header.html', () => {
      initNavbarLogic();

      const navbar = document.getElementById('navbar');
      if(navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                // Scroll: Solid + Shadow
                navbar.classList.add('bg-cream', 'shadow-md', 'border-coffee-100');
                navbar.classList.remove('bg-transparent', 'border-white/20');
            } else {
                // Top: Transparent
                navbar.classList.remove('bg-cream', 'shadow-md', 'border-coffee-100');
                navbar.classList.add('bg-transparent', 'border-white/20');
            }
        });
      }
  });

  loadComponent('footer-placeholder', prefix + 'layouts/footer.html');
  initScrollReveal();
});