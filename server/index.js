import express from 'express';
const app = express();
const port = 3000;
app.use(express.json());

// ================================
// Persistência em memória
// ================================
const usuarios = [];

// ================================
// Funções de Validação
// ================================

function validarNome(nome) {
    if (typeof nome !== 'string') return 'Nome inválido';

    const tamanho = nome.trim().length;
    if (tamanho >= 2 && tamanho <= 50) return null;

    return 'Nome inválido';
}

function validarEmail(email) {
    if (typeof email !== 'string') return 'Email inválido';

    const texto = email.trim();
    const quantosArroba = texto.split('@').length - 1;
    const quantosPonto = texto.split('.').length - 1;

    const arroba = texto.indexOf('@');
    const ponto = texto.indexOf('.');

    if (
        quantosArroba === 1 &&
        quantosPonto >= 1 &&
        arroba > 0 &&
        ponto - arroba > 1 &&
        ponto < texto.length - 1 &&
        texto[texto.length - 1] !== '.'
    ) {
        return null;
    }

    return 'Email inválido';
}

function validarSenha(senha) {
    if (typeof senha !== 'string') return 'Senha inválida';

    const letra = /[a-zA-Z]/.test(senha);
    const numero = /\d/.test(senha);
    const especialPermitido = /[*#;]/.test(senha);
    const especialProibido = /[^a-zA-Z0-9*#;]/.test(senha);

    if (
        senha.length > 9 &&
        letra &&
        numero &&
        especialPermitido &&
        !especialProibido
    ) {
        return null;
    }

    return 'Senha fraca';
}

function validarConfirmarSenha(senha, confirmarSenha) {
    if (senha === confirmarSenha) return null;
    return 'Senhas não coincidem';
}

function validarCep(cep) {
    if (typeof cep !== 'string') return 'CEP inválido';

    const texto = cep.trim();
    const cepNumerico = /^[\d-]+$/.test(texto);
    const quantosHifen = texto.split('-').length - 1;

    if (
        cepNumerico &&
        texto.length === 9 &&
        quantosHifen === 1
    ) {
        return null;
    }

    return 'CEP inválido';
}

function validarEndereco(endereco) {
    if (typeof endereco !== 'string') return 'Endereço inválido';
    if (endereco.trim().length > 2) return null;
    return 'Endereço inválido';
}

function validarEstado(estado) {
    if (typeof estado !== 'string') return 'Estado inválido';

    const texto = estado.trim();
    const apenasMaiusculas = /^[A-Z]+$/.test(texto);

    if (apenasMaiusculas && texto.length === 2) return null;
    return 'Estado inválido';
}

function validarCidade(cidade) {
    if (typeof cidade !== 'string') return 'Cidade inválida';
    if (cidade.trim().length > 2) return null;
    return 'Cidade inválida';
}

function contemAtaqueSQL(valor) {
    if (typeof valor !== 'string') return false;

    const ataques = ['SELECT', 'CREATE', 'DELETE', 'UPDATE'];
    const texto = valor.toUpperCase();

    return ataques.some(palavra => texto.includes(palavra));
}

// ================================
// Rota de Cadastro
// ================================
app.post('/cadastrar_usurario', (req, res) => {

    const {
        nome,
        email,
        senha,
        confirmarSenha,
        cep,
        endereco,
        estado,
        cidade
    } = req.body;

    const erros = [];

Object.values(req.body).forEach(valor => {
    if (contemAtaqueSQL(valor)) {
        erros.push('Tentativa de injeção SQL');
    }
});

if (erros.length > 0) {
    return res.status(500).json(erros);
}


    const validacoes = [
        validarNome(nome),
        validarEmail(email),
        validarSenha(senha),
        validarConfirmarSenha(senha, confirmarSenha),
        validarCep(cep),
        validarEndereco(endereco),
        validarEstado(estado),
        validarCidade(cidade)
    ];

    validacoes.forEach(erro => {
        if (erro) erros.push(erro);
    });

    if (erros.length > 0) {
        return res.status(500).json(erros);
    }

    // Persistência em memória
    usuarios.push({
        nome,
        email,
        senha,
        cep,
        endereco,
        estado,
        cidade
    });
console.log(usuarios);

    return res.status(200).json({
    sucesso: true,
    mensagem: 'Cadastro realizado com sucesso'
});

});

// ================================
// Inicialização do servidor
// ================================
app.listen(port, () => {
    console.log(`server rodando na porta http://localhost:${port}`);
});
