// js/blog.js
// Works on: local server + GitHub Pages (repo sites like /REPO_NAME/)
// Fixes: "/static/posts.json -> 404" by using URL-based paths

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

// ---- helpers ----
async function loadJSON(pathOrUrl) {
  const res = await fetch(pathOrUrl, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${pathOrUrl} -> HTTP ${res.status}`);
  return await res.json();
}

async function loadText(pathOrUrl) {
  const res = await fetch(pathOrUrl, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${pathOrUrl} -> HTTP ${res.status}`);
  return await res.text();
}

function getQueryParam(name) {
  return new URL(window.location.href).searchParams.get(name);
}

// ---- Base URL-safe paths (handles GitHub Pages /REPO_NAME/) ----
const BASE = new URL(".", window.location.href); // current folder
const POSTS_INDEX_URL = new URL("static/posts.json", BASE);
const POST_MD_URL = (slug) => new URL(`static/posts/${slug}.md`, BASE);

// ---- BLOG LIST: blog.html ----
async function initBlogList() {
  const listEl = document.getElementById("blogList");
  if (!listEl) return;

  try {
    const posts = await loadJSON(POSTS_INDEX_URL);

    if (!Array.isArray(posts) || posts.length === 0) {
      listEl.innerHTML = `<p><b>No posts found.</b> Add items to <code>static/posts.json</code>.</p>`;
      return;
    }

    listEl.innerHTML = posts.map(p => `
      <article class="post">
        <h2>
          <a class="link" href="post.html?p=${encodeURIComponent(p.slug)}">${p.title || p.slug}</a>
        </h2>
        <div class="meta">${p.date || ""}${p.category ? ` • Category: ${p.category}` : ""}</div>
        <p>${p.excerpt || ""}</p>
      </article>
    `).join("");

  } catch (err) {
    console.error(err);
    listEl.innerHTML = `
      <p><b>Could not load posts.</b></p>
      <p>Reason: <code>${String(err.message).replaceAll("<","&lt;")}</code></p>
      <p class="dim">On GitHub Pages this is usually a wrong absolute path (<code>/static/...</code>).</p>
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
    // metadata list
    const posts = await loadJSON(POSTS_INDEX_URL);
    const meta = Array.isArray(posts) ? posts.find(x => x.slug === slug) : null;

    // markdown content
    const md = await loadText(POST_MD_URL(slug));
    bodyEl.innerHTML = window.marked ? marked.parse(md) : `<pre>${md}</pre>`;

    // title/meta
    if (meta) {
      const titleEl = document.getElementById("postTitle");
      const metaEl = document.getElementById("postMeta");
      if (titleEl) titleEl.textContent = meta.title || slug;
      if (metaEl) metaEl.textContent = `${meta.date || ""}${meta.category ? ` • ${meta.category}` : ""}`;
      document.title = `${meta.title || slug} • My Retro Blog`;
    }

    // highlight blocks
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

// run (safe: each exits if elements not found)
initBlogList();
initPostPage();
