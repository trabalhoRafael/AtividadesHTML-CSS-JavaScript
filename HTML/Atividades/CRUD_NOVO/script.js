/* =========================================================
   CADASTRO DE USUÁRIO EXTERNO - script.js
   Funciona sem alterar o HTML/CSS existentes.
   ========================================================= */

/* ---------- 0. ESTILO DOS ERROS (injetado pelo próprio script) ---------- */

const estilo = document.createElement('style');
estilo.textContent = `
    .erro { color: #c0392b; font-size: 11px; }
    .campo input.invalido,
    .campo select.invalido { border: 1px solid #c0392b; }
`;
document.head.appendChild(estilo);

const botaoEnviar = document.querySelector('.botoes button[type="submit"]');
const botaoVoltar = document.querySelector('.botoes button[type="reset"]');


/* ---------- 1. MÁSCARAS ---------- */

const somenteDigitos = (valor) => valor.replace(/\D/g, '');

const mascaras = {
    cpf(valor) {
        return somenteDigitos(valor)
            .slice(0, 11)
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    },

    telefone(valor) {
        const d = somenteDigitos(valor).slice(0, 11);

        if (d.length <= 2) return d.replace(/(\d{0,2})/, '($1');
        if (d.length <= 6) return d.replace(/(\d{2})(\d+)/, '($1) $2');
        if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
        return d.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
    },

    cep(valor) {
        return somenteDigitos(valor)
            .slice(0, 8)
            .replace(/(\d{5})(\d)/, '$1-$2');
    }
};

function aplicarMascara(idCampo, funcaoMascara) {
    const campo = document.getElementById(idCampo);
    campo.addEventListener('input', () => {
        campo.value = funcaoMascara(campo.value);
    });
}

aplicarMascara('cpf', mascaras.cpf);
aplicarMascara('telefone_fixo', mascaras.telefone);
aplicarMascara('telefone_celular', mascaras.telefone);
aplicarMascara('cep', mascaras.cep);


/* ---------- 2. VALIDAÇÃO ---------- */

function cpfValido(cpf) {
    cpf = somenteDigitos(cpf);

    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    const calcularDigito = (base) => {
        let soma = 0;
        for (let i = 0; i < base; i++) {
            soma += Number(cpf[i]) * (base + 1 - i);
        }
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };

    return calcularDigito(9) === Number(cpf[9]) &&
           calcularDigito(10) === Number(cpf[10]);
}

const emailValido = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/* Cada regra retorna uma mensagem de erro ("" = válido) */
const regras = {
    nome: (v) => {
        if (!v) return 'Informe o nome do representante.';
        if (v.split(/\s+/).length < 2) return 'Informe o nome completo.';
        return '';
    },
    cpf: (v) => {
        if (!v) return 'Informe o CPF.';
        if (!cpfValido(v)) return 'CPF inválido.';
        return '';
    },
    rg: (v) => (v ? '' : 'Informe o RG.'),
    orgao_expedidor: (v) => (v ? '' : 'Informe o órgão expedidor.'),
    telefone_fixo: (v) => {
        if (v && somenteDigitos(v).length < 10) return 'Telefone incompleto.';
        return '';
    },
    telefone_celular: (v) => {
        if (!v) return 'Informe o telefone celular.';
        if (somenteDigitos(v).length < 11) return 'Celular incompleto.';
        return '';
    },
    endereco_residencial: (v) => (v ? '' : 'Informe o endereço.'),
    bairro: (v) => (v ? '' : 'Informe o bairro.'),
    estado: (v) => (v ? '' : 'Selecione o estado.'),
    cidade: (v) => (v ? '' : 'Informe a cidade.'),
    cep: (v) => {
        if (!v) return 'Informe o CEP.';
        if (somenteDigitos(v).length !== 8) return 'CEP inválido.';
        return '';
    },
    email: (v) => {
        if (!v) return 'Informe o e-mail.';
        if (!emailValido(v)) return 'E-mail inválido.';
        return '';
    },
    senha: (v) => {
        if (!v) return 'Informe a senha.';
        if (v.length < 8) return 'A senha deve ter pelo menos 8 caracteres.';
        if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) {
            return 'Use letras e números na senha.';
        }
        return '';
    },
    confirmar_senha: (v) => {
        if (!v) return 'Confirme a senha.';
        if (v !== document.getElementById('senha').value) {
            return 'As senhas não coincidem.';
        }
        return '';
    }
};

const idsDosCampos = [
    ...Object.keys(regras),
    'complemento'
];


/* ---------- 3. EXIBIÇÃO DE ERROS ---------- */

function mostrarErro(campo, mensagem) {
    let span = campo.parentElement.querySelector('.erro');

    if (!span) {
        span = document.createElement('span');
        span.className = 'erro';
        campo.parentElement.appendChild(span);
    }

    span.textContent = mensagem;
    campo.classList.toggle('invalido', mensagem !== '');
}

function validarCampo(campo) {
    const regra = regras[campo.id];
    if (!regra) return true;

    const valor = campo.type === 'password' ? campo.value : campo.value.trim();
    const mensagem = regra(valor);

    mostrarErro(campo, mensagem);
    return mensagem === '';
}

function validarFormulario() {
    let primeiroInvalido = null;

    Object.keys(regras).forEach((id) => {
        const campo = document.getElementById(id);
        if (!validarCampo(campo) && !primeiroInvalido) {
            primeiroInvalido = campo;
        }
    });

    if (primeiroInvalido) primeiroInvalido.focus();
    return primeiroInvalido === null;
}

Object.keys(regras).forEach((id) => {
    const campo = document.getElementById(id);

    campo.addEventListener('blur', () => validarCampo(campo));

    campo.addEventListener('input', () => {
        if (campo.classList.contains('invalido')) validarCampo(campo);
    });
});

document.getElementById('senha').addEventListener('input', () => {
    const confirmacao = document.getElementById('confirmar_senha');
    if (confirmacao.value) validarCampo(confirmacao);
});


/* ---------- 4. BUSCA AUTOMÁTICA PELO CEP (ViaCEP) ---------- */

document.getElementById('cep').addEventListener('blur', async () => {
    const cep = somenteDigitos(document.getElementById('cep').value);
    if (cep.length !== 8) return;

    try {
        const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const dados = await resposta.json();

        if (dados.erro) {
            mostrarErro(document.getElementById('cep'), 'CEP não encontrado.');
            return;
        }

        const preencher = (id, valor) => {
            const campo = document.getElementById(id);
            if (valor && !campo.value) {
                campo.value = valor;
                validarCampo(campo);
            }
        };

        preencher('endereco_residencial', dados.logradouro);
        preencher('bairro', dados.bairro);
        preencher('cidade', dados.localidade);
        preencher('estado', dados.uf);

    } catch (erro) {
        console.warn('Não foi possível consultar o CEP:', erro);
    }
});


/* ---------- 5. ENVIAR E VOLTAR ---------- */

function limparFormulario() {
    idsDosCampos.forEach((id) => {
        const campo = document.getElementById(id);
        campo.value = '';
        campo.classList.remove('invalido');
    });
    document.querySelectorAll('.erro').forEach((span) => (span.textContent = ''));
}

async function enviarFormulario() {
    if (!validarFormulario()) return;

    const valor = (id) => document.getElementById(id).value.trim();
    const numeros = (id) => somenteDigitos(document.getElementById(id).value);

    const dados = {
        nome: valor('nome'),
        cpf: numeros('cpf'),
        rg: valor('rg'),
        orgao_expedidor: valor('orgao_expedidor'),
        telefone_fixo: numeros('telefone_fixo'),
        telefone_celular: numeros('telefone_celular'),
        endereco_residencial: valor('endereco_residencial'),
        complemento: valor('complemento'),
        bairro: valor('bairro'),
        estado: document.getElementById('estado').value,
        cidade: valor('cidade'),
        cep: numeros('cep'),
        email: valor('email'),
        senha: document.getElementById('senha').value
    };

    try {
        /* Troque pela URL real do seu servidor:
        const resposta = await fetch('/api/usuarios-externos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });
        if (!resposta.ok) throw new Error('Erro no servidor');
        */

        console.log('Dados prontos para envio:', { ...dados, senha: '********' });
        alert('Cadastro enviado com sucesso!');
        limparFormulario();

    } catch (erro) {
        alert('Não foi possível enviar o cadastro. Tente novamente.');
        console.error(erro);
    }
}

botaoEnviar.addEventListener('click', enviarFormulario);
botaoVoltar.addEventListener('click', limparFormulario);

// Enter dentro de um campo também envia
document.querySelectorAll('.campo input').forEach((campo) => {
    campo.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') enviarFormulario();
    });
});