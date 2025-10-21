# CustomSelect 自定义下拉组件

## 功能特性

✅ **真正的 Placeholder** - 占位符不在选项列表中  
✅ **内置清除按钮** - 点击快速清除选择  
✅ **级联支持** - 支持启用/禁用状态  
✅ **动态选项** - 支持动态更新选项列表  
✅ **优雅动画** - 平滑的下拉展开/收起动画  
✅ **响应式设计** - 适配移动端和桌面端  
✅ **完整 API** - 丰富的方法和回调

## 使用方法

### 1. 引入组件

```html
<!-- CSS -->
<link rel="stylesheet" href="components/custom-select.css">

<!-- JavaScript -->
<script src="components/custom-select.js"></script>
```

### 2. 准备容器

```html
<div id="mySelectContainer"></div>
```

### 3. 初始化组件

```javascript
const mySelect = new CustomSelect({
    container: '#mySelectContainer',
    placeholder: '请选择',
    options: ['选项1', '选项2', '选项3'],
    value: '',
    disabled: false,
    clearable: true,
    onChange: (value) => {
        console.log('选中:', value);
    }
});
```

## API 文档

### 配置选项

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `container` | String/Element | **必填** | 容器选择器或DOM元素 |
| `placeholder` | String | `'请选择'` | 占位符文本 |
| `options` | Array | `[]` | 选项列表 |
| `value` | String | `''` | 初始值 |
| `disabled` | Boolean | `false` | 是否禁用 |
| `clearable` | Boolean | `true` | 是否显示清除按钮 |
| `onChange` | Function | `() => {}` | 值变化回调 |

### 实例方法

#### `setValue(value, triggerChange = true)`
设置选中值

```javascript
mySelect.setValue('选项1'); // 设置并触发onChange
mySelect.setValue('选项2', false); // 设置但不触发onChange
```

#### `getValue()`
获取当前值

```javascript
const currentValue = mySelect.getValue();
```

#### `setOptions(options, keepValue = false)`
设置选项列表

```javascript
mySelect.setOptions(['新选项1', '新选项2']); // 设置新选项，清除当前值
mySelect.setOptions(['新选项1', '新选项2'], true); // 保留当前值（如果存在于新选项中）
```

#### `enable()` / `disable()`
启用/禁用组件

```javascript
mySelect.enable();
mySelect.disable();
```

#### `setDisabled(disabled)`
设置禁用状态

```javascript
mySelect.setDisabled(true); // 禁用
mySelect.setDisabled(false); // 启用
```

#### `isDisabled()`
判断是否禁用

```javascript
if (mySelect.isDisabled()) {
    console.log('组件已禁用');
}
```

#### `clear()` / `reset()`
清除选择

```javascript
mySelect.clear();
// 或
mySelect.reset();
```

#### `open()` / `close()` / `toggle()`
控制下拉菜单

```javascript
mySelect.open(); // 打开
mySelect.close(); // 关闭
mySelect.toggle(); // 切换
```

#### `destroy()`
销毁组件

```javascript
mySelect.destroy();
```

## 级联使用示例

```javascript
// 科目选择器
const subjectSelect = new CustomSelect({
    container: '#subjectSelect',
    placeholder: '请选择科目',
    options: ['语文', '数学', '英语'],
    onChange: (subject) => {
        if (subject) {
            // 根据科目获取年级
            const grades = getGradesBySubject(subject);
            gradeSelect.setOptions(grades);
            gradeSelect.enable();
        } else {
            gradeSelect.setOptions([]);
            gradeSelect.disable();
        }
    }
});

// 年级选择器（默认禁用）
const gradeSelect = new CustomSelect({
    container: '#gradeSelect',
    placeholder: '请选择年级',
    options: [],
    disabled: true,
    onChange: (grade) => {
        // 处理年级变化
    }
});
```

## 样式自定义

组件使用 CSS 类名，你可以通过覆盖以下类来自定义样式：

```css
/* 主容器 */
.custom-select { }

/* 触发器 */
.custom-select-trigger { }

/* 选中值 */
.custom-select-value { }

/* 占位符 */
.custom-select-value.placeholder { }

/* 清除按钮 */
.custom-select-clear { }

/* 下拉菜单 */
.custom-select-dropdown { }

/* 选项 */
.custom-select-option { }

/* 选中的选项 */
.custom-select-option.selected { }

/* 禁用状态 */
.custom-select.disabled { }
```

## 浏览器兼容性

- Chrome/Edge (最新版本)
- Firefox (最新版本)
- Safari (最新版本)
- 移动端浏览器

## 注意事项

1. **唯一容器** - 每个 CustomSelect 实例需要独立的容器
2. **DOM 准备** - 确保在 DOM 加载完成后初始化
3. **事件处理** - onChange 在值变化时触发，可通过第二个参数控制
4. **性能优化** - 大量选项时建议使用虚拟滚动（需自行扩展）

## 许可证

MIT License

