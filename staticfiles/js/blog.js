// SCRF & Fetch Logic (Existing logic preserved)
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i=0; i<cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length+1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length+1));
        break;
      }
    }
  }
  return cookieValue;
}
const csrftoken = getCookie('csrftoken');

// REAL-TIME SEARCH FILTER
document.getElementById('blogSearch').addEventListener('input', function(e) {
  const term = e.target.value.toLowerCase();
  const cards = document.querySelectorAll('.blog-card');
  cards.forEach(card => {
    const title = card.querySelector('h3').innerText.toLowerCase();
    const excerpt = card.querySelector('p').innerText.toLowerCase();
    card.style.display = (title.includes(term) || excerpt.includes(term)) ? "flex" : "none";
  });
});




// CATEGORY FILTER
const blogGrid = document.querySelector(".blog-grid");
const navButtons = document.querySelectorAll(".nav-btn");
navButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    navButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;

    fetch(`/broken-elevator-media-blogs?category=${filter}`, {headers: {'X-Requested-With': 'XMLHttpRequest'}})
      .then(r=>r.json())
      .then(data=>{
        blogGrid.innerHTML = "";
        data.blogs.forEach(blog=>{
          const card = document.createElement("div");
          card.className = "blog-card";
          card.innerHTML = `
            <div class="card-img-wrapper">
               <img src="${blog.thumbnail}" alt="${blog.title}">
            </div>
            <div class="blog-info">
              <h3>${blog.title}</h3>
              <p>${blog.excerpt}</p>
               <div class="meta"><span>${blog.created_at}</span></div>
              <div class="blog-actions">
                <button class="read-btn" data-id="${blog.id}">View Project</button>
              </div>
            </div>
          `;
          blogGrid.appendChild(card);
        });
        attachBlogCardEvents();
      });
  });
});


function attachBlogCardEvents(){
  document.querySelectorAll(".read-btn").forEach(btn=>btn.onclick = ()=>openBlog(btn.dataset.id));
}
attachBlogCardEvents();


function openBlog(blogId){
  fetch(`/blog-content/${blogId}/`)
    .then(r => r.json())
    .then(data => {
      document.getElementById("modalTitle").innerText = data.title;
      document.getElementById("modalContent").innerHTML = data.content;
      document.getElementById("modalMeta").innerText =
        `${data.date} // WRITTEN BY ${data.author || 'BROKEN ELEVATOR'}`;

      const modal = document.getElementById("blogModal");
      modal.classList.add("active");

      document.body.style.overflow = "hidden";
      const navi = document.getElementById("header");
      navi.style.visibility="hidden";

    });
}

function closeBlog(){
  const navi = document.getElementById("header");
  navi.style.visibility="unset";
  const modal = document.getElementById("blogModal");

  modal.classList.remove("active");

  setTimeout(() => {
    document.body.style.overflow = "auto";
  }, 400);
}

document.getElementById("blogModal").addEventListener("click", (e) => {
  if (e.target.id === "blogModal") {
    closeBlog();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeBlog();
});
