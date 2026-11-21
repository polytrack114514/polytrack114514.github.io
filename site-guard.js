/**
 * 站点守卫：统一处理公告与关闭访问
 * 用法：<script src="https://polytrack114514.github.io/site-guard.js" data-site="cloud2"></script>
 */
(function () {
  'use strict';

  var me = document.currentScript || document.querySelector('script[data-site]');
  var site = me && me.getAttribute('data-site');
  if (!site) return;

  var API = 'https://file-cloud-2.pages.dev';
  var root = document.documentElement;
  root.classList.add('sg-pending');

  var css = document.createElement('style');
  css.id = 'sg-style';
  css.textContent = [
    'html.sg-pending body{visibility:hidden}',
    'body.sg-lock{overflow:hidden!important}',
    'html.sg-closed body{overflow:hidden!important}',
    'html.sg-closed body > *:not(#sg-closed){display:none!important}',
    '#sg-ann-mask{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;',
    'padding:20px;background:rgba(6,9,16,.68);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}',
    '#sg-ann-box{width:100%;max-width:440px;background:#161a22;border:1px solid #2a303c;border-radius:14px;',
    'padding:22px 22px 18px;color:#e8eaef;box-shadow:0 30px 80px -20px rgba(0,0,0,.8);',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}',
    '#sg-ann-site{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8b93a3;margin-bottom:6px}',
    '#sg-ann-title{font-size:16px;font-weight:650;margin:0 0 10px}',
    '#sg-ann-body{font-size:13.5px;line-height:1.8;color:#c9cfdb;white-space:pre-wrap;word-break:break-word;',
    'max-height:50vh;overflow:auto}',
    '#sg-ann-ok{margin-top:18px;width:100%;border:1px solid #3a4152;background:#1d222c;color:#e8eaef;',
    'border-radius:10px;padding:9px 14px;font:inherit;font-size:13px;cursor:pointer;transition:border-color .16s,background .16s}',
    '#sg-ann-ok:hover{border-color:#4f8cff;background:#202634}',
    'html[data-theme="light"] #sg-ann-box{background:#fff;border-color:#dfe3ec;color:#1b2030;',
    'box-shadow:0 24px 60px -24px rgba(20,30,60,.3)}',
    'html[data-theme="light"] #sg-ann-body{color:#4a5468}',
    'html[data-theme="light"] #sg-ann-ok{background:#f1f3f9;border-color:#c7cedb;color:#1b2030}',
    '#sg-closed{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;',
    'padding:24px;background:#0d0f14;color:#e8eaef;text-align:center;',
    'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif}',
    '#sg-closed .box{max-width:420px}',
    '#sg-closed svg{width:46px;height:46px;stroke:#f0626b;fill:none;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}',
    '#sg-closed h2{font-size:17px;line-height:1.55;margin:16px 0 8px;font-weight:650}',
    '#sg-closed p{color:#8b93a3;font-size:12.5px;margin:0 0 20px}',
    '#sg-closed a{display:inline-flex;align-items:center;justify-content:center;padding:8px 16px;border-radius:10px;',
    'border:1px solid #3a4152;background:#1d222c;color:#e8eaef;text-decoration:none;font-size:13px}',
    '#sg-closed a:hover{border-color:#4f8cff}',
    'html[data-theme="light"] #sg-closed{background:#f2f4f8;color:#1b2030}',
    'html[data-theme="light"] #sg-closed p{color:#66708a}',
    'html[data-theme="light"] #sg-closed a{background:#fff;border-color:#c7cedb;color:#1b2030}'
  ].join('');
  (document.head || root).appendChild(css);

  function whenBody(fn) {
    if (document.body) fn();
    else document.addEventListener('DOMContentLoaded', fn, { once: true });
  }

  function release() {
    root.classList.remove('sg-pending');
  }

  function showAnnouncement(text, name) {
    whenBody(function () {
      var mask = document.createElement('div');
      mask.id = 'sg-ann-mask';
      mask.innerHTML =
        '<div id="sg-ann-box" role="dialog" aria-modal="true">' +
          '<div id="sg-ann-site"></div>' +
          '<div id="sg-ann-title">公告</div>' +
          '<div id="sg-ann-body"></div>' +
          '<button id="sg-ann-ok" type="button">我知道了</button>' +
        '</div>';
      mask.querySelector('#sg-ann-site').textContent = name || site;
      mask.querySelector('#sg-ann-body').textContent = text;
      document.body.appendChild(mask);
      document.body.classList.add('sg-lock');

      var btn = mask.querySelector('#sg-ann-ok');
      function close() {
        if (mask.parentNode) mask.parentNode.removeChild(mask);
        document.body.classList.remove('sg-lock');
        document.removeEventListener('keydown', onKey);
      }
      function onKey(e) {
        if (e.key === 'Escape') close();
      }
      btn.addEventListener('click', close);
      document.addEventListener('keydown', onKey);
      btn.focus();
    });
  }

  function showClosed(name) {
    root.classList.add('sg-closed');
    whenBody(function () {
      var el = document.createElement('div');
      el.id = 'sg-closed';
      el.innerHTML =
        '<div class="box">' +
          '<svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="10" rx="2"/>' +
          '<path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>' +
          '<h2>该网页正在处于关闭访问状态中，不可访问</h2>' +
          '<p></p>' +
          '<a href="https://polytrack114514.github.io/">返回主页</a>' +
        '</div>';
      el.querySelector('p').textContent = (name || site) + ' 暂时关闭，请稍后再试。';
      document.body.appendChild(el);
      release();
    });
  }

  var timer = setTimeout(release, 6000);
  fetch(API + '/site-config?t=' + Date.now(), { cache: 'no-store' })
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (cfg) {
      clearTimeout(timer);
      var info = cfg && cfg.sites && cfg.sites[site];
      if (info && info.closed) {
        showClosed(info.name);
        return;
      }
      if (info && info.announcement && String(info.announcement).trim()) {
        showAnnouncement(String(info.announcement), info.name);
      }
      release();
    })
    .catch(function () {
      clearTimeout(timer);
      release();
    });
})();
