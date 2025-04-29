let container = document.querySelector('.container');
let nextButtons = document.querySelectorAll('.next');
let items = document.querySelectorAll('.item');

let active = 0;

nextButtons.forEach(button => {
    button.addEventListener('click', function() {
        console.log("Botão clicado");

        // Verifica se o botão clicado é o último
        if (active === items.length - 1) {
            active = 0; // Reinicia o contador
            console.log("Último botão clicado");
            window.location.href = "home"
            return; // Interrompe a execução do restante do código
        }

        // Retira a classe active do item atual
        let itemOld = container.querySelector('.list .item.active');
        if (itemOld) {
            itemOld.classList.remove('active');
        }

        // Incrementa a variável active
        active++;

        // Adiciona a classe active ao próximo item
        let itemNew = container.querySelector('.list .item:nth-child(' + (active + 1) + ')');
        if (itemNew) {
            itemNew.classList.add('active');
        }
    });
});