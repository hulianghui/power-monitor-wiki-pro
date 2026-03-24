// RFID 页面交互脚本

document.addEventListener('DOMContentLoaded', function() {
    // 模块标签切换
    const moduleTabs = document.querySelectorAll('.module-tab');
    const moduleContents = document.querySelectorAll('.module-content');

    moduleTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetModule = this.dataset.module;

            // 移除所有激活状态
            moduleTabs.forEach(t => t.classList.remove('active'));
            moduleContents.forEach(c => c.classList.remove('active'));

            // 激活当前标签和内容
            this.classList.add('active');
            document.getElementById(targetModule).classList.add('active');

            // 平滑滚动到内容区顶部
            setTimeout(() => {
                const contentSection = document.querySelector('.content-section');
                const offset = 100; // 偏移量（避开 sticky 导航）
                const elementPosition = contentSection.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - offset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }, 100);
        });
    });

    // 添加卡片悬停效果增强
    const productCards = document.querySelectorAll('.product-card');
    const appCards = document.querySelectorAll('.app-card');
    const caseCards = document.querySelectorAll('.case-card');

    const cards = [...productCards, ...appCards, ...caseCards];

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            cards.forEach(c => {
                if (c !== card) {
                    c.style.opacity = '0.7';
                }
            });
        });

        card.addEventListener('mouseleave', function() {
            cards.forEach(c => {
                c.style.opacity = '1';
            });
        });
    });

    // FAQ 折叠/展开（可选功能）
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('h4');
        const answer = item.querySelector('.faq-answer');

        question.style.cursor = 'pointer';

        question.addEventListener('click', function() {
            const isExpanded = item.classList.contains('expanded');

            // 关闭所有展开的 FAQ
            faqItems.forEach(faq => {
                faq.classList.remove('expanded');
                const ans = faq.querySelector('.faq-answer');
                if (ans) {
                    ans.style.maxHeight = '0';
                    ans.style.overflow = 'hidden';
                }
            });

            // 如果当前未展开，则展开
            if (!isExpanded) {
                item.classList.add('expanded');
                answer.style.maxHeight = answer.scrollHeight + 'px';
                answer.style.transition = 'max-height 0.3s ease';
            }
        });

        // 初始化 FAQ 答案高度
        if (answer) {
            answer.style.maxHeight = 'none';
            answer.style.overflow = 'visible';
        }
    });

    // 添加页面加载动画
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
    });

    // 统计数字动画
    const statValues = document.querySelectorAll('.stat-value');

    const animateStats = () => {
        statValues.forEach(stat => {
            const rect = stat.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                stat.style.opacity = '0';
                stat.style.transform = 'translateY(20px)';

                setTimeout(() => {
                    stat.style.transition = 'all 0.6s ease';
                    stat.style.opacity = '1';
                    stat.style.transform = 'translateY(0)';
                }, 100);
            }
        });
    };

    // 监听滚动
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                animateStats();
                ticking = false;
            });
            ticking = true;
        }
    });

    // 初始检查
    animateStats();

    // 面包屑导航链接高亮
    const breadcrumbLinks = document.querySelectorAll('.breadcrumb a');
    breadcrumbLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.color = 'var(--rfid-primary)';
        });

        link.addEventListener('mouseleave', function() {
            this.style.color = 'var(--text-secondary)';
        });
    });

    // 双击 Hero 标题滚动到顶部
    const heroTitle = document.querySelector('.rfid-hero .hero-title');
    heroTitle.addEventListener('dblclick', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    console.log('RFID 页面加载完成');
});

// 添加 CSS 动画
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    body.loaded {
        opacity: 1;
    }

    body {
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);
