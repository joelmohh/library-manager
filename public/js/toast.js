// Global Toast Notification System
class ToastManager {
  constructor() {
    this.container = this.createContainer()
    this.toastCount = 0
  }

  createContainer() {
    let container = document.querySelector(".toast-container")
    if (!container) {
      container = document.createElement("div")
      container.className = "toast-container"
      document.body.appendChild(container)
    }
    return container
  }

  show(message, type = "info", options = {}) {
    const toastId = "toast-" + ++this.toastCount
    const duration = options.duration || 5000
    const persistent = options.persistent || false

    const iconMap = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    }

    const titleMap = {
      success: "Sucesso",
      error: "Erro",
      warning: "Atenção",
      info: "Informação",
    }

    const toastHTML = `
            <div class="toast ${type}" role="alert" id="${toastId}" data-bs-autohide="${!persistent}">
                <div class="toast-header">
                    <i class="${iconMap[type]} me-2 text-${type}"></i>
                    <strong class="me-auto">${titleMap[type]}</strong>
                    <small class="text-muted">${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</small>
                    <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                </div>
                <div class="toast-body">${message}</div>
            </div>
        `

    this.container.insertAdjacentHTML("beforeend", toastHTML)

    const toastElement = document.getElementById(toastId)
    const bootstrap = window.bootstrap // Declare the bootstrap variable
    const toast = new bootstrap.Toast(toastElement, {
      delay: persistent ? 0 : duration,
      autohide: !persistent,
    })

    toast.show()

    toastElement.addEventListener("hidden.bs.toast", () => {
      toastElement.remove()
    })

    return toast
  }

  success(message, options = {}) {
    return this.show(message, "success", options)
  }

  error(message, options = {}) {
    return this.show(message, "error", { ...options, persistent: options.persistent || true })
  }

  warning(message, options = {}) {
    return this.show(message, "warning", options)
  }

  info(message, options = {}) {
    return this.show(message, "info", options)
  }

  clear() {
    const toasts = this.container.querySelectorAll(".toast")
    toasts.forEach((toast) => {
      const bsToast = window.bootstrap.Toast.getInstance(toast) // Use window.bootstrap
      if (bsToast) bsToast.hide()
    })
  }
}

// Global instance
window.toastManager = new ToastManager()

// Global helper function
window.showToast = (message, type = "info", options = {}) => window.toastManager.show(message, type, options)

// Keyboard shortcuts
document.addEventListener("keydown", (e) => {
  // Ctrl/Cmd + Shift + C to clear all toasts
  if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "C") {
    e.preventDefault()
    window.toastManager.clear()
  }
})
