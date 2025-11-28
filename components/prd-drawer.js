/**
 * PRD 文档抽屉组件
 * 在原型页面中引入此组件，即可通过悬浮按钮查看对应的 PRD 文档
 * 
 * 使用方式：
 * <script src="../components/prd-drawer.js" data-doc="../docs/your-doc.md"></script>
 */

(function() {
    // 获取配置
    const script = document.currentScript;
    const scriptDir = script.src.substring(0, script.src.lastIndexOf('/'));
    const configUrl = scriptDir + '/../docs/config.json';
    const buttonPosition = script.getAttribute('data-position') || 'bottom-right';
    
    // 配置数据
    let config = { docs: [], pageMapping: {} };
    let currentDoc = null; // 当前显示的文档
    let currentView = 'list'; // 'list' 或 'doc'

    // 获取当前页面名
    function getPageName() {
        return window.location.pathname.split('/').pop() || 'index.html';
    }

    // 动态加载依赖库
    function loadScript(src) {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = reject;
            document.head.appendChild(s);
        });
    }

    async function loadDependencies() {
        // 加载 marked.js（如果未加载）
        if (typeof marked === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/marked/16.3.0/lib/marked.umd.min.js');
        }
        // 加载 mermaid.js（如果未加载）
        if (typeof mermaid === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mermaid/11.4.0/mermaid.min.js');
        }
    }

    // 位置映射
    const positions = {
        'bottom-right': 'right: 24px; bottom: 24px;',
        'bottom-left': 'left: 24px; bottom: 24px;',
        'top-right': 'right: 24px; top: 24px;',
        'top-left': 'left: 24px; top: 24px;'
    };

    // 注入样式
    const style = document.createElement('style');
    style.textContent = `
        .prd-fab {
            position: fixed;
            ${positions[buttonPosition] || positions['bottom-right']}
            width: 56px;
            height: 56px;
            border-radius: 50%;
            background: #1a1a2e;
            color: white;
            border: none;
            font-size: 24px;
            cursor: pointer;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transition: transform 0.2s, background 0.2s;
            z-index: 10000;
        }
        .prd-fab:hover {
            transform: scale(1.1);
            background: #2d2d44;
        }
        .prd-overlay {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            opacity: 0;
            visibility: hidden;
            transition: opacity 0.3s;
            z-index: 10001;
        }
        .prd-overlay.open {
            opacity: 1;
            visibility: visible;
        }
        .prd-drawer {
            position: fixed;
            top: 0;
            right: 0;
            width: 60vw;
            min-width: 800px;
            height: 100vh;
            background: #fff;
            box-shadow: -4px 0 30px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            z-index: 10002;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }
        .prd-drawer.open {
            transform: translateX(0);
        }
        .prd-header {
            padding: 16px 24px;
            background: #1a1a2e;
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        }
        .prd-breadcrumb {
            display: flex;
            align-items: center;
            font-size: 15px;
        }
        .prd-breadcrumb-item {
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
        }
        .prd-breadcrumb-item:hover {
            opacity: 1;
        }
        .prd-breadcrumb-root {
            opacity: 0.7;
        }
        .prd-breadcrumb-sep {
            margin: 0 10px;
            opacity: 0.5;
        }
        .prd-breadcrumb-current {
            opacity: 1;
            cursor: default;
        }
        .prd-breadcrumb.at-list .prd-breadcrumb-sep,
        .prd-breadcrumb.at-list .prd-breadcrumb-current {
            display: none;
        }
        .prd-breadcrumb.at-list .prd-breadcrumb-root {
            opacity: 1;
            cursor: default;
        }
        .prd-close {
            background: none;
            border: none;
            color: white;
            font-size: 28px;
            cursor: pointer;
            opacity: 0.7;
            transition: opacity 0.2s;
            line-height: 1;
        }
        .prd-close:hover {
            opacity: 1;
        }
        .prd-body {
            flex: 1;
            display: flex;
            overflow: hidden;
            position: relative;
        }
        /* 文档列表视图 */
        .prd-doc-list {
            position: absolute;
            inset: 0;
            background: #fff;
            padding: 24px;
            overflow-y: auto;
            display: none;
        }
        .prd-doc-list.show {
            display: block;
        }
        .prd-doc-list-inner {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px 0;
        }
        .prd-doc-item {
            display: flex;
            align-items: center;
            padding: 16px 24px;
            margin-bottom: 10px;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid #eee;
            box-shadow: 0 1px 2px rgba(0,0,0,0.03);
        }
        .prd-doc-item:hover {
            background: #f8f9ff;
            border-color: #4f46e5;
            transform: translateX(4px);
        }
        .prd-doc-item-index {
            font-size: 14px;
            color: #999;
            font-weight: 600;
            width: 32px;
            flex-shrink: 0;
        }
        .prd-doc-item-icon {
            font-size: 20px;
            margin-right: 16px;
            color: #444;
        }
        .prd-doc-item-name {
            font-size: 15px;
            font-weight: 500;
            color: #333;
            flex: 1;
        }
        .prd-doc-item:hover .prd-doc-item-index,
        .prd-doc-item:hover .prd-doc-item-name {
            color: #4f46e5;
        }
        /* 文档内容视图 */
        .prd-doc-view {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        .prd-doc-view.hidden {
            display: none;
        }
        /* 左侧目录 */
        .prd-toc {
            width: 240px;
            background: #f8f9fa;
            border-left: 1px solid #eee;
            flex-shrink: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        .prd-toc-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid #eee;
            background: #fff;
            flex-shrink: 0;
        }
        .prd-toc-title {
            font-size: 14px;
            font-weight: 600;
            color: #333;
        }
        .prd-toc-toggle {
            background: none;
            border: none;
            width: 28px;
            height: 28px;
            padding: 4px;
            cursor: pointer;
            color: #666;
            border-radius: 4px;
            transition: all 0.15s;
        }
        .prd-toc-toggle:hover {
            background: #eee;
            color: #333;
        }
        .prd-toc-toggle svg {
            width: 100%;
            height: 100%;
        }
        .prd-toc-collapsed {
            display: none;
            width: 36px;
            background: #f8f9fa;
            border-left: 1px solid #eee;
            flex-shrink: 0;
            padding-top: 12px;
        }
        .prd-toc-collapsed.show {
            display: block;
        }
        .prd-toc.hidden {
            display: none;
        }
        .prd-toc-expand {
            background: none;
            border: none;
            width: 28px;
            height: 28px;
            margin: 0 auto;
            display: block;
            padding: 4px;
            cursor: pointer;
            color: #666;
            border-radius: 4px;
            transition: all 0.15s;
        }
        .prd-toc-expand:hover {
            background: #ddd;
            color: #333;
        }
        .prd-toc-expand svg {
            width: 100%;
            height: 100%;
        }
        .prd-toc-list {
            padding: 8px 0;
            flex: 1;
            overflow-y: auto;
        }
        .prd-toc-group {
        }
        .prd-toc-parent {
            display: flex;
            align-items: center;
            padding: 10px 16px;
            color: #333;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.15s;
            border-left: 3px solid transparent;
        }
        .prd-toc-parent:hover {
            background: #eee;
        }
        .prd-toc-parent.active {
            background: #e8e8ff;
            color: #4f46e5;
            border-left-color: #4f46e5;
        }
        .prd-toc-arrow {
            width: 16px;
            height: 16px;
            margin-right: 6px;
            transition: transform 0.2s;
            flex-shrink: 0;
        }
        .prd-toc-arrow.collapsed {
            transform: rotate(-90deg);
        }
        .prd-toc-arrow.empty {
            visibility: hidden;
        }
        .prd-toc-children {
            overflow: hidden;
            transition: max-height 0.25s ease;
        }
        .prd-toc-children.collapsed {
            max-height: 0 !important;
        }
        .prd-toc-child {
            display: block;
            padding: 8px 16px 8px 38px;
            color: #666;
            text-decoration: none;
            font-size: 13px;
            cursor: pointer;
            transition: all 0.15s;
            border-left: 3px solid transparent;
        }
        .prd-toc-child:hover {
            background: #eee;
            color: #333;
        }
        .prd-toc-child.active {
            background: #e8e8ff;
            color: #4f46e5;
            border-left-color: #4f46e5;
        }
        .prd-toc-child.level-3 {
            padding-left: 52px;
            font-size: 12px;
        }
        .prd-content {
            flex: 1;
            padding: 30px;
            overflow-y: auto;
        }
        /* Markdown 渲染样式 */
        .prd-content h1 { font-size: 1.8em; border-bottom: 2px solid #eee; padding-bottom: 0.3em; margin: 0 0 0.8em; color: #1a1a2e; }
        .prd-content h2 { font-size: 1.4em; border-bottom: 1px solid #eee; padding-bottom: 0.3em; margin: 1.2em 0 0.6em; color: #1a1a2e; }
        .prd-content h3 { font-size: 1.15em; margin: 1em 0 0.5em; color: #333; }
        .prd-content h4 { font-size: 1em; margin: 1em 0 0.5em; color: #444; }
        .prd-content p { line-height: 1.8; margin: 0.8em 0; color: #444; }
        .prd-content ul, .prd-content ol { padding-left: 1.8em; margin: 0.8em 0; }
        .prd-content li { line-height: 1.8; margin: 0.3em 0; }
        .prd-content code {
            background: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Consolas', 'Monaco', monospace;
            font-size: 0.9em;
            color: #e83e8c;
        }
        .prd-content pre {
            background: #1e1e1e;
            color: #d4d4d4;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 1em 0;
        }
        .prd-content pre code {
            background: none;
            padding: 0;
            color: inherit;
        }
        .prd-content blockquote {
            border-left: 4px solid #667eea;
            padding: 12px 16px;
            color: #666;
            margin: 1em 0;
            background: #f8f9fa;
            border-radius: 0 8px 8px 0;
        }
        .prd-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            font-size: 0.95em;
        }
        .prd-content th, .prd-content td {
            border: 1px solid #ddd;
            padding: 10px 12px;
            text-align: left;
        }
        .prd-content th {
            background: #f8f9fa;
            font-weight: 600;
        }
        .prd-content a {
            color: #667eea;
        }
        .prd-content img {
            max-width: 100%;
            border-radius: 8px;
        }
        .prd-content hr {
            border: none;
            border-top: 1px solid #eee;
            margin: 1.5em 0;
        }
        .prd-loading {
            text-align: center;
            padding: 40px;
            color: #999;
        }
        .prd-content .mermaid {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 1em 0;
            text-align: center;
        }
    `;
    document.head.appendChild(style);

    // 创建 DOM 结构
    const container = document.createElement('div');
    container.innerHTML = `
        <button class="prd-fab" title="查看 PRD 文档">📄</button>
        <div class="prd-overlay"></div>
        <div class="prd-drawer">
            <div class="prd-header">
                <div class="prd-breadcrumb">
                    <span class="prd-breadcrumb-item prd-breadcrumb-root" title="全部文档">📁 全部文档</span>
                    <span class="prd-breadcrumb-sep">›</span>
                    <span class="prd-breadcrumb-item prd-breadcrumb-current">📄 文档</span>
                </div>
                <button class="prd-close">×</button>
            </div>
            <div class="prd-body">
                <!-- 文档列表视图 -->
                <div class="prd-doc-list">
                    <div class="prd-doc-list-inner"></div>
                </div>
                <!-- 文档内容视图 -->
                <div class="prd-doc-view">
                    <div class="prd-content">
                        <div class="prd-loading">加载中...</div>
                    </div>
                    <nav class="prd-toc">
                        <div class="prd-toc-header">
                            <span class="prd-toc-title">大纲</span>
                            <button class="prd-toc-toggle" title="隐藏大纲">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <polyline points="13 17 18 12 13 7"></polyline>
                                    <polyline points="6 17 11 12 6 7"></polyline>
                                </svg>
                            </button>
                        </div>
                        <div class="prd-toc-list"></div>
                    </nav>
                    <div class="prd-toc-collapsed">
                        <button class="prd-toc-expand" title="显示大纲">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="11 7 6 12 11 17"></polyline>
                                <polyline points="18 7 13 12 18 17"></polyline>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    // 获取元素
    const fab = container.querySelector('.prd-fab');
    const overlay = container.querySelector('.prd-overlay');
    const drawer = container.querySelector('.prd-drawer');
    const closeBtn = container.querySelector('.prd-close');
    const breadcrumbRoot = container.querySelector('.prd-breadcrumb-root');
    const breadcrumbSep = container.querySelector('.prd-breadcrumb-sep');
    const breadcrumbCurrent = container.querySelector('.prd-breadcrumb-current');
    const docList = container.querySelector('.prd-doc-list');
    const docListInner = container.querySelector('.prd-doc-list-inner');
    const docView = container.querySelector('.prd-doc-view');
    const toc = container.querySelector('.prd-toc');
    const tocList = container.querySelector('.prd-toc-list');
    const tocToggle = container.querySelector('.prd-toc-toggle');
    const tocCollapsed = container.querySelector('.prd-toc-collapsed');
    const tocExpand = container.querySelector('.prd-toc-expand');
    const content = container.querySelector('.prd-content');

    let configLoaded = false;

    // 初始化大纲状态
    const isTocHidden = localStorage.getItem('prd-toc-hidden') === 'true';
    if (isTocHidden) {
        toc.classList.add('hidden');
        tocCollapsed.classList.add('show');
    }
    
    // 大纲显示/隐藏切换
    tocToggle.addEventListener('click', () => {
        toc.classList.add('hidden');
        tocCollapsed.classList.add('show');
        localStorage.setItem('prd-toc-hidden', 'true');
    });
    
    tocExpand.addEventListener('click', () => {
        toc.classList.remove('hidden');
        tocCollapsed.classList.remove('show');
        localStorage.setItem('prd-toc-hidden', 'false');
    });

    // 加载配置
    async function loadConfig() {
        if (configLoaded) return;
        try {
            const res = await fetch(configUrl);
            if (res.ok) {
                config = await res.json();
            }
        } catch (e) {
            console.warn('PRD config not found, using defaults');
        }
        configLoaded = true;
    }

    // 渲染文档列表
    function renderDocList() {
        docListInner.innerHTML = '';
        
        // 添加标题
        const header = document.createElement('div');
        header.style.padding = '0 0 16px 4px';
        header.style.color = '#666';
        header.style.fontSize = '14px';
        header.textContent = `共 ${config.docs.length} 篇文档`;
        docListInner.appendChild(header);

        config.docs.forEach((doc, index) => {
            const item = document.createElement('div');
            item.className = 'prd-doc-item';
            item.innerHTML = `
                <span class="prd-doc-item-index">${String(index + 1).padStart(2, '0')}</span>
                <span class="prd-doc-item-icon">📄</span>
                <div class="prd-doc-item-name">${doc.name}</div>
            `;
            item.onclick = () => openDoc(doc.file, doc.name);
            docListInner.appendChild(item);
        });
    }

    // 切换到列表视图
    function showListView() {
        currentView = 'list';
        docList.classList.add('show');
        docView.classList.add('hidden');
        container.querySelector('.prd-breadcrumb').classList.add('at-list');
    }

    // 切换到文档视图
    function showDocView(docName) {
        currentView = 'doc';
        docList.classList.remove('show');
        docView.classList.remove('hidden');
        container.querySelector('.prd-breadcrumb').classList.remove('at-list');
        breadcrumbCurrent.textContent = '📄 ' + docName;
    }

    // 打开指定文档
    async function openDoc(file, name) {
        currentDoc = file;
        showDocView(name || file);
        await loadDocContent('../docs/' + file);
    }

    // 打开抽屉
    async function open() {
        overlay.classList.add('open');
        drawer.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        // 加载配置
        await loadConfig();
        renderDocList();
        
        // 根据页面映射决定显示什么
        const pageName = getPageName();
        const mapping = config.pageMapping[pageName];
        
        if (mapping === '*') {
            // 显示文档列表
            showListView();
        } else {
            // 显示具体文档
            const docFile = mapping || pageName.replace('.html', '.md');
            const docInfo = config.docs.find(d => d.file === docFile);
            const docName = docInfo ? docInfo.name : docFile;
            await openDoc(docFile, docName);
        }
    }

    // 关闭抽屉
    function close() {
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
    }

    // 点击面包屑返回列表
    breadcrumbRoot.addEventListener('click', () => {
        if (currentView === 'doc') {
            showListView();
        }
    });

    // 加载文档内容
    async function loadDocContent(docPath) {
        try {
            content.innerHTML = '<div class="prd-loading">加载中...</div>';
            tocList.innerHTML = ''; // 清空大纲
            
            // 先加载依赖库
            await loadDependencies();
            
            const res = await fetch(docPath);
            if (!res.ok) throw new Error('文档未找到: ' + docPath);
            const md = await res.text();
            
            content.innerHTML = marked.parse(md);

            // 生成目录
            buildTOC();

            // 渲染 Mermaid 图表
            if (typeof mermaid !== 'undefined') {
                const codeBlocks = content.querySelectorAll('pre code');
                codeBlocks.forEach((block) => {
                    const text = block.textContent.trim();
                    const isMermaid = block.className.includes('mermaid') ||
                        /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|mindmap|timeline)/.test(text);
                    
                    if (isMermaid) {
                        const pre = block.parentElement;
                        const div = document.createElement('div');
                        div.className = 'mermaid';
                        div.textContent = text;
                        pre.replaceWith(div);
                    }
                });
                
                mermaid.initialize({ startOnLoad: false, theme: 'default' });
                await mermaid.run({ querySelector: '.prd-content .mermaid' });
            }
        } catch (e) {
            content.innerHTML = '<div class="prd-loading">❌ ' + e.message + '</div>';
        }
    }

    // 绑定事件
    fab.addEventListener('click', open);
    overlay.addEventListener('click', close);
    closeBtn.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });

    // 生成目录
    function buildTOC() {
        // 获取所有标题
        const headings = content.querySelectorAll('h1, h2, h3, h4, h5, h6');
        tocList.innerHTML = '';
        
        // 构建树状结构（支持任意层级）
        const tree = [];
        const stack = [{ level: 0, children: tree }];
        
        headings.forEach((heading, index) => {
            const id = 'prd-heading-' + index;
            heading.id = id;
            const level = parseInt(heading.tagName.charAt(1));
            const node = { heading, id, level, children: [] };
            
            // 找到合适的父级
            while (stack.length > 1 && stack[stack.length - 1].level >= level) {
                stack.pop();
            }
            stack[stack.length - 1].children.push(node);
            stack.push(node);
        });
        
        // 箭头 SVG
        const arrowSvg = '<svg class="prd-toc-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>';
        
        // 递归渲染树
        function renderNode(node, container, depth = 0) {
            const groupEl = document.createElement('div');
            groupEl.className = 'prd-toc-group';
            
            // 标题项
            const itemEl = document.createElement('div');
            itemEl.className = 'prd-toc-parent';
            itemEl.style.paddingLeft = (16 + depth * 16) + 'px';
            itemEl.innerHTML = (node.children.length > 0 ? arrowSvg : '<span class="prd-toc-arrow empty"></span>') + 
                               '<span>' + node.heading.textContent + '</span>';
            itemEl.dataset.id = node.id;
            
            // 子级容器
            const childrenEl = document.createElement('div');
            childrenEl.className = 'prd-toc-children';
            
            // 递归渲染子级
            node.children.forEach(child => {
                renderNode(child, childrenEl, depth + 1);
            });
            
            // 计算子级高度用于动画
            if (node.children.length > 0) {
                childrenEl.style.maxHeight = (countNodes(node) * 40) + 'px';
            }
            
            // 点击箭头只展开/收起
            const arrow = itemEl.querySelector('.prd-toc-arrow');
            if (arrow && node.children.length > 0) {
                arrow.onclick = (e) => {
                    e.stopPropagation();
                    arrow.classList.toggle('collapsed');
                    childrenEl.classList.toggle('collapsed');
                };
            }
            
            // 点击文字跳转并选中
            const textSpan = itemEl.querySelector('span:last-child');
            if (textSpan) {
                textSpan.style.cursor = 'pointer';
                textSpan.onclick = (e) => {
                    e.stopPropagation();
                    node.heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActive(node.id);
                };
            }
            
            groupEl.appendChild(itemEl);
            groupEl.appendChild(childrenEl);
            container.appendChild(groupEl);
        }
        
        // 计算节点总数（用于动画高度）
        function countNodes(node) {
            let count = node.children.length;
            node.children.forEach(child => {
                count += countNodes(child);
            });
            return count;
        }
        
        // 渲染顶层节点
        tree.forEach(node => renderNode(node, tocList));
        
        // 设置高亮
        function setActive(id) {
            tocList.querySelectorAll('.prd-toc-parent, .prd-toc-child').forEach(el => {
                el.classList.toggle('active', el.dataset.id === id);
            });
        }
        
        // 默认高亮第一个
        if (tree.length > 0) {
            setActive(tree[0].id);
        }
        
        // 收集所有节点用于滚动高亮
        function getAllNodes(nodes) {
            let all = [];
            nodes.forEach(n => {
                all.push(n);
                all = all.concat(getAllNodes(n.children));
            });
            return all;
        }
        const allNodes = getAllNodes(tree);
        
        // 更新滚动监听
        content.removeEventListener('scroll', scrollHandler);
        function scrollHandler() {
            let current = null;
            allNodes.forEach((node) => {
                const rect = node.heading.getBoundingClientRect();
                const contentRect = content.getBoundingClientRect();
                if (rect.top <= contentRect.top + 100) {
                    current = node;
                }
            });
            if (current) {
                setActive(current.id);
            }
        }
        content.addEventListener('scroll', scrollHandler);
    }

    // 暴露 API
    window.PRDDrawer = { open, close, reload: () => { loaded = false; loadDoc(); } };
})();
