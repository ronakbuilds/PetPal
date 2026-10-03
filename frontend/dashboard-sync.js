document.addEventListener("DOMContentLoaded", async () => {
  // 1. Authenticate cached local storage records token keys
  const userString = localStorage.getItem("user");
  if (!userString) { window.location.href = "./login.html"; return; }
  const user = JSON.parse(userString);
  
  const welcomeHeader = document.querySelector("#welcome-user-text");
  if (welcomeHeader) welcomeHeader.textContent = `Welcome Back, ${user.fullname || 'Pet Owner'}!`;

  // 2. Direct pipeline data binding engine extraction
  try {
    const response = await fetch(`https://onrender.com{user.id}`);
    const pets = await response.json();

    const petCounter = document.querySelector("#live-pet-counter");
    const vaccineCounter = document.querySelector("#live-vaccine-counter");
    const petGrid = document.querySelector("#real-pet-grid-container");
    const vaccineList = document.querySelector("#dynamic-vaccine-list");

    let activeVaccinesCount = 0;

    if (Array.isArray(pets)) {
      if (petCounter) petCounter.textContent = pets.length;
      if (petGrid) petGrid.innerHTML = "";
      if (vaccineList) vaccineList.innerHTML = "";

      if (pets.length === 0) {
        if (petGrid) petGrid.innerHTML = `<p style="color:#64748b; font-style:italic;">No registered pets found. Click '+ Add Pet' to initialize tracking profiles.</p>`;
        if (vaccineList) vaccineList.innerHTML = `<p style="color:#64748b;">No pending upcoming immunizations targets scheduled.</p>`;
        if (vaccineCounter) vaccineCounter.textContent = "0";
        return;
      }

      pets.forEach(pet => {
        if (pet.next_vaccination_date) activeVaccinesCount++;

        // Append real-time profile grid cards
        const card = document.createElement("div");
        card.className = "pet-card";
        card.innerHTML = `
          <h3>${pet.pet_name} <span style="font-weight:400; font-size:0.85rem; color:var(--text-muted);">(${pet.pet_type})</span></h3>
          <p><strong>Breed:</strong> ${pet.breed || 'Not Logged'} | <strong>Gender:</strong> ${pet.gender}</p>
          <p><strong>Current Age:</strong> ${pet.age} years | <strong>Weight:</strong> ${pet.weight} kg</p>
          <p style="color:var(--text-muted); font-size:0.85rem; margin-top:0.6rem; font-style:italic; background:#f8fafc; padding:0.5rem; border-radius:6px;">Notes: ${pet.medical_notes || 'No tracking metrics logged.'}</p>
        `;
        if (petGrid) petGrid.appendChild(card);

        // Generate Premium Vaccination Cards featuring hover scale glow matrices
        if (vaccineList) {
          const vaxCard = document.createElement("div");
          vaxCard.className = "vax-record-card";
          
          // Generate a fallback calculation for the historical previous shot timeline metrics row
          const nextDate = new Date(pet.next_vaccination_date);
          nextDate.setMonth(nextDate.getMonth() - 6);
          const previousVaccineDate = pet.vaccination_date || nextDate.toISOString().split('T')[0];

          vaxCard.innerHTML = `
            <div class="vax-card-header">
                <h3>${pet.pet_name} <span>(Type: ${pet.pet_type})</span></h3>
                <div>
                    <span class="vax-badge-pill vax-badge-prev">Prev Vaccine: ${previousVaccineDate}</span>
                    <span class="vax-badge-pill vax-badge-next">Next Booster: ${pet.next_vaccination_date}</span>
                </div>
            </div>
            <div class="vax-meta-row"><strong>Breed:</strong> ${pet.breed || 'Not Specified'} | <strong>Gender Details:</strong> ${pet.gender}</div>
            <div class="vax-meta-row"><strong>Weight:</strong> ${pet.weight} kg | <strong>Registered Age Tier:</strong> ${pet.age} years old</div>
            <div class="vax-notes-line">Ecosystem Notes: ${pet.medical_notes || 'No vaccine complications or notes logged.'}</div>
          `;
          vaccineList.appendChild(vaxCard);
        }
      });
      if (vaccineCounter) vaccineCounter.textContent = activeVaccinesCount;
    }
  } catch (err) { console.error("Ruptured cloud sync communication parameters layer:", err); }
});

// 3. Wiping token arrays logic matching logout triggers
const logoutBtnNode = document.querySelector("#logout-btn-trigger");
if (logoutBtnNode) {
  logoutBtnNode.addEventListener("click", (e) => {
    e.preventDefault();
    const overlay = document.querySelector("#logout-overlay-screen");
    if (overlay) overlay.style.display = "flex";
    setTimeout(() => { localStorage.removeItem("user"); window.location.href = "./login.html"; }, 1800);
  });
}