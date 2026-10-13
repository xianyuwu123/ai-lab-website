import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Marked, Renderer, TextRenderer } from 'marked'
import GithubSlugger from 'github-slugger'

// Markdown is source material, never executable instructions. Rendering is local.
const courseDir = resolve(dirname(fileURLToPath(import.meta.url)), '../public/courses')
const notesDir = resolve(courseDir, 'notes')
const sourceDir = resolve(notesDir, 'sources')
const chapters = [
  { title: '微型计算机基础知识', deck: '数制与编码、微机组成、嵌入式系统：建立整门课程的基础。', tags: '数制转换 · 补码 · 微机组成', labs: [] },
  { title: 'Cortex-M3 处理器', deck: '从流水线和寄存器，到工作模式、堆栈与异常，认识处理器内核。', tags: '流水线 · 寄存器 · 堆栈与异常', labs: [['stm32-interrupt-lab.html', '中断现场与双堆栈']] },
  { title: 'STM32F1 系列微控制器', deck: '把处理器与片上外设联系起来，理解系统架构、存储映像和时钟。', tags: '系统架构 · 存储映像 · 时钟与启动', labs: [] },
  { title: '汇编语言及其程序设计', deck: '理解指令格式、寻址方式与条件执行，读懂汇编程序的控制流程。', tags: '指令集 · 寻址方式 · 程序设计', labs: [['stm32-assembly-foundations-lab.html', '汇编语句与程序生成'], ['stm32-addressing-modes-lab.html', '寻址方式'], ['stm32-branch-it-lab.html', '分支与 IT 指令']] },
  { title: 'ARM 微控制器开发', deck: '梳理工具链、启动过程、程序映像以及 C 语言和固件库开发。', tags: '工具链 · 启动过程 · C 与固件库', labs: [['stm32-assembly-foundations-lab.html', '程序生成与启动']] },
  { title: 'GPIO 通用输入输出接口', deck: '从引脚内部结构到寄存器和固件库，用 LED 案例贯通输入输出。', tags: '引脚模式 · GPIO 寄存器 · LED 应用', labs: [['stm32-gpio-lab.html', 'GPIO 内部结构'], ['stm32-gpio-register-map.html', '寄存器与 LED · 路径讲解']] },
  { title: 'EXTI 中断模块与基本应用', deck: '理解中断管理、外部事件和优先级，再连接寄存器配置与应用实例。', tags: '中断管理 · EXTI · 优先级', labs: [['stm32-interrupt-lab.html', '中断现场与双堆栈'], ['stm32-exti-priority-lab.html', 'EXTI 与中断优先级']] },
  { title: '定时器与脉宽调制', deck: '串联时基单元、计数模式、捕获比较和 PWM，理解时间与波形。', tags: '计数与时钟 · 捕获比较 · PWM', labs: [['stm32-timer-counter-lab.html', '计数与时钟'], ['stm32-timer-timebase-shadow.html', '时基与影子寄存器'], ['stm32-pwm-lab.html', 'PWM 与占空比']] },
  { title: '串行通信', deck: '从通信基本概念到 USART、SPI，理解协议、寄存器与串口应用。', tags: '串行通信 · USART · SPI', labs: [['stm32-usart-lab.html', 'USART 串行通信']] },
  { title: '模拟量模块', deck: '理解 ADC 与 DAC 的工作原理、性能指标和 STM32 转换配置。', tags: 'ADC · 转换模式 · DAC', labs: [['stm32-adc-lab.html', 'SAR、ADC 通道与转换模式']] },
].map((chapter, index) => ({ ...chapter, number: index + 1, id: String(index + 1).padStart(2, '0') }))

const escape = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char])
const cleanCourseText = text => text.replaceAll('欢迎在评论区交流讨论。', '')
await mkdir(sourceDir, { recursive: true })
if (process.argv[2]) {
  const files = await readdir(process.argv[2])
  // Read and validate every named chapter before copying anything.
  const originals = await Promise.all(chapters.map(async chapter => {
    const matches = files.filter(name => name.startsWith(`微机原理-第${chapter.number}章`) && name.endsWith('-知识点整理.md'))
    if (matches.length !== 1) throw new Error(`Expected one source for chapter ${chapter.number}`)
    const text = await readFile(resolve(process.argv[2], matches[0]), 'utf8')
    return [chapter, cleanCourseText(text)]
  }))
  for (const [chapter, bytes] of originals) await writeFile(resolve(sourceDir, `chapter-${chapter.id}.md`), bytes)
}

const stats = []
for (const chapter of chapters) {
  const original = cleanCourseText(await readFile(resolve(sourceDir, `chapter-${chapter.id}.md`), 'utf8')).replace(/^\uFEFF/, '')
  // Replace the source title and duplicated Markdown TOC with the page header/TOC.
  const markdown = original.replace(/^# [^\r\n]+\r?\n/, '').replace(/(?:^|\n)## 目录\r?\n[\s\S]*?(?=\n## )/, '\n')
  const slugger = new GithubSlugger()
  const sections = []
  const renderer = new Renderer()
  const tableRenderer = Renderer.prototype.table
  renderer.heading = function ({ tokens, depth }) {
    const plain = this.parser.parseInline(tokens, new TextRenderer())
    const id = slugger.slug(plain)
    if (depth === 2) sections.push({ id, title: plain })
    return `<h${depth} id="${escape(id)}">${this.parser.parseInline(tokens)}</h${depth}>\n`
  }
  renderer.code = ({ text, lang }) => `<div class="code-block"><div class="code-header"><span>${escape(lang || '示例')}</span><button type="button" class="copy-code" aria-label="复制代码">复制代码</button></div><pre><code>${escape(text)}</code></pre></div>\n`
  renderer.table = function (token) { return `<div class="table-scroll">${tableRenderer.call(this, token)}</div>\n` }
  // Escape embedded HTML; only Markdown creates markup.
  renderer.html = ({ text }) => escape(text)
  const parser = new Marked({ renderer, gfm: true, async: false })
  // A single tilde in Pin 0~7 or 1~65536 is a range, not strikethrough.
  parser.use({ tokenizer: { del(src) { return src.startsWith('~~') ? false : undefined } } })
  const body = parser.parse(markdown)
  const toc = sections.map(section => `<a href="#${escape(section.id)}">${escape(section.title)}</a>`).join('\n')
  const chapterLinks = chapters.map(item => `<a href="chapter-${item.id}.html"${item.id === chapter.id ? ' aria-current="page"' : ''}><span>${item.id}</span>${escape(item.title)}</a>`).join('\n')
  const related = chapter.labs.length ? `<section class="related-labs" aria-label="配套互动课堂"><h2>读懂之后，动手验证</h2><div class="related-labs-links">${chapter.labs.map(([file, title]) => `<a href="../${file}">${escape(title)} ↗</a>`).join('')}</div></section>` : ''
  const previous = chapters[chapter.number - 2]
  const next = chapters[chapter.number]
  const page = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>第${chapter.number}章 · ${escape(chapter.title)} | 微机原理知识点</title><meta name="description" content="${escape(chapter.deck)}"><link rel="stylesheet" href="../courses.css"><link rel="stylesheet" href="../knowledge.css"><script src="../notes.js" defer></script></head>
<body class="reader-page"><a class="skip" href="#chapter-content">跳到正文</a>
<header class="site-header"><div class="header-inner"><a class="brand" href="../index.html"><span class="brand-dot"></span>AOCI Lab<span class="brand-divider">/</span><span class="brand-sub">章节知识点</span></a><nav class="reader-header-nav" aria-label="阅读页导航"><a href="../index.html#knowledge">← 课程目录</a><a href="../index.html#catalogue">互动课堂</a></nav></div><div class="progress-track" aria-hidden="true"><span class="progress-fill"></span></div></header>
<main class="reader-shell"><aside class="chapter-sidebar"><p class="sidebar-label">COURSE CHAPTERS · 章节</p><nav class="chapter-links" aria-label="全部章节">${chapterLinks}</nav><a class="sidebar-return" href="../index.html#knowledge">← 返回课程资源</a></aside>
<div class="reading-column"><header class="chapter-heading"><p class="eyebrow">CHAPTER ${chapter.id} / 10 · 微机原理与接口技术</p><h1>${escape(chapter.title)}</h1><p class="chapter-deck">${escape(chapter.deck)}</p><div class="chapter-meta"><span>章节知识点整理</span><span>${sections.length} 个阅读主题</span></div></header>
<details class="chapter-mobile"><summary>切换章节 · 第${chapter.number}章</summary><nav class="chapter-links" aria-label="手机端全部章节">${chapterLinks}</nav></details><details class="toc-mobile"><summary>本章目录 · ${sections.length} 个主题</summary><nav aria-label="展开本章目录">${toc}</nav></details>
${related}<article class="prose" id="chapter-content" aria-label="第${chapter.number}章知识点正文">${body}</article>
<nav class="chapter-pagination" aria-label="前后章节">${previous ? `<a href="chapter-${previous.id}.html"><small>← 上一章 · 第${previous.number}章</small>${escape(previous.title)}</a>` : '<a href="../index.html#knowledge"><small>← 返回</small>全部章节目录</a>'}${next ? `<a class="next" href="chapter-${next.id}.html"><small>下一章 · 第${next.number}章 →</small>${escape(next.title)}</a>` : '<a class="next" href="../index.html#catalogue"><small>继续探索 →</small>进入互动课堂</a>'}</nav><footer class="reader-credit">Designed By Xianyu Wu</footer></div>
<aside class="toc-sidebar"><p class="sidebar-label">ON THIS PAGE · 本章目录</p><nav aria-label="本章目录">${toc}</nav></aside></main></body></html>\n`
  // Assert all anchors before shipping a generated page.
  const ids = new Set([...page.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]))
  for (const match of page.matchAll(/href="#([^"]+)"/g)) {
    if (!ids.has(match[1])) throw new Error(`Broken chapter ${chapter.number} anchor: ${match[1]}`)
  }
  await writeFile(resolve(notesDir, `chapter-${chapter.id}.html`), page, 'utf8')
  stats.push({ chapter: chapter.number, sections: sections.length, tables: (body.match(/<table>/g) || []).length, code: (body.match(/class="code-block"/g) || []).length })
}

const directory = `<section class="knowledge-section" id="knowledge" aria-labelledby="knowledge-title">
<div class="catalogue-heading"><div><p class="eyebrow">CHAPTER NOTES</p><h2 id="knowledge-title">章节知识点 · 建立知识框架。</h2></div><p>按课程章节阅读，配合互动课堂加深理解。</p></div>
<div class="knowledge-grid">${chapters.map(chapter => `<a class="chapter-card" href="notes/chapter-${chapter.id}.html"><span class="chapter-number" aria-hidden="true">${chapter.id}</span><div class="chapter-copy"><h3>第${chapter.number}章 · ${escape(chapter.title)}</h3><p>${escape(chapter.tags)}</p><span class="chapter-action">阅读知识点 → <span>${chapter.labs.length ? `配套 ${chapter.labs.length} 个互动课堂` : '基础知识梳理'}</span></span></div><span class="chapter-arrow" aria-hidden="true">↗</span></a>`).join('\n')}</div>
<p class="knowledge-footer">各章包含知识点梳理、表格与示例，以及本章小结与思考题，点击章节即可阅读。</p></section>`
const indexPath = resolve(courseDir, 'index.html')
const index = await readFile(indexPath, 'utf8')
if (!/<!-- KNOWLEDGE_START -->[\s\S]*?<!-- KNOWLEDGE_END -->/.test(index)) throw new Error('Missing chapter directory markers')
await writeFile(indexPath, index.replace(/<!-- KNOWLEDGE_START -->[\s\S]*?<!-- KNOWLEDGE_END -->/, `<!-- KNOWLEDGE_START -->\n${directory}\n    <!-- KNOWLEDGE_END -->`), 'utf8')
console.log(`Built ${chapters.length} chapter reading pages and refreshed the chapter directory.`)
console.table(stats)
