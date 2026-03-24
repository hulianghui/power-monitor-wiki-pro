// 首页交互脚本

// 全局搜索
function performSearch() {
    const query = document.getElementById('globalSearch').value.trim();
    if (query) {
        // 跳转到搜索结果页或执行搜索
        console.log('搜索:', query);
        // TODO: 实现搜索功能
        alert('搜索功能开发中... 当前搜索词：' + query);
    }
}

function handleSearch(event) {
    if (event.key === 'Enter') {
        performSearch();
    }
}

// 按标签搜索
function searchByTag(tag) {
    document.getElementById('globalSearch').value = tag;
    performSearch();
}

// 主题切换
let isDarkTheme = true;
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    const btn = document.querySelector('.theme-toggle');
    if (isDarkTheme) {
        btn.textContent = '🌙';
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
    } else {
        btn.textContent = '☀️';
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
    }
}

// 卡片悬停效果增强
document.addEventListener('DOMContentLoaded', function() {
    // 技术卡片悬停
    const techCards = document.querySelectorAll('.tech-card');
    techCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            techCards.forEach(c => {
                if (c !== card) {
                    c.style.opacity = '0.7';
                }
            });
        });

        card.addEventListener('mouseleave', function() {
            techCards.forEach(c => {
                c.style.opacity = '1';
            });
        });
    });

    // 功能卡片悬停
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            featureCards.forEach(c => {
                if (c !== card) {
                    c.style.opacity = '0.7';
                }
            });
        });

        card.addEventListener('mouseleave', function() {
            featureCards.forEach(c => {
                c.style.opacity = '1';
            });
        });
    });

    // 标签点击效果
    const tags = document.querySelectorAll('.tag, .search-tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // 更新卡片动画
    const updateCards = document.querySelectorAll('.update-card');
    updateCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateX(0)';
        }, index * 100);
    });

    // 统计数字动画
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        const text = stat.textContent;
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            stat.style.transition = 'all 0.6s ease';
            stat.style.opacity = '1';
            stat.style.transform = 'translateY(0)';
        }, 200);
    });

    // 添加平滑滚动
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // 搜索框聚焦效果
    const searchInput = document.getElementById('globalSearch');
    searchInput.addEventListener('focus', function() {
        this.parentElement.classList.add('focused');
    });

    searchInput.addEventListener('blur', function() {
        this.parentElement.classList.remove('focused');
    });

    console.log('首页加载完成');
});

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
    @keyframes float {
        0%, 100% { transform: translate(0, 0) scale(1); }
        50% { transform: translate(30px, -30px) scale(1.1); }
    }

    .search-box {
        transition: all 0.3s ease;
    }

    .search-box.focused {
        transform: scale(1.02);
        box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
    }

    .tag {
        transition: all 0.3s ease;
    }

    body {
        transition: background 0.3s ease, color 0.3s ease;
    }

    .light-theme {
        --bg-dark: #f8fafc;
        --bg-card: #ffffff;
        --bg-card-hover: #f1f5f9;
        --text-primary: #0f172a;
        --text-secondary: #64748b;
    }
`;
document.head.appendChild(style);
