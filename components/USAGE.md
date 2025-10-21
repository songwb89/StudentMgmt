# CustomSelect 快速使用指南

## 🎯 已完成的工作

### 1. 创建的文件
```
components/
├── custom-select.css      # 组件样式文件
├── custom-select.js       # 组件JavaScript类
├── README.md             # 完整API文档
├── test.html             # 功能测试页面
└── USAGE.md              # 本文件
```

### 2. 已集成到项目
- ✅ 在 `index.html` 中引入了组件文件
- ✅ 替换了所有原生 `<select>` 为自定义组件
- ✅ 更新了筛选逻辑以支持级联功能
- ✅ 保持了所有原有功能

## 🚀 如何测试

### 方法1: 测试页面（推荐）
1. 在浏览器中打开 `components/test.html`
2. 测试所有功能：
   - 基础选择
   - 级联选择
   - 动态控制
   - 启用/禁用
   - 更新选项

### 方法2: 主应用
1. 在浏览器中打开 `index.html`
2. 点击 "AI课件讲解" 按钮
3. 在弹窗中测试筛选器：
   - 选择科目 → 年级自动启用
   - 选择年级 → 版本自动启用
   - 选择版本 → 单元自动启用
   - 点击清除按钮 → 清空选择

## 📋 核心特性

### ✨ Placeholder 真实占位符
```javascript
// 占位符不在选项列表中，只在未选择时显示
placeholder: '请选择科目'
```

### 🗑️ 内置清除按钮
```javascript
// 鼠标悬停时显示清除按钮
clearable: true  // 默认开启
```

### 🔗 级联支持
```javascript
// 示例：科目 → 年级 → 版本 → 单元
onChange: (value) => {
    if (value) {
        nextSelect.setOptions(newOptions);
        nextSelect.enable();
    } else {
        nextSelect.disable();
    }
}
```

### 🎨 美观样式
- 优雅的下拉动画
- 现代化UI设计
- 紫色主题色
- 响应式支持

## 🔧 在项目中的使用

### 当前实现的筛选器

```javascript
// 科目筛选器
subjectSelectInstance = new CustomSelect({
    container: '#subjectFilterContainer',
    placeholder: '请选择科目',
    options: ['语文', '数学', '英语'],
    clearable: true,
    onChange: (value) => filterOnlineCourses()
});

// 年级筛选器（默认禁用）
gradeSelectInstance = new CustomSelect({
    container: '#gradeFilterContainer',
    placeholder: '请选择年级',
    options: [],
    disabled: true,
    clearable: true,
    onChange: (value) => filterOnlineCourses()
});

// ... 版本和单元选择器类似
```

### 级联逻辑

```javascript
function updateCascadeFilters(subject, grade, version, unit) {
    if (subject) {
        // 根据科目获取年级列表
        const grades = [...new Set(data.filter(c => c.subject === subject).map(c => c.grade))];
        gradeSelectInstance.setOptions(grades);
        gradeSelectInstance.enable();
    } else {
        // 清空并禁用后续选择器
        gradeSelectInstance.setOptions([]);
        gradeSelectInstance.disable();
    }
    // ... 类似的逻辑用于版本和单元
}
```

## 🎨 样式定制

如果需要修改样式，编辑 `components/custom-select.css`：

```css
/* 主题色 */
.custom-select-trigger:hover {
    border-color: #8b5cf6;  /* 修改这里改变悬停颜色 */
}

/* 选中项背景色 */
.custom-select-option.selected {
    background: #ede9fe;    /* 修改这里改变选中背景 */
    color: #8b5cf6;
}
```

## 🐛 常见问题

### Q: 下拉菜单被遮挡？
A: 检查父容器的 `z-index`，组件下拉菜单的 `z-index` 为 1000

### Q: 级联不生效？
A: 确保在 `onChange` 回调中调用了筛选函数

### Q: 选项不更新？
A: 使用 `setOptions()` 方法更新选项，而不是直接修改

### Q: 如何禁用清除按钮？
A: 初始化时设置 `clearable: false`

## 📚 更多信息

详细API文档请查看 `components/README.md`

## 🎉 验证清单

测试以下功能是否正常：

- [ ] 打开 `index.html`，点击 "AI课件讲解"
- [ ] 科目选择器显示 placeholder "请选择科目"
- [ ] 选择科目后，年级选择器自动启用
- [ ] 选择年级后，版本选择器自动启用
- [ ] 选择版本后，单元选择器自动启用
- [ ] 鼠标悬停时显示清除按钮（×）
- [ ] 点击清除按钮，清空当前选择
- [ ] 清空科目，后续选择器自动禁用
- [ ] 下拉菜单动画流畅
- [ ] 选中项有紫色标记和 ✓

全部通过后，组件即可投入使用！🎊

