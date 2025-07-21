function fazerLogin(email, password) {
    const errorMessage = document.getElementById('errorMessage');
    
    fetch('/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password})
    }).then(res => {
        if(res.status === 200){
            window.location.href = '/dash'
        } else {
            errorMessage.textContent = 'Usuário ou senha incorretos';
            errorMessage.style.display = 'block';
        }
    }).catch(error => {
        errorMessage.textContent = 'Erro ao tentar fazer login. Tente novamente.';
        errorMessage.style.display = 'block';
    });
}