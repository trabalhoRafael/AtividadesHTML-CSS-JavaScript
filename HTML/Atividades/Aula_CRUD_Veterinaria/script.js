const CHAVE_STORAGE='Animais_crud_dados';
let listaAnimais=[];

window.onload=function()
{
    carregarDados();
    atualizarTabela();
    
}
function carregarDados()
{
    const dados=localStorage.getItem(CHAVE_STORAGE);
    if (dados)
        {
            listaAnimais=JSON.parse(dados);
        }
    else
        {
            listaAnimais=[
                {id:'1',nome:'rex',especie:'vira lata',idade:'4',peso:'18'},
                {id:'2',nome:'lina',especie:'siamês',idade:'4',peso:'10'}
            ];
            salvarStorage();
        }

}
function salvarStorage()
{
    localStorage.setItem(CHAVE_STORAGE,JSON.stringify(listaAnimais));
}
function atualizarTabela() 
{
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if(listaAnimais.length===0)
        {
            tbody.innerHTML=`
            <tr>
                <td colspan="5"class="empty-msg">
                    Nenhum animal cadastrado
                </td>
            </tr>`;
            return;
        }
    listaAnimais.forEach( animal=> {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${escaparHTML(animal.nome)}</td>
                    <td>${escaparHTML(animal.especie)}</td>
                    <td>${animal.idade}</td>
                    <td>${animal.peso} kg</td>
                    <td>
                        <button type="button" class="btn-edit" onclick="editarAnimal('${animal.id}')">Editar</button>
                        <button type="button" class="btn-delete" onclick="excluirAnimal('${animal.id}')">Excluir</button>
                        
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        function salvarAnimal(event) {
            event.preventDefault();

            const id = document.getElementById('anmId').value;
            const nome = document.getElementById('nome').value.trim();
            const especie = document.getElementById('especie').value.trim();
            const idade = parseInt(document.getElementById('idade').value);
            const peso = parseFloat(document.getElementById('peso').value);

            if (id) {
                const index = listaAnimais.findIndex(v => v.id === id);
                if (index !== -1) {
                    listaAnimais[index] = { id, nome, especie, idade, peso };
                }
            } 
            else {
                const novoAnimal = {
                    id: Date.now().toString(),
                    nome,
                    especie,
                    idade,
                    peso
                };
                listaAnimais.push(novoAnimal);
            }

            salvarStorage();
            atualizarTabela();
        }

        function editarAnimal(id) {
            const animal = listaAnimais.find(v => v.id === id);
            if (!animal) return;// SE O Animal NÃO FOR ACHADO PELA LINHA ANTERIOR, VOCÊ RETORNA PARA TELA PRINCIPAL

            document.getElementById('anmId').value = animal.id;//CASO ELE SEJA ENCROTRADO VOCÊ PROSSEGUE COM O PREENCHIMENTJO NO FORM
            document.getElementById('nome').value = animal.nome;
            document.getElementById('especie').value = animal.especie;
            document.getElementById('idade').value = animal.idade;
            document.getElementById('peso').value = animal.peso;

            document.getElementById('form-title').innerText = 'Editar Animal';
            document.getElementById('btnSubmit').innerText = 'Atualizar';
        }

        function excluirAnimal(id) {
            if (confirm('Deseja realmente excluir este Animal?')) {
                listaAnimais = listaAnimais.filter(v => v.id !== id);
                salvarStorage();
                atualizarTabela();
            }
        }
        function escaparHTML(str) {//ESSE MÉTODO É PARA EVITAR ATAQUES DE CROSS SCRIPTING E AJUDA NO TRATAMENTO DE TAGS
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;");
        }
 
