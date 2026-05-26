(function () {
  const roots = document.querySelectorAll("[data-artemis-run]");

  roots.forEach((root) => {
    const canvas = root.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    const scoreEl = root.querySelector("[data-score]");
    const bestEl = root.querySelector("[data-best]");
    const stageEl = root.querySelector("[data-stage]");
    const overlay = root.querySelector("[data-overlay]");
    const overlayTitle = root.querySelector("[data-overlay-title]");
    const overlayText = root.querySelector("[data-overlay-text]");
    const startButton = root.querySelector("[data-start]");
    const jumpButton = root.querySelector("[data-jump]");
    const resetButton = root.querySelector("[data-reset]");
    const artemisRunSheet = new Image();
    artemisRunSheet.src = "img/minigame/artemis-run-spritesheet-v2.png";
    artemisRunSheet.addEventListener("load", draw);
    const obstacleSheet = new Image();
    obstacleSheet.src = "img/minigame/artemis-obstacles-v2.png";
    obstacleSheet.addEventListener("load", draw);

    const storageKey = "artemis-run-best";
    const stages = [
      {
        name: "Receita",
        at: 0,
        sky: "#f9ead0",
        horizon: "#f4c775",
        ground: "#d6a358",
        accent: "#8b6f3f",
        background: "img/minigame/stage-receita.png",
        groundObstacles: ["amphora", "malt"],
      },
      {
        name: "Mostura",
        at: 520,
        sky: "#f6d49f",
        horizon: "#ecad55",
        ground: "#c98532",
        accent: "#8f5a23",
        background: "img/minigame/stage-mostura.png",
        groundObstacles: ["barrel", "malt", "amphora"],
      },
      {
        name: "Fermentação",
        at: 1240,
        sky: "#e9bf78",
        horizon: "#bf7b35",
        ground: "#9a661f",
        accent: "#70441e",
        background: "img/minigame/stage-fermentacao.png",
        groundObstacles: ["amphora", "barrel", "malt"],
      },
      {
        name: "Maturação",
        at: 2080,
        sky: "#d6ae75",
        horizon: "#895a2b",
        ground: "#704417",
        accent: "#4d301a",
        background: "img/minigame/stage-maturacao.png",
        groundObstacles: ["barrel", "column"],
      },
      {
        name: "Brinde Final",
        at: 3040,
        sky: "#f0b64d",
        horizon: "#a65b1f",
        ground: "#5d3510",
        accent: "#3b2413",
        background: "img/minigame/stage-brinde-final.png",
        groundObstacles: ["amphora", "barrel", "column", "malt"],
      },
    ];
    const stageBackgrounds = stages.map((stage) => {
      const image = new Image();
      image.src = stage.background;
      image.addEventListener("load", draw);
      return image;
    });
    const obstacleTypes = [
      { type: "amphora", w: 34, h: 54, minGap: 260 },
      { type: "barrel", w: 48, h: 42, minGap: 285 },
      { type: "column", w: 42, h: 68, minGap: 310 },
      { type: "malt", w: 44, h: 38, minGap: 250 },
    ];
    const flyingTypes = [
      { type: "arrow", w: 62, h: 18, minGap: 520 },
      { type: "owl", w: 42, h: 32, minGap: 620 },
    ];
    const obstacleSprites = {
      amphora: { sx: 77, sy: 162, sw: 285, sh: 384, dw: 56, dh: 76, groundOffset: 4 },
      barrel: { sx: 362, sy: 224, sw: 362, sh: 312, dw: 64, dh: 56, groundOffset: 9 },
      column: { sx: 724, sy: 145, sw: 362, sh: 415, dw: 60, dh: 88, groundOffset: 5 },
      malt: { sx: 1134, sy: 196, sw: 266, sh: 335, dw: 58, dh: 62, groundOffset: 5 },
      owl: { sx: 1822, sy: 214, sw: 286, sh: 286, dw: 62, dh: 56, groundOffset: 0 },
    };
    const gravity = 3100;
    const jumpVelocity = -860;
    const jumpAirTime = (Math.abs(jumpVelocity) * 2) / gravity;
    const initialSpeed = 360;
    const maxSpeed = 920;
    const speedRamp = 24;
    const stageTransitionScore = 220;

    let dpr = 1;
    let width = 960;
    let height = 420;
    let groundY = 330;
    let lastTime = 0;
    let spawnTimer = 0;
    let flyingTimer = 420;
    let rafId = 0;
    let best = readBestScore();
    let state = createState("ready");

    function createState(mode) {
      return {
        mode,
        score: 0,
        speed: initialSpeed,
        distance: 0,
        stageIndex: 0,
        lastGroundType: "",
        obstacles: [],
        particles: [],
        player: {
          x: 116,
          y: 0,
          w: 66,
          h: 82,
          vy: 0,
          grounded: true,
          runFrame: 0,
        },
      };
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      width = Math.max(320, Math.round(rect.width));
      height = Math.max(230, Math.round(rect.height));
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      groundY = Math.round(height * 0.79);
      state.player.y = Math.min(state.player.y || groundY - state.player.h, groundY - state.player.h);
      draw();
    }

    function setOverlay(title, text, visible) {
      overlayTitle.textContent = title;
      overlayText.textContent = text;
      overlay.hidden = !visible;
    }

    function start() {
      state = createState("running");
      state.player.y = groundY - state.player.h;
      lastTime = performance.now();
      setOverlay("", "", false);
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(loop);
    }

    function gameOver() {
      state.mode = "over";
      best = Math.max(best, Math.floor(state.score));
      writeBestScore(best);
      updateHud();
      setOverlay(
        "Fim da Produção",
        "Pontuação " + padScore(state.score) + ". Pressione espaço, clique ou toque para tentar de novo.",
        true
      );
    }

    function jump() {
      if (state.mode !== "running") {
        start();
        return;
      }

      const player = state.player;
      if (!player.grounded) return;

      player.vy = jumpVelocity;
      player.grounded = false;
      addParticles(player.x + 18, player.y + player.h, 7, "#d99017");
    }

    function loop(now) {
      const elapsed = (now - lastTime) / 1000;
      const dt = Math.min(0.032, Math.max(0, Number.isFinite(elapsed) ? elapsed : 0));
      lastTime = now;

      if (state.mode === "running") {
        update(dt);
        draw();
        rafId = requestAnimationFrame(loop);
      }
    }

    function update(dt) {
      state.distance += state.speed * dt * 0.022;
      state.score += dt * (10 + state.speed * 0.035);
      state.speed = Math.min(maxSpeed, state.speed + dt * speedRamp);
      state.stageIndex = getStageIndex(state.score);

      const player = state.player;
      player.vy += gravity * dt;
      player.y += player.vy * dt;

      if (player.y >= groundY - player.h) {
        player.y = groundY - player.h;
        player.vy = 0;
        player.grounded = true;
      }
      const speedRatio = state.speed / initialSpeed;
      player.runFrame += dt * (player.grounded ? 10 + speedRatio * 4.5 : 4 + speedRatio);

      spawnTimer -= state.speed * dt;
      flyingTimer -= state.speed * dt;

      if (spawnTimer <= 0) {
        spawnGroundObstacle();
      }

      if (state.score > 350 && flyingTimer <= 0) {
        spawnFlyingObstacle();
      }

      state.obstacles.forEach((obstacle) => {
        obstacle.x -= state.speed * dt * (obstacle.speedMultiplier || 1);
        if (obstacle.type === "owl") obstacle.y += Math.sin((state.score + obstacle.x) * 0.05) * 0.38;
      });

      state.obstacles = state.obstacles.filter((obstacle) => obstacle.x + obstacle.w > -80);
      state.particles.forEach((particle) => {
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.life -= dt;
      });
      state.particles = state.particles.filter((particle) => particle.life > 0);

      if (state.obstacles.some((obstacle) => overlaps(player, obstacle))) {
        addParticles(player.x + player.w / 2, player.y + player.h / 2, 16, "#fff2cf");
        gameOver();
      }

      updateHud();
    }

    function spawnGroundObstacle() {
      if (hasFlyingObstacleConflict()) {
        spawnTimer = randomRange(180, 300);
        return;
      }

      const allowRepeat = poolAllowsRepeat();
      const stage = stages[state.stageIndex];
      const pool = obstacleTypes.filter((item) => {
        if (!stage.groundObstacles.includes(item.type)) return false;
        if (state.score <= 520 && item.type === "column") return false;
        return item.type !== state.lastGroundType || allowRepeat;
      });
      const model = pool[Math.floor(Math.random() * pool.length)] || obstacleTypes[0];
      state.obstacles.push({
        type: model.type,
        x: width + 22,
        y: groundY - model.h,
        w: model.w,
        h: model.h,
      });
      state.lastGroundType = model.type;
      spawnTimer = getSafeGroundGap(model);
    }

    function spawnFlyingObstacle() {
      const model = flyingTypes[Math.floor(Math.random() * flyingTypes.length)];
      if (hasGroundObstacleConflict()) {
        flyingTimer = randomRange(260, 420);
        return;
      }

      const highLane = groundY - randomRange(190, 220);
      state.obstacles.push({
        type: model.type,
        x: width + 30,
        y: Math.max(72, highLane),
        w: model.w,
        h: model.h,
        speedMultiplier: model.type === "arrow" ? 1.55 : 1.35,
      });
      flyingTimer = getSafeFlyingGap(model);
    }

    function poolAllowsRepeat() {
      return state.score > 700 && Math.random() < 0.18;
    }

    function getSafeGroundGap(model) {
      const reactionSpace = 170;
      const landingSpace = state.speed * jumpAirTime + 92;
      const difficultyTrim = Math.min(90, state.score * 0.025);
      const minGap = Math.max(model.minGap, landingSpace, reactionSpace + model.w) - difficultyTrim * 0.35;
      const maxGap = minGap + randomRange(150, 330);
      return randomRange(minGap, maxGap);
    }

    function getSafeFlyingGap(model) {
      const lastGround = getLastGroundObstacle();
      const groundBuffer = lastGround ? Math.max(0, width + 260 - lastGround.x) : 0;
      const minGap = Math.max(model.minGap + 180, state.speed * 1.05, 700 + groundBuffer * 0.35);
      return randomRange(minGap, minGap + 620);
    }

    function isFlyingObstacle(obstacle) {
      return obstacle.type === "arrow" || obstacle.type === "owl";
    }

    function getLastGroundObstacle() {
      for (let i = state.obstacles.length - 1; i >= 0; i -= 1) {
        const obstacle = state.obstacles[i];
        if (!isFlyingObstacle(obstacle)) return obstacle;
      }
      return null;
    }

    function hasGroundObstacleConflict() {
      return state.obstacles.some((obstacle) => {
        if (isFlyingObstacle(obstacle)) return false;
        return obstacle.x > width - 120 && obstacle.x < width + 260;
      });
    }

    function hasFlyingObstacleConflict() {
      return state.obstacles.some((obstacle) => {
        if (!isFlyingObstacle(obstacle)) return false;
        return obstacle.x > width - 160 && obstacle.x < width + 220;
      });
    }

    function randomRange(min, max) {
      return min + Math.random() * (max - min);
    }

    function overlaps(player, obstacle) {
      const pad = 8;
      return (
        player.x + pad < obstacle.x + obstacle.w - pad &&
        player.x + player.w - pad > obstacle.x + pad &&
        player.y + pad < obstacle.y + obstacle.h - pad &&
        player.y + player.h - pad > obstacle.y + pad
      );
    }

    function getStageIndex(score) {
      let index = 0;
      stages.forEach((stage, stageIndex) => {
        if (score >= stage.at) index = stageIndex;
      });
      return index;
    }

    function updateHud() {
      scoreEl.textContent = padScore(state.score);
      bestEl.textContent = padScore(best);
      stageEl.textContent = stages[state.stageIndex].name;
    }

    function padScore(value) {
      return String(Math.max(0, Math.floor(value))).padStart(5, "0");
    }

    function readBestScore() {
      try {
        return Number(window.localStorage.getItem(storageKey) || 0);
      } catch {
        return 0;
      }
    }

    function writeBestScore(value) {
      try {
        window.localStorage.setItem(storageKey, String(value));
      } catch {
        // Some browsers block localStorage for directly opened local files.
      }
    }

    function draw() {
      const stage = stages[state.stageIndex];
      drawBackground(stage);
      drawGround(stage);
      state.obstacles.forEach(drawObstacle);
      drawPlayer(state.player);
      drawParticles();
    }

    function drawBackground(stage) {
      const transition = getStageTransition();
      const background = stageBackgrounds[transition.fromIndex];
      if (imageReady(background)) {
        drawScrollingBackground(background, 1 - transition.progress);
        if (transition.toIndex !== transition.fromIndex) {
          const nextBackground = stageBackgrounds[transition.toIndex];
          if (imageReady(nextBackground)) {
            drawScrollingBackground(nextBackground, transition.progress);
          }
        }
        ctx.fillStyle = stage.accent;
        ctx.globalAlpha = 0.04 + state.stageIndex * 0.025;
        ctx.fillRect(0, 0, width, height);
        ctx.globalAlpha = 1;
        return;
      }

      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, stage.sky);
      gradient.addColorStop(0.58, "#f8e8c6");
      gradient.addColorStop(1, stage.horizon);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    function drawGround(stage) {
      if (imageReady(stageBackgrounds[state.stageIndex])) {
        ctx.fillStyle = "rgba(255, 246, 220, 0.18)";
        ctx.fillRect(0, groundY, width, 3);
        ctx.fillStyle = "rgba(65, 35, 13, 0.18)";
        ctx.fillRect(0, groundY + 4, width, 5);
        return;
      }

      ctx.fillStyle = stage.ground;
      ctx.fillRect(0, groundY, width, height - groundY);
      ctx.fillStyle = "rgba(65, 35, 13, 0.3)";
      ctx.fillRect(0, groundY, width, 5);
    }

    function getStageTransition() {
      const currentIndex = state.stageIndex;
      const nextIndex = Math.min(stages.length - 1, currentIndex + 1);
      if (nextIndex === currentIndex) {
        return { fromIndex: currentIndex, toIndex: currentIndex, progress: 0 };
      }

      const nextAt = stages[nextIndex].at;
      const progress = clamp01((state.score - (nextAt - stageTransitionScore)) / stageTransitionScore);
      return { fromIndex: currentIndex, toIndex: nextIndex, progress: smoothStep(progress) };
    }

    function drawPlayer(player) {
      if (imageReady(artemisRunSheet)) {
        try {
          drawPlayerRunSheet(player);
        } catch {
          drawFallbackRunner(player);
        }
        return;
      }

      drawFallbackRunner(player);
    }

    function drawPlayerRunSheet(player) {
      const frameCount = 6;
      const frameIndex = Math.floor(player.runFrame * 0.62) % frameCount;
      const sourceW = artemisRunSheet.naturalWidth / frameCount;
      const frameBoxes = [
        { x: 18, y: 245, w: 316, h: 308, lift: 0 },
        { x: 10, y: 277, w: 324, h: 280, lift: 2 },
        { x: 10, y: 249, w: 324, h: 309, lift: 0 },
        { x: 10, y: 244, w: 324, h: 307, lift: -1 },
        { x: 10, y: 214, w: 324, h: 306, lift: -8 },
        { x: 10, y: 264, w: 300, h: 294, lift: 1 },
      ];
      const box = frameBoxes[frameIndex];
      const drawH = 88;
      const drawW = drawH * (box.w / box.h);
      const runBob = player.grounded ? Math.sin(player.runFrame * 0.72) * 0.8 : -4;
      const drawX = player.x + player.w / 2 - drawW / 2;
      const drawY = player.y + player.h - drawH + box.lift + runBob + 5;

      ctx.save();
      ctx.fillStyle = "rgba(28, 20, 12, 0.2)";
      ctx.beginPath();
      ctx.ellipse(player.x + player.w / 2, groundY + 4, 32, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.drawImage(
        artemisRunSheet,
        frameIndex * sourceW + box.x,
        box.y,
        box.w,
        box.h,
        drawX,
        drawY,
        drawW,
        drawH
      );
      ctx.restore();
    }

    function drawFallbackRunner(player) {
      ctx.fillStyle = "rgba(28, 20, 12, 0.2)";
      ctx.beginPath();
      ctx.ellipse(player.x + player.w / 2, groundY + 4, 28, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#70421f";
      ctx.fillRect(player.x + 16, player.y + 12, 28, 34);
      ctx.fillStyle = "#f1b56b";
      ctx.fillRect(player.x + 22, player.y + 4, 24, 22);
      ctx.fillStyle = "#f7ead4";
      ctx.fillRect(player.x + 20, player.y + 42, 26, 26);
    }

    function drawObstacle(obstacle) {
      if (obstacle.type === "arrow") {
        drawArrow(obstacle);
        return;
      }

      if (imageReady(obstacleSheet) && drawObstacleSprite(obstacle)) return;

      drawFallbackObstacle(obstacle);
    }

    function drawObstacleSprite(obstacle) {
      const sprite = obstacleSprites[obstacle.type];
      if (!sprite) return false;

      const wobble = obstacle.type === "owl" ? Math.sin((state.score + obstacle.x) * 0.12) * 0.06 : 0;
      const x = obstacle.x + obstacle.w / 2 - sprite.dw / 2;
      const y = obstacle.y + obstacle.h - sprite.dh + sprite.groundOffset;

      if (!isFlyingObstacle(obstacle)) {
        ctx.fillStyle = "rgba(32, 22, 14, 0.22)";
        ctx.beginPath();
        ctx.ellipse(obstacle.x + obstacle.w / 2, obstacle.y + obstacle.h + 4, sprite.dw * 0.36, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(x + sprite.dw / 2, y + sprite.dh / 2);
      ctx.rotate(wobble);
      ctx.drawImage(
        obstacleSheet,
        sprite.sx,
        sprite.sy,
        sprite.sw,
        sprite.sh,
        -sprite.dw / 2,
        -sprite.dh / 2,
        sprite.dw,
        sprite.dh
      );
      ctx.restore();
      return true;
    }

    function drawArrow(item) {
      const x = item.x;
      const y = item.y;
      ctx.save();
      ctx.translate(x, y + item.h / 2);
      ctx.rotate(Math.sin((state.score + x) * 0.04) * 0.04);
      ctx.strokeStyle = "#5d3514";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(item.w - 15, 0);
      ctx.stroke();
      ctx.strokeStyle = "#dcb36b";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(2, -2);
      ctx.lineTo(item.w - 18, -2);
      ctx.stroke();
      ctx.fillStyle = "#d99017";
      ctx.beginPath();
      ctx.moveTo(item.w, 0);
      ctx.lineTo(item.w - 15, -9);
      ctx.lineTo(item.w - 13, 0);
      ctx.lineTo(item.w - 15, 9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#7f4920";
      ctx.beginPath();
      ctx.moveTo(1, 0);
      ctx.lineTo(12, -8);
      ctx.lineTo(9, 0);
      ctx.lineTo(12, 8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawFallbackObstacle(item) {
      ctx.fillStyle = "rgba(38, 24, 14, 0.2)";
      ctx.beginPath();
      ctx.ellipse(item.x + item.w / 2, item.y + item.h + 4, item.w * 0.62, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#9a5d26";
      ctx.fillRect(item.x, item.y, item.w, item.h);
    }

    function imageReady(image) {
      return image.complete && image.naturalWidth > 0;
    }

    function drawScrollingBackground(image, alpha) {
      const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
      const drawW = image.naturalWidth * scale;
      const drawH = image.naturalHeight * scale;
      const drawY = (height - drawH) / 2;
      const tileW = drawW * 2;
      const offset = -((state.distance * 18) % tileW);

      ctx.save();
      ctx.globalAlpha = alpha;
      for (let x = offset - tileW; x < width + tileW; x += tileW) {
        ctx.drawImage(image, x, drawY, drawW, drawH);

        ctx.save();
        ctx.translate(x + drawW * 2, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(image, 0, drawY, drawW, drawH);
        ctx.restore();
      }
      ctx.restore();
    }

    function clamp01(value) {
      return Math.max(0, Math.min(1, value));
    }

    function smoothStep(value) {
      const t = clamp01(value);
      return t * t * (3 - 2 * t);
    }

    function addParticles(x, y, count, color) {
      for (let i = 0; i < count; i += 1) {
        state.particles.push({
          x,
          y,
          vx: -120 + Math.random() * 180,
          vy: -190 + Math.random() * 170,
          life: 0.35 + Math.random() * 0.3,
          color,
        });
      }
    }

    function drawParticles() {
      state.particles.forEach((particle) => {
        ctx.globalAlpha = Math.max(0, particle.life * 2);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, 5, 5);
        ctx.globalAlpha = 1;
      });
    }

    window.addEventListener("resize", resize);
    window.addEventListener("keydown", (event) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();
        jump();
      }
    });
    canvas.addEventListener("pointerdown", jump);
    startButton.addEventListener("click", start);
    jumpButton.addEventListener("click", jump);
    resetButton.addEventListener("click", start);

    bestEl.textContent = padScore(best);
    resize();
    setOverlay("A corrida de Ártemis", "Pressione espaço, clique ou toque para começar.", true);
  });
})();
