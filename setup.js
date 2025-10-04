// Script para criar usuário administrador de teste
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const User = require('./models/User');
const Book = require('./models/Book');

async function createAdminUser() {
    try {
        // Conectar ao banco
        await mongoose.connect(process.env.DB_URL);
        console.log('Conectado ao banco de dados');

        // Verificar se já existe um admin
        const existingAdmin = await User.findOne({ type: 'admin' });
        if (existingAdmin) {
            console.log('Usuário admin já existe:', existingAdmin.username);
        } else {
            // Criar hash da senha
            const hashedPassword = await bcrypt.hash('admin123', 10);

            // Criar usuário admin
            const adminUser = new User({
                username: 'admin',
                fullName: 'Administrador do Sistema',
                email: 'admin@biblioteca.com',
                password: hashedPassword,
                type: 'admin'
            });

            await adminUser.save();
            console.log('✅ Usuário administrador criado com sucesso!');
            console.log('Username: admin');
            console.log('Senha: admin123');
        }

        // Verificar se já existe um estudante
        const existingStudent = await User.findOne({ username: 'estudante' });
        if (existingStudent) {
            console.log('Usuário estudante já existe:', existingStudent.username);
        } else {
            // Criar um usuário estudante de teste
            const studentPassword = await bcrypt.hash('student123', 10);
            const studentUser = new User({
                username: 'estudante',
                fullName: 'Estudante Teste',
                email: 'estudante@teste.com',
                password: studentPassword,
                type: 'student'
            });

            await studentUser.save();
            console.log('✅ Usuário estudante criado com sucesso!');
            console.log('Username: estudante');
            console.log('Senha: student123');
        }

        // Criar 100 livros aleatórios
        console.log('\n📚 Criando 100 livros aleatórios...');
        await createRandomBooks(100);

        // Criar 20 usuários aleatórios
        console.log('\n👥 Criando 20 usuários aleatórios...');
        await createRandomUsers(20);

        process.exit(0);
    } catch (error) {
        console.error('❌ Erro ao criar usuários:', error);
        process.exit(1);
    }
}

// Função para criar livros aleatórios
async function createRandomBooks(count) {
    const bookTitles = [
        "O Senhor dos Anéis", "1984", "Dom Casmurro", "O Pequeno Príncipe", "Harry Potter e a Pedra Filosofal",
        "O Alquimista", "Cem Anos de Solidão", "Crime e Castigo", "O Cortiço", "Memórias Póstumas de Brás Cubas",
        "O Grande Gatsby", "Orgulho e Preconceito", "A Metamorfose", "O Sol é Para Todos", "Moby Dick",
        "Guerra e Paz", "Anna Karenina", "O Apanhador no Campo de Centeio", "Lolita", "Ulisses",
        "Cem Anos de Solidão", "O Nome da Rosa", "A Insustentável Leveza do Ser", "O Estrangeiro", "Fahrenheit 451",
        "O Conde de Monte Cristo", "Os Miseráveis", "Madame Bovary", "O Retrato de Dorian Gray", "Drácula",
        "Frankenstein", "O Hobbit", "As Crônicas de Nárnia", "Neuromancer", "Duna", "Fundação",
        "O Guia do Mochileiro das Galáxias", "2001: Uma Odisseia no Espaço", "Blade Runner", "O Código Da Vinci",
        "Anjos e Demônios", "O Símbolo Perdido", "Inferno", "Origem", "A Cabana", "O Menino do Pijama Listrado",
        "A Culpa é das Estrelas", "Me Chame Pelo Seu Nome", "Eleanor & Park", "Cinquenta Tons de Cinza",
        "Crepúsculo", "Jogos Vorazes", "Divergente", "Percy Jackson", "As Aventuras de Sherlock Holmes",
        "O Silêncio dos Inocentes", "O Iluminado", "It - A Coisa", "Carrie", "O Cemitério Maldito",
        "Misery", "Doctor Sleep", "Pet Sematary", "Salem's Lot", "The Dark Tower", "The Shining",
        "The Stand", "Christine", "Firestarter", "The Dead Zone", "Cujo", "Different Seasons",
        "IT", "The Outsider", "Billy Summers", "Later", "If It Bleeds", "The Institute",
        "Elevation", "Sleeping Beauties", "End of Watch", "Finders Keepers", "Mr. Mercedes",
        "Revival", "Doctor Sleep", "Joyland", "11/22/63", "Under the Dome", "Full Dark, No Stars",
        "Blockade Billy", "Just After Sunset", "Duma Key", "Lisey's Story", "Cell", "The Dark Tower VII",
        "The Dark Tower VI", "The Dark Tower V", "The Dark Tower IV", "The Dark Tower III", "The Dark Tower II",
        "The Dark Tower I", "Hearts in Atlantis", "The Girl Who Loved Tom Gordon", "Bag of Bones", "Storm of the Century",
        "The Green Mile", "Rose Madder", "Insomnia", "Gerald's Game", "Dolores Claiborne", "Needful Things",
        "The Dark Half", "The Tommyknockers", "It", "Eyes of the Dragon", "The Talisman", "Pet Sematary"
    ];

    const authors = [
        "J.R.R. Tolkien", "George Orwell", "Machado de Assis", "Antoine de Saint-Exupéry", "J.K. Rowling",
        "Paulo Coelho", "Gabriel García Márquez", "Fiódor Dostoiévski", "Aluísio Azevedo", "F. Scott Fitzgerald",
        "Jane Austen", "Franz Kafka", "Harper Lee", "Herman Melville", "Lev Tolstói", "J.D. Salinger",
        "Vladimir Nabokov", "James Joyce", "Umberto Eco", "Milan Kundera", "Albert Camus", "Ray Bradbury",
        "Alexandre Dumas", "Victor Hugo", "Gustave Flaubert", "Oscar Wilde", "Bram Stoker", "Mary Shelley",
        "C.S. Lewis", "William Gibson", "Frank Herbert", "Isaac Asimov", "Douglas Adams", "Arthur C. Clarke",
        "Philip K. Dick", "Dan Brown", "William P. Young", "John Boyne", "John Green", "André Aciman",
        "Rainbow Rowell", "E.L. James", "Stephenie Meyer", "Suzanne Collins", "Veronica Roth", "Rick Riordan",
        "Arthur Conan Doyle", "Thomas Harris", "Stephen King", "Agatha Christie", "Edgar Allan Poe",
        "H.P. Lovecraft", "Dean Koontz", "Gillian Flynn", "Tana French", "Louise Penny", "Michael Crichton",
        "John Grisham", "James Patterson", "David Baldacci", "Harlan Coben", "Lee Child", "Jeffery Deaver",
        "Karin Slaughter", "Tess Gerritsen", "Patricia Cornwell", "Jonathan Kellerman", "Michael Connelly",
        "Robert B. Parker", "Sue Grafton", "Sara Paretsky", "Marcia Muller", "Linda Barnes", "Julie Smith"
    ];

    const publishers = [
        "Companhia das Letras", "Record", "Globo Livros", "Rocco", "Intrínseca", "Planeta",
        "Arqueiro", "Aleph", "DarkSide Books", "NewPOP", "Galera Record", "Verus",
        "Penguin Random House", "HarperCollins", "Simon & Schuster", "Macmillan", "Hachette",
        "Scholastic", "Bloomsbury", "Vintage", "Anchor Books", "Bantam", "Dell", "Ballantine"
    ];

    for (let i = 0; i < count; i++) {
        try {
            const randomTitle = bookTitles[Math.floor(Math.random() * bookTitles.length)];
            const randomAuthor = authors[Math.floor(Math.random() * authors.length)];
            const randomPublisher = publishers[Math.floor(Math.random() * publishers.length)];
            
            // Gerar ISBN aleatório
            const isbn = `978-${Math.floor(Math.random() * 10)}-${Math.floor(Math.random() * 90000) + 10000}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 10)}`;
            
            // Gerar ano aleatório entre 1950 e 2024
            const year = Math.floor(Math.random() * 75) + 1950;
            
            // Gerar número de páginas aleatório entre 100 e 800
            const pages = Math.floor(Math.random() * 700) + 100;

            const book = new Book({
                title: `${randomTitle} - Volume ${i + 1}`,
                author: randomAuthor,
                editor: randomPublisher,
                isbn: isbn,
                available: Math.random() > 0.3 // 70% dos livros disponíveis
            });

            await book.save();
            
            if ((i + 1) % 20 === 0) {
                console.log(`📖 ${i + 1} livros criados...`);
            }
        } catch (error) {
            console.error(`❌ Erro ao criar livro ${i + 1}:`, error.message);
        }
    }
    
    console.log('✅ 100 livros aleatórios criados com sucesso!');
}

// Função para criar usuários aleatórios
async function createRandomUsers(count) {
    const firstNames = [
        "Ana", "João", "Maria", "Pedro", "Carla", "Bruno", "Juliana", "Rafael", "Fernanda", "Lucas",
        "Camila", "Gabriel", "Beatriz", "Diego", "Larissa", "Mateus", "Natália", "Thiago", "Priscila", "Vitor",
        "Amanda", "Leonardo", "Patrícia", "Rodrigo", "Vanessa", "Felipe", "Débora", "Marcelo", "Cristina", "André",
        "Mariana", "Ricardo", "Sandra", "Gustavo", "Renata", "Eduardo", "Mônica", "Fábio", "Simone", "Daniel",
        "Adriana", "Paulo", "Elaine", "Carlos", "Tatiana", "Roberto", "Karina", "Alexandre", "Luciana", "Sérgio"
    ];

    const lastNames = [
        "Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Pereira", "Lima", "Gomes",
        "Costa", "Ribeiro", "Martins", "Carvalho", "Almeida", "Lopes", "Soares", "Fernandes", "Vieira", "Barbosa",
        "Rocha", "Dias", "Monteiro", "Cardoso", "Reis", "Araújo", "Campos", "Franco", "Moreira", "Freitas"
    ];

    for (let i = 0; i < count; i++) {
        try {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${firstName} ${lastName}`;
            
            // Criar username único
            const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${i + 1}`;
            
            // Criar email único
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@email.com`;
            
            // Alternar entre student e teacher (80% students, 20% teachers)
            const userType = Math.random() > 0.8 ? 'teacher' : 'student';
            
            // Hash da senha padrão
            const hashedPassword = await bcrypt.hash('password123', 12);

            const user = new User({
                fullName: fullName,
                username: username,
                email: email,
                password: hashedPassword,
                type: userType
            });

            await user.save();
            
            if ((i + 1) % 5 === 0) {
                console.log(`👤 ${i + 1} usuários criados...`);
            }
        } catch (error) {
            console.error(`❌ Erro ao criar usuário ${i + 1}:`, error.message);
        }
    }
    
    console.log('✅ 20 usuários aleatórios criados com sucesso!');
    console.log('📝 Senha padrão para todos os usuários: password123');
}

createAdminUser();