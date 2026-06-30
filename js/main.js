/* ==========================================================================
   SISTEMA INTEGRADO (BESTIÁRIO & ARSENAL) - A.S.T.R.A. SYSTEM
   ========================================================================== */

document.addEventListener("DOMContentLoaded", function() {
    
    /* ==========================================================================
       1. MÓDULO DO BESTIÁRIO
       ========================================================================== */
    const inputBusca = document.getElementById('busca-anomalia');
    const selectClasse = document.getElementById('filtro-classe');
    const btnBuscar = document.querySelector('.btn-buscar');
    const fichasMonstros = document.querySelectorAll('.ficha-monstro');

    if (inputBusca && selectClasse && fichasMonstros.length > 0) {
        function filtrarBestiario() {
            const termoBuscado = inputBusca.value.toLowerCase().trim();
            const classeSelecionada = selectClasse.value.toLowerCase();

            fichasMonstros.forEach(function(ficha) {
                const nomeMonstro = (ficha.getAttribute('data-nome') || "").toLowerCase();
                const classeMonstro = (ficha.getAttribute('data-classe') || "").toLowerCase();
                const textoFicha = ficha.innerText.toLowerCase(); 

                const passouNaBusca = nomeMonstro.includes(termoBuscado) || textoFicha.includes(termoBuscado);
                const passouNaClasse = (classeSelecionada === 'todos') || (classeMonstro === classeSelecionada);

                if (passouNaBusca && passouNaClasse) {
                    ficha.style.display = "flex";
                } else {
                    ficha.style.display = "none";
                }
            });
        }

        if (btnBuscar) btnBuscar.addEventListener('click', filtrarBestiario);
        inputBusca.addEventListener('keyup', filtrarBestiario);
        selectClasse.addEventListener('change', filtrarBestiario);
    }

    /* ==========================================================================
       2. MÓDULO DO ARSENAL (COM FUNÇÃO DE DOWNLOAD)
       ========================================================================== */
    const campoBuscaItem = document.getElementById('busca-item');
    const botoesAbas = document.querySelectorAll('.btn-aba');
    const cardsItens = document.querySelectorAll('.card-item');
    const painelCreditos = document.getElementById('creditos-valor');
    const listaManifesto = document.getElementById('lista-manifesto');
    const btnLimparCarga = document.querySelector('.btn-limpar-manifesto');
    const btnBaixarManifesto = document.getElementById('btn-baixar-manifesto');

    let saldoAtual = parseInt(painelCreditos?.innerText) || 150;
    let categoriaAtiva = "todos"; 

    if (campoBuscaItem && cardsItens.length > 0) {

        function filtrarArsenal() {
            const termoBuscado = campoBuscaItem.value.toLowerCase().trim();

            cardsItens.forEach(function(card) {
                const nomeItem = (card.getAttribute('data-nome') || "").toLowerCase();
                const categoryItem = card.getAttribute('data-categoria') || "";
                const textoInterno = card.innerText.toLowerCase();

                const bateTexto = nomeItem.includes(termoBuscado) || textoInterno.includes(termoBuscado);
                const bateCategoria = (categoriaAtiva === "todos") || (categoryItem === categoriaAtiva);

                if (bateTexto && bateCategoria) {
                    card.style.display = "flex"; 
                } else {
                    card.style.display = "none"; 
                }
            });
        }

        botoesAbas.forEach(function(aba) {
            aba.addEventListener('click', function() {
                botoesAbas.forEach(b => b.classList.remove('ativa'));
                aba.classList.add('ativa');
                
                categoriaAtiva = aba.getAttribute('data-categoria');
                filtrarArsenal();
            });
        });

        campoBuscaItem.addEventListener('keyup', filtrarArsenal);

        // Sistema de inclusão no Carrinho/Manifesto
        cardsItens.forEach(function(card) {
            const btnRequisitar = card.querySelector('.btn-requisitar');
            if (!btnRequisitar) return;

            btnRequisitar.addEventListener('click', function() {
                const custoItem = parseInt(card.getAttribute('data-custo')) || 0;
                const nomeItem = card.getAttribute('data-nome');

                if (saldoAtual >= custoItem) {
                    saldoAtual -= custoItem;
                    painelCreditos.innerText = saldoAtual;

                    adicionarAoManifesto(nomeItem, custoItem, card);

                    btnRequisitar.innerText = "[ ALOCADO EM CARGA ]";
                    btnRequisitar.disabled = true;
                } else {
                    alert("[ALERTA DO ALMOXARIFADO]: Créditos insuficientes para este item.");
                }
            });
        });

        function adicionarAoManifesto(nome, custo, cardOrigem) {
            const mensagemVazio = listaManifesto.querySelector('.manifesto-vazio');
            if (mensagemVazio) mensagemVazio.remove();

            const linhaItem = document.createElement('div');
            linhaItem.className = 'item-manifesto-linha';
            // Adicionado um atributo data-nome-item para o downloader ler depois
            linhaItem.setAttribute('data-nome-item', nome);
            linhaItem.innerHTML = `
                <span>✔️ ${nome} (-${custo} CR)</span>
                <button class="btn-remover-item" data-custo="${custo}">[ DEVOLVER ]</button>
            `;

            linhaItem.querySelector('.btn-remover-item').addEventListener('click', function() {
                saldoAtual += custo;
                painelCreditos.innerText = saldoAtual;

                const btnOriginal = cardOrigem.querySelector('.btn-requisitar');
                if (btnOriginal) {
                    btnOriginal.innerText = "[ REQUISITAR ITEM ]";
                    btnOriginal.disabled = false;
                }

                linhaItem.remove();
                if (listaManifesto.children.length === 0) {
                    listaManifesto.innerHTML = '<p class="manifesto-vazio">Nenhum equipamento alocado para a missão atual.</p>';
                }
            });

            listaManifesto.appendChild(linhaItem);
        }

        if (btnLimparCarga) {
            btnLimparCarga.addEventListener('click', function() {
                const botoesDevolver = listaManifesto.querySelectorAll('.btn-remover-item');
                botoesDevolver.forEach(btn => btn.click());
            });
        }

        /* ==========================================
           NOVA FUNÇÃO: DOWNLOAD DO MANIFESTO (.TXT)
           ========================================== */
        if (btnBaixarManifesto) {
            btnBaixarManifesto.addEventListener('click', function() {
                const linhasItens = listaManifesto.querySelectorAll('.item-manifesto-linha');
                
                // Valida se a mochila não está vazia
                if (linhasItens.length === 0) {
                    alert("[ERRO LOGÍSTICO]: Impossível emitir manifesto vazio. Aloque equipamentos primeiro.");
                    return;
                }

                // Monta o cabeçalho estético do arquivo de texto
                let conteudoTexto = "==================================================\n";
                conteudoTexto += "          A.S.T.R.A. - MANIFESTO DE CARGA         \n";
                conteudoTexto += "==================================================\n";
                conteudoTexto += `DATA DE EMISSÃO: ${new Date().toLocaleDateString('pt-BR')} \n`;
                conteudoTexto += `AUTORIZAÇÃO: AGENTE NÍVEL 1\n`;
                conteudoTexto += `CRÉDITOS RESTANTES NO ALMOXARIFADO: ${saldoAtual} CR\n`;
                conteudoTexto += "--------------------------------------------------\n";
                conteudoTexto += "EQUIPAMENTOS ALOCADOS PARA A MISSÃO:\n\n";

                // Varre a lista de itens e injeta no texto
                linhasItens.forEach(function(linha, index) {
                    const nomeDoObjeto = linha.getAttribute('data-nome-item');
                    conteudoTexto += `  [${index + 1}] ${nomeDoObjeto}\n`;
                });

                conteudoTexto += "\n--------------------------------------------------\n";
                conteudoTexto += "AVISO: Este documento é confidencial.\n";
                conteudoTexto += "==================================================\n";

                // Cria o link de download invisível na memória do navegador
                const blob = new Blob([conteudoTexto], { type: "text/plain;charset=utf-8" });
                const linkInvisivel = document.createElement("a");
                linkInvisivel.href = URL.createObjectURL(blob);
                linkInvisivel.download = "ASTRA_Manifesto_Carga.txt"; // Nome do arquivo salvo no PC
                
                // Dispara o download e limpa a memória
                document.body.appendChild(linkInvisivel);
                linkInvisivel.click();
                document.body.removeChild(linkInvisivel);
            });
        }
    }
});

/* ==========================================================================
       3. MÓDULO DE INTERNAGREGAÇÃO DE ABAS (DOSSIÊ DE CASOS)
       ========================================================================== */
    const botoesAbasDossie = document.querySelectorAll('.aba-btn');
    const blocosConteudosAbas = document.querySelectorAll('.conteudo-aba');

    // Executa apenas se encontrar os botões de abas do dossiê na página atual
    if (botoesAbasDossie.length > 0 && blocosConteudosAbas.length > 0) {
        
        botoesAbasDossie.forEach(function(botao) {
            botao.addEventListener('click', function() {
                // 1. Remove a classe ativa de todos os botões de abas
                botoesAbasDossie.forEach(b => b.classList.remove('ativa'));
                // 2. Adiciona a classe ativa no botão que acabou de ser clicado
                botao.classList.add('ativa');

                // Pega o identificador (ex: "vitimas", "evidencias")
                const alvoAbaId = botao.getAttribute('data-aba');

                // 3. Varre e oculta todas as caixas de conteúdos de abas
                blocosConteudosAbas.forEach(function(bloco) {
                    bloco.classList.remove('ativa');
                    
                    // 4. Se o ID do bloco bater com o alvo clicado, torna-o visível
                    if (bloco.id === `aba-${alvoAbaId}`) {
                        bloco.classList.add('ativa');
                    }
                });
            });
        });
    }