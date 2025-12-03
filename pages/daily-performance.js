class DailyPerformanceModal {
    constructor(studentsData) {
        this.students = studentsData;
        this.isVisible = false;
        this.currentClass = '三年二班';
        this.currentSubject = '语文';
        this.currentTimeRange = 180; // 默认近六个月（天数）
        this.selectedStudentId = null;
        this.searchText = ''; // 搜索关键词
        this.isSettingsDropdownOpen = false;

        // 可见性设置：key格式为 "班级-学科-学期"
        this.visibilitySettings = {};

        // 预定义徽章配置 (系统默认)
        this.systemBadges = {
            positive: [
                { id: 'p1', name: '一点就通', icon: 'lightbulb', color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' },
                { id: 'p2', name: '举手答问', icon: 'hand', color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' },
                { id: 'p3', name: '团队合作', icon: 'users', color: 'text-green-600', bg: 'bg-green-100', border: 'border-green-200' },
                { id: 'p4', name: '帮助他人', icon: 'heart-handshake', color: 'text-cyan-500', bg: 'bg-cyan-100', border: 'border-cyan-200' },
                { id: 'p5', name: '注意力集中', icon: 'target', color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' },
                { id: 'p6', name: '积极思考', icon: 'sun', color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-200' },
                { id: 'p7', name: '认真读书', icon: 'book-open', color: 'text-orange-500', bg: 'bg-orange-100', border: 'border-orange-200' },
                { id: 'p8', name: '遵守纪律', icon: 'shield-check', color: 'text-yellow-500', bg: 'bg-yellow-100', border: 'border-yellow-200' }
            ],
            negative: [
                { id: 'n1', name: '上课走神', icon: 'cloud', color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200' },
                { id: 'n2', name: '大声喧哗', icon: 'volume-2', color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
                { id: 'n3', name: '没交作业', icon: 'file-x', color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
                { id: 'n4', name: '疏于思考', icon: 'brain', color: 'text-pink-500', bg: 'bg-pink-50', border: 'border-pink-200' },
                { id: 'n5', name: '较少合作', icon: 'user-x', color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
                { id: 'n6', name: '追跑打闹', icon: 'zap', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200' },
                { id: 'n7', name: '损坏公物', icon: 'trash-2', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                { id: 'n8', name: '迟到', icon: 'clock', color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-200' }
            ]
        };

        // 加载自定义徽章
        this.customBadges = this.loadCustomBadges();

        // 合并所有徽章供界面使用
        this.badges = { positive: [], negative: [] };
        this.mergeBadges();

        // 初始化数据结构
        this.initData();
        // 初始化UI
        this.initUI();
    }

    initData() {
        // 确保每个学生都有 dailyStats 和 dailyHistory
        this.students.forEach(s => {
            if (!s.dailyStats) {
                s.dailyStats = { praise: 0, criticism: 0 };
            }
            if (!s.dailyHistory) {
                s.dailyHistory = [];
            }

            // 生成模拟数据 (如果为空)
            if (s.dailyHistory.length === 0) {
                const count = Math.floor(Math.random() * 8) + 3; // 3-10条记录
                for (let i = 0; i < count; i++) {
                    const isPositive = Math.random() > 0.3;
                    const type = isPositive ? 'positive' : 'negative';
                    const badgeList = isPositive ? this.badges.positive : this.badges.negative;
                    const badge = badgeList[Math.floor(Math.random() * badgeList.length)];

                    // 随机时间：最近30天内
                    const timeOffset = Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
                    const timestamp = Date.now() - timeOffset;

                    s.dailyHistory.push({
                        id: timestamp + i, // 简单模拟唯一ID
                        timestamp: timestamp,
                        type: type,
                        reason: badge.name
                    });

                    // 更新统计
                    if (isPositive) s.dailyStats.praise++;
                    else s.dailyStats.criticism++;
                }
                // 按时间倒序
                s.dailyHistory.sort((a, b) => b.timestamp - a.timestamp);
            }
        });

        // 默认选中第一个学生
        if (this.students.length > 0) {
            this.selectedStudentId = this.students[0].id;
        }
    }

    initUI() {
        this.injectStyles();
        this.createFloatingButton();
        this.createModal();
        this.renderBadges();

        // 绑定全局 ESC 关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .daily-perf-modal-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.6);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.3s ease;
            }
            .daily-perf-modal-overlay.show {
                opacity: 1;
                pointer-events: auto;
            }
            .daily-perf-modal {
                background: white;
                width: 95vw;
                height: 90vh;
                max-width: 1400px;
                border-radius: 16px;
                box-shadow: 0 20px 50px rgba(0,0,0,0.2);
                display: flex;
                flex-direction: column; /* Change to column layout */
                overflow: visible;
                transform: scale(0.95);
                transition: transform 0.3s ease;
            }
            .daily-perf-modal-overlay.show .daily-perf-modal {
                transform: scale(1);
            }
            .daily-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 24px;
                background: #fff;
                border-bottom: 1px solid #e2e8f0;
                border-radius: 16px 16px 0 0;
                position: relative;
                z-index: 100;
            }
            .daily-content-wrapper {
                display: flex;
                flex: 1;
                overflow: hidden; /* Contain the panels */
                border-radius: 0 0 16px 16px;
            }
            .daily-left-panel {
                width: 280px;
                background: #f8fafc;
                border-right: 1px solid #e2e8f0;
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
                overflow: visible;
                position: relative;
                z-index: 50;
            }
            .daily-main-panel {
                flex: 1;
                padding: 32px;
                display: flex;
                flex-direction: column;
                background: #fff;
                position: relative;
                min-width: 0;
            }
            .daily-timeline-panel {
                width: 320px;
                background: #f9fafb;
                border-left: 1px solid #e2e8f0;
                display: flex;
                flex-direction: column;
                flex-shrink: 0;
            }
            .student-list-item {
                padding: 16px 20px;
                border-bottom: 1px solid #f1f5f9;
                cursor: pointer;
                transition: all 0.2s;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 12px;
            }
            .student-index {
                color: #9ca3af;
                font-size: 13px;
                min-width: 20px;
                text-align: right;
            }
            .student-list-item:hover {
                background: #fff;
            }
            .student-list-item.active {
                background: white;
                border-left: 4px solid #1e6fff;
                box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            .student-list-item .stats-pill {
                display: flex;
                gap: 8px;
                font-size: 13px;
                font-weight: 600;
            }
            .stat-item {
                display: flex;
                align-items: center;
                gap: 2px;
                font-size: 13px;
            }
            .stat-item.praise { color: #16a34a; }
            .stat-item.criticism { color: #dc2626; }
            
            .badge-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 10px;
                margin-bottom: 24px;
            }
            /* Compact mode removed as per requirement */
            .perf-badge {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 14px 10px;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s;
                border: 2px solid transparent;
                user-select: none;
            }
            .perf-badge .badge-icon {
                width: 42px;
                height: 42px;
                border-radius: 50%;
                background: white;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .perf-badge .badge-name {
                font-size: 12px;
                font-weight: 600;
                text-align: center;
            }
            .perf-badge:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1);
            }
            .perf-badge:active {
                transform: scale(0.95);
            }
            .floating-score-anim {
                position: absolute;
                font-size: 24px;
                font-weight: bold;
                pointer-events: none;
                animation: floatUp 0.8s ease-out forwards;
                z-index: 10000;
            }
            @keyframes floatUp {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
            }
            .close-btn {
                position: absolute;
                top: 20px;
                right: 20px;
                padding: 8px;
                border-radius: 50%;
                cursor: pointer;
                transition: bg 0.2s;
                color: #64748b;
                z-index: 10;
            }
            .close-btn:hover {
                background: #f1f5f9;
                color: #334155;
            }
            
            /* Timeline Styles */
            .timeline-header-area {
                padding: 12px 20px;
                background: rgba(249, 250, 251, 0.8);
                backdrop-filter: blur(4px);
                position: sticky;
                top: 0;
                z-index: 10;
                font-size: 12px;
                font-weight: 500;
                color: #94a3b8;
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .timeline-container {
                flex: 1;
                overflow-y: auto;
                padding: 0 20px 20px 20px;
            }
            .timeline-item {
                position: relative;
                padding-left: 24px;
                margin-bottom: 20px;
                animation: slideIn 0.3s ease-out;
            }
            @keyframes slideIn {
                from { opacity: 0; transform: translateX(20px); }
                to { opacity: 1; transform: translateX(0); }
            }
            .timeline-line {
                position: absolute;
                left: 7px;
                top: 24px;
                bottom: -24px;
                width: 2px;
                background: #e2e8f0;
            }
            .timeline-item:last-child .timeline-line {
                display: none;
            }
            .timeline-dot {
                position: absolute;
                left: 0;
                top: 6px;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                border: 3px solid #fff;
                box-shadow: 0 0 0 1px #e2e8f0;
                z-index: 1;
            }
            .timeline-dot.positive { background: #22c55e; }
            .timeline-dot.negative { background: #ef4444; }
            
            .timeline-card {
                background: white;
                padding: 12px;
                border-radius: 8px;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                border: 1px solid #f1f5f9;
                position: relative;
                transition: all 0.2s;
            }
            .timeline-card:hover {
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                border-color: #e2e8f0;
            }
            .timeline-meta {
                display: flex;
                justify-content: space-between;
                margin-bottom: 4px;
                font-size: 12px;
                color: #94a3b8;
            }
            .timeline-content {
                font-size: 14px;
                font-weight: 500;
                color: #1e293b;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .timeline-delete {
                position: absolute;
                right: 8px;
                top: 50%;
                transform: translateY(-50%);
                cursor: pointer;
                padding: 6px;
                border-radius: 4px;
                color: #94a3b8;
                background: rgba(255,255,255,0.8);
                transition: all 0.2s;
            }
            .timeline-delete:hover {
                background: #fee2e2;
                color: #ef4444;
            }
            
            /* Settings Dropdown Styles */
            .settings-btn-wrapper {
                position: relative;
            }
            .settings-btn {
                padding: 8px;
                border-radius: 6px;
                cursor: pointer;
                color: #64748b;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .settings-btn:hover {
                background: #f1f5f9;
            }
            .settings-dropdown {
                display: none;
                position: fixed;
                width: 240px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                border: 1px solid #e2e8f0;
                z-index: 99999;
            }
            .settings-dropdown.show {
                display: block;
            }
            .settings-header {
                padding: 12px 16px;
                border-bottom: 1px solid #f1f5f9;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 600;
                font-size: 14px;
                color: #334155;
            }
            .settings-body {
                padding: 12px 16px;
            }
            .settings-item {
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
            .settings-label {
                font-size: 14px;
                color: #475569;
                font-weight: 500;
            }
            .settings-scope {
                margin-top: 12px;
                padding-top: 12px;
                border-top: 1px dashed #e2e8f0;
            }
            .scope-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .scope-tag {
                font-size: 11px;
                padding: 4px 8px;
                background: #f1f5f9;
                color: #64748b;
                border-radius: 4px;
                font-weight: 500;
            }
            
            /* Header Select Styles */
            .header-select {
                border: none;
                background: transparent;
                font-size: 14px;
                font-weight: 500;
                color: #64748b;
                cursor: pointer;
                padding: 4px 24px 4px 4px;
                appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
                background-repeat: no-repeat;
                background-position: right center;
                background-size: 14px;
                transition: all 0.2s;
                border-radius: 6px;
            }
            .header-select:hover {
                background-color: #f1f5f9;
                color: #334155;
            }
            .header-select:focus {
                outline: none;
                background-color: #e2e8f0;
            }
            
            /* Toggle Switch Styles */
            .toggle-switch {
                position: relative;
                display: inline-block;
                width: 36px;
                height: 20px;
            }
            .toggle-switch input {
                opacity: 0;
                width: 0;
                height: 0;
            }
            .toggle-slider {
                position: absolute;
                cursor: pointer;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: #cbd5e1;
                transition: 0.3s;
                border-radius: 20px;
            }
            .toggle-slider:before {
                position: absolute;
                content: "";
                height: 14px;
                width: 14px;
                left: 3px;
                bottom: 3px;
                background-color: white;
                transition: 0.3s;
                border-radius: 50%;
            }
            .toggle-switch input:checked + .toggle-slider {
                background-color: #3b82f6;
            }
            .toggle-switch input:checked + .toggle-slider:before {
                transform: translateX(20px);
            }
            
            /* Search Box Styles */
            .daily-search-box {
                padding: 12px 16px;
                border-bottom: 1px solid #f1f5f9;
                background: #fff;
                position: sticky;
                top: 0;
                z-index: 10;
            }
            .search-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
            }
            .search-input-wrapper svg {
                position: absolute;
                left: 10px;
                color: #94a3b8;
                width: 16px;
                height: 16px;
                pointer-events: none;
            }
            .search-input {
                width: 100%;
                padding: 8px 12px 8px 34px;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                font-size: 13px;
                color: #334155;
                transition: all 0.2s;
                outline: none;
            }
            .search-input:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }
            .search-input::placeholder {
                color: #cbd5e1;
            }
            
            /* Badge Manager Styles */
            .badge-manager-overlay {
                position: fixed;
                inset: 0;
                background: rgba(0, 0, 0, 0.5);
                z-index: 100000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s;
            }
            .badge-manager-overlay.show {
                opacity: 1;
                pointer-events: auto;
            }
            .badge-manager-modal {
                background: white;
                width: 400px;
                border-radius: 12px;
                box-shadow: 0 10px 25px rgba(0,0,0,0.2);
                overflow: hidden;
                transform: scale(0.95);
                transition: transform 0.2s;
            }
            .badge-manager-overlay.show .badge-manager-modal {
                transform: scale(1);
            }
            .manager-header {
                padding: 16px;
                border-bottom: 1px solid #f1f5f9;
                display: flex;
                justify-content: space-between;
                align-items: center;
                font-weight: 600;
                color: #334155;
            }
            .manager-content {
                padding: 20px;
            }
            .add-badge-form {
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
            }
            .badge-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                font-size: 14px;
                outline: none;
            }
            .badge-input:focus {
                border-color: #3b82f6;
                box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
            }
            .add-btn {
                padding: 8px 16px;
                background: #3b82f6;
                color: white;
                border-radius: 6px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: bg 0.2s;
            }
            .add-btn:hover {
                background: #2563eb;
            }
            .manager-list {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                max-height: 300px;
                overflow-y: auto;
            }
            .manager-badge-tag {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 6px 10px;
                border-radius: 6px;
                font-size: 13px;
                border: 1px solid transparent;
                user-select: none;
            }
            .manager-badge-tag.system {
                background: #f1f5f9;
                color: #64748b;
                border-color: #e2e8f0;
            }
            .manager-badge-tag.custom-positive {
                background: #e0e7ff;
                color: #4338ca;
                border-color: #c7d2fe;
            }
            .manager-badge-tag.custom-negative {
                background: #ffe4e6;
                color: #e11d48;
                border-color: #fecdd3;
            }
            .delete-badge-btn {
                cursor: pointer;
                opacity: 0.6;
                transition: opacity 0.2s;
                display: flex;
                align-items: center;
            }
            .delete-badge-btn:hover {
                opacity: 1;
            }
            .manage-link-btn {
                font-size: 12px;
                color: #94a3b8;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 4px;
                transition: all 0.2s;
            }
            .manage-link-btn:hover {
                background: #f1f5f9;
                color: #3b82f6;
            }

            /* Visibility Toggle Button in Header */
            .header-visibility-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 4px 12px;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
                margin-left: 8px;
                user-select: none;
                border-left: 1px solid #e2e8f0;
            }
            .header-visibility-btn:hover {
                opacity: 0.8;
            }
            .header-visibility-btn.visible {
                color: #16a34a;
            }
            .header-visibility-btn.hidden-state {
                color: #6b7280;
            }
            
            /* 开关样式 */
            .publish-toggle {
                position: relative;
                width: 36px;
                height: 20px;
                background: #d1d5db;
                border-radius: 10px;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            .publish-toggle::after {
                content: '';
                position: absolute;
                top: 2px;
                left: 2px;
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                transition: all 0.2s;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
            }
            .publish-toggle.on {
                background: #16a34a;
            }
            .publish-toggle.on::after {
                left: 18px;
            }
        `;
        document.head.appendChild(style);
    }

    createFloatingButton() {
        // 在筛选条件左侧的槽位插入按钮
        const buttonSlot = document.getElementById('dailyPerfButtonSlot');
        if (!buttonSlot) {
            console.warn('未找到 dailyPerfButtonSlot，无法插入“课堂点评”按钮');
            return;
        }

        let btn = document.getElementById('dailyPerfToolbarBtn');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'dailyPerfToolbarBtn';
            btn.className = 'btn btn-outline';
            btn.style.display = 'flex';
            btn.style.alignItems = 'center';
            btn.style.gap = '8px';
            btn.style.padding = '10px 16px';
            btn.innerHTML = `
                <i data-lucide="trophy" style="width: 16px; height: 16px;"></i>
                课堂点评
            `;
            btn.onclick = () => this.show();
            buttonSlot.appendChild(btn);
        }

        this.toolbarBtn = btn;

        // 初始化图标
        if (window.lucide) window.lucide.createIcons();

        // 监听标签页切换
        this.observeTabSwitch();

        // 初始化可见性
        this.updateFloatingButtonVisibility('all');
    }

    observeTabSwitch() {
        // 监听 switchTab 函数的调用
        const originalSwitchTab = window.switchTab;
        if (originalSwitchTab) {
            window.switchTab = (tab) => {
                originalSwitchTab(tab);
                this.updateFloatingButtonVisibility(tab);
            };
        }
    }

    updateFloatingButtonVisibility(tab) {
        const buttonSlot = document.getElementById('dailyPerfButtonSlot');
        if (!buttonSlot) return;

        buttonSlot.style.display = tab === 'all' ? 'block' : 'none';
    }

    createModal() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'daily-perf-modal-overlay';

        this.overlay.innerHTML = `
            <div class="daily-perf-modal">
                <!-- 统一顶部栏 -->
                <div class="daily-modal-header">
                    <div class="flex items-center gap-4">
                        <h2 class="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <i data-lucide="trophy" class="text-blue-600 w-6 h-6"></i> 
                            课堂点评
                        </h2>
                        <div class="h-6 w-px bg-gray-300 mx-2"></div>
                        
                        <!-- 筛选器区域 -->
                        <div class="flex items-center gap-2">
                            <select class="header-select" id="dailyClassSelect">
                                <option>三年一班</option>
                                <option selected>三年二班</option>
                                <option>三年三班</option>
                                <option>三年四班</option>
                                <option>三年五班</option>
                            </select>
                            <select class="header-select" id="dailySubjectSelect">
                                <option>语文</option>
                                <option>数学</option>
                                <option>英语</option>
                            </select>
                            <select class="header-select" id="dailyTimeRangeSelect">
                                <option value="7">近一周</option>
                                <option value="30">近一个月</option>
                                <option value="180" selected>近六个月</option>
                                <option value="365">近一年</option>
                                <option value="0">全部数据</option>
                            </select>

                            <!-- 新增：发布状态开关 -->
                            <div class="header-visibility-btn visible" id="headerVisibilityBtn" title="点击切换发布状态">
                                <div class="publish-toggle on"></div>
                                <span>已发布</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <!-- 关闭按钮 -->
                        <div class="p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer" onclick="window.dailyPerfModal.hide()">
                            <i data-lucide="x" class="w-6 h-6"></i>
                        </div>
                    </div>
                </div>

                <!-- 内容区域 -->
                <div class="daily-content-wrapper">
                    <!-- 左侧学生列表 -->
                    <div class="daily-left-panel">
                        <!-- 搜索框 -->
                        <div class="daily-search-box">
                            <div class="search-input-wrapper">
                                <i data-lucide="search"></i>
                                <input type="text" class="search-input" id="dailyStudentSearch" placeholder="搜索学生...">
                            </div>
                        </div>
                        <!-- 学生列表 -->
                        <div class="flex-1 overflow-y-auto" id="dailyStudentList">
                            <!-- 动态渲染 -->
                        </div>
                    </div>

                    <!-- 中间评价区 -->
                    <div class="daily-main-panel">
                        <div class="mb-6 border-b border-gray-100 pb-6">
                            <div class="flex items-end justify-between">
                                <h2 class="text-3xl font-bold text-gray-800" id="dailyTargetName">请选择学生</h2>
                                <div class="text-gray-500" id="dailyTargetStats">点击下方徽章进行评价</div>
                            </div>
                        </div>

                        <div class="flex-1 overflow-hidden pr-2">
                            <div class="mb-8">
                                <div class="flex items-center justify-between mb-4">
                                    <h4 class="text-sm font-bold text-green-700 uppercase tracking-wider flex items-center gap-2">
                                        <i data-lucide="thumbs-up" class="w-4 h-4"></i> 正向激励
                                    </h4>
                                    <div class="manage-link-btn" onclick="window.dailyPerfModal.openBadgeManager('positive')">
                                        <i data-lucide="settings-2" class="w-3 h-3"></i> 管理
                                    </div>
                                </div>
                                <div class="badge-grid" id="positiveBadges"></div>
                            </div>

                            <div>
                                <div class="flex items-center justify-between mb-4">
                                    <h4 class="text-sm font-bold text-red-700 uppercase tracking-wider flex items-center gap-2">
                                        <i data-lucide="thumbs-down" class="w-4 h-4"></i> 待改进
                                    </h4>
                                    <div class="manage-link-btn" onclick="window.dailyPerfModal.openBadgeManager('negative')">
                                        <i data-lucide="settings-2" class="w-3 h-3"></i> 管理
                                    </div>
                                </div>
                                <div class="badge-grid" id="negativeBadges"></div>
                            </div>
                        </div>
                    </div>

                    <!-- 右侧时间轴 -->
                    <div class="daily-timeline-panel">
                        <div class="timeline-header-area">
                            <i data-lucide="history" class="w-3 h-3"></i> 点评记录
                        </div>
                        <div class="timeline-container" id="dailyTimelineList">
                            <!-- 动态渲染 -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.overlay);

        // 将下拉菜单移动到 body，避免受到 modal transform 的影响导致定位错误
        const dropdownEl = this.overlay.querySelector('#visibilitySettingsDropdown');
        if (dropdownEl) {
            document.body.appendChild(dropdownEl);
        }

        // 绑定筛选事件
        const classSelect = this.overlay.querySelector('#dailyClassSelect');
        classSelect.addEventListener('change', (e) => {
            this.currentClass = e.target.value;
            this.renderStudentList();
            this.updateVisibilityToggleState();
        });

        const subjectSelect = this.overlay.querySelector('#dailySubjectSelect');
        subjectSelect.addEventListener('change', (e) => {
            this.currentSubject = e.target.value;
            this.updateVisibilityToggleState();
        });

        const timeRangeSelect = this.overlay.querySelector('#dailyTimeRangeSelect');
        timeRangeSelect.addEventListener('change', (e) => {
            this.currentTimeRange = parseInt(e.target.value);
            this.renderStudentList();
        });

        // 绑定可见性切换按钮事件
        const visibilityBtn = this.overlay.querySelector('#headerVisibilityBtn');
        visibilityBtn.addEventListener('click', () => {
            this.toggleVisibility();
        });

        // 初始化可见性按钮状态
        this.updateVisibilityToggleState();

        // 绑定搜索框事件
        const searchInput = this.overlay.querySelector('#dailyStudentSearch');
        searchInput.addEventListener('input', (e) => {
            this.searchText = e.target.value.trim();
            this.renderStudentList();
        });
    }

    initSemesterOptions(selectElement) {
        const startYear = 2023;
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        const semesters = [];
        for (let y = currentYear; y >= startYear; y--) {
            if (y === currentYear && currentMonth < 7) {
                semesters.push(`${y}年上学期`);
            } else {
                semesters.push(`${y}年下学期`);
                semesters.push(`${y}年上学期`);
            }
        }

        selectElement.innerHTML = semesters.map(s => `<option value="${s}">${s}</option>`).join('');

        // Set default
        let defaultSemester = '';
        if (currentMonth >= 7) {
            defaultSemester = `${currentYear}年下学期`;
        } else {
            defaultSemester = `${currentYear}年上学期`;
        }

        if (semesters.includes(defaultSemester)) {
            selectElement.value = defaultSemester;
            this.currentSemester = defaultSemester;
        } else if (semesters.length > 0) {
            selectElement.value = semesters[0];
            this.currentSemester = semesters[0];
        }
    }

    renderStudentList() {
        const listContainer = this.overlay.querySelector('#dailyStudentList');

        // 过滤逻辑
        let filteredStudents = [...this.students];

        // 1. 按搜索词过滤
        if (this.searchText) {
            const term = this.searchText.toLowerCase();
            filteredStudents = filteredStudents.filter(s => s.name.toLowerCase().includes(term));
        }

        // 2. 按姓名拼音首字母升序排序
        filteredStudents.sort((a, b) =>
            a.name.localeCompare(b.name, 'zh-CN')
        );

        if (filteredStudents.length === 0) {
            listContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-40 text-gray-400">
                    <i data-lucide="search-x" class="w-8 h-8 mb-2 opacity-50"></i>
                    <span class="text-sm">未找到学生</span>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        listContainer.innerHTML = filteredStudents.map((s, index) => `
            <div class="student-list-item ${s.id === this.selectedStudentId ? 'active' : ''}" 
                 onclick="window.dailyPerfModal.selectStudent(${s.id})">
                <span class="student-index">${index + 1}</span>
                <div class="font-medium text-gray-700">${s.name}</div>
                <div class="stats-pill">
                    <div class="stat-item praise">
                        <i data-lucide="thumbs-up" class="w-3.5 h-3.5"></i>
                        <span id="praise_count_${s.id}">${s.dailyStats.praise}</span>
                    </div>
                    <div class="stat-item criticism">
                        <i data-lucide="thumbs-down" class="w-3.5 h-3.5"></i>
                        <span id="criticism_count_${s.id}">${s.dailyStats.criticism}</span>
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    renderBadges() {
        const posContainer = this.overlay.querySelector('#positiveBadges');
        const negContainer = this.overlay.querySelector('#negativeBadges');

        const createBadge = (b, type) => `
            <div class="perf-badge ${b.bg} ${b.border}" onclick="window.dailyPerfModal.triggerBadge('${type}', '${b.name}', this)">
                <div class="badge-icon">
                    <i data-lucide="${b.icon}" class="${b.color} w-6 h-6"></i>
                </div>
                <span class="badge-name ${b.color}">${b.name}</span>
            </div>
        `;

        // 始终使用统一的标准样式，不再需要紧凑模式
        posContainer.className = 'badge-grid';
        negContainer.className = 'badge-grid';

        posContainer.innerHTML = this.badges.positive.map(b => createBadge(b, 'positive')).join('');
        negContainer.innerHTML = this.badges.negative.map(b => createBadge(b, 'negative')).join('');
    }

    selectStudent(id) {
        this.selectedStudentId = id;
        this.renderStudentList();
        this.updateRightPanelHeader();
        this.renderTimeline();
    }

    updateRightPanelHeader() {
        const student = this.students.find(s => s.id === this.selectedStudentId);
        if (!student) return;

        const nameEl = this.overlay.querySelector('#dailyTargetName');
        const statsEl = this.overlay.querySelector('#dailyTargetStats');

        nameEl.textContent = student.name;
        statsEl.innerHTML = `
            <span class="text-green-600 font-medium mr-4 inline-flex items-center gap-1">
                <i data-lucide="thumbs-up" class="w-4 h-4"></i> 点赞：${student.dailyStats.praise}
            </span>
            <span class="text-red-600 font-medium inline-flex items-center gap-1">
                <i data-lucide="thumbs-down" class="w-4 h-4"></i> 批评：${student.dailyStats.criticism}
            </span>
        `;
        if (window.lucide) window.lucide.createIcons();
    }

    triggerBadge(type, reason, element) {
        if (!this.selectedStudentId) return;

        const student = this.students.find(s => s.id === this.selectedStudentId);
        if (!student) return;

        // 1. 记录历史
        const timestamp = Date.now();

        const record = {
            id: timestamp,
            timestamp: timestamp,
            type,
            reason
        };

        if (!student.dailyHistory) student.dailyHistory = [];
        student.dailyHistory.push(record);

        // 2. 更新统计数据
        if (type === 'positive') {
            student.dailyStats.praise++;
            this.showFloatingAnim(element, '+1', 'text-green-600');
        } else {
            student.dailyStats.criticism++;
            this.showFloatingAnim(element, '-1', 'text-red-600');
        }

        // 3. 更新UI
        this.updateRightPanelHeader();
        this.renderTimeline();

        // 更新左侧列表中的具体数字
        const praiseEl = document.getElementById(`praise_count_${student.id}`);
        const critEl = document.getElementById(`criticism_count_${student.id}`);
        if (praiseEl) praiseEl.textContent = student.dailyStats.praise;
        if (critEl) critEl.textContent = student.dailyStats.criticism;
    }

    formatDate(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();

        const pad = (n) => n.toString().padStart(2, '0');
        const timeStr = `${pad(date.getHours())}:${pad(date.getMinutes())}`;

        const isToday = date.getDate() === now.getDate() &&
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();

        const isThisYear = date.getFullYear() === now.getFullYear();

        if (isToday) {
            return `今天 ${timeStr}`;
        } else if (isThisYear) {
            return `${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${timeStr}`;
        } else {
            return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${timeStr}`;
        }
    }

    renderTimeline() {
        const container = this.overlay.querySelector('#dailyTimelineList');
        const student = this.students.find(s => s.id === this.selectedStudentId);

        if (!student || !student.dailyHistory || student.dailyHistory.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-gray-400">
                    <i data-lucide="clipboard-list" class="w-12 h-12 mb-2 opacity-20"></i>
                    <p class="text-sm">暂无点评记录</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        // 按时间倒序排列
        let sorted = [...student.dailyHistory].sort((a, b) => b.timestamp - a.timestamp);

        // 应用时段筛选
        if (this.currentTimeRange > 0) {
            const cutoffTime = Date.now() - this.currentTimeRange * 24 * 60 * 60 * 1000;
            sorted = sorted.filter(item => item.timestamp >= cutoffTime);
        }

        // 如果没有符合条件的记录
        if (sorted.length === 0) {
            container.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-gray-400">
                    <i data-lucide="clipboard-list" class="w-12 h-12 mb-2 opacity-20"></i>
                    <p class="text-sm">该时段内暂无点评记录</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        container.innerHTML = sorted.map((item, index) => `
            <div class="timeline-item">
                <div class="timeline-line"></div>
                <div class="timeline-dot ${item.type === 'positive' ? 'positive' : 'negative'}"></div>
                <div class="timeline-card group">
                    <div class="timeline-meta">
                        <span>${this.formatDate(item.timestamp)}</span>
                    </div>
                    <div class="timeline-content">
                        <span>${item.reason}</span>
                        <span class="${item.type === 'positive' ? 'text-green-600' : 'text-red-600'} font-bold">
                            ${item.type === 'positive' ? '+1' : '-1'}
                        </span>
                    </div>
                    <div class="timeline-delete" onclick="window.dailyPerfModal.deleteHistoryItem(${item.id})" title="撤销此记录">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </div>
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    deleteHistoryItem(recordId) {
        const student = this.students.find(s => s.id === this.selectedStudentId);
        if (!student) return;

        const index = student.dailyHistory.findIndex(r => r.id === recordId);
        if (index === -1) return;

        const record = student.dailyHistory[index];

        // 回退统计数据
        if (record.type === 'positive') {
            student.dailyStats.praise = Math.max(0, student.dailyStats.praise - 1);
        } else {
            student.dailyStats.criticism = Math.max(0, student.dailyStats.criticism - 1);
        }

        // 删除记录
        student.dailyHistory.splice(index, 1);

        // 更新UI
        this.updateRightPanelHeader();
        this.renderTimeline();

        // 更新左侧列表
        const praiseEl = document.getElementById(`praise_count_${student.id} `);
        const critEl = document.getElementById(`criticism_count_${student.id} `);
        if (praiseEl) praiseEl.textContent = student.dailyStats.praise;
        if (critEl) critEl.textContent = student.dailyStats.criticism;
    }

    showFloatingAnim(targetEl, text, colorClass) {
        const rect = targetEl.getBoundingClientRect();
        const floatEl = document.createElement('div');
        floatEl.className = `floating-score-anim ${colorClass}`;
        floatEl.textContent = text;
        floatEl.style.left = `${rect.left + rect.width / 2 - 10}px`;
        floatEl.style.top = `${rect.top}px`;
        document.body.appendChild(floatEl);

        setTimeout(() => floatEl.remove(), 1000);
    }

    show() {
        this.isVisible = true;
        this.overlay.classList.add('show');
        this.renderStudentList();
        this.updateRightPanelHeader();
        this.renderTimeline(); // 初始渲染时间轴
        // 重新渲染图标，确保动态插入的图标显示
        if (window.lucide) window.lucide.createIcons();
    }

    hide() {
        this.isVisible = false;
        this.overlay.classList.remove('show');
    }

    getVisibilityKey() {
        return `${this.currentClass} -${this.currentSubject} -${this.currentSemester} `;
    }

    updateVisibilityToggleState() {
        const btn = document.getElementById('headerVisibilityBtn');
        if (!btn) return;

        const key = this.getVisibilityKey();
        // 默认为 true（可见）
        const isVisible = this.visibilitySettings[key] !== false;

        if (isVisible) {
            btn.className = 'header-visibility-btn visible';
            btn.innerHTML = `
                <div class="publish-toggle on"></div>
                <span>已发布</span>
            `;
        } else {
            btn.className = 'header-visibility-btn hidden-state';
            btn.innerHTML = `
                <div class="publish-toggle"></div>
                <span>未发布</span>
            `;
        }
    }

    toggleVisibility() {
        const key = this.getVisibilityKey();
        const currentIsVisible = this.visibilitySettings[key] !== false;

        // 切换状态
        this.visibilitySettings[key] = !currentIsVisible;

        // 更新 UI
        this.updateVisibilityToggleState();

        // 显示提示
        const newIsVisible = !currentIsVisible;
        this.showToast(
            newIsVisible
                ? '已发布，学生端可查看'
                : '已取消发布',
            newIsVisible ? 'success' : 'info'
        );

        // 这里可以添加保存到后端的逻辑
        console.log('可见性设置已更新:', key, newIsVisible);
    }

    loadCustomBadges() {
        try {
            const stored = localStorage.getItem('custom_badges');
            if (stored) {
                const parsed = JSON.parse(stored);
                // 确保结构正确
                if (!parsed.positive) parsed.positive = [];
                if (!parsed.negative) parsed.negative = [];
                return parsed;
            }
        } catch (e) {
            console.error('Failed to load custom badges', e);
        }
        return { positive: [], negative: [] };
    }

    mergeBadges() {
        this.badges.positive = [...this.systemBadges.positive, ...this.customBadges.positive];
        this.badges.negative = [...this.systemBadges.negative, ...this.customBadges.negative];
    }

    saveCustomBadges() {
        localStorage.setItem('custom_badges', JSON.stringify(this.customBadges));
        this.mergeBadges();
        this.renderBadges();
        if (window.lucide) window.lucide.createIcons();
    }

    openBadgeManager(type) {
        // 移除旧的 manager (如果存在)
        const oldOverlay = document.getElementById('badgeManagerOverlay');
        if (oldOverlay) oldOverlay.remove();

        const overlay = document.createElement('div');
        overlay.id = 'badgeManagerOverlay';
        overlay.className = 'badge-manager-overlay show';

        const typeName = type === 'positive' ? '正向激励' : '待改进';
        const icon = type === 'positive' ? 'thumbs-up' : 'thumbs-down';
        const color = type === 'positive' ? 'text-green-600' : 'text-red-600';

        overlay.innerHTML = `
            <div class="badge-manager-modal">
                <div class="manager-header">
                    <div class="flex items-center gap-2">
                        <i data-lucide="${icon}" class="${color} w-5 h-5"></i>
                        管理${typeName}徽章
                    </div>
                    <div class="cursor-pointer hover:bg-gray-100 p-1 rounded" id="closeManagerBtn">
                        <i data-lucide="x" class="w-5 h-5 text-gray-500"></i>
                    </div>
                </div>
                <div class="manager-content">
                    <div class="add-badge-form">
                        <input type="text" class="badge-input" id="newBadgeName" placeholder="输入徽章名称 (2-4字)" maxlength="6">
                        <button class="add-btn" id="addBadgeBtn">添加</button>
                    </div>
                    
                    <div class="text-xs text-gray-400 mb-2">现有徽章 (灰色为系统预置)</div>
                    <div class="manager-list" id="managerBadgeList">
                        <!-- List Rendered Here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        if (window.lucide) window.lucide.createIcons();

        // 绑定事件
        overlay.querySelector('#closeManagerBtn').onclick = () => overlay.remove();
        overlay.querySelector('#addBadgeBtn').onclick = () => {
            const input = overlay.querySelector('#newBadgeName');
            const name = input.value.trim();
            if (name) {
                if (this.addCustomBadge(name, type)) {
                    input.value = '';
                    this.renderManagerList(type);
                }
            }
        };
        // 回车添加
        overlay.querySelector('#newBadgeName').onkeypress = (e) => {
            if (e.key === 'Enter') overlay.querySelector('#addBadgeBtn').click();
        };

        // 初始渲染列表
        this.renderManagerList(type);
    }

    renderManagerList(type) {
        const container = document.getElementById('managerBadgeList');
        if (!container) return;

        const systemList = this.systemBadges[type];
        const customList = this.customBadges[type];
        const allList = [...systemList.map(b => ({ ...b, isSystem: true })), ...customList];

        container.innerHTML = allList.map(b => {
            const isSystem = b.isSystem;
            const tagClass = isSystem ? 'system' : (type === 'positive' ? 'custom-positive' : 'custom-negative');

            return `
                <div class="manager-badge-tag ${tagClass}">
                    <span>${b.name}</span>
                    ${!isSystem ? `
                        <div class="delete-badge-btn" onclick="window.dailyPerfModal.deleteCustomBadge('${b.id}', '${type}')">
                            <i data-lucide="x" class="w-3 h-3"></i>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');

        if (window.lucide) window.lucide.createIcons();
    }

    addCustomBadge(name, type) {
        // 检查是否已达到上限（系统8个 + 自定义最多4个 = 12个）
        const totalCount = this.systemBadges[type].length + this.customBadges[type].length;
        if (totalCount >= 12) {
            this.showToast('最多只能添加4个自定义徽章', 'warning');
            return false;
        }

        const id = Date.now().toString();
        const badge = {
            id: id,
            name: name,
            // 默认样式配置
            icon: type === 'positive' ? 'star' : 'alert-triangle',
            color: type === 'positive' ? 'text-indigo-600' : 'text-rose-600',
            bg: type === 'positive' ? 'bg-indigo-50' : 'bg-rose-50',
            border: type === 'positive' ? 'border-indigo-100' : 'border-rose-100'
        };

        this.customBadges[type].push(badge);
        this.saveCustomBadges();
        return true;
    }

    deleteCustomBadge(id, type) {
        this.customBadges[type] = this.customBadges[type].filter(b => b.id !== id);
        this.saveCustomBadges();
        this.renderManagerList(type);
    }

    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 99999;
            animation: fadeIn 0.2s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Toast 动画
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(toastStyle);
