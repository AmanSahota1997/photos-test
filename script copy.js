const photos = [
  { src: "photos/32340965797_3b2b8a05ee_b.jpg", geography: "Switzerland", color: "grey", type: "city", content: "construction_site" },
  { src: "photos/32340966927_f01b33477f_b.jpg", geography: "London", color: "grey", type: "city", content: "vehicle" },
  { src: "photos/32341013877_9391e995c1_b.jpg", geography: "England", color: "green", type: "rural", content: "vehicle" },
  { src: "photos/32341013877_9391e995c1_b.jpg", geography: "England", color: "yellow", type: "rural", content: "construction_site" },
  { src: "photos/32341015487_126aae5148_b.jpg", geography: "England", color: "green", type: "rural", content: "landscape" },
  { src: "photos/32341024557_c9e5dab4fb_b.jpg", geography: "England", color: "white", type: "town", content: "building" },
  { src: "photos/32341025327_8fa359cd57_b.jpg", geography: "England", color: "grey", type: "city", content: "building" },
  { src: "photos/32341025947_25515b6585_b.jpg", geography: "London", color: "red", type: "city", content: "building" },
  { src: "photos/33407161618_bd6948189f_b.jpg", geography: "London", color: "grey", type: "city", content: "building" },
  { src: "photos/33407235608_71f120c56e_b.jpg", geography: "England", color: "yellow", type: "town", content: "construction_site" },
  { src: "photos/40318228743_4eda78fd71_b.jpg", geography: "Berlin", color: "yellow", type: "city", content: "vehicle" },
  { src: "photos/40318258653_5bba1e2b51_b.jpg", geography: "England", color: "green", type: "rural", content: "landscape" },
  { src: "photos/40318269833_6ed2e12e11_b.jpg", geography: "London", color: "blue", type: "city", content: "building" },
  { src: "photos/40318270123_f510b9a648_b.jpg", geography: "London", color: "grey", type: "city", content: "building" },
  { src: "photos/46368245075_b6d8a26653_b.jpg", geography: "London", color: "blue", type: "city", content: "building" },
  { src: "photos/46368251265_7eeeb1759b_b.jpg", geography: "England", color: "green", type: "rural", content: "landscape" },
  { src: "photos/46368252775_31a6bdc18c_b.jpg", geography: "London", color: "grey", type: "city", content: "building" },
  { src: "photos/46559611774_183dbccf2d_b.jpg", geography: "England", color: "grey", type: "town", content: "vehicle" },
  { src: "photos/F46559612764_f9a62212e6_b.jpg", geography: "London", color: "yellow", type: "city", content: "construction_site" },
  { src: "photos/46559622254_d3d335ab0b_b.jpg", geography: "London", color: "white", type: "city", content: "vehicle" },
  { src: "photos/47230712782_7ea2b6aaa6_b.jpg", geography: "Switzerland", color: "red", type: "city", content: "construction_site" },
  { src: "photos/47230713912_4d62337e69_b.jpg", geography: "England", color: "red", type: "town", content: "vehicle" },
  { src: "photos/47230715122_e23ef5afab_b.jpg", geography: "Berlin", color: "white", type: "city", content: "vehicle" },
  { src: "photos/47230741562_51d812d234_b.jpg", geography: "England", color: "grey", type: "town", content: "building" },
  { src: "photos/47230751962_8fac247266_b.jpg", geography: "Berlin", color: "grey", type: "city", content: "construction_site" },
  { src: "photos/47230769722_8f4ba11cd9_b.jpg", geography: "London", color: "red", type: "city", content: "construction_site" },
];

const gallery = document.getElementById('gallery');
const buttons = document.querySelectorAll('#controls button');

// helper: non-overlapping position generator
function getNonOverlappingPosition(existing, cluster, size) {
  let x, y, tries = 0;
  const maxTries = 5000;
  const margin = 0.05; // keeps photos inside screen
  const clusterSpread = 0.2;

  do {
    const randX = cluster.x + (Math.random() - 0.5) * clusterSpread;
    const randY = cluster.y + (Math.random() - 0.5) * clusterSpread;

    const clampedX = Math.min(1 - margin, Math.max(margin, randX));
    const clampedY = Math.min(1 - margin, Math.max(margin, randY));

    x = clampedX * window.innerWidth;
    y = clampedY * window.innerHeight;
    tries++;
  } while (
    existing.some(p => Math.hypot(p.x - x, p.y - y) < (size + p.size) / 2) &&
    tries < maxTries
  );

  return { x, y };
}

// repel overlapping photos after placement
function repel(placed, iterations = 50) {
  for (let k = 0; k < iterations; k++) {
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        const dx = placed[j].x - placed[i].x;
        const dy = placed[j].y - placed[i].y;
        const dist = Math.hypot(dx, dy);
        const minDist = (placed[i].size + placed[j].size) / 2;
        if (dist < minDist) {
          const shift = (minDist - dist) / 2;
          const angle = Math.atan2(dy, dx);
          placed[i].x -= Math.cos(angle) * shift;
          placed[i].y -= Math.sin(angle) * shift;
          placed[j].x += Math.cos(angle) * shift;
          placed[j].y += Math.sin(angle) * shift;
        }
      }
    }
  }
}

function displayPhotos(sortKey) {
  // Group photos by selected tag
  const groups = {};
  photos.forEach(p => {
    const key = p[sortKey];
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  });

  const groupKeys = Object.keys(groups);

  // dynamic cluster positions
  const clusterPositions = [];
  const n = groupKeys.length;
  const radius = 0.3;
  const randomness = 0.1;
  const verticalOffset = -0.1;
  const horizontalOffset = -0.05;

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * 2 * Math.PI;
    const x = 0.5 + radius * Math.cos(angle) + (Math.random() - 0.5) * randomness + horizontalOffset;
    const y = 0.5 + radius * Math.sin(angle) + (Math.random() - 0.5) * randomness + verticalOffset;
    clusterPositions.push({ x, y });
  }

  // Place each group of photos in its cluster
  groupKeys.forEach((key, i) => {
    const cluster = clusterPositions[i % clusterPositions.length];
    const sortedPhotos = groups[key].slice().sort(() => 0.5 - Math.random());
    const placed = [];

    // calculate positions
    sortedPhotos.forEach(photo => {
      const size = 70 + Math.random() * 5;
      const pos = getNonOverlappingPosition(placed, cluster, size);
      placed.push({ x: pos.x, y: pos.y, size });
    });

    repel(placed);

    // create/update DOM elements with animation
    sortedPhotos.forEach((photo, index) => {
      const pos = placed[index];
      let el = document.querySelector(`.photo[data-src='${photo.src}']`);

      if (!el) {
        el = document.createElement('div');
        el.className = 'photo';
        el.dataset.src = photo.src;

        const img = document.createElement('img');
        img.src = photo.src;
        el.appendChild(img);

        // start at center
        el.style.left = window.innerWidth / 2 + 'px';
        el.style.top = window.innerHeight / 2 + 'px';
        el.style.width = pos.size + 'px';
        el.style.opacity = 0;

        // floating properties
        el.dataset.dx = (Math.random() - 0.5) * 0.5;
        el.dataset.dy = (Math.random() - 0.5) * 0.5;
        el.dataset.cx = pos.x;
        el.dataset.cy = pos.y;

        gallery.appendChild(el);

        requestAnimationFrame(() => {
          el.style.left = pos.x + 'px';
          el.style.top = pos.y + 'px';
          el.style.opacity = 1;
        });
      } else {
        el.style.left = pos.x + 'px';
        el.style.top = pos.y + 'px';
        el.style.width = pos.size + 'px';
        el.dataset.cx = pos.x;
        el.dataset.cy = pos.y;
      }
    });
  });
}

// floating animation loop
function animateFloatingPhotos() {
  const photosEls = document.querySelectorAll('.photo');

  photosEls.forEach(el => {
    let dx = parseFloat(el.dataset.dx);
    let dy = parseFloat(el.dataset.dy);
    let cx = parseFloat(el.dataset.cx);
    let cy = parseFloat(el.dataset.cy);

    let x = parseFloat(el.style.left);
    let y = parseFloat(el.style.top);

    x += dx;
    y += dy;

    const maxOffset = 10;
    if (x > cx + maxOffset || x < cx - maxOffset) dx *= -1;
    if (y > cy + maxOffset || y < cy - maxOffset) dy *= -1;

    el.style.left = x + 'px';
    el.style.top = y + 'px';

    el.dataset.dx = dx;
    el.dataset.dy = dy;
  });

  requestAnimationFrame(animateFloatingPhotos);
}

// buttons
buttons.forEach(b => {
  b.addEventListener('click', () => {
    const mode = b.dataset.sort;
    displayPhotos(mode);

    buttons.forEach(btn => {
      btn.style.fontWeight = btn.dataset.sort === mode ? 'bold' : 'normal';
    });
  });
});

// initial load
displayPhotos('color');
buttons.forEach(btn => {
  btn.style.fontWeight = btn.dataset.sort === 'color' ? 'bold' : 'normal';
});

// start floating animation
animateFloatingPhotos();



