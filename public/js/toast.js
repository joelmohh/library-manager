// Sistema de Toast Customizado
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container")
  if (!container) {
    console.error("Container de toast não encontrado")
    return
  }

  const toastId = "toast-" + Date.now()

  const typeConfig = {
    success: { title: "Sucesso", icon: "fas fa-check" },
    error: { title: "Erro", icon: "fas fa-times" },
    warning: { title: "Aviso", icon: "fas fa-exclamation-triangle" },
    info: { title: "Informação", icon: "fas fa-info" },
  }

  const config = typeConfig[type] || typeConfig.info

  const toastHTML = `
        <div class="toast-notification ${type}" id="${toastId}">
            <div class="toast-icon">
                <i class="${config.icon}"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">${config.title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" data-toast-id="${toastId}">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `

  container.insertAdjacentHTML("beforeend", toastHTML)

  const toastElement = document.getElementById(toastId)
  const closeButton = toastElement.querySelector(".toast-close")

  // Adicionar event listener para o botão de fechar
  closeButton.addEventListener("click", () => {
    removeToast(toastId)
  })

  // Auto-remover após 5 segundos
  setTimeout(() => {
    removeToast(toastId)
  }, 5000)
}

function removeToast(toastId) {
  const toastElement = document.getElementById(toastId)
  if (toastElement) {
    toastElement.style.animation = "slideOut 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards"
    setTimeout(() => {
      toastElement.remove()
    }, 400)
  }
}

// Toast especializado para reset de senha
function showResetPasswordToast(result) {
  const container = document.getElementById("toast-container")
  if (!container) {
    console.error("Container de toast não encontrado")
    return
  }

  const toastId = "toast-reset-" + Date.now()

  const toastHTML = `
        <div class="toast-notification success" id="${toastId}" style="max-width: 400px;">
            <div class="toast-icon">
                <i class="fas fa-key"></i>
            </div>
            <div class="toast-content">
                <div class="toast-title">Senha Resetada com Sucesso!</div>
                <div class="toast-message">
                    <strong>Usuário:</strong> ${result.username}<br>
                    <strong>Nova senha:</strong> 
                    <code style="background: rgba(0, 122, 255, 0.1); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono);">${result.tempPassword}</code>
                    <br>
                    <small style="color: var(--text-secondary); margin-top: 4px; display: block;">
                        <i class="fas fa-info-circle"></i> Senha copiada automaticamente!
                    </small>
                </div>
            </div>
            <button class="toast-close" onclick="removeToast('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `

  container.insertAdjacentHTML("beforeend", toastHTML)

  const toastElement = document.getElementById(toastId)

  // Auto-remover após 10 segundos (mais tempo para ler)
  setTimeout(() => {
    removeToast(toastId)
  }, 10000)

  // Copiar senha para área de transferência
  if (navigator.clipboard) {
    navigator.clipboard.writeText(result.tempPassword)
  }
}
