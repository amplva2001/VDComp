// Brick Builder — selectable image bricks with rotation preview & placement
(() => {
  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');

  // UI
  const imagePalette = document.getElementById('imagePalette');
  const useColorBtn = document.getElementById('useColorBtn');
  const brickWidthInput = document.getElementById('brickWidth');
  const brickHeightInput = document.getElementById('brickHeight');
  const cellSizeInput = document.getElementById('cellSize');
  const colorPicker = document.getElementById('colorPicker');
  const exportPngBtn = document.getElementById('exportPng');
  const downloadJsonBtn = document.getElementById('downloadJson');
  const loadJsonBtn = document.getElementById('loadJson');
  const loadJsonFile = document.getElementById('loadJsonFile');
  const clearBtn = document.getElementById('clearBtn');

  // IMPORTANT: list of image filenames the app will try to load (adjust if yours differ)
  const imageNames = ['01.png','02.png','03.png','04.png','05.png','06.png','07.png'].map(n => `images/${n}`);

  // State
  let cellSize = parseInt(cellSizeInput.value, 10) || 40;
  const bricks = []; // {x,y,w,h,color?,imageIndex?,rotation}
  let loadedImages = new Array(imageNames.length); // maintain indices matching imageNames
  let selectedImageIndex = null; // index into loadedImages, null => color mode
  let useColorMode = false;
  let rotation = 0; // 0, 90, 180, 270 (degrees)
  let mouse = { x: 0, y: 0, over: false }; // raw screen coords
  let snapped = { gx: 0, gy: 0 }; // last snapped grid coords for preview

  // Canvas sizing
  function resizeCanvas() {
    const wrap = document.getElementById('stageWrap');
    const style = getComputedStyle(wrap);
    const innerWidth = wrap.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    canvas.width = Math.max(600, innerWidth);
    canvas.height = 640;
    draw();
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Load images for palette while preserving their index positions
  function loadImages(names) {
    names.forEach((src, i) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'auto';
      img.onload = () => {
        loadedImages[i] = { src, img };
        buildPalette();
        // pick first available if none selected
        if (!useColorMode && (selectedImageIndex === null || !loadedImages[selectedImageIndex])) {
          for (let k = 0; k < loadedImages.length; k++) {
            if (loadedImages[k]) {
              selectedImageIndex = k;
              break;
            }
          }
        }
        draw();
      };
      img.onerror = () => {
        loadedImages[i] = null; // mark missing
        buildPalette();
        draw();
      };
      img.src = src;
    });
  }

  function buildPalette() {
    imagePalette.innerHTML = '';
    // Keep palette order same as imageNames
    for (let i = 0; i < imageNames.length; i++) {
      const entry = loadedImages[i];
      if (!entry) continue; // skip missing images
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = entry.src;
      const im = document.createElement('img');
      im.src = entry.src;
      im.alt = `brick ${i+1}`;
      btn.appendChild(im);
      if (!useColorMode && selectedImageIndex === i) btn.classList.add('selected');
      ((index) => {
        btn.addEventListener('click', () => {
          selectedImageIndex = index;
          useColorMode = false;
          updatePaletteSelection();
          draw();
        });
      })(i);
      imagePalette.appendChild(btn);
    }
    updatePaletteSelection();
  }

  function updatePaletteSelection() {
    const buttons = imagePalette.querySelectorAll('button');
    buttons.forEach((b, idx) => {
      // idx here is index among visible buttons, so compare using the position in imagePalette
      // determine the original index of this button by walking imageNames
    });
    // Simpler: rebuild selection by matching DOM button order to loadedImages order
    let btnIndex = 0;
    for (let i = 0; i < imageNames.length; i++) {
      if (!loadedImages[i]) continue;
      const b = imagePalette.children[btnIndex];
      if (b) {
        b.classList.toggle('selected', !useColorMode && selectedImageIndex === i);
      }
      btnIndex++;
    }
    useColorBtn.textContent = useColorMode ? 'Using Color' : 'Use Color';
  }

  useColorBtn.addEventListener('click', () => {
    useColorMode = true;
    selectedImageIndex = null;
    updatePaletteSelection();
    draw();
  });

  // Initial load
  loadImages(imageNames);

  // Helpers: convert screen to grid coords (snap)
  function screenToGrid(sx, sy) {
    const rect = canvas.getBoundingClientRect();
    const cx = sx - rect.left;
    const cy = sy - rect.top;

    // create nice margins like the sample
    const offsetX = 20;
    const offsetY = 20;
    const worldX = cx - offsetX;
    const worldY = cy - offsetY;
    const gx = Math.floor(worldX / cellSize);
    const gy = Math.floor(worldY / cellSize);
    return { gx, gy, withinX: worldX >= 0 && worldY >= 0 && worldX <= canvas.width - offsetX && worldY <= canvas.height - offsetY };
  }

  // Draw grid, bricks, preview
  function drawGrid(originX = 20, originY = 20) {
    const w = canvas.width;
    const h = canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);

    // grid lines
    ctx.strokeStyle = '#d2d2d2';
    ctx.lineWidth = 1;
    const cols = Math.ceil((w - originX * 2) / cellSize);
    const rows = Math.ceil((h - originY * 2) / cellSize);

    ctx.beginPath();
    for (let i = 0; i <= cols; i++) {
      const x = originX + i * cellSize;
      ctx.moveTo(x, originY);
      ctx.lineTo(x, originY + rows * cellSize);
    }
    for (let j = 0; j <= rows; j++) {
      const y = originY + j * cellSize;
      ctx.moveTo(originX, y);
      ctx.lineTo(originX + cols * cellSize, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawBricks(originX = 20, originY = 20) {
    for (const b of bricks) {
      const bx = originX + b.x * cellSize;
      const by = originY + b.y * cellSize;
      const bw = b.w * cellSize;
      const bh = b.h * cellSize;

      if (typeof b.imageIndex === 'number' && loadedImages[b.imageIndex]) {
        const img = loadedImages[b.imageIndex].img;
        // tile per cell
        for (let i = 0; i < b.w; i++) {
          for (let j = 0; j < b.h; j++) {
            const tx = bx + i * cellSize;
            const ty = by + j * cellSize;
            if (b.rotation % 360 === 0) {
              ctx.drawImage(img, tx, ty, cellSize, cellSize);
            } else {
              drawImageRotated(ctx, img, tx, ty, cellSize, cellSize, b.rotation);
            }
          }
        }
      } else {
        // color brick
        ctx.fillStyle = b.color || '#b22222';
        ctx.fillRect(bx, by, bw, bh);
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        ctx.strokeRect(bx, by, bw, bh);
      }
    }
  }

  function drawPreview(originX = 20, originY = 20) {
    if (!mouse.over) return;
    const gx = snapped.gx;
    const gy = snapped.gy;

    const inputW = Math.max(1, parseInt(brickWidthInput.value, 10) || 1);
    const inputH = Math.max(1, parseInt(brickHeightInput.value, 10) || 1);
    const placedW = (rotation % 180 === 0) ? inputW : inputH;
    const placedH = (rotation % 180 === 0) ? inputH : inputW;

    const px = originX + gx * cellSize;
    const py = originY + gy * cellSize;
    const pw = placedW * cellSize;
    const ph = placedH * cellSize;

    ctx.save();
    ctx.globalAlpha = 0.65;
    if (!useColorMode && typeof selectedImageIndex === 'number' && loadedImages[selectedImageIndex]) {
      const img = loadedImages[selectedImageIndex].img;
      for (let i = 0; i < placedW; i++) {
        for (let j = 0; j < placedH; j++) {
          const tx = px + i * cellSize;
          const ty = py + j * cellSize;
          if (rotation % 360 === 0) {
            ctx.drawImage(img, tx, ty, cellSize, cellSize);
          } else {
            drawImageRotated(ctx, img, tx, ty, cellSize, cellSize, rotation);
          }
        }
      }
    } else {
      ctx.fillStyle = colorPicker.value || '#b22222';
      ctx.fillRect(px, py, pw, ph);
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = '#2b88ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
    ctx.restore();
  }

  function drawImageRotated(ctx, img, x, y, w, h, deg) {
    const rad = deg * Math.PI / 180;
    ctx.save();
    ctx.translate(x + w / 2, y + h / 2);
    ctx.rotate(rad);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  function draw() {
    const originX = 20;
    const originY = 20;
    drawGrid(originX, originY);
    drawBricks(originX, originY);
    drawPreview(originX, originY);
  }

  // Mouse handling: preview & placement
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.over = true;
    const { gx, gy } = screenToGrid(e.clientX, e.clientY);
    snapped.gx = gx;
    snapped.gy = gy;
    draw();
  });

  canvas.addEventListener('mouseleave', () => {
    mouse.over = false;
    draw();
  });

  // Place / remove bricks
  canvas.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const { gx, gy } = screenToGrid(e.clientX, e.clientY);
    if (e.button === 2) {
      // right-click: remove brick containing this cell (topmost)
      for (let i = bricks.length - 1; i >= 0; i--) {
        const b = bricks[i];
        if (gx >= b.x && gx < b.x + b.w && gy >= b.y && gy < b.y + b.h) {
          bricks.splice(i, 1);
          draw();
          return;
        }
      }
      return;
    }
    if (e.button === 0) {
      const inputW = Math.max(1, parseInt(brickWidthInput.value, 10) || 1);
      const inputH = Math.max(1, parseInt(brickHeightInput.value, 10) || 1);
      const placedW = (rotation % 180 === 0) ? inputW : inputH;
      const placedH = (rotation % 180 === 0) ? inputH : inputW;

      const b = {
        x: gx,
        y: gy,
        w: placedW,
        h: placedH,
        rotation: rotation
      };

      if (!useColorMode && typeof selectedImageIndex === 'number' && loadedImages[selectedImageIndex]) {
        b.imageIndex = selectedImageIndex;
      } else {
        b.color = colorPicker.value || '#b22222';
      }

      bricks.push(b);
      draw();
    }
  });

  // prevent context menu on canvas
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // Keyboard: left/right rotate current selection
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      rotation = (rotation + 270) % 360; // -90
      draw();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      rotation = (rotation + 90) % 360; // +90
      draw();
    }
  });

  // UI bindings
  cellSizeInput.addEventListener('change', () => {
    cellSize = Math.max(8, parseInt(cellSizeInput.value, 10) || 40);
    draw();
  });
  brickWidthInput.addEventListener('change', draw);
  brickHeightInput.addEventListener('change', draw);
  colorPicker.addEventListener('change', draw);

  // export PNG
  exportPngBtn.addEventListener('click', () => {
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'brick-building.png';
    a.click();
  });

  // download JSON
  downloadJsonBtn.addEventListener('click', () => {
    const payload = {
      cellSize,
      bricks
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'brick-building.json';
    a.click();
  });

  // load JSON
  loadJsonBtn.addEventListener('click', () => loadJsonFile.click());
  loadJsonFile.addEventListener('change', (ev) => {
    const f = ev.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (Array.isArray(data.bricks)) {
          bricks.length = 0;
          data.bricks.forEach(b => bricks.push(b));
          if (typeof data.cellSize === 'number') {
            cellSize = data.cellSize;
            cellSizeInput.value = String(cellSize);
          }
          draw();
        } else {
          alert('Invalid JSON: no bricks array found');
        }
      } catch (err) {
        alert('Failed to load JSON: ' + err.message);
      }
    };
    reader.readAsText(f);
    loadJsonFile.value = '';
  });

  clearBtn.addEventListener('click', () => {
    if (confirm('Clear all bricks?')) {
      bricks.length = 0;
      draw();
    }
  });

  // initial draw and expose state for debugging
  draw();
  window.brickBuilder = {
    bricks,
    loadedImages,
    getRotation: () => rotation
  };
})();