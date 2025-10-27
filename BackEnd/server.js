// Carrega variáveis de ambiente do arquivo .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Driver do PostgreSQL
const bcrypt = require('bcrypt'); // Para hash de senha

const app = express();
const port = process.env.PORT || 3001;

// Importar rotas
const nftRoutes = require('./src/routes/nft.routes');

// Middlewares
app.use(cors()); // Permite requisições do frontend
app.use(express.json({ limit: '10mb' })); // Habilita o parsing de JSON (aumenta limite para imagens)
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos (imagens dos NFTs)
app.use('/uploads', express.static('uploads'));

// Configuração da Conexão com o Banco de Dados (lê do .env)
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Teste de Conexão com o DB (opcional)
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err.stack);
  } else {
    console.log('Conectado ao banco de dados:', res.rows[0].now);
  }
});


// Armazena o pool no app para acesso nos controllers
app.locals.pool = pool;

// --- ROTAS ---

// Rotas de NFT
app.use('/api/nft', nftRoutes);


// --- LÓGICA DE VALIDAÇÃO ---

// Regex para validar email
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Regex para validar formato CPF
const cpfFormatRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;

// Função para formatar CPF
function formatCPF(cpf) {
  // Remove tudo que não for dígito
  const digitsOnly = cpf.replace(/\D/g, '');
  // Aplica a formatação se tiver 11 dígitos
  if (digitsOnly.length === 11) {
    return digitsOnly.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return cpf; // Retorna original se não for válido para formatação
}

// --- ENDPOINT DE CADASTRO ---
app.post('/api/auth/register', async (req, res) => {
  const {
    firstName,    // 'Nome' do SignUpForm.jsx
    lastName,     // 'Sobrenome' do SignUpForm.jsx
    cpf,          // 'CPF' do SignUpForm.jsx
    birthDate,    // 'Data de Nascimento' do SignUpForm.jsx
    email,        // 'E-mail' do SignUpForm.jsx
    password,     // 'Senha' do SignUpForm.jsx
    cep,          // 'CEP' do SignUpForm.jsx
    address,      // 'Endereço' do SignUpForm.jsx
    gender        // 'gender' do SignUpForm.jsx
  } = req.body;

  // --- VALIDAÇÕES ---

  // 1. Validação do Email (Formato)
  if (!emailRegex.test(email)) {
    // Usamos return para parar a execução aqui
    return res.status(400).json({ message: 'Formato de e-mail inválido.' });
  }

  // 2. Formatação e Validação do CPF
  const formattedCPF = formatCPF(cpf);
  if (!cpfFormatRegex.test(formattedCPF)) {
    return res.status(400).json({ message: 'Formato de CPF inválido. Use apenas números ou o formato XXX.XXX.XXX-XX.' });
  }
  // TODO: Adicionar validação de CPF real (verificar dígitos verificadores - existem libs para isso)

  // 3. Validação Idade Mínima (já feita no frontend, mas bom validar no backend também)
  const dob = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  if (age < 18) {
    return res.status(400).json({ message: 'Você deve ter pelo menos 18 anos para se cadastrar.' });
  }

  // --- VERIFICAÇÃO DE UNICIDADE E SEGURANÇA ---
  try {
    // 4. Verificar se Email ou CPF já existem (SEGURANÇA: Usando query parametrizada)
    // Usamos $1, $2 como placeholders. O driver 'pg' substitui de forma segura, prevenindo SQL Injection.
    const checkUserQuery = 'SELECT email, cpf FROM users WHERE email = $1 OR cpf = $2';
    const checkUserResult = await pool.query(checkUserQuery, [email, formattedCPF]);

    if (checkUserResult.rows.length > 0) {
      const existing = checkUserResult.rows[0];
      if (existing.email === email) {
        return res.status(409).json({ message: 'Este e-mail já está cadastrado.' }); // 409 Conflict
      }
      if (existing.cpf === formattedCPF) {
        return res.status(409).json({ message: 'Este CPF já está cadastrado.' }); // 409 Conflict
      }
    }

    // 5. Gerar Hash da Senha (SEGURANÇA: Nunca salvar senha pura)
    const saltRounds = 10; // Fator de custo para o bcrypt (quanto maior, mais lento e seguro)
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // --- INSERÇÃO NO BANCO DE DADOS ---
    // (SEGURANÇA: Usando query parametrizada novamente)
    const insertUserQuery = `
      INSERT INTO users (first_name, last_name, cpf, birth_date, email, password_hash, cep, address, gender)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING user_id, email; -- Retorna o ID e email do usuário criado
    `;
    const values = [
      firstName, lastName, formattedCPF, birthDate, email,
      passwordHash, cep, address, gender
    ];

    const newUserResult = await pool.query(insertUserQuery, values);

    // Retorna sucesso
    res.status(201).json({ // 201 Created
      message: 'Usuário cadastrado com sucesso!',
      user: newUserResult.rows[0] // Envia os dados do usuário criado (sem a senha!)
    });

  } catch (error) {
    console.error('Erro ao registrar usuário:', error.stack);
    res.status(500).json({ message: 'Erro interno do servidor ao tentar registrar o usuário.' });
  }
});


// Endpoint de Login (a ser implementado)
app.post('/api/auth/login', async (req, res) => {
  // TODO: Implementar lógica de login
  // 1. Buscar usuário pelo email
  // 2. Comparar hash da senha com bcrypt.compare()
  // 3. Gerar e retornar token JWT se a senha for válida
  res.status(501).json({ message: 'Endpoint de login ainda não implementado.' }); // 501 Not Implemented
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando na porta ${port}`);
});