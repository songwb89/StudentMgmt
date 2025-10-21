/**
 * CustomSelect - 自定义下拉选择组件
 * 
 * @class CustomSelect
 * @description 功能强大的自定义下拉选择器，支持placeholder、清除、禁用、级联等功能
 * 
 * @example
 * const select = new CustomSelect({
 *     container: '#mySelectContainer',
 *     placeholder: '请选择',
 *     options: ['选项1', '选项2', '选项3'],
 *     value: '',
 *     disabled: false,
 *     clearable: true,
 *     onChange: (value) => console.log('Selected:', value)
 * });
 */

class CustomSelect {
    constructor(config) {
        // 配置项
        this.container = typeof config.container === 'string' 
            ? document.querySelector(config.container) 
            : config.container;
        
        if (!this.container) {
            console.error('CustomSelect: Container not found');
            return;
        }

        this.placeholder = config.placeholder || '请选择';
        this.options = config.options || [];
        this.value = config.value || '';
        this.disabled = config.disabled || false;
        this.clearable = config.clearable !== false; // 默认可清除
        this.onChange = config.onChange || (() => {});
        
        // 内部状态
        this.isOpen = false;
        this.selectedOption = null;
        
        // 初始化
        this.init();
    }

    /**
     * 初始化组件
     */
    init() {
        this.render();
        this.bindEvents();
        
        // 如果有初始值，设置选中项
        if (this.value) {
            this.setValue(this.value, false); // false表示不触发onChange
        }
    }

    /**
     * 渲染组件HTML
     */
    render() {
        this.container.innerHTML = `
            <div class="custom-select ${this.disabled ? 'disabled' : ''} ${this.value ? 'has-value' : ''}">
                <div class="custom-select-trigger">
                    <span class="custom-select-value ${!this.value ? 'placeholder' : ''}">
                        ${this.value || this.placeholder}
                    </span>
                    <div class="custom-select-controls">
                        ${this.clearable ? `
                            <div class="custom-select-clear">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </div>
                        ` : ''}
                        <div class="custom-select-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="custom-select-dropdown">
                    ${this.renderOptions()}
                </div>
            </div>
        `;

        // 缓存DOM元素
        this.selectEl = this.container.querySelector('.custom-select');
        this.triggerEl = this.container.querySelector('.custom-select-trigger');
        this.valueEl = this.container.querySelector('.custom-select-value');
        this.clearEl = this.container.querySelector('.custom-select-clear');
        this.dropdownEl = this.container.querySelector('.custom-select-dropdown');
    }

    /**
     * 渲染选项列表
     */
    renderOptions() {
        if (!this.options || this.options.length === 0) {
            return '<div class="custom-select-empty">暂无选项</div>';
        }

        return this.options.map(option => {
            const isSelected = option === this.value;
            return `
                <div class="custom-select-option ${isSelected ? 'selected' : ''}" data-value="${option}">
                    ${option}
                </div>
            `;
        }).join('');
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 点击触发器
        this.triggerEl.addEventListener('click', (e) => {
            if (this.disabled) return;
            e.stopPropagation();
            this.toggle();
        });

        // 点击清除按钮
        if (this.clearEl) {
            this.clearEl.addEventListener('click', (e) => {
                if (this.disabled) return;
                e.stopPropagation();
                this.clear();
            });
        }

        // 点击选项
        this.dropdownEl.addEventListener('click', (e) => {
            const optionEl = e.target.closest('.custom-select-option');
            if (optionEl && !this.disabled) {
                const value = optionEl.getAttribute('data-value');
                this.setValue(value);
                this.close();
            }
        });

        // 点击外部关闭
        document.addEventListener('click', (e) => {
            if (!this.container.contains(e.target)) {
                this.close();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * 打开下拉菜单
     */
    open() {
        if (this.disabled) return;
        this.isOpen = true;
        this.selectEl.classList.add('active');
    }

    /**
     * 关闭下拉菜单
     */
    close() {
        this.isOpen = false;
        this.selectEl.classList.remove('active');
    }

    /**
     * 切换下拉菜单
     */
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    /**
     * 设置值
     * @param {string} value - 要设置的值
     * @param {boolean} triggerChange - 是否触发onChange回调，默认true
     */
    setValue(value, triggerChange = true) {
        const oldValue = this.value;
        this.value = value;
        this.selectedOption = value;

        // 更新显示
        this.valueEl.textContent = value || this.placeholder;
        this.valueEl.classList.toggle('placeholder', !value);
        this.selectEl.classList.toggle('has-value', !!value);

        // 更新选项的选中状态
        this.updateOptionsState();

        // 触发onChange回调
        if (triggerChange && oldValue !== value) {
            this.onChange(value);
        }
    }

    /**
     * 更新选项的选中状态
     */
    updateOptionsState() {
        const options = this.dropdownEl.querySelectorAll('.custom-select-option');
        options.forEach(optionEl => {
            const optionValue = optionEl.getAttribute('data-value');
            optionEl.classList.toggle('selected', optionValue === this.value);
        });
    }

    /**
     * 获取当前值
     */
    getValue() {
        return this.value;
    }

    /**
     * 清除选择
     */
    clear() {
        this.setValue('');
        this.close();
    }

    /**
     * 设置选项列表
     * @param {Array} options - 新的选项列表
     * @param {boolean} keepValue - 是否保留当前值（如果新选项中包含），默认false
     */
    setOptions(options, keepValue = false) {
        this.options = options || [];
        
        // 如果不保留值或当前值不在新选项中，清除当前值
        if (!keepValue || !this.options.includes(this.value)) {
            this.value = '';
        }

        // 重新渲染选项
        this.dropdownEl.innerHTML = this.renderOptions();
    }

    /**
     * 启用组件
     */
    enable() {
        this.disabled = false;
        this.selectEl.classList.remove('disabled');
    }

    /**
     * 禁用组件
     */
    disable() {
        this.disabled = true;
        this.selectEl.classList.add('disabled');
        this.close();
    }

    /**
     * 设置禁用状态
     * @param {boolean} disabled - 是否禁用
     */
    setDisabled(disabled) {
        if (disabled) {
            this.disable();
        } else {
            this.enable();
        }
    }

    /**
     * 判断是否禁用
     */
    isDisabled() {
        return this.disabled;
    }

    /**
     * 重置组件（清除值并关闭下拉）
     */
    reset() {
        this.clear();
    }

    /**
     * 销毁组件
     */
    destroy() {
        // 移除事件监听器（简化处理，实际应该移除所有绑定的事件）
        this.container.innerHTML = '';
    }
}

// 如果需要作为模块导出（ES6）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomSelect;
}

