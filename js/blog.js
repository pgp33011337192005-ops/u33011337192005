// ---- marked + highlight.js setup ----
if (window.marked) {
  marked.setOptions({
    gfm: true,
    breaks: true,
    highlight: (code, lang) => {
      if (!window.hljs) return code;
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    }
  });
}

async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return await res.json();
}

async function loadText(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return await res.text();
}

function getQueryParam(name) {
  return new URL(window.location.href).searchParams.get(name);
}

// ---- BLOG LIST: blog.html ----
async function initBlogList() {
  const listEl = document.getElementById("blogList");
  if (!listEl) return;

  try {
    const posts = await loadJSON("/static/posts.json");

    if (!Array.isArray(posts) || posts.length === 0) {
      listEl.innerHTML = "<p><b>No posts found.</b> Add items to <code>static/posts.json</code>.</p>";
      return;
    }

    listEl.innerHTML = posts.map(p => `
      <article class="post">
        <h2>
          <a class="link" href="post.html?p=${encodeURIComponent(p.slug)}">${p.title}</a>
        </h2>
        <div class="meta">${p.date || ""} • Category: ${p.category || ""}</div>
        <p>${p.excerpt || ""}</p>
      </article>
    `).join("");

  } catch (err) {
    console.error(err);
    listEl.innerHTML = `
      <p><b>Could not load posts.</b></p>
      <p>Reason: <code>${String(err.message).replaceAll("<","&lt;")}</code></p>
      <p class="dim">Check: server running? file path correct? valid JSON?</p>
    `;
  }
}

// ---- POST PAGE: post.html ----
async function initPostPage() {
  const bodyEl = document.getElementById("postBody");
  if (!bodyEl) return;

  const slug = getQueryParam("p");
  if (!slug) {
    bodyEl.innerHTML = "<p><b>Error:</b> missing <code>?p=post-slug</code></p>";
    return;
  }

  try {
    const posts = await loadJSON("/static/posts.json");
    const meta = posts.find(x => x.slug === slug) || null;

    const md = await loadText(`/static/posts/${slug}.md`);
    bodyEl.innerHTML = window.marked ? marked.parse(md) : `<pre>${md}</pre>`;

    if (meta) {
      const titleEl = document.getElementById("postTitle");
      const metaEl = document.getElementById("postMeta");
      if (titleEl) titleEl.textContent = meta.title;
      if (metaEl) metaEl.textContent = `${meta.date || ""} • ${meta.category || ""}`;
      document.title = `${meta.title} • My Retro Blog`;
    }

    if (window.hljs) {
      document.querySelectorAll("pre code").forEach(b => hljs.highlightElement(b));
    }
  } catch (err) {
    console.error(err);
    bodyEl.innerHTML = `
      <p><b>Could not load this post.</b></p>
      <p>Reason: <code>${String(err.message).replaceAll("<","&lt;")}</code></p>
    `;
  }
}

// run
initBlogList();
initPostPage();
