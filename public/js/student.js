document.addEventListener('DOMContentLoaded', function() {
  // Função para carregar estatísticas do dashboard
  async function loadDashboardStats() {
    try {
      // Carregar empréstimos do usuário
      const lendingResponse = await fetch('/api/lending');
      const lendingData = await lendingResponse.json();
      
      if (lendingData.success && lendingData.lendings) {
        const active = lendingData.lendings.filter(l => l.status === 'active').length;
        const returned = lendingData.lendings.filter(l => l.status === 'returned').length;
        
        document.getElementById('activeLendings').textContent = active;
        document.getElementById('returnedLendings').textContent = returned;
      }
      
      // Carregar total de livros
      const booksResponse = await fetch('/api/books');
      const booksData = await booksResponse.json();
      
      if (booksData.success && booksData.books) {
        const total = booksData.books.length;
        const available = booksData.books.filter(b => b.quantity > 0).length;
        
        document.getElementById('totalBooks').textContent = total;
        document.getElementById('availableBooks').textContent = available;
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }

  // Função para carregar empréstimos do aluno
  async function loadStudentLendings() {
    try {
      const response = await fetch('/api/lending');
      const data = await response.json();
      
      const container = document.getElementById('recent-lendings');
      if (!container) return;
      
      if (data.success && data.lendings && data.lendings.length > 0) {
        const recentLendings = data.lendings.slice(0, 3); // Mostrar apenas os 3 mais recentes
        container.innerHTML = recentLendings.map(lending => `
          <div class="card mb-2">
            <div class="card-body py-2">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>${lending.book?.title || 'Livro não encontrado'}</strong>
                  <br>
                  <small class="text-muted">
                    Emprestado em: ${new Date(lending.loanDate).toLocaleDateString('pt-BR')}
                  </small>
                </div>
                <span class="badge ${lending.status === 'active' ? 'bg-warning' : 'bg-success'}">
                  ${lending.status === 'active' ? 'Ativo' : 'Devolvido'}
                </span>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<p class="text-muted">Nenhum empréstimo encontrado.</p>';
      }
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
      const container = document.getElementById('recent-lendings');
      if (container) {
        container.innerHTML = '<p class="text-danger">Erro ao carregar empréstimos.</p>';
      }
    }
  }

  // Função para carregar livros populares
  async function loadPopularBooks() {
    try {
      const response = await fetch('/api/books');
      const data = await response.json();
      
      const container = document.getElementById('popular-books');
      if (!container) return;
      
      if (data.success && data.books && data.books.length > 0) {
        // Pegar os primeiros 5 livros
        const popularBooks = data.books.slice(0, 5);
        container.innerHTML = popularBooks.map(book => `
          <div class="card mb-2">
            <div class="card-body py-2">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong>${book.title}</strong>
                  <br>
                  <small class="text-muted">por ${book.author}</small>
                </div>
                <span class="badge ${book.quantity > 0 ? 'bg-success' : 'bg-danger'}">
                  ${book.quantity > 0 ? 'Disponível' : 'Indisponível'}
                </span>
              </div>
            </div>
          </div>
        `).join('');
      } else {
        container.innerHTML = '<p class="text-muted">Nenhum livro encontrado.</p>';
      }
    } catch (error) {
      console.error('Erro ao carregar livros populares:', error);
      const container = document.getElementById('popular-books');
      if (container) {
        container.innerHTML = '<p class="text-danger">Erro ao carregar livros.</p>';
      }
    }
  }

  // Função logout
  window.logout = async () => {
    try {
      const response = await fetch("/api/auth/exit", {
        method: "POST",
      });

      const result = await response.json();

      if (response.ok) {
        showToast("Logout realizado com sucesso!", "success");
        setTimeout(() => {
          window.location.href = "/login";
        }, 1000);
      } else {
        showToast("Erro no logout. Tente novamente.", "error");
      }
    } catch (error) {
      console.error("Erro no logout:", error);
      showToast("Erro no logout. Tente novamente.", "error");
    }
  };

  // Função para carregar livros para pesquisa
  window.loadBooks = () => {
    document.getElementById('mainContent').innerHTML = `
      <h3>Pesquisar Livros</h3>
      <div class="mb-3">
        <input type="text" class="form-control" id="searchInput" placeholder="Digite o título, autor ou ISBN...">
      </div>
      <div id="booksResults">
        <p class="text-muted">Digite algo para pesquisar...</p>
      </div>
    `;

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', async (e) => {
      const query = e.target.value;
      if (query.length > 2) {
        try {
          const response = await fetch(`/api/books?search=${encodeURIComponent(query)}`);
          const data = await response.json();
          const resultsDiv = document.getElementById('booksResults');
          
          if (data.success && data.books && data.books.length > 0) {
            let html = '<div class="row">';
            data.books.forEach(book => {
              html += `
                <div class="col-md-6 mb-3">
                  <div class="card">
                    <div class="card-body">
                      <h6 class="card-title">${book.title}</h6>
                      <p class="card-text">
                        <strong>Autor:</strong> ${book.author}<br>
                        <strong>ISBN:</strong> ${book.isbn}<br>
                        <strong>Gênero:</strong> ${book.genre}<br>
                        <strong>Editora:</strong> ${book.publisher}<br>
                        <span class="badge ${book.quantity > 0 ? 'bg-success' : 'bg-danger'}">
                          ${book.quantity > 0 ? `${book.quantity} disponível(is)` : 'Indisponível'}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              `;
            });
            html += '</div>';
            resultsDiv.innerHTML = html;
          } else {
            resultsDiv.innerHTML = '<p class="text-muted">Nenhum livro encontrado.</p>';
          }
        } catch (error) {
          console.error('Erro na pesquisa:', error);
          document.getElementById('booksResults').innerHTML = '<p class="text-danger">Erro na pesquisa.</p>';
        }
      } else {
        document.getElementById('booksResults').innerHTML = '<p class="text-muted">Digite pelo menos 3 caracteres para pesquisar...</p>';
      }
    });
  };

  // Função para navegar para meus empréstimos
  window.viewMyLendings = async () => {
    document.getElementById('mainContent').innerHTML = `
      <h3>Meus Empréstimos</h3>
      <div id="lendingsTable">
        <p class="text-muted">Carregando...</p>
      </div>
    `;

    try {
      const response = await fetch('/api/lending');
      const data = await response.json();
      const tableDiv = document.getElementById('lendingsTable');
      
      if (data.success && data.lendings && data.lendings.length > 0) {
        let html = `
          <div class="table-responsive">
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Livro</th>
                  <th>Data de Empréstimo</th>
                  <th>Data de Devolução</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
        `;
        
        data.lendings.forEach(lending => {
          html += `
            <tr>
              <td>${lending.book ? lending.book.title : 'Livro não encontrado'}</td>
              <td>${new Date(lending.loanDate).toLocaleDateString('pt-BR')}</td>
              <td>${lending.returnDate ? new Date(lending.returnDate).toLocaleDateString('pt-BR') : 'Não devolvido'}</td>
              <td>
                <span class="badge ${lending.status === 'active' ? 'bg-warning' : 'bg-success'}">
                  ${lending.status === 'active' ? 'Ativo' : 'Devolvido'}
                </span>
              </td>
            </tr>
          `;
        });
        
        html += '</tbody></table></div>';
        tableDiv.innerHTML = html;
      } else {
        tableDiv.innerHTML = '<p class="text-muted">Você não possui empréstimos.</p>';
      }
    } catch (error) {
      console.error('Erro ao carregar empréstimos:', error);
      document.getElementById('lendingsTable').innerHTML = '<p class="text-danger">Erro ao carregar empréstimos.</p>';
    }
  };

  // Carregar dados quando a página carrega
  loadDashboardStats();
  loadStudentLendings();
  loadPopularBooks();
});