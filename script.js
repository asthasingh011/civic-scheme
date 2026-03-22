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

/* CARD */
function createCard(scheme){
  const card = document.createElement("div");
  card.className = "card";

  card.innerHTML = `
  <h3>${scheme.name}</h3>
  <p>${scheme.description}</p>

  <div class="card-buttons">

    <div style="display:flex; gap:10px;">
      <button class="icon-btn" onclick="speakText('${scheme.name}')">🔊</button>
      <button class="icon-btn" onclick="shareScheme(${scheme.id})">📤</button>
      <button class="icon-btn" onclick="toggleSave(${scheme.id})" id="save-${scheme.id}">🤍</button>
    </div>

    <a href="scheme-details.html?id=${scheme.id}">
      <button class="view-btn">View Details</button>
    </a>

  </div>
`;

  return card;
}

/* LOAD SCHEMES */
function loadSchemes(){
  const container = document.getElementById("schemeContainer");
  if(!container) return;

  const params = new URLSearchParams(window.location.search);
  const selectedDomain = params.get("domain");
  const searchQuery = params.get("search");

  container.innerHTML = "";

  schemes.forEach(scheme => {

    let matchDomain = !selectedDomain || selectedDomain === "all" || scheme.domain === selectedDomain;

    let matchSearch = !searchQuery ||
      scheme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      scheme.description.toLowerCase().includes(searchQuery.toLowerCase());

    if(matchDomain && matchSearch){
      container.appendChild(createCard(scheme));
    }
  });

  updateSaveIcons();
}

/* PAGE LOAD */
window.onload = function(){

  if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark-mode");
  }

  fetch("http://localhost:3000/schemes")
    .then(res => res.json())
    .then(data => {
      schemes = data;

      if(document.getElementById("schemeContainer")){
        loadSchemes();
      }

      if(document.getElementById("savedContainer")){
        loadSavedSchemes();
      }

      if(document.getElementById("schemeName")){
        loadSchemeDetails();
      }
     loadUser();
      loadCountsIntoCards();
    });
};

/* SAVE SYSTEM */
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

/* UPDATE ICONS */
function updateSaveIcons(){
  let saved = JSON.parse(localStorage.getItem("saved")) || [];

  schemes.forEach(s => {
    let btn = document.getElementById(`save-${s.id}`);
    if(btn){
      btn.innerText = saved.includes(s.id) ? "❤️" : "🤍";
    }
  });
}

/* LOAD SAVED */
function loadSavedSchemes(){

  const container = document.getElementById("savedContainer");
  if(!container) return;

  let saved = JSON.parse(localStorage.getItem("saved")) || [];

  fetch("http://localhost:3000/schemes")
    .then(res => res.json())
    .then(data => {

      container.innerHTML = "";

      let filtered = data.filter(s => saved.includes(s.id));

      if(filtered.length === 0){
        container.innerHTML = "<h3>No saved schemes yet ❤️</h3>";
        return;
      }

      filtered.forEach(scheme => {
        container.appendChild(createCard(scheme));
      });

    });
}

/* ELIGIBILITY */
function checkEligibility(){

  let gender = document.getElementById("gender").value.toLowerCase();
  let age = document.getElementById("age").value.toLowerCase();
  let category = document.getElementById("category").value.toLowerCase();

  let container = document.getElementById("resultContainer");
  container.innerHTML = "<p>Loading...</p>";

  fetch("http://localhost:3000/schemes")
    .then(res => res.json())
    .then(data => {

      let filtered = data.filter(s => {

        let sGender = (s.gender || "").toLowerCase();
        let sAge = (s.age || "").toLowerCase();
        let sCategory = (s.category || "").toLowerCase();

        return (
          (gender === "all" || sGender === gender || sGender === "all") &&
          (age === "all" || sAge === age || sAge === "all") &&
          (category === "all" || sCategory === category || sCategory === "all")
        );
      });

      container.innerHTML = "";

      if(filtered.length === 0){
        container.innerHTML = "<p>No matching schemes found</p>";
        return;
      }

      filtered.forEach(scheme => {
        container.appendChild(createCard(scheme));
      });

    })
    .catch(() => {
      container.innerHTML = "<p>Error loading data</p>";
    });
}

/* COUNTS */
function loadCountsIntoCards(){
  fetch("http://localhost:3000/domain-count")
    .then(res => res.json())
    .then(data => {
      data.forEach(item => {
        let el = document.getElementById("count-" + item.domain.toLowerCase());
        if(el) el.innerText = item.total;
      });
    });
}

/* DETAILS */
function loadSchemeDetails(){

  const id = new URLSearchParams(window.location.search).get("id");

  fetch("http://localhost:3000/schemes")
    .then(res => res.json())
    .then(data => {

      let scheme = data.find(s => s.id == id);

      if(!scheme) return;

      document.getElementById("schemeName").innerText = scheme.name;
      document.getElementById("description").innerText = scheme.description;
      document.getElementById("eligibility").innerText = scheme.eligibility;
      document.getElementById("benefits").innerText = scheme.benefits;

      document.getElementById("documents").innerHTML =
        (scheme.documents || "").split(",").map(d => `<li>${d}</li>`).join("");

      document.getElementById("applyLink").href = scheme.link;
    });
}
function startVoiceSearch(){

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if(!SpeechRecognition){
    alert("Voice search not supported in this browser");
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

    let input = document.getElementById("searchInput");
    if(input){
      input.value = transcript;
    }

    window.location.href = "schemes.html?search=" + transcript;
  };

  recognition.onerror = (event) => {
    console.log("Error:", event.error);
    alert("Voice error: " + event.error);
  };
}
function filterCategory(event, category){

  // remove active class
  const buttons = document.querySelectorAll(".filter-chips button");
  buttons.forEach(btn => btn.classList.remove("active"));

  // add active to clicked
  event.target.classList.add("active");

  // update URL
  const url = new URL(window.location);
  url.searchParams.set("domain", category);
  window.history.pushState({}, "", url);

  // reload schemes
  loadSchemes();
}
function shareScheme(id){

  const scheme = schemes.find(s => s.id === id);

  if(!scheme){
    alert("Scheme not found");
    return;
  }

  const shareText = `${scheme.name}\n${scheme.description}\n\nCheck it here: ${window.location.origin}/scheme-details.html?id=${id}`;

  // ✅ If browser supports native share
  if(navigator.share){
    navigator.share({
      title: scheme.name,
      text: scheme.description,
      url: `${window.location.origin}/scheme-details.html?id=${id}`
    })
    .catch(err => console.log("Share error:", err));
  } 
  else {
    // fallback (copy to clipboard)
    navigator.clipboard.writeText(shareText);
    alert("Link copied to clipboard!");
  }
}function registerUser(event){
  event.preventDefault();

  let name = document.getElementById("name").value;
  let email = document.getElementById("email").value;
  let phone = document.getElementById("phone").value;

  // ✅ save in localStorage
  const user = { name, email, phone };
  localStorage.setItem("user", JSON.stringify(user));

  // ✅ show success
  document.getElementById("successMsg").style.display = "block";

  // ✅ redirect after 1 sec
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}
function loadUser(){
  let user = JSON.parse(localStorage.getItem("user"));
  let msg = document.getElementById("welcomeMsg");
  if(user && msg){
    msg.innerText = "Welcome, " + user.name + " 👋";
  }
}
function showSuggestions(){

  let input = document.getElementById("searchInput").value.toLowerCase();
  let box = document.getElementById("suggestionsBox");

  if(!box) return;

  box.innerHTML = "";

  if(!input){
    box.style.display = "none";
    return;
  }

  // 🔥 use global schemes
  let filtered = schemes.filter(s =>
    s.name.toLowerCase().includes(input)
  );

  if(filtered.length === 0){
    box.style.display = "none";
    return;
  }

  box.style.display = "block";

  filtered.slice(0, 5).forEach(s => {

    let div = document.createElement("div");
    div.className = "suggestion-item";
    div.innerText = s.name;

    div.onclick = () => {
      window.location.href = "schemes.html?search=" + s.name;
    };

    box.appendChild(div);
  });
}
document.addEventListener("click", function(e){
  let box = document.getElementById("suggestionsBox");
  let input = document.getElementById("searchInput");

  if(!box || !input) return;

  if(!input.contains(e.target)){
    box.style.display = "none";
  }
});
function speakText(text){

  if(!('speechSynthesis' in window)){
    alert("Speech not supported in this browser");
    return;
  }

  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "en-IN";
  speech.rate = 1;   // speed
  speech.pitch = 1;  // tone

  window.speechSynthesis.speak(speech);
}