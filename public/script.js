// Referências aos elementos da tela
const form = document.getElementById('formPessoa');
const tabelaCorpo = document.getElementById('tabelaCorpo');
const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');

const inputBuscaNome = document.getElementById('buscaNome');
const btnBuscar = document.getElementById('btnBuscar');
const btnLimparBusca = document.getElementById('btnLimparBusca');

let editandoId = null;

// Carrega lista ao abrir a página
document.addEventListener('DOMContentLoaded', carregarPessoas);

// Submit do formulário (salvar pessoa)
form.addEventListener('submit', function (event) {
  event.preventDefault();

  const dados = {
    nome: document.getElementById('nome').value,
    email: document.getElementById('email').value,
    telefone: document.getElementById('telefone').value,
    data_nascimento: document.getElementById('data_nascimento').value
  };

  if (!dados.nome) {
    alert('Nome é obrigatório.');
    return;
  }

  if (editandoId) {
    atualizarPessoa(editandoId, dados);
  } else {
    criarPessoa(dados);
  }
});

// Clique no botão Buscar
btnBuscar.addEventListener('click', () => {
  const termo = inputBuscaNome.value.trim();
  if (termo === '') {
    carregarPessoas();
  } else {
    buscarPessoasPorNome(termo);
  }
});

// Clique no botão Limpar
btnLimparBusca.addEventListener('click', () => {
  inputBuscaNome.value = '';
  carregarPessoas();
});

// Clique no botão Cancelar edição
btnCancelarEdicao.addEventListener('click', () => {
  limparFormulario();
});

// ========== FUNÇÕES DE LISTAGEM ==========

function carregarPessoas() {
  fetch('/api/pessoas')
    .then(res => res.json())
    .then(pessoas => {
      desenharTabela(pessoas);
    })
    .catch(err => {
      console.error('Erro ao carregar pessoas', err);
      alert('Erro ao carregar pessoas');
    });
}

function buscarPessoasPorNome(nome) {
  fetch(`/api/pessoas/busca?nome=${encodeURIComponent(nome)}`)
    .then(async res => {
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        // Se o servidor respondeu com erro (HTTP 500, por exemplo)
        console.error('Erro HTTP na busca:', data);
        throw data || { error: 'Erro desconhecido na busca' };
      }

      return data;
    })
    .then(pessoas => {
      desenharTabela(pessoas);
    })
    .catch(err => {
      console.error('Erro ao buscar pessoas por nome (front-end):', err);
      alert(err.error || err.details || 'Erro ao buscar pessoas por nome');
    });
}


function desenharTabela(pessoas) {
  tabelaCorpo.innerHTML = '';

  pessoas.forEach((pessoa, index) => {
    const tr = document.createElement('tr');

    const numeroLinha = index + 1; // 1, 2, 3, 4...

    tr.innerHTML = `
      <td>${numeroLinha}</td>
      <td>${pessoa.nome}</td>
      <td>${pessoa.email || ''}</td>
      <td>${pessoa.telefone || ''}</td>
      <td>${pessoa.data_nascimento || ''}</td>
      <td class="acoes">
        <button class="btn btn-secondary" onclick="editarPessoa(${pessoa.id})">Editar</button>
        <button class="btn btn-danger" onclick="excluirPessoa(${pessoa.id})">Excluir</button>
      </td>
    `;

    tabelaCorpo.appendChild(tr);
  });
}



// ========== FUNÇÕES CRUD (BACK-END) ==========

function criarPessoa(dados) {
  fetch('/api/pessoas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(e => { throw e; });
      }
      return res.json();
    })
    .then(() => {
      limparFormulario();
      carregarPessoas();
    })
    .catch(err => {
      console.error('Erro ao criar pessoa', err);
      alert(err.error || 'Erro ao criar pessoa');
    });
}

function atualizarPessoa(id, dados) {
  fetch(`/api/pessoas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dados)
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(e => { throw e; });
      }
      return res.json();
    })
    .then(() => {
      limparFormulario();
      carregarPessoas();
    })
    .catch(err => {
      console.error('Erro ao atualizar pessoa', err);
      alert(err.error || 'Erro ao atualizar pessoa');
    });
}

function editarPessoa(id) {
  fetch(`/api/pessoas/${id}`)
    .then(res => {
      if (!res.ok) {
        return res.json().then(e => { throw e; });
      }
      return res.json();
    })
    .then(pessoa => {
      editandoId = pessoa.id;
      document.getElementById('id').value = pessoa.id;
      document.getElementById('nome').value = pessoa.nome || '';
      document.getElementById('email').value = pessoa.email || '';
      document.getElementById('telefone').value = pessoa.telefone || '';
      document.getElementById('data_nascimento').value = pessoa.data_nascimento || '';

      btnCancelarEdicao.style.display = 'inline-block';
    })
    .catch(err => {
      console.error('Erro ao buscar pessoa', err);
      alert(err.error || 'Erro ao buscar pessoa');
    });
}

function excluirPessoa(id) {
  if (!confirm('Tem certeza que deseja excluir esta pessoa?')) return;

  fetch(`/api/pessoas/${id}`, {
    method: 'DELETE'
  })
    .then(res => {
      if (!res.ok) {
        return res.json().then(e => { throw e; });
      }
      return res.json();
    })
    .then(() => {
      if (editandoId === id) limparFormulario();
      carregarPessoas();
    })
    .catch(err => {
      console.error('Erro ao excluir pessoa', err);
      alert(err.error || 'Erro ao excluir pessoa');
    });
}

// ========== UTILITÁRIOS ==========

function limparFormulario() {
  editandoId = null;
  form.reset();
  document.getElementById('id').value = '';
  btnCancelarEdicao.style.display = 'none';
}
