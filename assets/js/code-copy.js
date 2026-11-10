(function() {
    'use strict';

    var COPY_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    var CHECK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    var LABEL_COPY = 'Copiar Código';
    var LABEL_COPIED = 'Copiado!';

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }

        var area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        document.execCommand('copy');
        document.body.removeChild(area);
        return Promise.resolve();
    }

    function addCopyButton(pre) {
        var code = pre.querySelector('code');
        if (!code) return;

        var wrapper = document.createElement('div');
        wrapper.className = 'code-block';
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'copy-code';
        button.innerHTML = COPY_ICON;
        button.setAttribute('aria-label', LABEL_COPY);
        button.setAttribute('title', LABEL_COPY);
        wrapper.appendChild(button);

        var timer;

        function reset() {
            button.innerHTML = COPY_ICON;
            button.classList.remove('is-copied');
            button.setAttribute('aria-label', LABEL_COPY);
            button.setAttribute('title', LABEL_COPY);
        }

        button.addEventListener('click', function() {
            copyText(code.innerText).then(function() {
                button.innerHTML = CHECK_ICON;
                button.classList.add('is-copied');
                button.setAttribute('aria-label', LABEL_COPIED);
                button.setAttribute('title', LABEL_COPIED);
            }, reset).then(function() {
                clearTimeout(timer);
                timer = setTimeout(reset, 2000);
            });
        });
    }

    function init() {
        document.querySelectorAll('pre').forEach(addCopyButton);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
