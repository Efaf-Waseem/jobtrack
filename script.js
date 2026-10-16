const API = "http://localhost:5000/api/jobs";
const statuses = ["applied", "interview", "offer", "rejected"];
const form = document.getElementById("add-form");
const stats = document.getElementById("stats");

async function loadJobs() {
  try {
    const res = await fetch(API);
    const jobs = await res.json();
    render(jobs);
  } catch (err) {
    stats.textContent = "Cannot connect to the server. Is it running?";
  }
}

function makeCard(job) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3></h3>
    <p></p>
    <span class="date"></span>
    <div class="actions">
      <button class="move">Move →</button>
      <button class="delete">Delete</button>
    </div>
  `;
  card.querySelector("h3").textContent = job.title;
  card.querySelector("p").textContent = job.company;
  card.querySelector(".date").textContent = "Applied: " + job.date;

  card.querySelector(".move").addEventListener("click", async function () {
    const next = statuses[(statuses.indexOf(job.status) + 1) % statuses.length];
    await fetch(API + "/" + job._id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    loadJobs();
  });

  card.querySelector(".delete").addEventListener("click", async function () {
    await fetch(API + "/" + job._id, { method: "DELETE" });
    loadJobs();
  });

  return card;
}

function render(jobs) {
  const counts = {};

  statuses.forEach(function (status) {
    const col = document.querySelector('.column[data-status="' + status + '"]');
    const box = col.querySelector(".cards");
    const items = jobs.filter(function (j) {
      return j.status === status;
    });

    counts[status] = items.length;
    col.querySelector(".count").textContent = items.length;
    box.innerHTML = "";

    if (items.length === 0) {
      box.innerHTML = '<p class="empty">Nothing here yet</p>';
    }
    items.forEach(function (job) {
      box.appendChild(makeCard(job));
    });
  });

  stats.innerHTML = `
    <div class="stat"><strong>${jobs.length}</strong><span>Total applications</span></div>
    <div class="stat interview"><strong>${counts.interview}</strong><span>Interviews</span></div>
    <div class="stat offer"><strong>${counts.offer}</strong><span>Offers</span></div>
    <div class="stat rejected"><strong>${counts.rejected}</strong><span>Rejected</span></div>
  `;
}

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const picked = document.getElementById("job-date").value;
  const dateObj = picked ? new Date(picked + "T00:00:00") : new Date();
  const date = dateObj.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
  });

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: document.getElementById("job-title").value,
      company: document.getElementById("company").value,
      date: date,
      status: "applied",
    }),
  });

  form.reset();
  loadJobs();
});

loadJobs();