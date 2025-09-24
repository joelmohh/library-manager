document.addEventListener("DOMContentLoaded", () => {
  // ===== MENU HAMBÚRGUER MOBILE =====
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebarToggleDesktop = document.getElementById('sidebarToggleDesktop');
  const sidebar = document.querySelector('.sidebar');
  const mainContent = document.querySelector('.main-content');
  
  // Criar overlay se não existir
  let sidebarOverlay = document.querySelector('.sidebar-overlay');
  if (!sidebarOverlay) {
    sidebarOverlay = document.createElement('div');
    sidebarOverlay.className = 'sidebar-overlay';
    document.body.appendChild(sidebarOverlay);
  }

  // Toggle para mobile (header)
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', (e) => {
      e.preventDefault();
      sidebar.classList.toggle('show');
      sidebarOverlay.classList.toggle('show');
      document.body.classList.toggle('sidebar-open');
    });
  }

  // Toggle para desktop (sidebar)
  if (sidebarToggleDesktop) {
    sidebarToggleDesktop.addEventListener('click', (e) => {
      e.preventDefault();
      sidebar.classList.toggle('collapsed');
      mainContent.classList.toggle('expanded');
      
      // Trocar ícone
      const icon = sidebarToggleDesktop.querySelector('i');
      if (sidebar.classList.contains('collapsed')) {
        icon.className = 'fas fa-chevron-right';
      } else {
        icon.className = 'fas fa-chevron-left';
      }
    });
  }

  // ===== FECHAR MENU AO CLICAR FORA =====
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', () => {
      if (sidebar.classList.contains('show')) {
        sidebar.classList.remove('show');
        sidebarOverlay.classList.remove('show');
        document.body.classList.remove('sidebar-open');
      }
    });
  }

  // ===== FECHAR MENU AO CLICAR EM LINK (MOBILE) =====
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

  // Logout function
  window.logout = async () => {
    try {
      console.log("Iniciando logout..."); // Debug
      const response = await fetch("/api/auth/exit", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        }
      })

      console.log("Response status:", response.status); // Debug
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

  // Event listener para logout do header
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    console.log("Event listener de logout adicionado"); // Debug
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      console.log("Logout link clicado"); // Debug
      logout();
    });
  } else {
    console.log("Elemento logoutLink não encontrado"); // Debug
  }
});