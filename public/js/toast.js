// Sistema de Toast Customizado
function showToast(message, type = 'info') {
    const container = document.getElementById('customToastContainer');
    if (!container) {
        console.error('Container de toast não encontrado');
        return;
    }
    
    const toastId = 'toast-' + Date.now();
    
    const typeConfig = {
        success: { title: 'Sucesso', icon: 'fas fa-check' },
        error: { title: 'Erro', icon: 'fas fa-times' },
        warning: { title: 'Aviso', icon: 'fas fa-exclamation-triangle' },
        info: { title: 'Informação', icon: 'fas fa-info' }
    };
    
    const config = typeConfig[type] || typeConfig.info;
    
    const toastHTML = `
        <div class="custom-toast ${type}" id="${toastId}">
            <div class="custom-toast-icon">
                <i class="${config.icon}"></i>
            </div>
            <div class="custom-toast-content">
                <div class="custom-toast-title">${config.title}</div>
                <div class="custom-toast-message">${message}</div>
            </div>
            <button class="custom-toast-close" data-toast-id="${toastId}">
                <i class="fas fa-times"></i>
            </button>
            <div class="custom-toast-progress"></div>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const progressBar = toastElement.querySelector('.custom-toast-progress');
    const closeButton = toastElement.querySelector('.custom-toast-close');
    
    // Adicionar event listener para o botão de fechar
    closeButton.addEventListener('click', () => {
        removeToast(toastId);
    });
    
    // Mostrar toast
    requestAnimationFrame(() => {
        toastElement.classList.add('show');
    });
    
    // Barra de progresso
    let progress = 100;
    progressBar.style.width = '100%';
    
    const interval = setInterval(() => {
        progress -= 1;
        progressBar.style.width = progress + '%';
        
        if (progress <= 0) {
            clearInterval(interval);
            removeToast(toastId);
        }
    }, 50); // 5 segundos total (100 * 50ms)
    
    // Armazenar interval para limpeza manual
    toastElement.dataset.interval = interval;
}

function removeToast(toastId) {
    const toastElement = document.getElementById(toastId);
    if (toastElement) {
        // Limpar interval se existir
        if (toastElement.dataset.interval) {
            clearInterval(parseInt(toastElement.dataset.interval));
        }
        
        toastElement.classList.add('hiding');
        setTimeout(() => {
            toastElement.remove();
        }, 300);
    }
}

// Toast especializado para reset de senha
function showResetPasswordToast(result) {
    const container = document.getElementById('customToastContainer');
    if (!container) {
        console.error('Container de toast não encontrado');
        return;
    }
    
    const toastId = 'toast-reset-' + Date.now();
    
    const toastHTML = `
        <div class="custom-toast success" id="${toastId}" style="max-width: 400px;">
            <div class="custom-toast-icon">
                <i class="fas fa-key"></i>
            </div>
            <div class="custom-toast-content">
                <div class="custom-toast-title">Senha Resetada com Sucesso!</div>
                <div class="custom-toast-message">
                    <strong>Usuário:</strong> ${result.username}<br>
                    <strong>Nova senha:</strong> 
                    <code style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px; font-family: monospace;">${result.tempPassword}</code>
                    <br>
                    <small style="color: #64748b; margin-top: 4px; display: block;">
                        <i class="fas fa-info-circle"></i> Senha copiada automaticamente!
                    </small>
                </div>
            </div>
            <button class="custom-toast-close" onclick="removeToast('${toastId}')">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    container.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    requestAnimationFrame(() => {
        toastElement.classList.add('show');
    });
    
    // Auto-remover após 10 segundos (mais tempo para ler)
    setTimeout(() => {
        removeToast(toastId);
    }, 10000);
    
    // Copiar senha para área de transferência
    if (navigator.clipboard) {
        navigator.clipboard.writeText(result.tempPassword);
    }
}
