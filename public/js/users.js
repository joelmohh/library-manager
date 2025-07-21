function isTeacher(){
    if(document.getElementById("userType").value == "teacher"){
        document.getElementById('studentClass').style.display = 'none';
        document.getElementById('classLabel').style.display = 'none';
        document.getElementById('raField').style.display = 'none'; // Esconde campo RA
        document.getElementById('studentRA').required = false; // Remove obrigatoriedade
    }else{
        document.getElementById('studentClass').style.display = 'block';
        document.getElementById('classLabel').style.display = 'block';
        document.getElementById('raField').style.display = 'block'; // Mostra campo RA
        document.getElementById('studentRA').required = true; // Torna obrigatório
    }
}

async function addUser(){
    try{
        let classe = document.getElementById('userType').value == 'teacher' ? "PROF" : document.getElementById('studentClass').value;
        
        const userInfo = {
            name: document.getElementById('studentName').value,
            role: document.getElementById('userType').value,
            class: classe,
            ra: document.getElementById('studentRA').value // Sempre enviar o RA
        }
        
        // Validações
        if(!userInfo.name){
            showToast('Nome não pode ser vazio', 'error');
            return;
        }

        if(userInfo.role == 'student') {
            if(!userInfo.class){
                showToast('Turma não pode ser vazia', 'error');
                return;
            }
            if(!userInfo.ra){
                showToast('RA não pode ser vazio', 'error');
                return;
            }
        }

        fetch('/api/students/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userInfo)
        }).then(() => {
            showToast('Usuário adicionado com sucesso');
            closeModal('addStudentModal');
            setTimeout(() => window.location.reload(), 2000);
        })
        

    }catch(error){
        console.error('Erro ao adicionar usuário:', error);
        showToast('Erro ao adicionar usuário');
    }
}

async function editUser(){
    const user = {
        id: document.getElementById('editStudentId').value,
        name: document.getElementById('editStudentName').value,
        class: document.getElementById('editStudentClass').value,
    }

    if(!user.name){
        showToast('Nome não pode ser vazio');
        return;
    }
    if(!user.class){
        showToast('Turma não pode ser vazia');
        return;
    }

    fetch(`/api/students/edit/${user.id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
    }).then(() => {
        showToast('Usuário editado com sucesso');
        closeModal('editStudentModal');
        setTimeout(() => window.location.reload(), 2000);
    })
}

async function deleteUser(){
    try{
    const id = document.getElementById('deleteStudentId').value;
    fetch(`/api/students/delete/${id}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(() => {
        showToast('Usuário deletado com sucesso');
        closeModal('deleteStudentModal');
        setTimeout(() => window.location.reload(), 2000);
    })
    }catch(error){
        console.error('Erro ao deletar usuário:', error);
        showToast('Erro ao deletar usuário');
    }
}