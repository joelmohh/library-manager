function returnBook(loan) {
    try {
        document.getElementById('returnBookName').textContent = loan.bookName;
        document.getElementById('returnLoanId').value = loan._id;
        document.getElementById('returnModal').classList.add('show');
    } catch (error) {
        console.error('Erro ao processar dados:', error);
        alert('Erro ao preparar devolução');
    }
}

async function confirmReturn() {
    const loanId = document.getElementById('returnLoanId').value;
    
    try {
        const response = await fetch(`/api/loans/return/${loanId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showToast('Livro devolvido com sucesso!', 'success');
            closeModal('returnModal');
            window.location.reload();
        } else {
            const data = await response.json();
            showToast(data.message || 'Erro ao devolver o livro', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao processar a devolução', 'error');
    }
}

async function saveLoan() {
    try {
        const formData = {
            bookId: document.getElementById('bookId').value,
            studentId: document.getElementById('studentId').value,
            lendingDate: document.getElementById('lendingDate').value,
            returnDate: document.getElementById('returnDate').value
        };

        const response = await fetch('/api/loans/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            showToast('Empréstimo criado com sucesso!', 'success');
            closeModal('newLoanModal');
            setTimeout(() => window.location.reload(), 2000);
        } else {
            const error = await response.json();
            showToast(error.message || 'Erro ao criar empréstimo', 'error');
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao salvar empréstimo', 'error');
    }
}
function viewLoan(loan) {
    try {
        document.getElementById('viewBookName').textContent = loan.bookName;
        document.getElementById('viewStudentName').textContent = loan.studentName;
        document.getElementById('viewLendingDate').textContent = new Date(loan.lendingDate).toLocaleDateString();
        document.getElementById('viewReturnDate').textContent = loan.returnDate ? new Date(loan.returnDate).toLocaleDateString() : '-';
        document.getElementById('viewStatus').textContent = loan.status === 'emprestado' ? 'Em andamento' : 'Devolvido';
        
        document.getElementById('viewLoanModal').classList.add('show');
    } catch (error) {
        console.error('Erro ao processar dados:', error);
        alert('Erro ao visualizar detalhes do empréstimo');
    }
}

/*
/
/  USER FUNCTIONS
/
*/

async function createUser(){
    const user = {
        name: document.getElementById('studentName').value,
        username: "Não ultilizavel no momento",
        password: "Não ultilizavel no momento",
        class: document.getElementById('studentClass').value,
        role: document.getElementById('userType').value,
    }

    fetch('/api/students/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(user)
    }).then((response) => {
        if (response.ok) {
            showToast('Usuário criado com sucesso!', 'success');
            closeModal('newUserModal');
            setTimeout(() => window.location.reload(), 2000);
        } else {
            response.json().then((error) => {
                showToast(error.message || 'Erro ao criar usuário', 'error');
            });
        }
    }).catch((error) => {
        console.error('Erro:', error);
        showToast('Erro ao criar usuário', 'error');
    });
}