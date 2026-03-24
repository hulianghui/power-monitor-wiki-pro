// ========================================
// 增强搜索系统 - 支持标签过滤和分类筛选
// ========================================

// 搜索配置
const SEARCH_CONFIG = {
    maxResults: 10,
    minScore: 1,
    debounceTime: 300,
    highlightMatches: true
};

// 当前搜索状态
let searchState = {
    query: '',
    category: 'all', // 'all', 'rfid', 'monitor'
    tags: [],
    results: []
};

// 防抖函数
function debounce(func, wait) {
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

// 执行搜索
const performSearch = debounce(() => {
    const query = document.getElementById('searchInput').value.trim();
    searchState.query = query;
    
    if (query || searchState.tags.length > 0) {
        const results = searchKnowledgeBase(query, searchState.category, searchState.tags);
        displaySearchResults(results, query);
    } else {
        clearSearchResults();
    }
}, SEARCH_CONFIG.debounceTime);

// 按标签搜索
function searchByTag(tag) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = tag;
    searchState.query = tag;
    searchState.tags = [tag];
    
    const results = searchKnowledgeBase(tag, searchState.category, searchState.tags);
    displaySearchResults(results, tag);
}

// 设置分类筛选
function setCategoryFilter(category) {
    searchState.category = category;
    
    // 更新筛选按钮状态
    document.querySelectorAll('.category-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    
    // 重新搜索
    if (searchState.query || searchState.tags.length > 0) {
        const results = searchKnowledgeBase(searchState.query, category, searchState.tags);
        displaySearchResults(results, searchState.query);
    }
}

// 切换标签筛选
function toggleTagFilter(tag) {
    const index = searchState.tags.indexOf(tag);
    if (index > -1) {
        searchState.tags.splice(index, 1);
    } else {
        searchState.tags.push(tag);
    }
    
    // 更新标签按钮状态
    document.querySelectorAll('.tag-filter-btn').forEach(btn => {
        btn.classList.toggle('active', searchState.tags.includes(btn.dataset.tag));
    });
    
    // 重新搜索
    const results = searchKnowledgeBase(searchState.query, searchState.category, searchState.tags);
    displaySearchResults(results, searchState.query);
}

// 搜索知识库
function searchKnowledgeBase(query, category = 'all', tags = []) {
    const results = [];
    const kb = window.knowledgeBase;
    const lowerQuery = query.toLowerCase();
    
    // 定义搜索范围
    const searchScopes = [];
    if (category === 'all' || category === 'rfid') {
        searchScopes.push({ data: kb.rfid, categoryName: 'RFID测温', categoryId: 'rfid' });
    }
    if (category === 'all' || category === 'monitor') {
        searchScopes.push({ data: kb.monitor, categoryName: '在线监测', categoryId: 'monitor' });
    }
    
    // 执行搜索
    searchScopes.forEach(scope => {
        if (scope.data && scope.data.modules) {
            scope.data.modules.forEach(module => {
                module.items.forEach(item => {
                    const matchScore = calculateMatchScore(item, lowerQuery, tags);
                    if (matchScore >= SEARCH_CONFIG.minScore) {
                        results.push({
                            ...item,
                            module: module.title,
                            moduleId: module.id,
                            category: scope.categoryName,
                            categoryId: scope.categoryId,
                            score: matchScore
                        });
                    }
                });
            });
        }
    });
    
    // 按相关度排序
    results.sort((a, b) => b.score - a.score);
    
    return results.slice(0, SEARCH_CONFIG.maxResults);
}

// 计算匹配度评分
function calculateMatchScore(item, query, filterTags) {
    let score = 0;
    const title = (item.title || '').toLowerCase();
    const summary = (item.summary || '').toLowerCase();
    const content = (item.content || '').toLowerCase();
    const tags = (item.tags || []).map(t => t.toLowerCase());
    
    // 关键词匹配
    if (query) {
        // 标题精确匹配（权重最高）
        if (title.includes(query)) {
            score += 10;
            if (title === query) score += 5;
            if (title.startsWith(query)) score += 3;
        }
        
        // 标签匹配
        tags.forEach(tag => {
            if (tag.includes(query)) {
                score += 5;
            }
        });
        
        // 摘要匹配
        if (summary.includes(query)) {
            score += 3;
            // 摘要中多次出现
            const count = (summary.match(new RegExp(query, 'g')) || []).length;
            score += Math.min(count - 1, 2);
        }
        
        // 内容匹配
        if (content.includes(query)) {
            score += 1;
        }
    }
    
    // 标签筛选匹配
    if (filterTags.length > 0) {
        const matchedTags = filterTags.filter(tag => 
            tags.some(t => t.includes(tag.toLowerCase()))
        );
        if (matchedTags.length > 0) {
            score += matchedTags.length * 2;
        } else if (query) {
            // 如果有筛选标签但未匹配，降低分数
            score *= 0.5;
        }
    }
    
    return score;
}

// 高亮匹配文本
function highlightText(text, query) {
    if (!query || !SEARCH_CONFIG.highlightMatches) return text;
    
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// 转义正则特殊字符
function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 显示搜索结果
function displaySearchResults(results, query) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="search-empty">
                <div class="search-empty-icon">🔍</div>
                <h3>未找到"${escapeHtml(query)}"相关结果</h3>
                <p>尝试使用以下建议：</p>
                <ul class="search-suggestions">
                    <li>检查关键词拼写</li>
                    <li>使用更通用的关键词</li>
                    <li>尝试相关技术术语</li>
                    <li>清除筛选条件</li>
                </ul>
                <div class="search-quick-tags">
                    <span>热门搜索：</span>
                    <button class="quick-tag" onclick="searchByTag('RFID原理')">RFID原理</button>
                    <button class="quick-tag" onclick="searchByTag('温度传感器')">温度传感器</button>
                    <button class="quick-tag" onclick="searchByTag('开关柜')">开关柜</button>
                    <button class="quick-tag" onclick="searchByTag('故障诊断')">故障诊断</button>
                </div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = results.map((result, index) => `
        <div class="search-result-item" onclick="openKnowledgeItem('${result.categoryId}', '${result.moduleId}', '${result.id}')" style="animation-delay: ${index * 0.05}s">
            <div class="search-result-header">
                <span class="search-result-category ${result.categoryId}">${result.category}</span>
                <span class="search-result-module">${result.module}</span>
                ${result.score >= 15 ? '<span class="search-result-badge">高匹配</span>' : ''}
            </div>
            <h4 class="search-result-title">${highlightText(result.title, query)}</h4>
            <p class="search-result-summary">${highlightText(result.summary, query)}</p>
            <div class="search-result-tags">
                ${result.tags.map(tag => `<span class="search-result-tag">${tag}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

// 清空搜索结果
function clearSearchResults() {
    const container = document.getElementById('searchResults');
    if (container) {
        container.innerHTML = '';
    }
}

// 转义HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 打开知识点详情
function openKnowledgeItem(categoryId, moduleId, itemId) {
    // 关闭搜索弹窗
    const searchModal = document.getElementById('searchModal');
    if (searchModal) {
        searchModal.classList.remove('active');
    }
    
    // 跳转到对应页面
    const page = categoryId === 'rfid' ? 'rfid.html' : 'monitor.html';
    window.location.href = `${page}#${moduleId}`;
}

// 获取搜索建议
function getSearchSuggestions(query) {
    if (!query || query.length < 2) return [];
    
    const suggestions = [];
    const kb = window.knowledgeBase;
    const lowerQuery = query.toLowerCase();
    
    // 从所有标签中匹配
    const allTags = new Set();
    [kb.rfid, kb.monitor].forEach(category => {
        if (category && category.modules) {
            category.modules.forEach(module => {
                module.items.forEach(item => {
                    if (item.tags) {
                        item.tags.forEach(tag => allTags.add(tag));
                    }
                });
            });
        }
    });
    
    // 匹配标签
    allTags.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) {
            suggestions.push({ type: 'tag', value: tag });
        }
    });
    
    // 匹配标题
    [kb.rfid, kb.monitor].forEach(category => {
        if (category && category.modules) {
            category.modules.forEach(module => {
                module.items.forEach(item => {
                    if (item.title.toLowerCase().includes(lowerQuery)) {
                        suggestions.push({ 
                            type: 'title', 
                            value: item.title,
                            category: category === kb.rfid ? 'RFID' : '监测'
                        });
                    }
                });
            });
        }
    });
    
    return suggestions.slice(0, 5);
}

// 显示搜索建议
function showSearchSuggestions(query) {
    const suggestions = getSearchSuggestions(query);
    const container = document.getElementById('searchSuggestions');
    
    if (!container || suggestions.length === 0) return;
    
    container.innerHTML = suggestions.map(s => `
        <div class="search-suggestion-item" onclick="selectSuggestion('${escapeHtml(s.value)}')">
            <span class="suggestion-icon">${s.type === 'tag' ? '🏷️' : '📄'}</span>
            <span class="suggestion-text">${highlightText(s.value, query)}</span>
            ${s.category ? `<span class="suggestion-category">${s.category}</span>` : ''}
        </div>
    `).join('');
    
    container.style.display = 'block';
}

// 选择建议
function selectSuggestion(value) {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = value;
    searchState.query = value;
    
    const suggestions = document.getElementById('searchSuggestions');
    if (suggestions) {
        suggestions.style.display = 'none';
    }
    
    performSearch();
}

// 初始化搜索
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    // 输入事件
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        searchState.query = query;
        
        if (query.length >= 2) {
            showSearchSuggestions(query);
        } else {
            const suggestions = document.getElementById('searchSuggestions');
            if (suggestions) {
                suggestions.style.display = 'none';
            }
        }
        
        performSearch();
    });
    
    // 键盘导航
    searchInput.addEventListener('keydown', (e) => {
        const suggestions = document.getElementById('searchSuggestions');
        const items = suggestions ? suggestions.querySelectorAll('.search-suggestion-item') : [];
        let activeIndex = Array.from(items).findIndex(item => item.classList.contains('active'));
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (activeIndex < items.length - 1) {
                    if (activeIndex >= 0) items[activeIndex].classList.remove('active');
                    items[activeIndex + 1].classList.add('active');
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                if (activeIndex > 0) {
                    items[activeIndex].classList.remove('active');
                    items[activeIndex - 1].classList.add('active');
                }
                break;
            case 'Enter':
                if (activeIndex >= 0 && items[activeIndex]) {
                    items[activeIndex].click();
                } else {
                    performSearch();
                }
                break;
            case 'Escape':
                if (suggestions) {
                    suggestions.style.display = 'none';
                }
                break;
        }
    });
    
    // 点击外部关闭建议
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) {
            const suggestions = document.getElementById('searchSuggestions');
            if (suggestions) {
                suggestions.style.display = 'none';
            }
        }
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initSearch);
