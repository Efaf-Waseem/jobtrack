const API = "http://localhost:5000/api/jobs";
const statuses = ["applied", "interview", "offer", "rejected"];
const form = document.getElementById("add-form");
const stats = document.getElementById("stats");
const searchBox = document.getElementById("search");
let allJobs = [];

function followUpState(job) {
  if (!job.followUp) return null;
  if (job.status !== "applied" && job.status !== "interview") return null;
  const due = new Date(job.followUp + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (due < today) return "overdue";
  if (due.getTime() === today.getTime()) return "today";
  return "upcoming";
}

async function loadJobs() {
  try {
    const res = await fetch(API);
    allJobs = await res.json();
    applyFilter();
  } catch (err) {
    stats.textContent = "Cannot connect to the server. Is it running?";
  }
}

function applyFilter() {
  const q = searchBox.value.trim().toLowerCase();
  const shown = allJobs.filter(function (j) {
    return (
      (j.title || "").toLowerCase().includes(q) ||
      (j.company || "").toLowerCase().includes(q)
    );
  });
  render(shown);
}

function makeCard(job) {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `
    <h3></h3>
    <p></p>
    <span class="date"></span>
    <span class="followup"></span>
    <a class="link" target="_blank" rel="noopener">View job posting</a>
    <div class="notes"></div>
    <div class="actions">
      <button class="move">Move →</button>
      <button class="edit">Edit</button>
      <button class="delete">Delete</button>
    </div>
  `;
  card.querySelector("h3").textContent = job.title;
  card.querySelector("p").textContent = job.company;
  card.querySelector(".date").textContent = "Applied: " + job.date;

  const fuEl = card.querySelector(".followup");
  const state = followUpState(job);
  if (state) {
    const label = new Date(job.followUp + "T00:00:00").toLocaleDateString(
      "en-GB",
      { day: "numeric", month: "long" }
    );
    if (state === "overdue") {
      fuEl.textContent = "Follow-up overdue: " + label;
      fuEl.classList.add("overdue");
    } else if (state === "today") {
      fuEl.textContent = "Follow up today";
      fuEl.classList.add("today");
    } else {
      fuEl.textContent = "Follow up: " + label;
    }
  } else {
    fuEl.remove();
  }

  const linkEl = card.querySelector(".link");
  let url = (job.link || "").replace(/\s+/g, "");
  if (url && !/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }
  if (url) {
    linkEl.href = url;
  } else {
    linkEl.remove();
  }

  const notesEl = card.querySelector(".notes");
  if (job.notes) {
    notesEl.textContent = job.notes;
  } else {
    notesEl.remove();
  }

  card.querySelector(".move").addEventListener("click", async function () {
    const next = statuses[(statuses.indexOf(job.status) + 1) % statuses.length];
    await fetch(API + "/" + job._id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    loadJobs();
  });

  card.querySelector(".edit").addEventListener("click", function () {
    card.innerHTML = `
      <input class="e-title" placeholder="Job title">
      <input class="e-company" placeholder="Company">
      <input class="e-link" placeholder="Job link">
      <label class="field">Follow up on
        <input type="date" class="e-followup">
      </label>
      <textarea class="e-notes" placeholder="Notes"></textarea>
      <div class="actions">
        <button class="save">Save</button>
        <button class="cancel">Cancel</button>
      </div>
    `;
    card.querySelector(".e-title").value = job.title || "";
    card.querySelector(".e-company").value = job.company || "";
    card.querySelector(".e-link").value = job.link || "";
    card.querySelector(".e-followup").value = job.followUp || "";
    card.querySelector(".e-notes").value = job.notes || "";

    card.querySelector(".save").addEventListener("click", async function () {
      const title = card.querySelector(".e-title").value.trim();
      const company = card.querySelector(".e-company").value.trim();
      if (!title || !company) {
        alert("Job title and company cannot be empty.");
        return;
      }
      await fetch(API + "/" + job._id, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title,
          company: company,
          link: card.querySelector(".e-link").value,
          followUp: card.querySelector(".e-followup").value,
          notes: card.querySelector(".e-notes").value,
        }),
      });
      loadJobs();
    });

    card.querySelector(".cancel").addEventListener("click", loadJobs);
  });

  card.querySelector(".delete").addEventListener("click", async function () {
    await fetch(API + "/" + job._id, { method: "DELETE" });
    loadJobs();
  });

  return card;
}

function render(jobs) {
  statuses.forEach(function (status) {
    const col = document.querySelector('.column[data-status="' + status + '"]');
    const box = col.querySelector(".cards");
    const items = jobs.filter(function (j) {
      return j.status === status;
    });

    col.querySelector(".count").textContent = items.length;
    box.innerHTML = "";

    if (items.length === 0) {
      box.innerHTML = '<p class="empty">Nothing here yet</p>';
    }
    items.forEach(function (job) {
      box.appendChild(makeCard(job));
    });
  });

  function count(s) {
    return allJobs.filter(function (j) {
      return j.status === s;
    }).length;
  }

  const dueCount = allJobs.filter(function (j) {
    const s = followUpState(j);
    return s === "overdue" || s === "today";
  }).length;

  stats.innerHTML = `
    <div class="stat"><strong>${allJobs.length}</strong><span>Total applications</span></div>
    <div class="stat interview"><strong>${count("interview")}</strong><span>Interviews</span></div>
    <div class="stat offer"><strong>${count("offer")}</strong><span>Offers</span></div>
    <div class="stat rejected"><strong>${count("rejected")}</strong><span>Rejected</span></div>
    <div class="stat due"><strong>${dueCount}</strong><span>Follow-ups due</span></div>
  `;
}

searchBox.addEventListener("input", applyFilter);

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
      link: document.getElementById("job-link").value,
      notes: document.getElementById("job-notes").value,
      followUp: document.getElementById("job-followup").value,
      status: "applied",
    }),
  });

  form.reset();
  loadJobs();
});

loadJobs();