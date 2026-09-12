import { createServer } from 'node:http'

// Local-only manual fixture. No browser or extension APIs are mocked.
const port = Number(process.env.CHHEADER_TEST_PORT || 3002)
const page = `<!doctype html><html lang="en"><meta charset="utf-8">
<title>ChHeader local header check</title>
<style>
:root{color-scheme:dark}body{font:14px system-ui;color:#e8eaed;background:#202124;max-width:740px;margin:48px auto;padding:0 24px}h1{font-size:28px;letter-spacing:-.7px;margin:8px 0 16px}.eyebrow{color:#a8c7fa;font-size:12px;font-weight:600}p{color:#bdc1c6;line-height:1.6}strong{color:#e8eaed}button{background:#a8c7fa;color:#202124;border:0;border-radius:20px;padding:10px 18px;font-weight:600;margin:8px 0}pre{font:13px/1.55 ui-monospace,monospace;white-space:pre-wrap;background:#292a2d;border:1px solid #3c4043;border-radius:12px;padding:20px}footer{color:#9aa0a6;font-size:12px;margin-top:20px}
</style><div class="eyebrow">CHHEADER / LOCAL TEST FIXTURE</div>
<h1>ChHeader local header check</h1>
<p>Expected test request: X-ChHeader-Test = enabled. Server response starts as X-ChHeader-Response = original.</p>
<p>Document request header: <strong id="document-header">DOCUMENT_HEADER</strong></p>
<button id="run">Run checks</button><pre id="results">Ready</pre>
<script>
document.querySelector('#run').onclick = async () => {
  const results = [];
  for (const path of ['/echo', '/match/echo', '/miss/echo']) {
    const response = await fetch(path, {cache:'no-store'});
    const data = await response.json();
    results.push({path, requestHeader:data.headers['x-chheader-test'] || '(absent)', responseHeader:response.headers.get('x-chheader-response')});
  }
  document.querySelector('#results').textContent = JSON.stringify(results, null, 2);
};
</script><footer>Real browser requests · 127.0.0.1 only · No mocked extension APIs</footer></html>`

createServer((req, res) => {
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('X-ChHeader-Response', 'original')
  if (req.url === '/') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    const header = String(req.headers['x-chheader-test'] || '(absent)').replace(
      /[&<>"']/g,
      (char) => `&#${char.charCodeAt(0)};`
    )
    res.end(page.replace('DOCUMENT_HEADER', header))
  } else {
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ url: req.url, headers: req.headers }, null, 2))
  }
}).listen(port, '127.0.0.1', () => {
  console.log(`ChHeader fixture: http://127.0.0.1:${port}`)
})
