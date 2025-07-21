 // Toggle sidebar
 const menuToggle = document.getElementById('menu-toggle');
 const sidebar = document.querySelector('.sidebar');
 const mainContent = document.querySelector('.main-content');

 menuToggle.addEventListener('click', () => {
     sidebar.classList.toggle('open');
     menuToggle.classList.toggle('open');
 });

 // Toggle submenus
 const menuLinks = document.querySelectorAll('.menu-link.has-submenu');

 menuLinks.forEach(link => {
     link.addEventListener('click', (e) => {
         e.preventDefault();
         const submenu = link.nextElementSibling;
         submenu.classList.toggle('open');
     });
 });

 // Handle active menu items
 const allMenuLinks = document.querySelectorAll('.menu-link, .submenu-link');

 allMenuLinks.forEach(link => {
     link.addEventListener('click', function(e) {
         e.preventDefault();
         document.querySelector('.menu-link.active')?.classList.remove('active');
         
         if (this.classList.contains('submenu-link')) {
             this.closest('.menu-item').querySelector('.menu-link').classList.add('active');
         } else {
             this.classList.add('active');
         }
     });
 });

 // Toggle user dropdown
 const userMenuToggle = document.getElementById('user-menu-toggle');
 const userDropdown = document.getElementById('user-dropdown');
 let isDropdownOpen = false;

 function toggleDropdown() {
     isDropdownOpen = !isDropdownOpen;
     userDropdown.classList.toggle('open', isDropdownOpen);
 }

 function closeDropdown() {
     isDropdownOpen = false;
     userDropdown.classList.remove('open');
 }

 userMenuToggle.addEventListener('click', (e) => {
     e.stopPropagation();
     toggleDropdown();
 });

 document.addEventListener('click', (e) => {
     const isClickInside = userDropdown.contains(e.target) || userMenuToggle.contains(e.target);
     if (!isClickInside && isDropdownOpen) {
         closeDropdown();
     }
 });

 // Close dropdown when pressing Escape key
 document.addEventListener('keydown', (e) => {
     if (e.key === 'Escape') {
         userDropdown.classList.remove('open');
     }
 });

 // Add keyboard navigation for dropdown
 userDropdown.addEventListener('keydown', (e) => {
     const items = userDropdown.querySelectorAll('.user-dropdown-item');
     const currentIndex = Array.from(items).indexOf(document.activeElement);

     if (e.key === 'ArrowDown') {
         e.preventDefault();
         const nextIndex = (currentIndex + 1) % items.length;
         items[nextIndex].focus();
     } else if (e.key === 'ArrowUp') {
         e.preventDefault();
         const prevIndex = (currentIndex - 1 + items.length) % items.length;
         items[prevIndex].focus();
     }
 });