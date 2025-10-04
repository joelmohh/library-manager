document.addEventListener("DOMContentLoaded", () => {
  // ===== MENU HAMBÚRGUER MOBILE =====
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  let sidebarOverlay = document.querySelector('.sidebar-overlay');
  if (!sidebarOverlay) {
    sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);
  }
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
      e.preventDefault();
      sidebar.classList.toggle('show');
      sidebarOverlay.classList.toggle('show');
      document.body.classList.toggle('sidebar-open');
    });
  }

  if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
      e.preventDefault();
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
      
      const icon = sidebarToggleDesktop.querySelector('i');
      if (sidebar.classList.contains('collapsed')) {
        icon.className = 'fas fa-chevron-right';
      } else {
        icon.className = 'fas fa-chevron-left';
      }
    });
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      if (sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
      }
    });
  }

  const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
      }
    });
  });

  window.logout = async () => {
    try {
      const response = await fetch("/api/auth/exit", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        if (typeof showToast === 'function') {
          showToast("Logout realizado com sucesso!", "success");
        } else {
          alert("Logout realizado com sucesso!");
        }
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        throw new Error(result.message || 'Erro no logout');
      }
    } catch (error) {
      console.error("Erro no logout:", error);
      if (typeof showToast === 'function') {
        showToast("Erro no logout. Tente novamente.", "error");
      } else {
        alert("Erro no logout. Tente novamente.");
      }
    }
  }

  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    })}
});