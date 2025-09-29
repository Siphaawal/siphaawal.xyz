class DOMUtils {
    static createElement(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    static createCheckbox(id, value, label, changeHandler = null) {
        const container = DOMUtils.createElement('div', 'checkbox-item');

        const checkbox = DOMUtils.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.value = value;
        if (changeHandler) {
            checkbox.addEventListener('change', changeHandler);
        }

        const labelElement = DOMUtils.createElement('label');
        labelElement.htmlFor = id;
        labelElement.textContent = label;

        container.appendChild(checkbox);
        container.appendChild(labelElement);

        return { container, checkbox, label: labelElement };
    }

    static createButton(text, className = '', clickHandler = null) {
        const button = DOMUtils.createElement('button', className, text);
        if (clickHandler) {
            button.addEventListener('click', clickHandler);
        }
        return button;
    }

    static createModal(modalId, title = '', content = '') {
        const modal = DOMUtils.createElement('div', 'modal', `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <span class="close" id="close${modalId}">&times;</span>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `);
        modal.id = modalId;
        modal.style.display = 'none';

        const closeBtn = modal.querySelector(`#close${modalId}`);
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        return modal;
    }

    static clearContainer(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
        return container;
    }

    static appendToContainer(containerId, element) {
        const container = document.getElementById(containerId);
        if (container && element) {
            container.appendChild(element);
        }
        return container;
    }

    static setElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
        return element;
    }

    static setElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
        return element;
    }

    static getSelectedCheckboxValues(containerSelector) {
        const checkboxes = document.querySelectorAll(`${containerSelector} input[type="checkbox"]:checked`);
        return Array.from(checkboxes).map(checkbox => checkbox.value);
    }

    static toggleElementVisibility(elementId, visible) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = visible ? 'block' : 'none';
        }
        return element;
    }

    static addClassToElement(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add(className);
        }
        return element;
    }

    static removeClassFromElement(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(className);
        }
        return element;
    }

    static createCard(title, content, className = 'card') {
        return DOMUtils.createElement('div', className, `
            <div class="card-header">
                <h3>${title}</h3>
            </div>
            <div class="card-content">
                ${content}
            </div>
        `);
    }

    static createList(items, className = 'list') {
        const list = DOMUtils.createElement('ul', className);
        items.forEach(item => {
            const listItem = DOMUtils.createElement('li', '', typeof item === 'string' ? item : item.text || '');
            if (typeof item === 'object' && item.click) {
                listItem.addEventListener('click', item.click);
                listItem.style.cursor = 'pointer';
            }
            list.appendChild(listItem);
        });
        return list;
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

}