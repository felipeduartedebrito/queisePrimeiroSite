/**
 * ============================================
 * UTILS.JS - Funções Utilitárias
 * ============================================
 * 
 * Módulo com funções auxiliares reutilizáveis
 * Formatação, validação, DOM helpers, etc.
 * 
 * @module utils
 */

import { FORMAT_CONFIG, VALIDATION_PATTERNS, ANIMATION_CONFIG } from './config.js';

// ========================================
// FORMATAÇÃO DE PREÇOS
// ========================================

/**
 * Formata preço de centavos para BRL
 * @param {number} priceInCents - Preço em centavos
 * @returns {string} Preço formatado (ex: "R$ 165,00")
 */
export function formatPrice(priceInCents) {
    if (typeof priceInCents !== 'number' || isNaN(priceInCents)) {
        return 'R$ 0,00';
    }

    const priceInReais = priceInCents / 100;
    return priceInReais.toLocaleString(
        FORMAT_CONFIG.currency.locale,
        {
            style: FORMAT_CONFIG.currency.style,
            currency: FORMAT_CONFIG.currency.currency
        }
    );
}

/**
 * Converte string de preço para centavos
 * @param {string} priceString - String do preço (ex: "R$ 165,00" ou "165,00")
 * @returns {number} Preço em centavos
 */
export function parsePriceTocents(priceString) {
    if (typeof priceString !== 'string') {
        return 0;
    }

    // Remove tudo exceto números e vírgula
    const cleaned = priceString.replace(/[^\d,]/g, '');
    
    // Substitui vírgula por ponto
    const normalized = cleaned.replace(',', '.');
    
    // Converte para número e multiplica por 100
    const value = parseFloat(normalized);
    
    return isNaN(value) ? 0 : Math.round(value * 100);
}

// ========================================
// FORMATAÇÃO DE DATAS
// ========================================

/**
 * Formata data para formato brasileiro
 * @param {Date|string|number} date - Data a formatar
 * @returns {string} Data formatada (ex: "15 de junho de 2025")
 */
export function formatDate(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return '';
    }

    return dateObj.toLocaleDateString(
        FORMAT_CONFIG.date.locale,
        FORMAT_CONFIG.date.options
    );
}

/**
 * Formata data para formato curto
 * @param {Date|string|number} date - Data a formatar
 * @returns {string} Data formatada (ex: "15/06/2025")
 */
export function formatDateShort(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    
    if (isNaN(dateObj.getTime())) {
        return '';
    }

    return dateObj.toLocaleDateString(FORMAT_CONFIG.date.locale);
}

/**
 * Calcula tempo relativo (ex: "há 2 horas")
 * @param {Date|string|number} date - Data a comparar
 * @returns {string} Tempo relativo
 */
export function getRelativeTime(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `há ${Math.floor(diffInSeconds / 86400)} dias`;
    
    return formatDateShort(dateObj);
}

// ========================================
// VALIDAÇÃO
// ========================================

/**
 * Valida email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
export function isValidEmail(email) {
    return VALIDATION_PATTERNS.email.test(email);
}

/**
 * Valida telefone brasileiro
 * @param {string} phone - Telefone a validar
 * @returns {boolean}
 */
export function isValidPhone(phone) {
    return VALIDATION_PATTERNS.phone.test(phone);
}

/**
 * Valida CEP brasileiro
 * @param {string} cep - CEP a validar
 * @returns {boolean}
 */
export function isValidCEP(cep) {
    return VALIDATION_PATTERNS.cep.test(cep);
}

/**
 * Alias para isValidCEP
 */
export const validateCEP = isValidCEP;

/**
 * Alias para isValidEmail
 */
export const validateEmail = isValidEmail;

/**
 * Alias para isValidPhone
 */
export const validatePhone = isValidPhone;

/**
 * Valida CNPJ brasileiro
 * @param {string} cnpj - CNPJ a validar
 * @returns {boolean}
 */
export function isValidCNPJ(cnpj) {
    const cleaned = cnpj.replace(/\D/g, '');
    
    if (cleaned.length !== 14) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false; // Todos dígitos iguais
    
    // Validação dos dígitos verificadores
    let length = cleaned.length - 2;
    let numbers = cleaned.substring(0, length);
    let digits = cleaned.substring(length);
    let sum = 0;
    let pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(0))) return false;
    
    length = length + 1;
    numbers = cleaned.substring(0, length);
    sum = 0;
    pos = length - 7;
    
    for (let i = length; i >= 1; i--) {
        sum += numbers.charAt(length - i) * pos--;
        if (pos < 2) pos = 9;
    }
    
    result = sum % 11 < 2 ? 0 : 11 - sum % 11;
    if (result !== parseInt(digits.charAt(1))) return false;
    
    return true;
}

/**
 * Alias para isValidCNPJ
 */
export const validateCNPJ = isValidCNPJ;

/**
 * Valida CPF brasileiro
 * @param {string} cpf - CPF a validar
 * @returns {boolean}
 */
export function isValidCPF(cpf) {
    // Remove formatação
    const cleaned = cpf.replace(/\D/g, '');
    
    if (cleaned.length !== 11) return false;
    if (/^(\d)\1+$/.test(cleaned)) return false; // Todos dígitos iguais
    
    // Validação dos dígitos verificadores
    let sum = 0;
    for (let i = 0; i < 9; i++) {
        sum += parseInt(cleaned.charAt(i)) * (10 - i);
    }
    let digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleaned.charAt(i)) * (11 - i);
    }
    digit = 11 - (sum % 11);
    if (digit >= 10) digit = 0;
    if (digit !== parseInt(cleaned.charAt(10))) return false;
    
    return true;
}

/**
 * Formata CPF
 * @param {string} cpf - CPF a formatar
 * @returns {string} CPF formatado (xxx.xxx.xxx-xx)
 */
export function formatCPF(cpf) {
    const cleaned = cpf.replace(/\D/g, '');
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CEP
 * @param {string} cep - CEP a formatar
 * @returns {string} CEP formatado (xxxxx-xxx)
 */
export function formatCEP(cep) {
    const cleaned = cep.replace(/\D/g, '');
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata telefone
 * @param {string} phone - Telefone a formatar
 * @returns {string} Telefone formatado
 */
export function formatPhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.length === 11) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
        return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    
    return phone;
}

// ========================================
// STRING HELPERS
// ========================================

/**
 * Capitaliza primeira letra
 * @param {string} str - String a capitalizar
 * @returns {string}
 */
export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Converte para slug (URL-friendly)
 * @param {string} str - String a converter
 * @returns {string}
 */
export function slugify(str) {
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim();
}

/**
 * Trunca string com reticências
 * @param {string} str - String a truncar
 * @param {number} maxLength - Tamanho máximo
 * @returns {string}
 */
export function truncate(str, maxLength = 100) {
    if (!str || str.length <= maxLength) return str;
    return str.slice(0, maxLength).trim() + '...';
}

/**
 * Remove tags HTML de uma string
 * @param {string} html - String com HTML
 * @returns {string} String sem HTML
 */
export function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

// ========================================
// NUMBER HELPERS
// ========================================

/**
 * Formata número com separadores de milhares
 * @param {number} num - Número a formatar
 * @returns {string}
 */
export function formatNumber(num) {
    return num.toLocaleString(FORMAT_CONFIG.number.locale);
}

/**
 * Gera número aleatório entre min e max
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number}
 */
export function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Limita número entre min e max (clamp)
 * @param {number} num - Número
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number}
 */
export function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

// ========================================
// DOM HELPERS
// ========================================

/**
 * Cria elemento DOM com atributos e classes
 * @param {string} tag - Tag do elemento
 * @param {Object} attributes - Atributos do elemento
 * @param {string|Array<string>} classes - Classes CSS
 * @returns {HTMLElement}
 */
export function createElement(tag, attributes = {}, classes = []) {
    const element = document.createElement(tag);
    
    // Adicionar atributos
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'textContent') {
            element.textContent = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Adicionar classes
    const classArray = Array.isArray(classes) ? classes : [classes];
    classArray.forEach(cls => {
        if (cls) element.classList.add(cls);
    });
    
    return element;
}

/**
 * Remove todos os filhos de um elemento
 * @param {HTMLElement} element - Elemento a limpar
 */
export function clearElement(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

/**
 * Verifica se elemento está visível no viewport
 * @param {HTMLElement} element - Elemento a verificar
 * @returns {boolean}
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Scroll suave até elemento
 * @param {HTMLElement|string} target - Elemento ou seletor
 * @param {number} offset - Offset em pixels
 */
export function smoothScrollTo(target, offset = 0) {
    const element = typeof target === 'string' 
        ? document.querySelector(target) 
        : target;
    
    if (!element) return;
    
    const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - offset;
    
    window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
    });
}

// ========================================
// PERFORMANCE HELPERS
// ========================================

/**
 * Debounce - executa função após delay sem novas chamadas
 * @param {Function} func - Função a executar
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function}
 */
export function debounce(func, wait = 300) {
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

/**
 * Throttle - executa função no máximo uma vez a cada intervalo
 * @param {Function} func - Função a executar
 * @param {number} limit - Intervalo em ms
 * @returns {Function}
 */
export function throttle(func, limit = 300) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Delay assíncrono
 * @param {number} ms - Milissegundos
 * @returns {Promise}
 */
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// ARRAY HELPERS
// ========================================

/**
 * Embaralha array (Fisher-Yates shuffle)
 * @param {Array} array - Array a embaralhar
 * @returns {Array} Novo array embaralhado
 */
export function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

/**
 * Remove duplicatas de array
 * @param {Array} array - Array com possíveis duplicatas
 * @param {string} key - Chave para comparação (opcional, para objetos)
 * @returns {Array} Array sem duplicatas
 */
export function removeDuplicates(array, key = null) {
    if (!key) {
        return [...new Set(array)];
    }
    
    const seen = new Set();
    return array.filter(item => {
        const keyValue = item[key];
        if (seen.has(keyValue)) {
            return false;
        }
        seen.add(keyValue);
        return true;
    });
}

/**
 * Agrupa array de objetos por chave
 * @param {Array} array - Array a agrupar
 * @param {string} key - Chave para agrupar
 * @returns {Object} Objeto com arrays agrupados
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const groupKey = item[key];
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}

// ========================================
// URL HELPERS
// ========================================

/**
 * Obtém parâmetro da URL
 * @param {string} param - Nome do parâmetro
 * @returns {string|null}
 */
export function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

/**
 * Atualiza parâmetro na URL sem recarregar página
 * @param {string} param - Nome do parâmetro
 * @param {string} value - Valor do parâmetro
 */
export function updateUrlParam(param, value) {
    const url = new URL(window.location);
    url.searchParams.set(param, value);
    window.history.replaceState({}, '', url);
}

/**
 * Remove parâmetro da URL
 * @param {string} param - Nome do parâmetro
 */
export function removeUrlParam(param) {
    const url = new URL(window.location);
    url.searchParams.delete(param);
    window.history.replaceState({}, '', url);
}

/**
 * Copia texto para clipboard
 * @param {string} text - Texto a copiar
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Erro ao copiar:', err);
        return false;
    }
}

// ========================================
// INTERSECTION OBSERVER HELPER
// ========================================

/**
 * Cria Intersection Observer com callback
 * @param {Function} callback - Função a executar quando elemento é visível
 * @param {Object} options - Opções do observer
 * @returns {IntersectionObserver}
 */
export function createObserver(callback, options = ANIMATION_CONFIG.observerOptions) {
    return new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                callback(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, options);
}

// ========================================
// OBJECT HELPERS
// ========================================

/**
 * Deep clone de objeto
 * @param {*} obj - Objeto a clonar
 * @returns {*}
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Verifica se objeto está vazio
 * @param {Object} obj - Objeto a verificar
 * @returns {boolean}
 */
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

// ========================================
// EXPORTAÇÃO DEFAULT
// ========================================

export default {
    // Formatação
    formatPrice,
    parsePriceTocents,
    formatDate,
    formatDateShort,
    getRelativeTime,
    formatCPF,
    formatCEP,
    formatPhone,
    formatNumber,
    
    // Validação
    isValidEmail,
    isValidPhone,
    isValidCEP,
    isValidCPF,
    
    // String
    capitalize,
    slugify,
    truncate,
    stripHtml,
    
    // Number
    randomNumber,
    clamp,
    
    // DOM
    createElement,
    clearElement,
    isInViewport,
    smoothScrollTo,
    
    // Performance
    debounce,
    throttle,
    delay,
    
    // Array
    shuffleArray,
    removeDuplicates,
    groupBy,
    
    // URL
    getUrlParam,
    updateUrlParam,
    removeUrlParam,
    copyToClipboard,
    
    // Observer
    createObserver,
    
    // Object
    deepClone,
    isEmpty
};
