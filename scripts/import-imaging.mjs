import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Import the self-contained lesson; exclude screenshots and QA scripts.
if (!process.argv[2]) throw new Error('Usage: node scripts/import-imaging.mjs <source-index.html>')
const source = await readFile(process.argv[2], 'utf8')
const originalFooter = '<footer class="footer"><span><b>数字成像与影像处理</b> / 光的四个维度</span><span>交互旋钮 · SVG 动画 · 本地单文件课堂版</span></footer>'
if (!source.includes(originalFooter) || !source.includes('<div class="top-note">')) throw new Error('Unexpected imaging lesson layout')
const published = source
  .replace('<div class="top-note">', '<div class="top-note"><a href="../index.html" style="text-decoration:none;white-space:nowrap">← 课程目录</a>')
  .replace(originalFooter, '<footer class="footer"><span><b>数字成像与影像处理</b> / 光的四个维度</span><span><a href="../index.html">← 返回成像课程目录</a> · Designed By Xianyu Wu</span></footer>')
const destination = resolve(dirname(fileURLToPath(import.meta.url)), '../public/courses/imaging/light-dimensions')
await mkdir(destination, { recursive: true })
await writeFile(resolve(destination, 'index.html'), published, 'utf8')
console.log('Imported imaging lesson with course navigation and author credit. Source unchanged.')
