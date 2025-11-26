const form = document.getElementById('formPessoa');
const tabelaCorpo = document.getElementById('tabelaCorpo');
const btnCancelarEdicao = document.getElementById('btnCancelarEdicao');

let editandoId = null;

// Carrega lista ao abrir a página
document.addEventListener('DOMContentLoaded', carregarPessoas);

// Submit do formulário
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

// Botão cancelar edição
btnCancelarEdicao.addEventListener('click', () => {
  limparFormulario();
});

// Funções CRUD

function carregarPessoas() {
  fetch('/api/pessoas')
    .then(res => res.json())
    .then(pessoas => {
      tabelaCorpo.innerHTML = '';
      pessoas.forEach(pessoa => {
        const tr = document.createElement('tr');

        tr.innerHTML = `
          <td>${pessoa.id}</td>
          <td>${pessoa.nome}</td>
          <td>${pessoa.email || ''}</td>
          <td>${pessoa.telefone || ''}</td>
          <td>${pessoa.data_nascimento || ''}</td>
          <td>
            <button onclick="editarPessoa(${pessoa.id})">Editar</button>
            <button onclick="excluirPessoa(${pessoa.id})">Excluir</button>
          </td>
        `;

        tabelaCorpo.appendChild(tr);
      });
    })
    .catch(err => {
      console.error('Erro ao carregar pessoas', err);
      alert('Erro ao carregar pessoas');
    });
}

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

function limparFormulario() {
  editandoId = null;
  form.reset();
  document.getElementById('id').value = '';
  btnCancelarEdicao.style.display = 'none';
}
