module.exports = {
    title: 'Note',
    description: 'My Daily Note',
    dest: './public',
    themeConfig: {
        nav: [
            { text: 'Home', link: '/' },
            { text: 'Javascript', link: '/javascript/new'},
            {
                text: 'Vue',
                items: [
                    {text: '路由模式', link: '/vue/路由模式'},
                    {text: '双向绑定', link: '/vue/vue2双向绑定原理'},
                    {text: 'vue3新特性', link: '/vue/vue3新特性'}
                ]
            },
            {
                text: 'Node',
                items: [
                    {text: 'child_process', link: '/node/child_process'}
                ]
            },
            {
                text: 'Browse',
                items: [
                    {text: '缓存', link: '/browse/cache'},
                    {text: '事件循环', link: '/browse/eventloop'},
                    {text: '渲染', link: '/browse/performance'},
                    {text: 'WebComponent', link: '/browse/webcomponent'}
                ]
            },
            { 
                text: 'Webpack',
                items: [
                    {text: 'tapable', link: '/webpack/tapable'},
                    {text: 'webpack流程', link: '/webpack/webpack流程'}
                ]
            },
            {
                text: 'Test',
                items: [
                    {text: 'istanbul-client', link: '/test/client'},
                    {text: 'istanbul-server', link: '/test/server'},
                    {text: 'jest', link: '/test/jest'}
                ]
            },
            {
                text: '设计模式',
                items: [
                    {text: '迭代器模式', link: '/design/迭代器模式'},
                    {text: '观察者模式', link: '/design/观察者模式'}
                ]
            }
        ],
        sidebar: {
            '/javascript/': [
                ['new', 'new'],
                ['记忆函数', '记忆函数'],
                ['块级作用域', '块级作用域'],
                ['caches', 'window.caches'],
                ['cors', 'CORS'],
                ['async&await', 'async&await'],
                ['generator', 'generator'],
                ['iterator', 'iterator'],
                ['promise', 'promise']
            ]
        },
        lastUpdated: 'Last Updated',
        repo: 'smallcosmos/note',
        repoLabel: 'GitHub',
        docsDir: 'docs',
        editLinks: true,
        editLinkText: '帮助我改进页面内容！'
    }
}