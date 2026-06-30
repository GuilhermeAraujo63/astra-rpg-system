// 1. Definição das Credenciais Secretas (Altere aqui para o que quiser no seu RPG)
const USUARIO_CORRETO = "Delta19";
const SENHA_CORRETA = "RupturaZero";

// 2. Mapeamento dos elementos do HTML através dos IDs
const loginForm = document.getElementById('loginForm');
const campoUsuario = document.getElementById('usuario');
const campoSenha = document.getElementById('senha');
const mensagemErro = document.getElementById('mensagemErro');

// 3. Escutador de Eventos: Monitora quando o formulário é enviado (botão ou Enter)
loginForm.addEventListener('submit', function(evento) {
    
    // Intercepta e impede o navegador de recarregar a página automaticamente
    evento.preventDefault();

    // Captura os valores digitados pelos jogadores (e remove espaços extras nas pontas)
    const usuarioDigitado = campoUsuario.value.trim();
    const senhaDigitada = campoSenha.value.trim();

    // 4. Validação (O "Se" e o "Senão")
    if (usuarioDigitado === USUARIO_CORRETO && senhaDigitada === SENHA_CORRETA) {
        
        // SUCESSO: Esconde o erro caso ele estivesse aparecendo
        mensagemErro.classList.add('oculto');
        
        // Efeito estético opcional: Muda o texto do botão para fingir carregamento
        const botao = loginForm.querySelector('button');
        botao.textContent = "DESCRIPTOGRAFANDO...";
        botao.disabled = true;

        // Aguarda 1.5 segundos para dar um clima de processamento do terminal e redireciona
        setTimeout(function() {
            window.location.href = "/html/dashboard.html";
        }, 1500);

    } else {
        // FALHA: Remove a classe 'oculto' para fazer o alerta vermelho piscar na tela
        mensagemErro.classList.remove('oculto');

        // Limpa apenas o campo de senha para o jogador tentar novamente
        campoSenha.value = "";
        
        // Devolve o foco do teclado para o campo de senha automaticamente
        campoSenha.focus();
    }
});