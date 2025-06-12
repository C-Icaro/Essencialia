// Suporte.js - pode ser expandido futuramente para lógica dinâmica
// Exemplo: copiar e-mail ao clicar, mostrar toast, etc.
 
// Nenhuma lógica obrigatória no momento. 

document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(function(item) {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const toggle = item.querySelector('.faq-toggle');
        item.classList.remove('open');
        toggle.textContent = '+';
        function toggleFaq() {
            const isOpen = item.classList.contains('open');
            faqItems.forEach(i => {
                i.classList.remove('open');
                const t = i.querySelector('.faq-toggle');
                if (t) t.textContent = '+';
            });
            if (!isOpen) {
                item.classList.add('open');
                toggle.textContent = '×';
            }
        }
        question.addEventListener('click', toggleFaq);
        toggle.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFaq();
        });
    });
}); 