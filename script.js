let schemes = [];

/* DARK MODE */
function toggleDarkMode(){
  document.body.classList.toggle("dark-mode");
  localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
}

/* LANGUAGE */
let language = "en";
function toggleLanguage(){
  let title = document.getElementById("title");
  let subtitle = document.getElementById("subtitle");

  if(!title || !subtitle) return;

  if(language === "en"){
    title.innerText = "सरकारी योजनाएं खोजें";
    subtitle.innerText = "अपनी पात्रता के अनुसार योजनाएं खोजें";
    language = "hi";
  } else {
    title.innerText = "Find Government Schemes Easily";
    subtitle.innerText = "Explore government schemes based on eligibility, gender and benefits.";
    language = "en";
  }
}

/* SEARCH */
function handleSearch(event){
  if(event.key === "Enter"){
    let query = document.getElementById("searchInput").value;
    window.location.href = "schemes.html?search=" + query;
  }
}

/* DOMAIN CLICK */
function openDomain(domain){
  window.location.href = "schemes.html?domain=" + domain;
}

/* ================= LOAD SCHEMES ================= */
function loadSchemes(){

  const container = document.getElementById("schemeContainer");
  if(!container) return;

  const params = new URLSearchParams(window.location.search);
  const selectedDomain = params.get("domain");
  const searchQuery = params.get("search");

  container.innerHTML = "";

  if(!schemes || schemes.length === 0){
    container.innerHTML = "<p>Loading schemes...</p>";
    return;
  }

  schemes.forEach(scheme => {

let matchDomain = !selectedDomain || selectedDomain === "all" || scheme.domain === selectedDomain;
    let matchSearch = !searchQuery ||
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase());

    if(matchDomain && matchSearch){

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${scheme.name}</h3>
        <p>${scheme.description}</p>

        <div style="margin-top:10px; display:flex; gap:10px; justify-content:center;">
<button onclick="shareScheme(${scheme.id})">📤 Share</button>

          <button onclick="toggleSave(${scheme.id})" id="save-${scheme.id}">
            🤍
          </button>

          <a href="scheme-details.html?id=${scheme.id}">
            <button>View Details</button>
          </a>

        </div>
      `;

      container.appendChild(card);
    }
  });

  if(container.innerHTML === ""){
    container.innerHTML = "<p>No schemes found</p>";
  }

  updateSaveIcons();
}

/* ================= SCHEME DETAILS ================= */
function loadSchemeDetails(){

  const name = document.getElementById("schemeName");
  if(!name) return;

  const id = new URLSearchParams(window.location.search).get("id");
  const scheme = schemes.find(s => s.id == id);

  if(!scheme){
    name.innerText = "Scheme not found";
    return;
  }

  document.getElementById("schemeName").innerText = scheme.name;
  document.getElementById("description").innerText = scheme.description;
  document.getElementById("eligibility").innerText = scheme.eligibility;
  document.getElementById("benefits").innerText = scheme.benefits;

  let docs = scheme.documents.split(",");
  document.getElementById("documents").innerHTML =
    docs.map(d => `<li>${d.trim()}</li>`).join("");

  document.getElementById("applyLink").href = scheme.link;
}

/* ================= ELIGIBILITY ================= */
function checkEligibility(){

  let gender = document.getElementById("gender").value;
  let age = document.getElementById("age").value;
  let category = document.getElementById("category").value;

  let container = document.getElementById("resultContainer");
  container.innerHTML = "";

  let scored = [];

  schemes.forEach(scheme => {

    let score = 0;

    if(scheme.gender === gender) score++;
    if(scheme.age === age) score++;
    if(scheme.category === category) score++;

    if(scheme.gender === "all") score += 0.5;
    if(scheme.age === "all") score += 0.5;
    if(scheme.category === "all") score += 0.5;

    if(
      (gender === "all" || scheme.gender === gender || scheme.gender === "all") &&
      (age === "all" || scheme.age === age || scheme.age === "all") &&
      (category === "all" || scheme.category === category || scheme.category === "all")
    ){
      scored.push({scheme, score});
    }

  });

  if(scored.length === 0){
    container.innerHTML = "<p>No matching schemes found</p>";
    return;
  }

  scored.sort((a,b) => b.score - a.score);

  const best = scored[0];

  container.innerHTML += `<h2 style="text-align:center;">⭐ Best Match</h2>`;
  container.appendChild(createCard(best.scheme));

  let recommended = scored.slice(1,3);

  if(recommended.length > 0){
    container.innerHTML += `<h2 style="text-align:center;">🎯 Recommended</h2>`;
    recommended.forEach(item => {
      container.appendChild(createCard(item.scheme));
    });
  }

  container.innerHTML += `<h2 style="text-align:center;">📋 Other Schemes</h2>`;

  scored.slice(3).forEach(item => {
    container.appendChild(createCard(item.scheme));
  });
}

/* ================= SAVE SYSTEM ================= */
function toggleSave(id){
  let saved = JSON.parse(localStorage.getItem("saved")) || [];
  if(saved.includes(id)){
    saved = saved.filter(s => s !== id);
  } else {
    saved.push(id);
  }
  localStorage.setItem("saved", JSON.stringify(saved));
  updateSaveIcons();
}

function updateSaveIcons(){
  let saved = JSON.parse(localStorage.getItem("saved")) || [];
  schemes.forEach(scheme => {
    let btn = document.getElementById(`save-${scheme.id}`);
    if(btn){
      btn.innerText = saved.includes(scheme.id) ? "❤️" : "🤍";
    }
  });
}
function loadSavedSchemes(){

  const container = document.getElementById("savedContainer");
  if(!container) return;

  let saved = JSON.parse(localStorage.getItem("saved")) || [];

  container.innerHTML = "";

  // 🔥 IMPORTANT CHECK
  if(!schemes || schemes.length === 0){
    container.innerHTML = "<p>Loading saved schemes...</p>";
    return;
  }

  let filtered = schemes.filter(s => saved.includes(s.id));

  if(filtered.length === 0){
    container.innerHTML = `
      <h3>No saved schemes yet ❤️</h3>
      <p>Go save some schemes first</p>
    `;
    return;
  }

  filtered.forEach(scheme => {
    container.appendChild(createCard(scheme));
  });
}
/* ================= SEARCH SUGGESTIONS ================= */
function showSuggestions(){
  let input = document.getElementById("searchInput").value.toLowerCase();
  let box = document.getElementById("suggestionsBox");

  if(!box) return;

  box.innerHTML = "";

  if(input === ""){
    box.style.display = "none";
    return;
  }

  let filtered = schemes.filter(s =>
    s.name.toLowerCase().includes(input)
  );

  filtered.slice(0,5).forEach(scheme => {
    let div = document.createElement("div");
    div.innerText = scheme.name;

    div.onclick = () => {
      window.location.href = `scheme-details.html?id=${scheme.id}`;
    };

    box.appendChild(div);
  });

  box.style.display = "block";
}

document.addEventListener("click", function(e){
  let box = document.getElementById("suggestionsBox");
  if(!box) return;
  if(!e.target.closest("#searchInput")){
    box.style.display = "none";
  }
});

/* ================= CARD ================= */
function createCard(scheme){
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
    <h3>${scheme.name}</h3>
    <p>${scheme.description}</p>
    <a href="scheme-details.html?id=${scheme.id}">
      <button>View Details</button>
    </a>
  `;

  return card;
}

/* ================= USER ================= */
function loadUser(){
  let user = JSON.parse(localStorage.getItem("user"));
  let msg = document.getElementById("welcomeMsg");

  if(user && msg){
    msg.innerText = "Welcome, " + user.name + " 👋";
  }
}

/* ================= PAGE LOAD ================= */
window.onload = function(){

  if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-mode");
  }

  fetch("http://localhost:3000/schemes")
    .then(res => res.json())
    .then(data => {
      console.log("API DATA:", data);

      schemes = data;

      // 🔥 load schemes
      if(document.getElementById("schemeContainer")){
        loadSchemes();
      }

      if(document.getElementById("schemeName")){
        loadSchemeDetails();
      }
      if(document.getElementById("savedContainer")){
  loadSavedSchemes();
}

      loadUser();

loadCountsIntoCards();
      // 🔥 SET ACTIVE FILTER AFTER DATA LOAD
      const params = new URLSearchParams(window.location.search);
      const selected = params.get("domain");

      if(selected){
        document.querySelectorAll(".filter-chips button").forEach(btn => {
          if(btn.innerText.toLowerCase().includes(selected)){
            btn.classList.add("active");
          }
        });
      }

    })
    .catch(err => console.log("API ERROR:", err));
};
function filterCategory(event, category){

  const buttons = document.querySelectorAll(".filter-chips button");
  buttons.forEach(btn => btn.classList.remove("active"));

  event.target.classList.add("active");

  const url = new URL(window.location);
  url.searchParams.set("domain", category);
  window.history.pushState({}, "", url);

  loadSchemes();
}
function startVoiceSearch(){

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if(!SpeechRecognition){
    alert("Your browser does not support voice recognition");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.start();

  recognition.onstart = () => {
    console.log("🎤 Listening...");
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    console.log("You said:", transcript);

    document.getElementById("searchInput").value = transcript;

    window.location.href = "schemes.html?search=" + transcript;
  };

  recognition.onerror = (event) => {
    console.log("Error:", event.error);
    alert("Error: " + event.error);
  };
}
function shareScheme(id){

  const scheme = schemes.find(s => s.id == id);

  if(!scheme){
    alert("Scheme not found");
    return;
  }

  const url = window.location.origin + "/scheme-details.html?id=" + id;

  const shareText = `
${scheme.name}

${scheme.description.substring(0,200)}...

🔗 View Details:
${url}
`;

  if(navigator.share){
    navigator.share({
      title: scheme.name,
      text: shareText
    });
  } else {
    navigator.clipboard.writeText(shareText);
    alert("Copied nicely formatted content!");
  }
}

function loadCountsIntoCards(){

  fetch("http://localhost:3000/domain-count")
    .then(res => res.json())
    .then(data => {

      console.log("FULL API DATA:", data);

      data.forEach(item => {

        // ✅ SAFE CHECK
        if(!item.domain) return;

        const domain = item.domain.toLowerCase().trim();
        const el = document.getElementById("count-" + domain);

        console.log("Mapping:", domain, el);

        if(el){
          el.innerText = item.total;
        }

      });

    })
    .catch(err => console.log("ERROR:", err));
}