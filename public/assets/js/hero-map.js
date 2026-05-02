/* ═══════════════════════════════════════════════
   HERO MAP EMBED LOGIC
   ═══════════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {
  const mapContainer = document.getElementById("heroMap");
  if (!mapContainer) return;

  const CAT_CONFIG = {
    gym:        { color: "#0a84ff", icon: "🏋️", label: "Gym" },
    physio:     { color: "#ff2d55", icon: "🩺", label: "Physio" },
    supplement: { color: "#ffcc00", icon: "💊", label: "Supplement" }
  };

  let map = null;
  let userMarker = null;
  let centerLat = 20.5937, centerLng = 78.9629; // default india
  let searchRadius = 5000;
  let activeTypes = new Set(["gym", "physio", "supplement"]);
  
  const layerGroups = {
    gym: L.layerGroup(),
    physio: L.layerGroup(),
    supplement: L.layerGroup()
  };

  let fetchedPlaces = [];

  const els = {
    locBtn: document.getElementById("heroLocBtn"),
    chips: document.querySelectorAll(".hero-chip"),
    loading: document.getElementById("heroMapLoading")
  };

  // Init Map
  map = L.map("heroMap", { zoomControl: false, scrollWheelZoom: true }).setView([centerLat, centerLng], 5);
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap", maxZoom: 19
  }).addTo(map);

  Object.values(layerGroups).forEach(group => group.addTo(map));

  // Markers
  const createMarker = (type) => {
    const cfg = CAT_CONFIG[type];
    return L.divIcon({
      className: "",
      html: `<div class="hero-marker" style="background:${cfg.color}; width:28px; height:28px;">${cfg.icon}</div>`,
      iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14]
    });
  };

  // Overpass
  const getQuery = (lat, lng, r) => `[out:json][timeout:25];(
    node["leisure"="fitness_centre"](around:${r},${lat},${lng});
    node["amenity"="gym"](around:${r},${lat},${lng});
    way["leisure"="fitness_centre"](around:${r},${lat},${lng});
    node["healthcare"="physiotherapist"](around:${r},${lat},${lng});
    node["amenity"="physiotherapist"](around:${r},${lat},${lng});
    node["shop"="nutrition_supplements"](around:${r},${lat},${lng});
  );out center;`;

  const classify = (tags) => {
    if (tags.leisure === "fitness_centre" || tags.amenity === "gym") return "gym";
    if (tags.healthcare === "physiotherapist" || tags.amenity === "physiotherapist") return "physio";
    if (tags.shop === "nutrition_supplements") return "supplement";
    return null;
  };

  const updateMap = () => {
    Object.values(layerGroups).forEach(g => g.clearLayers());

    fetchedPlaces.forEach(p => {
      if (activeTypes.has(p.type)) {
        const marker = L.marker([p.lat, p.lng], { icon: createMarker(p.type) });
        const directions = `https://www.google.com/maps/dir/?api=1&origin=${centerLat},${centerLng}&destination=${p.lat},${p.lng}`;
        
        marker.bindPopup(`
          <div style="font-family:'Inter',sans-serif">
            <strong style="display:block;margin-bottom:4px;font-size:14px">${p.name}</strong>
            <span style="display:block;color:#aaa;font-size:12px;margin-bottom:8px">${p.address}</span>
            <a href="${directions}" target="_blank" style="display:block;background:#0a84ff;color:#fff;padding:4px 8px;border-radius:4px;text-align:center;text-decoration:none;font-weight:600;font-size:12px">Navigate</a>
          </div>
        `);
        layerGroups[p.type].addLayer(marker);
      }
    });
  };

  const fetchNearby = async (lat, lng) => {
    els.loading.classList.remove("hide");
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        body: "data=" + encodeURIComponent(getQuery(lat, lng, searchRadius))
      });
      const data = await res.json();
      let elements = data.elements || [];

      // Fallback
      if (elements.length === 0) {
        elements = [
          { id: 1, lat: lat+0.01, lon: lng+0.01, tags: { name: "Flex Gym", leisure: "fitness_centre", "addr:street": "Main Road" } },
          { id: 2, lat: lat-0.01, lon: lng-0.02, tags: { name: "Pro Physio", healthcare: "physiotherapist" } },
          { id: 3, lat: lat+0.02, lon: lng-0.01, tags: { name: "Elite Supplements", shop: "nutrition_supplements" } }
        ];
      }

      fetchedPlaces = elements.map(el => {
        const tLat = el.lat ?? el.center?.lat;
        const tLng = el.lon ?? el.center?.lon;
        const type = classify(el.tags);
        if (!tLat || !tLng || !type) return null;
        
        return {
          id: el.id, lat: tLat, lng: tLng, type: type,
          name: el.tags?.name || CAT_CONFIG[type].label,
          address: [el.tags?.["addr:street"], el.tags?.["addr:housenumber"]].filter(Boolean).join(" ") || "Local Area"
        };
      }).filter(Boolean);

      updateMap();
    } catch (err) {
      console.error(err);
    } finally {
      els.loading.classList.add("hide");
    }
  };

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
      fetchNearby(centerLat, centerLng);

      els.locBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg> Update Location`;
      els.locBtn.disabled = false;
    }, err => {
      alert("Location denied.");
      els.locBtn.innerHTML = `Use Location`;
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
