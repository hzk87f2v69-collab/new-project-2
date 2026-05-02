/* ═══════════════════════════════════════════════
   Smart Nearby Fitness Map | Leaflet + Overpass
   ═══════════════════════════════════════════════ */
(function () {
  let searchRadius = 5000; // default 5km
  const COLORS = { gym: "#22c55e", physio: "#3b82f6", supplement: "#f59e0b" };
  const LABELS = { gym: "Gym", physio: "Physiotherapy", supplement: "Supplement Shop" };
  const EMOJIS = { gym: "🏋️", physio: "🩺", supplement: "💊" };

  let map = null;
  let userMarker = null;
  let userLat = 20.5937; // Default India center
  let userLng = 78.9629;
  let userLocationKnown = false;
  let allFetchedPlaces = []; // Store results for list rendering

  const layerGroups = { gym: null, physio: null, supplement: null };
  let activeFilter = "all"; // "all", "gym", "physio", "supplement"

  /* ── Haversine Distance Calculator ── */
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  /* ── Custom pin icon ── */
  const makeIcon = (type) => L.divIcon({
    className: "",
    html: `<div style="width:34px;height:34px;border-radius:50%;background:${COLORS[type]};display:grid;place-items:center;font-size:16px;box-shadow:0 2px 10px rgba(0,0,0,.5);border:2px solid rgba(255,255,255,.3)">${EMOJIS[type]}</div>`,
    iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -20]
  });

  /* ── Overpass query ── */
  const buildQuery = (lat, lng, radius) =>
    `[out:json][timeout:25];(` +
    `node["leisure"="fitness_centre"](around:${radius},${lat},${lng});` +
    `node["amenity"="gym"](around:${radius},${lat},${lng});` +
    `way["leisure"="fitness_centre"](around:${radius},${lat},${lng});` +
    `node["healthcare"="physiotherapist"](around:${radius},${lat},${lng});` +
    `node["amenity"="physiotherapist"](around:${radius},${lat},${lng});` +
    `node["shop"="nutrition_supplements"](around:${radius},${lat},${lng});` +
    `node["shop"="health_food"](around:${radius},${lat},${lng});` +
    `node["shop"="sports"](around:${radius},${lat},${lng});` +
    `);out center;`;

  /* ── Classify OSM element ── */
  const getType = (tags) => {
    if (!tags) return null;
    if (tags.leisure === "fitness_centre" || tags.amenity === "gym") return "gym";
    if (tags.healthcare === "physiotherapist" || tags.amenity === "physiotherapist") return "physio";
    if (["nutrition_supplements","health_food","sports"].includes(tags.shop)) return "supplement";
    return null;
  };

  /* ── Render List Cards ── */
  const renderList = () => {
    const listEl = document.getElementById("resultsList");
    const countEl = document.getElementById("resultsCount");
    if (!listEl || !countEl) return;

    listEl.innerHTML = "";

    // Filter by type
    let filtered = allFetchedPlaces.filter(p => activeFilter === "all" || p.type === activeFilter);

    // Sort by distance if location known
    if (userLocationKnown) {
      filtered.sort((a, b) => a.distance - b.distance);
    }

    countEl.textContent = `${filtered.length} places found`;

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="results-empty-state"><p>No ${activeFilter !== 'all' ? activeFilter : 'fitness'} places found within ${searchRadius/1000}km.</p></div>`;
      return;
    }

    filtered.forEach(place => {
      const card = document.createElement("div");
      card.className = "place-card";
      
      let distStr = userLocationKnown ? `${place.distance.toFixed(1)} km` : "";
      
      let directionsUrl = place.custom_url || (userLocationKnown 
        ? `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${place.lat},${place.lng}`
        : `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`);

      card.innerHTML = `
        <div class="place-card-top">
          <div>
            <h4 class="place-card-title">${EMOJIS[place.type]} ${place.name}</h4>
            <div class="place-card-address">${place.address || LABELS[place.type]}</div>
          </div>
          ${distStr ? `<div class="place-card-distance">${distStr}</div>` : ""}
        </div>
        <div class="place-card-actions">
          <a href="${directionsUrl}" target="_blank" class="place-btn primary" onclick="event.stopPropagation()">Get Directions</a>
        </div>
      `;

      // Click card to pan map
      card.addEventListener("click", () => {
        if (map) {
          map.setView([place.lat, place.lng], 16);
          // Optional: Open popup
        }
      });

      listEl.appendChild(card);
    });
  };

  /* ── Render Map Markers ── */
  const renderMarkers = () => {
    // Clear old layers
    Object.keys(layerGroups).forEach(t => {
      if (layerGroups[t] && map) map.removeLayer(layerGroups[t]);
      layerGroups[t] = L.layerGroup();
    });

    allFetchedPlaces.forEach(place => {
      let directionsUrl = place.custom_url || `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
      const marker = L.marker([place.lat, place.lng], { icon: makeIcon(place.type) })
        .bindPopup(`<b>${place.name}</b><br><small style="color:#aaa">${place.address || ""}</small><br>
          <a href="${directionsUrl}" target="_blank" style="font-size:.75rem;color:#0a84ff">Open in Maps →</a>`);
      
      layerGroups[place.type].addLayer(marker);
    });

    // Show appropriate layers
    Object.keys(layerGroups).forEach(t => {
      if (activeFilter === "all" || activeFilter === t) {
        if (map) layerGroups[t].addTo(map);
      }
    });
  };

  const updateUI = () => {
    renderMarkers();
    renderList();
  };

  /* ── Fetch Data ── */
  const fetchPlaces = (lat, lng) => {
    if (!map) return;
    
    document.getElementById("resultsCount").textContent = "Searching nearby...";
    const listEl = document.getElementById("resultsList");
    if(listEl) listEl.innerHTML = `<div class="results-empty-state"><div class="map-spin"></div><p style="margin-top:1rem">Scanning for places...</p></div>`;

    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: "data=" + encodeURIComponent(buildQuery(lat, lng, searchRadius))
    })
    .then(r => r.json())
    .then(data => {
      let els = data.elements || [];
      
      // Fallback Demo Data if OSM is empty
      if (els.length === 0 && userLocationKnown) {
        console.log("No OSM data. Injecting demo data for UX.");
        els = [
          { lat: lat + 0.012, lon: lng + 0.008, _dummyType: "gym", tags: { name: "Platinum Gym", "addr:street": "Suhagi, Madhya Pradesh 482004", custom_url: "https://maps.app.goo.gl/E712eTaxRF7kEgq76" } },
          { lat: lat - 0.015, lon: lng - 0.010, _dummyType: "gym", tags: { name: "Iron Core Fitness (Demo)" } },
          { lat: lat + 0.005, lon: lng - 0.018, _dummyType: "physio", tags: { name: "Heal & Move Physiotherapy (Demo)" } },
          { lat: lat - 0.008, lon: lng + 0.014, _dummyType: "supplement", tags: { name: "Muscle Fuel Store (Demo)" } },
          { lat: lat + 0.020, lon: lng + 0.002, _dummyType: "gym", tags: { name: "Apex Training Centre (Demo)" } }
        ];
      }

      // Process elements
      allFetchedPlaces = [];
      els.forEach(el => {
        const elLat = el.lat ?? el.center?.lat;
        const elLng = el.lon ?? el.center?.lon;
        if (!elLat || !elLng) return;
        const type = getType(el.tags) || el._dummyType;
        if (!type) return;
        
        allFetchedPlaces.push({
          id: el.id,
          lat: elLat,
          lng: elLng,
          type: type,
          name: el.tags?.name || LABELS[type],
          address: [el.tags?.["addr:street"], el.tags?.["addr:housenumber"]].filter(Boolean).join(" "),
          custom_url: el.tags?.custom_url,
          distance: userLocationKnown ? getDistance(lat, lng, elLat, elLng) : 0
        });
      });

      updateUI();
    })
    .catch(err => {
      console.error("Overpass fetch error:", err);
      document.getElementById("resultsCount").textContent = "Error loading places";
      if(listEl) listEl.innerHTML = `<div class="results-empty-state"><p>Could not load places. Check connection.</p></div>`;
    });
  };

  /* ── Init Leaflet ── */
  const initMap = () => {
    if (map) return;
    const spin = document.getElementById("mapLocating");
    if (spin) spin.style.display = "none";

    setTimeout(() => {
      map = L.map("aceFitnessMap", { center:[userLat, userLng], zoom: userLocationKnown ? 14 : 5, scrollWheelZoom:false });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap", maxZoom: 19
      }).addTo(map);

      [50, 150, 400, 800].forEach(ms => setTimeout(() => map.invalidateSize(), ms));

      if (userLocationKnown) {
        userMarker = L.circleMarker([userLat, userLng], { radius:10, fillColor:"#0a84ff", color:"#fff", weight:3, fillOpacity:1 })
          .addTo(map).bindPopup("📍 You are here");
        fetchPlaces(userLat, userLng);
      } else {
        // Initial state before location is known
        const listEl = document.getElementById("resultsList");
        if(listEl) listEl.innerHTML = `<div class="results-empty-state"><p>Map is ready. Click "Use Current Location" to scan your area.</p></div>`;
        document.getElementById("resultsCount").textContent = "Waiting for location";
      }

    }, 100);
  };

  /* ── Trigger Location ── */
  const locateUser = () => {
    const btn = document.getElementById("mapLocateBtn");
    const originalText = btn.innerHTML;
    btn.innerHTML = `<div class="map-spin" style="width:16px;height:16px;border-width:2px;margin-right:8px;display:inline-block"></div> Locating...`;
    btn.disabled = true;

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      btn.innerHTML = originalText;
      btn.disabled = false;
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        userLat = pos.coords.latitude;
        userLng = pos.coords.longitude;
        userLocationKnown = true;
        
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        if (map) {
          map.setView([userLat, userLng], 14);
          if (userMarker) {
            userMarker.setLatLng([userLat, userLng]);
          } else {
            userMarker = L.circleMarker([userLat, userLng], { radius:10, fillColor:"#0a84ff", color:"#fff", weight:3, fillOpacity:1 })
              .addTo(map).bindPopup("📍 You are here");
          }
        } else {
          initMap();
        }
        
        fetchPlaces(userLat, userLng);
      },
      err => {
        console.warn("Geolocation error:", err);
        alert("Location access denied or failed. Showing default view.");
        btn.innerHTML = originalText;
        btn.disabled = false;
        
        // Fallback to Delhi if user explicitly denied but clicked button
        userLat = 28.6139;
        userLng = 77.2090;
        userLocationKnown = true;
        if(map) {
          map.setView([userLat, userLng], 14);
          fetchPlaces(userLat, userLng);
        }
      },
      { timeout: 10000 }
    );
  };

  /* ── Event Listeners ── */
  
  // Use Location Button
  const locBtn = document.getElementById("mapLocateBtn");
  if (locBtn) locBtn.addEventListener("click", locateUser);

  // Radius Select
  const radSelect = document.getElementById("radiusSelect");
  if (radSelect) {
    radSelect.addEventListener("change", (e) => {
      searchRadius = parseInt(e.target.value, 10);
      if (userLocationKnown && map) {
        // Adjust zoom based on radius loosely
        const zoomLevels = { 2000: 15, 5000: 14, 10000: 13, 15000: 12 };
        map.setZoom(zoomLevels[searchRadius] || 14);
        fetchPlaces(userLat, userLng);
      }
    });
  }

  // Filter Tabs
  document.querySelectorAll(".map-pill").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".map-pill").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilter = btn.dataset.type;
      updateUI();
    });
  });

  // Resize Observer for map div
  const mapContainer = document.getElementById("aceFitnessMap");
  if (mapContainer && window.ResizeObserver) {
    new ResizeObserver(() => { if(map) map.invalidateSize(); }).observe(mapContainer);
  }

  // Init base map as soon as section is visible, but don't ask for location yet
  const section = document.getElementById("nearbyMap");
  if (section && window.IntersectionObserver) {
    let initialized = false;
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !initialized) {
        initialized = true;
        initMap();
      }
    }).observe(section);
  }

})();
