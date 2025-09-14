document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault()

      const formData = new FormData(this)
      const loginData = {
        username: formData.get("username"),
        password: formData.get("password"),
      }

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(loginData),
        })

        const result = await response.json()

        if (response.ok) {
          window.showToast(result.message, "success")
          setTimeout(() => {
            if (result.userType === "admin") {
              window.location.href = "/admin"
            } else {
              window.location.href = "/student"
            }
          }, 1500)
        } else {
          window.showToast(result.message, "error")
        }
      } catch (error) {
        console.error("Erro no login:", error)
        window.showToast("Erro de conexão. Tente novamente.", "error")
      }
    })
  }
})
