import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// Import only the lessons linked by the catalogue; do not copy QA artifacts.
const source = process.argv[2]
if (!source) throw new Error('Usage: node scripts/import-courses.mjs <lesson-source-directory>')
const destination = resolve(dirname(fileURLToPath(import.meta.url)), '../public/courses')
const catalogue = await readFile(resolve(destination, 'index.html'), 'utf8')
const files = [...new Set([...catalogue.matchAll(/href="(stm32-[a-z-]+\.html)"/g)].map(match => match[1]))]
const credit = '\n<footer id="course-credit" style="box-sizing:border-box;position:static;max-width:1480px;margin:24px auto 0;padding:22px 26px 28px;border-top:1px solid #dce4e8;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;font:13px/1.7 -apple-system,BlinkMacSystemFont,\'Segoe UI\',\'Microsoft YaHei\',sans-serif;color:#617785;text-align:left;background:transparent"><a href="./index.html" style="color:#176b58;text-decoration:none">← 返回课程目录</a><span>Designed By Xianyu Wu</span></footer>\n'
const lessons = await Promise.all(files.map(async filename => {
  const original = await readFile(resolve(source, filename), 'utf8')
  if (!/<\/body\s*>/i.test(original)) throw new Error(`Missing closing body: ${filename}`)
  if (original.includes('id="course-credit"')) throw new Error(`Source already contains imported footer: ${filename}`)
  // Keep the published lesson's navigation aligned with the current catalogue.
  const published = filename === 'stm32-gpio-register-map.html'
    ? original.replace('<a href="stm32-gpio-registers.html">LED 简明版</a> · <a href="stm32-gpio-registers-advanced.html">原完整版本</a>', '<a href="stm32-gpio-lab.html">GPIO 内部结构</a> · <a href="index.html">课程目录</a>')
    : original
  return [filename, published.replace(/<\/body\s*>/i, `${credit}</body>`)]
}))
await mkdir(destination, { recursive: true })
for (const [filename, html] of lessons) await writeFile(resolve(destination, filename), html, 'utf8')
console.log(`Imported ${lessons.length} lessons with credits into public/courses. Source files were not modified.`)
