/* ═══════════════════════════════════════════════
   HERO MAP EMBED LOGIC
   ═══════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("heroMap");
  if (!mapContainer) return;

  const CAT_CONFIG = {
    gym: { color: "#0a84ff", icon: "🏋️", label: "Gym" }
  };

  let map = null;
  let userMarker = null;
  let centerLat = 23.1817, centerLng = 79.9554; // Centered around Jabalpur gym cluster
  let activeTypes = new Set(["gym"]);
  
  const layerGroups = {
    gym: L.layerGroup()
  };

  const PARTNER_GYMS = [
    { name: "Anytime Fitness", lat: 23.1679, lng: 79.9326 },
    { name: "My Fitness Gym", lat: 23.1817, lng: 79.9554 },
    { name: "Smart Gym Narmada", lat: 23.1508, lng: 79.9096 },
    { name: "Cult Gym Napier Town", lat: 23.1654, lng: 79.9448 },
    { name: "Fitness Anytym Gym", lat: 23.1831, lng: 79.9581 },
    { name: "Royal Fitness Garha", lat: 23.1612, lng: 79.9185 },
    { name: "Energica Gym", lat: 23.1968, lng: 79.9872 },
    { name: "Fitness Era Gym", lat: 23.1786, lng: 79.9513 },
    { name: "24 Gym", lat: 23.1547, lng: 79.9242 },
    { name: "Asia’s Gym Civic Centre", lat: 23.1702, lng: 79.9395 },
    { name: "Jabalpur Gym City", lat: 23.1859, lng: 79.9464 },
    { name: "Transform 360 Gym", lat: 23.1848, lng: 79.9627 },
    { name: "The Gold Mace Gym", lat: 23.1974, lng: 79.9821 },
    { name: "Fitness Jungle", lat: 23.1804, lng: 79.9706 },
    { name: "Evolve Fitness", lat: 23.1718, lng: 79.9498 },
    { name: "Royal Fitness Napier Town", lat: 23.1668, lng: 79.9431 },
    { name: "Olympus Gym", lat: 23.1937, lng: 79.9754 }
  ];

  let fetchedPlaces = [];

  const els = {
    locBtn: document.getElementById("heroLocBtn"),
    chips: document.querySelectorAll(".hero-chip"),
    loading: document.getElementById("heroMapLoading")
  };

  // Init Map
  map = L.map("heroMap", { zoomControl: false, scrollWheelZoom: true }).setView([centerLat, centerLng], 14);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap", maxZoom: 19
  }).addTo(map);

  Object.values(layerGroups).forEach(group => group.addTo(map));

  // ── ADD PARTNER GYMS ───────────────────────────────────────────
  const gymIcon = L.divIcon({
    className: "",
    html: `<div class="hero-marker" style="background:#0a84ff;width:30px;height:30px;font-size:16px;box-shadow:0 0 0 3px rgba(10,132,255,0.25);">🏋️</div>`,
    iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -15]
  });

  PARTNER_GYMS.forEach(gym => {
    L.marker([gym.lat, gym.lng], { icon: gymIcon })
      .addTo(layerGroups.gym)
      .bindPopup(`
        <div style="font-family:'Inter',sans-serif">
          <strong style="display:block;margin-bottom:4px;font-size:14px">📍 ${gym.name}</strong>
          <span style="display:block;color:#aaa;font-size:12px;margin-bottom:8px">Jabalpur, Madhya Pradesh</span>
          <a href="https://www.google.com/maps/dir/?api=1&destination=${gym.lat},${gym.lng}"
            target="_blank"
            style="display:block;background:#0a84ff;color:#fff;padding:4px 8px;border-radius:4px;text-align:center;text-decoration:none;font-weight:600;font-size:12px">
            Navigate
          </a>
        </div>
      `);
  });
  // ───────────────────────────────────────────────────────────────

  // Fetch nearby on load
  setTimeout(() => fetchNearby(centerLat, centerLng), 500);

  // Markers
  const createMarker = (type) => {
    const cfg = CAT_CONFIG[type];
    return L.divIcon({
      className: "",
      html: `<div class="hero-marker" style="background:${cfg.color}; width:28px; height:28px;">${cfg.icon}</div>`,
      iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14]
    });
  };

  const updateMap = () => {
    Object.values(layerGroups).forEach(g => g.clearLayers());

    // Render Partner Gyms
    if (activeTypes.has("gym")) {
      PARTNER_GYMS.forEach(gym => {
        const marker = L.marker([gym.lat, gym.lng], { icon: gymIcon });
        marker.bindPopup(`
          <div style="font-family:'Inter',sans-serif">
            <strong style="display:block;margin-bottom:4px;font-size:14px">📍 ${gym.name}</strong>
            <span style="display:block;color:#aaa;font-size:12px;margin-bottom:8px">Jabalpur, Madhya Pradesh</span>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${gym.lat},${gym.lng}"
              target="_blank"
              style="display:block;background:#0a84ff;color:#fff;padding:4px 8px;border-radius:4px;text-align:center;text-decoration:none;font-weight:600;font-size:12px">
              Navigate
            </a>
          </div>
        `);
        layerGroups.gym.addLayer(marker);
      });
    }
  };

  // Initial render
  updateMap();

  // Location logic
  els.locBtn.addEventListener("click", () => {
    els.locBtn.innerHTML = `Locating...`;
    els.locBtn.disabled = true;

    navigator.geolocation.getCurrentPosition(pos => {
      centerLat = pos.coords.latitude;
      centerLng = pos.coords.longitude;
      
      if (userMarker) userMarker.setLatLng([centerLat, centerLng]);
      else userMarker = L.circleMarker([centerLat, centerLng], { radius: 8, fillColor: "#fff", color: "#0a84ff", weight: 3, fillOpacity: 1 }).addTo(map).bindPopup("You");
      
      map.setView([centerLat, centerLng], 14);

      els.locBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg> Update Location`;
      els.locBtn.disabled = false;
    }, err => {
      alert("Location permission denied.");
      els.locBtn.innerHTML = `Live Location`;
      els.locBtn.disabled = false;
    });
  });

  // Filter chips
  els.chips.forEach(chip => {
    chip.addEventListener("click", () => {
      const type = chip.dataset.type;
      if (activeTypes.has(type)) {
        activeTypes.delete(type);
        chip.classList.remove("active");
      } else {
        activeTypes.add(type);
        chip.classList.add("active");
      }
      updateMap();
    });
  });

});
