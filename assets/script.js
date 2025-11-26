// assets/script.js

// --- KONFIGURASI STYLE ---
const NAV_ACTIVE = ['font-bold', 'text-coffee-900'];
const NAV_INACTIVE = ['font-medium', 'text-coffee-700'];

// 1. Fungsi Panggil Komponen (Header/Footer)
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

// 2. Fungsi Helper: Update Tampilan Link
function setLinkState(link, isActive) {
  if (isActive) {
    link.classList.remove(...NAV_INACTIVE);
    link.classList.add(...NAV_ACTIVE);
  } else {
    link.classList.remove(...NAV_ACTIVE);
    link.classList.add(...NAV_INACTIVE);
  }
}

// 3. Logika Utama Navbar (Termasuk Mobile & Path Fixer)
function initNavbarLogic() {
  const pathName = window.location.pathname;
  const isInMenuFolder = pathName.includes('/menu/');
  const isHomePage = !isInMenuFolder && (pathName === '/' || pathName.endsWith('index.html'));

  // A. Perbaikan Jalur Link (Path Fixer)
  if (isInMenuFolder) {
    const dynamicLinks = document.querySelectorAll('.nav-link-dynamic');
    dynamicLinks.forEach(link => {
      const originalHref = link.getAttribute('href');
      if(originalHref && !originalHref.startsWith('http') && !originalHref.startsWith('#')) {
         if(!originalHref.startsWith('../')) {
             link.setAttribute('href', '../' + originalHref);
         }
      }
    });
  }

  // B. Logic Mobile Menu Toggle & Body Scroll Lock
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  const icon = document.getElementById('menu-icon');
  
  if (btn && menu && icon) {
      const newBtn = btn.cloneNode(true); 
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Fungsi Toggle Menu
      const toggleMenu = () => {
          menu.classList.toggle('hidden');
          const isMenuOpen = !menu.classList.contains('hidden');
          
          icon.textContent = isMenuOpen ? 'close' : 'menu';

          // LOGIKA KUNCI SCROLL (PENTING AGAR TIDAK GERAK)
          if (isMenuOpen) {
              document.body.style.overflow = 'hidden'; 
          } else {
              document.body.style.overflow = ''; 
          }
      };

      newBtn.addEventListener('click', toggleMenu);

      // Tutup menu otomatis saat link diklik
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
      // Logic statis untuk halaman Menu
      navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href && href.includes('menu')) {
              setLinkState(link, true);
          } else {
              setLinkState(link, false);
          }
      });
  } else if (isHomePage) {
      // Logic dinamis (Scrollspy) untuk halaman Beranda
      initHomepageScrollspy(navLinks);
  }
}

// 4. Scrollspy Khusus Homepage
function initHomepageScrollspy(navLinks) {
  const sections = document.querySelectorAll('section[id]'); 
  
  const observerOptions = {
    root: null,
    rootMargin: "-30% 0px -60% 0px", 
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        navLinks.forEach(link => {
           const href = link.getAttribute('href');
           let shouldActive = false;
           
           if (id === 'home' || id === 'header-placeholder') { 
               if (href === '/' || href === './' || href === 'index.html' || href === '') shouldActive = true;
           } else {
               if (href && href.includes('#' + id)) shouldActive = true;
           }

           if (shouldActive) setLinkState(link, true);
        });
        
        cleanUpActiveClasses(navLinks, id);
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });
}

// Helper clean up
function cleanUpActiveClasses(navLinks, activeId) {
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        let isMatch = false;
        if ((activeId === 'home' || activeId === 'header-placeholder') && (href === '/' || href === 'index.html' || href === '')) {
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

  // Load Header
  loadComponent('header-placeholder', prefix + 'layouts/header.html', () => {
      // 1. Init Logic Navbar
      initNavbarLogic();

      // 2. Init Efek Scroll Header (SOLUSI MASALAH "NABRAK")
      const navbar = document.getElementById('navbar');
      if(navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 10) {
                // SAAT SCROLL: Jadi SOLID (bg-cream) dan ada Shadow
                // Hapus transparansi agar konten di belakang tidak terlihat "nabrak" logo
                navbar.classList.add('bg-cream', 'shadow-md', 'border-coffee-100');
                navbar.classList.remove('bg-cream/70', 'backdrop-blur-lg', 'border-white/20');
            } else {
                // SAAT DI ATAS: Jadi TRANSPARAN (Glass effect)
                navbar.classList.remove('bg-cream', 'shadow-md', 'border-coffee-100');
                navbar.classList.add('bg-cream/70', 'backdrop-blur-lg', 'border-white/20');
            }
        });
      }
  });

  loadComponent('footer-placeholder', prefix + 'layouts/footer.html');
  initScrollReveal();
});