// Year in footer
document.getElementById("year").textContent = new Date().getFullYear();

// Fake visitor counter (persistent using localStorage)
const key = "retro_blog_visitors";
const digitsEl = document.getElementById("visitorDigits");

function pad(n, width) {
  const s = String(n);
  return s.length >= width ? s : "0".repeat(width - s.length) + s;
}

let visitors = Number(localStorage.getItem(key) || "225788");
visitors += Math.floor(Math.random() * 3) + 1; // +1..+3 each load
localStorage.setItem(key, String(visitors));
digitsEl.textContent = pad(visitors, 6);

// Optional: retro background music toggle
const music = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("toggleMusicBtn");

toggleBtn.addEventListener("click", async () => {
  try {
    if (music.paused) {
      await music.play();
      toggleBtn.textContent = "Music: ON";
    } else {
      music.pause();
      toggleBtn.textContent = "Music: OFF";
    }
  } catch (e) {
    alert("Add a music file at assets/music.mp3 to enable music.");
  }
});
async function loadLatestPostCallout() {
  const textEl = document.getElementById("latestText");
  const linkEl = document.getElementById("latestLink");

  if (!textEl || !linkEl) {
    console.log("[latest] Not on index.html (missing latestText/latestLink)");
    return;
  }

  console.log("[latest] trying to fetch: static/posts.json");

  try {
    const res = await fetch("static/posts.json", { cache: "no-store" });
    console.log("[latest] fetch status:", res.status);

    if (!res.ok) throw new Error("posts.json HTTP " + res.status);

    const raw = await res.text();
    console.log("[latest] raw json:", raw.slice(0, 200));

    const data = JSON.parse(raw);

    const posts = Array.isArray(data) ? data : (data.posts || []);
    console.log("[latest] posts length:", posts.length);

    if (!posts.length) {
      textEl.innerHTML = "<b>New post:</b> No posts yet.";
      linkEl.href = "blog.html";
      return;
    }

    // If your JSON is not already newest-first, we sort by date safely:
    posts.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

    const latest = posts[0];
    const title = latest.title || "Untitled";
    const excerpt = latest.excerpt || "";
    const slug = latest.slug || "hello-world"; // fallback

    textEl.innerHTML = `<b>New post:</b> ${title}${excerpt ? " — " + excerpt : ""}`;
    linkEl.href = `post.html?slug=${encodeURIComponent(slug)}`;

    console.log("[latest] updated callout ✅", { title, slug });
  } catch (err) {
    console.error("[latest] failed ❌", err);
    textEl.innerHTML = "<b>New post:</b> (Could not load posts.json)";
    linkEl.href = "blog.html";
  }
}

document.addEventListener("DOMContentLoaded", loadLatestPostCallout);

