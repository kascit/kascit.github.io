document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('pre > code').forEach((codeBlock) => {
        const pre = codeBlock.parentNode;
        const button = document.createElement('button');
        button.className = 'copy-code-button';
        button.type = 'button';
        button.setAttribute('aria-label', 'Copy code');
        // Clipboard icon (Font Awesome)
        button.innerHTML = '<i class="fa-regular fa-clipboard"></i>';

        button.addEventListener('click', () => {
            const textToCopy = codeBlock.innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                button.innerHTML = '<i class="fa-solid fa-check"></i>';
                button.classList.add('copied');
                setTimeout(() => {
                    button.innerHTML = '<i class="fa-regular fa-clipboard"></i>';
                    button.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        });

        pre.appendChild(button);
    });
});
