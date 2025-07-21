async function createBook(){
    try {
        if(!document.getElementById('title').value || !document.getElementById('autor').value || !document.getElementById('category').value){
            showToast('Preencha todos os campos', 'error');
            return;
        }
        const data = {
            title: document.getElementById('title').value,
            autor: document.getElementById('autor').value,
            category: document.getElementById('category').value
        }
        const response = await fetch('/api/books/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        if(response.ok){
            showToast('Livro criado com sucesso!', 'success');
            closeModal('addBookModal');
            setTimeout(() => window.location.reload(), 2000);
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao salvar livro', 'error');
    }
}


async function bookEdit(){
    try{

        const book = {
            bookID: document.getElementById('editBookId').value,
            title: document.getElementById('editTitle').value,
            autor: document.getElementById('editAutor').value,
            category: document.getElementById('editCategory').value
        }
    
        if(!book.title || !book.autor || !book.category ){
            showToast('Preencha todos os campos', 'error')
            return
        }

        const editBookResponse = await fetch(`/api/books/edit/${book.bookID}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(book)
        }) 

        if(editBookResponse.ok){
            showToast('Livro editado com sucesso', 'success')
            closeModal('editBookModal')
            setTimeout(() => window.location.reload(), 2000)
        }else{
            showToast('Erro ao editar livro', 'error')
        }

    }catch(e){
        console.error(e)
        showToast('Erro ao editar livro', 'error')
    }
}

async function deleteBook(){
    try {
        const bookID = document.getElementById('deleteBookId').value;
        if(!bookID){
            showToast('Não foi possível encontrar esse livro', 'error');
            return;
        }

        const response = await fetch(`/api/books/delete/${bookID}`, {
            method: 'POST'
        });
        if(response.ok){
            showToast('Livro deletado com sucesso!', 'success');
            closeModal('deleteBookModal')
            setTimeout(() => window.location.reload(), 2000);
        }
    } catch (error) {
        console.error('Erro:', error);
        showToast('Erro ao deletar livro', 'error');
    }
}

async function searchByISBN() {
    const isbn = document.getElementById('isbn').value;
    if (!isbn) {
        showToast('Digite um ISBN válido', 'error');
        return;
    }

    try {
        showToast('Buscando informações do livro...', 'info');

        const googleResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
        const googleData = await googleResponse.json();

        if (googleData.items && googleData.items.length > 0) {
            const bookInfo = googleData.items[0].volumeInfo;
            
            // Verifica e trata cada campo antes de atribuir
            const title = typeof bookInfo.title === 'object' ? '' : bookInfo.title || '';
            const author = Array.isArray(bookInfo.authors) ? bookInfo.authors[0] : '';
            const category = Array.isArray(bookInfo.categories) ? bookInfo.categories[0] : '';

            document.getElementById('title').value = title;
            document.getElementById('autor').value = author;
            document.getElementById('category').value = category;
            showToast('Informações encontradas!', 'success');
            return;
        }

        const openLibraryResponse = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
        const openLibraryData = await openLibraryResponse.json();
        
        if (openLibraryData[`ISBN:${isbn}`]) {
            const bookInfo = openLibraryData[`ISBN:${isbn}`];
            
            // Verifica e trata cada campo antes de atribuir
            const title = typeof bookInfo.title === 'object' ? '' : bookInfo.title || '';
            const author = bookInfo.authors && bookInfo.authors[0] ? 
                          (typeof bookInfo.authors[0].name === 'object' ? '' : bookInfo.authors[0].name) : '';
            const category = bookInfo.subjects && bookInfo.subjects[0] ? 
                           (typeof bookInfo.subjects[0] === 'object' ? '' : bookInfo.subjects[0]) : '';

            document.getElementById('title').value = title;
            document.getElementById('autor').value = author;
            document.getElementById('category').value = category;
            showToast('Informações encontradas!', 'success');
            return;
        }

        showToast('Livro não encontrado', 'error');
    } catch (error) {
        console.error('Erro ao buscar livro:', error);
        showToast('Erro ao buscar informações do livro', 'error');
    }
}
