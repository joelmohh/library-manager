document.addEventListener("DOMContentLoaded", () => {
  // Declare variables before using them
  const bootstrap = window.bootstrap
  const showToast =
    window.showToast ||
    ((message, type) => {
      alert(`${type}: ${message}`)
    })

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/users")
      const users = await response.json()
      // Implementar exibição dos usuários
      console.log("Users loaded:", users)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    }
  }

  const loadBooks = async () => {
    try {
      const response = await fetch("/api/books")
      const books = await response.json()
      displayBooks(books)
    } catch (error) {
      console.error("Erro ao carregar livros:", error)
    }
  }

  const loadLendings = async () => {
    try {
      const response = await fetch("/api/lending")
      const lendings = await response.json()
      console.log("Lendings loaded:", lendings)
    } catch (error) {
      console.error("Erro ao carregar empréstimos:", error)
    }
  }

  const displayBooks = (books) => {
    console.log("Books displayed:", books)
  }

  // User Management Functions
  window.createUser = async () => {
    const form = document.getElementById("userForm")
    const formData = new FormData(form)

    const userData = {
      username: formData.get("username"),
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      password: formData.get("password"),
      type: formData.get("type"),
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (response.ok) {
        showToast(result.message, "success")
        form.reset()
        loadUsers()
      } else {
        showToast(result.message, "error")
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      showToast("Erro de conexão. Tente novamente.", "error")
    }
  }

  window.editUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/${userId}`)
      const user = await response.json()

      if (response.ok) {
        document.getElementById("editUserId").value = user._id
        document.getElementById("editUsername").value = user.username
        document.getElementById("editFullName").value = user.fullName
        document.getElementById("editEmail").value = user.email
        document.getElementById("editType").value = user.type

        const modal = new bootstrap.Modal(document.getElementById("editUserModal"))
        modal.show()
      }
    } catch (error) {
      console.error("Erro ao carregar usuário:", error)
      showToast("Erro ao carregar dados do usuário.", "error")
    }
  }

  window.updateUser = async () => {
    const form = document.getElementById("editUserForm")
    const formData = new FormData(form)
    const userId = formData.get("userId")

    const userData = {
      username: formData.get("username"),
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      type: formData.get("type"),
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (response.ok) {
        showToast(result.message, "success")
        const modal = bootstrap.Modal.getInstance(document.getElementById("editUserModal"))
        modal.hide()
        loadUsers()
      } else {
        showToast(result.message, "error")
      }
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error)
      showToast("Erro de conexão. Tente novamente.", "error")
    }
  }

  window.deleteUser = async (userId) => {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      try {
        const response = await fetch(`/api/users/${userId}`, {
          method: "DELETE",
        })

        const result = await response.json()

        if (response.ok) {
          showToast(result.message, "success")
          loadUsers()
        } else {
          showToast(result.message, "error")
        }
      } catch (error) {
        console.error("Erro ao excluir usuário:", error)
        showToast("Erro de conexão. Tente novamente.", "error")
      }
    }
  }

  // Book Management Functions
  window.createBook = async () => {
    const form = document.getElementById("bookForm")
    const formData = new FormData(form)

    const bookData = {
      title: formData.get("title"),
      author: formData.get("author"),
      isbn: formData.get("isbn"),
      category: formData.get("category"),
      quantity: Number.parseInt(formData.get("quantity")),
      description: formData.get("description"),
    }

    try {
      const response = await fetch("/api/books/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      })

      const result = await response.json()

      if (response.ok) {
        showToast("Livro criado com sucesso", "success")
        form.reset()
        loadBooks()
      } else {
        showToast(result.message, "error")
      }
    } catch (error) {
      console.error("Erro ao criar livro:", error)
      showToast("Erro de conexão. Tente novamente.", "error")
    }
  }

  window.editBook = async (bookId) => {
    try {
      const response = await fetch(`/api/books/${bookId}`)
      const book = await response.json()

      if (response.ok) {
        document.getElementById("editBookId").value = book._id
        document.getElementById("editTitle").value = book.title
        document.getElementById("editAuthor").value = book.author
        document.getElementById("editIsbn").value = book.isbn
        document.getElementById("editCategory").value = book.category
        document.getElementById("editQuantity").value = book.quantity
        document.getElementById("editDescription").value = book.description

        const modal = new bootstrap.Modal(document.getElementById("editBookModal"))
        modal.show()
      }
    } catch (error) {
      console.error("Erro ao carregar livro:", error)
      showToast("Erro ao carregar dados do livro.", "error")
    }
  }

  window.updateBook = async () => {
    const form = document.getElementById("editBookForm")
    const formData = new FormData(form)
    const bookId = formData.get("bookId")

    const bookData = {
      title: formData.get("title"),
      author: formData.get("author"),
      isbn: formData.get("isbn"),
      category: formData.get("category"),
      quantity: Number.parseInt(formData.get("quantity")),
      description: formData.get("description"),
    }

    try {
      const response = await fetch(`/api/books/update/${bookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookData),
      })

      const result = await response.json()

      if (response.ok) {
        showToast("Livro atualizado com sucesso", "success")
        const modal = bootstrap.Modal.getInstance(document.getElementById("editBookModal"))
        modal.hide()
        loadBooks()
      } else {
        showToast(result.message, "error")
      }
    } catch (error) {
      console.error("Erro ao atualizar livro:", error)
      showToast("Erro de conexão. Tente novamente.", "error")
    }
  }

  window.deleteBook = async (bookId) => {
    if (confirm("Tem certeza que deseja excluir este livro?")) {
      try {
        const response = await fetch(`/api/books/remove/${bookId}`, {
          method: "POST",
        })

        const result = await response.json()

        if (response.ok) {
          showToast(result.message, "success")
          loadBooks()
        } else {
          showToast(result.message, "error")
        }
      } catch (error) {
        console.error("Erro ao excluir livro:", error)
        showToast("Erro de conexão. Tente novamente.", "error")
      }
    }
  }

  // Lending Management Functions
  window.createLending = async () => {
    const form = document.getElementById("lendingForm")
    const formData = new FormData(form)

    const lendingData = {
      userId: formData.get("userId"),
      bookId: formData.get("bookId"),
      dueDate: formData.get("dueDate"),
    }

    try {
      const response = await fetch("/api/lending", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lendingData),
      })

      const result = await response.json()

      if (response.ok) {
        showToast(result.message, "success")
        form.reset()
        loadLendings()
      } else {
        showToast(result.message, "error")
      }
    } catch (error) {
      console.error("Erro ao criar empréstimo:", error)
      showToast("Erro de conexão. Tente novamente.", "error")
    }
  }

  window.returnBook = async (lendingId) => {
    try {
      const response = await fetch(`/api/lending/${lendingId}/return`, {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        showToast(result.message, "success")
        loadLendings()
      } else {
        showToast(result.message, "error")
      }
    } catch (error) {
      console.error("Erro ao devolver livro:", error)
      showToast("Erro de conexão. Tente novamente.", "error")
    }
  }

  // Search functionality
  window.searchBooks = async () => {
    const searchTerm = document.getElementById("searchInput").value

    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(searchTerm)}`)
      const books = await response.json()

      if (response.ok) {
        displayBooks(books)
      } else {
        showToast("Erro na busca.", "error")
      }
    } catch (error) {
      console.error("Erro na busca:", error)
      showToast("Erro de conexão. Tente novamente.", "error")
    }
  }

  // Logout function
  window.logout = async () => {
    try {
      const response = await fetch("/api/auth/exit", {
        method: "POST",
      })

      const result = await response.json()

      if (response.ok) {
        showToast(result.message, "success")
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
      }
    } catch (error) {
      console.error("Erro no logout:", error)
      showToast("Erro de conexão. Tente novamente.", "error")
    }
  }
})
