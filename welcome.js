/* welcome.js — MV3 extension pages can't run inline scripts */

// Founder story toggle
document.getElementById('story-toggle')?.addEventListener('click', () => {
  const content = document.getElementById('storyContent');
  const button  = document.getElementById('story-toggle');
  const open = content.classList.toggle('open');
  button.textContent = open ? 'Hide story.' : 'Story behind this.';
  button.setAttribute('aria-expanded', String(open));
});

// Fade sections in as they scroll into view
(() => {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(el => el.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach(el => io.observe(el));
})();

// ── Hero demo ────────────────────────────────────────────────────────────────
// Plays a looping walkthrough of the side panel: tick 3 chats → Next →
// Export → progress → ZIP saved. If a real screen recording is shipped as
// demo.gif next to this page, it replaces the animated mock automatically.
(() => {
  const demo = document.getElementById('demo');
  if (!demo) return;
  const mock = demo.querySelector('.mock');

  // Prefer a real recording when present
  const gif = new Image();
  gif.onload = () => {
    gif.className = 'demo-gif';
    gif.alt = 'Recording of Exporter for WhatsApp exporting chats';
    demo.replaceChildren(gif);
  };
  gif.src = 'demo.gif';

  const cursor = demo.querySelector('.dm-cursor');
  const $ = sel => demo.querySelector(`[data-dm="${sel}"]`);
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let running = false, visible = true;

  function moveTo(el, dx = 0.5, dy = 0.55) {
    const m = mock.getBoundingClientRect(), r = el.getBoundingClientRect();
    const x = r.left - m.left + r.width * dx, y = r.top - m.top + r.height * dy;
    cursor.style.transform = `translate(${x}px, ${y}px)`;
  }
  async function click(el, after) {
    moveTo(el);
    await sleep(750);
    cursor.classList.add('click');
    el.classList.add('dm-press');
    await sleep(140);
    cursor.classList.remove('click');
    el.classList.remove('dm-press');
    after?.();
    await sleep(300);
  }
  function reset() {
    demo.classList.remove('is-export', 'is-done');
    demo.querySelectorAll('.mock-row.sel').forEach(r => r.classList.remove('sel'));
    const bar = demo.querySelector('.dm-bar');
    bar.style.transition = 'none'; bar.style.width = '0%';
    demo.querySelector('.dm-prog').textContent = 'Ready';
    cursor.style.transform = 'translate(330px, 330px)';
  }

  async function play() {
    if (running) return;
    running = true;
    while (visible && demo.isConnected && demo.contains(mock)) {
      reset();
      await sleep(700);
      for (const id of ['r1', 'r2', 'r3']) await click($(id), () => $(id).classList.add('sel'));
      await sleep(250);
      await click($('next'), () => demo.classList.add('is-export'));
      await sleep(500);
      await click($('export'));
      const bar = demo.querySelector('.dm-bar'), prog = demo.querySelector('.dm-prog');
      bar.style.transition = 'width .9s linear';
      const steps = [['1 / 3 · Amaka Bello', 33], ['2 / 3 · Chinedu Okafor', 66], ['3 / 3 · Business Loan Leads', 92], ['Done!', 100]];
      for (const [label, pct] of steps) { prog.textContent = label; bar.style.width = pct + '%'; await sleep(950); }
      demo.classList.add('is-done');
      cursor.style.transform = 'translate(330px, 360px)';
      await sleep(2600);
    }
    running = false;
  }

  if (reduced) {   // static "finished" frame, no motion
    demo.classList.add('is-export', 'is-done');
    ['r1', 'r2', 'r3'].forEach(id => $(id).classList.add('sel'));
    demo.querySelector('.dm-bar').style.width = '100%';
    demo.querySelector('.dm-prog').textContent = 'Done!';
    cursor.hidden = true;
    return;
  }
  // Only animate while the demo is on screen
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) play(); }, { threshold: 0.2 }).observe(demo);
})();
