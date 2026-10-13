// Navigation and code copying enhance the static chapter content.
const sectionLinks = [...document.querySelectorAll('.toc-sidebar a')];
const sectionTargets = sectionLinks.map(link => document.getElementById(decodeURIComponent(link.hash.slice(1)))).filter(Boolean);
const progress = document.querySelector('.progress-fill');
let scheduled = false;
function updateReadingState() {
  scheduled = false;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${total > 0 ? Math.min(100, Math.max(0, window.scrollY / total * 100)) : 100}%`;
  let current = sectionTargets[0];
  for (const heading of sectionTargets) {
    if (heading.getBoundingClientRect().top <= 140) current = heading;
    else break;
  }
  for (const link of sectionLinks) {
    if (current && decodeURIComponent(link.hash.slice(1)) === current.id) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  }
}
function scheduleUpdate() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateReadingState); }
}
window.addEventListener('scroll', scheduleUpdate, { passive: true });
window.addEventListener('resize', scheduleUpdate);
updateReadingState();
for (const button of document.querySelectorAll('.copy-code')) {
  button.addEventListener('click', async () => {
    const code = button.closest('.code-block').querySelector('pre code');
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = '已复制';
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = '已选中，请复制';
    }
  });
}
