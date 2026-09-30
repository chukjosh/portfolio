(function () {
  var root = document.documentElement;
  var prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = !!window.gsap;
  function wait(milliseconds) { return new Promise(function (resolve) { setTimeout(resolve, milliseconds); }); }
  function twoDigits(number) { return String(number).padStart(2, "0"); }
  // Runs a handler at most once per animation frame, so scroll, resize and pointer work stays smooth
  function throttleToFrame(callback) {
    var isScheduled = false, latestArguments = null;
    return function () {
      latestArguments = arguments;
      if (isScheduled) return;
      isScheduled = true;
      requestAnimationFrame(function () { isScheduled = false; callback.apply(null, latestArguments); });
    };
  }

  // ---------- Theme ----------
  var themeListeners = [];
  var themeToggle = document.getElementById("themeToggle");
  function currentTheme() { return root.getAttribute("data-theme"); }
  var themeColorMeta = document.querySelector('meta[name="theme-color"]');
  function describeToggle() {
    themeToggle.setAttribute("aria-label", "Switch to " + (currentTheme() === "dark" ? "light" : "dark") + " mode");
    if (themeColorMeta) themeColorMeta.setAttribute("content", currentTheme() === "dark" ? "#050508" : "#f6f2fc");
  }
  themeToggle.addEventListener("click", function () {
    var nextTheme = currentTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", nextTheme);
    try { localStorage.setItem("theme", nextTheme); } catch (error) {}
    describeToggle();
    themeListeners.forEach(function (listener) { listener(nextTheme); });
  });
  describeToggle();

  // ---------- Live clock (Lagos) and self-updating copyright year ----------
  var clockFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  var clockElement = document.getElementById("clockTime");
  var yearElement = document.getElementById("year");
  var displayedYear = null;
  function updateClockAndYear() {
    var now = new Date();
    clockElement.textContent = clockFormatter.format(now);
    var currentYear = now.getFullYear();
    if (currentYear !== displayedYear) { displayedYear = currentYear; yearElement.textContent = currentYear; }
  }
  updateClockAndYear();
  setInterval(updateClockAndYear, 1000);

  // ---------- Mobile menu ----------
  var menu = document.getElementById("menu");
  var menuToggle = document.getElementById("menuToggle");
  menuToggle.addEventListener("click", function () {
    menuToggle.setAttribute("aria-expanded", menu.classList.toggle("open"));
  });

  // ---------- Demo gallery ----------
  var demos = [
    { tab: "AI", kind: "AI and machine learning", title: "Spotting the odd one out", plain: "A model studies thousands of normal events, learns the pattern, then flags anything that doesn't fit. Useful for fraud, security and hospital records.", tags: ["PyTorch", "Autoencoders", "Anomaly detection"] },
    { tab: "Apps", kind: "Websites and mobile apps", title: "Building the app people tap", plain: "I turn a sketch into working screens that load fast and feel smooth on any phone or laptop.", tags: ["React", "TypeScript", "Flutter"] },
    { tab: "Data", kind: "Data science", title: "Turning numbers into answers", plain: "Messy spreadsheets are cleaned, checked and turned into a chart anyone can read at a glance.", tags: ["Python", "Pandas", "Matplotlib"] },
    { tab: "Backend", kind: "Backend and cloud", title: "Keeping the engine room running", plain: "Every tap on an app travels through a server and a database and back again. I build and host that journey so it stays fast and safe.", tags: ["FastAPI", "PostgreSQL", "Docker", "AWS"] },
    { tab: "Documents", kind: "Document AI", title: "Reading paperwork automatically", plain: "A scan goes in. Names, dates and results come out as tidy records, with no retyping.", tags: ["OCR", "LLMs", "FHIR", "HL7"] },
    { tab: "Assistants", kind: "AI assistants", title: "An AI helper that stays private", plain: "Ask a question, get a clear answer. If one AI provider is down, another steps in, and private details are hidden first.", tags: ["Gemini", "Mistral", "DeepSeek", "FastAPI"] }
  ];
  var demoPanel = document.getElementById("demoPanel");
  var demoTabs = document.getElementById("demoTabs");
  var stages = Array.prototype.slice.call(document.querySelectorAll(".stage"));
  var demoIndex = 0, demoTimer = null, isDemoHovered = false, isDemoSlideActive = false;

  (function buildClusterDots() {
    var group = document.getElementById("clusterDots"), seed = 7;
    function pseudoRandom() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var i = 0; i < 38; i++) {
      var angle = pseudoRandom() * Math.PI * 2, radius = Math.sqrt(pseudoRandom()) * 62;
      var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", (110 + Math.cos(angle) * radius * 1.25).toFixed(1));
      dot.setAttribute("cy", (96 + Math.sin(angle) * radius * 0.95).toFixed(1));
      dot.setAttribute("r", "3.2");
      dot.setAttribute("class", "pt fa");
      dot.style.setProperty("--d", (i * 0.04).toFixed(2) + "s");
      group.appendChild(dot);
    }
  })();

  var tabButtons = demos.map(function (demo, index) {
    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("role", "tab");
    button.innerHTML = demo.tab + "<i></i>";
    button.addEventListener("click", function () { showDemo(index); });
    demoTabs.appendChild(button);
    return button;
  });

  function scheduleNextDemo() {
    clearTimeout(demoTimer);
    if (prefersReducedMotion || isDemoHovered || !isDemoSlideActive) return;
    demoTimer = setTimeout(function () { showDemo((demoIndex + 1) % demos.length); }, 6500);
  }
  function showDemo(index) {
    demoIndex = index;
    var demo = demos[index];
    stages.forEach(function (stage, stageIndex) {
      stage.classList.remove("on");
      if (stageIndex === index) { void stage.getBoundingClientRect(); stage.classList.add("on"); }
    });
    tabButtons.forEach(function (button) { button.setAttribute("aria-selected", "false"); });
    void demoTabs.offsetWidth;
    tabButtons[index].setAttribute("aria-selected", "true");
    document.getElementById("demoKind").textContent = demo.kind;
    document.getElementById("demoTitle").textContent = demo.title;
    document.getElementById("demoPlain").textContent = demo.plain;
    document.getElementById("demoTags").innerHTML = demo.tags.map(function (tag) { return "<li>" + tag + "</li>"; }).join("");
    demoPanel.classList.remove("swap");
    void demoPanel.offsetWidth;
    demoPanel.classList.add("swap");
    scheduleNextDemo();
  }
  demoPanel.addEventListener("pointerenter", function () { isDemoHovered = true; demoTabs.classList.add("paused"); clearTimeout(demoTimer); });
  demoPanel.addEventListener("pointerleave", function () { isDemoHovered = false; demoTabs.classList.remove("paused"); showDemo(demoIndex); });
  showDemo(0);

  // ---------- Project hanger: cards hang from a rope, drag them along it and they swing ----------
  var hanger = document.getElementById("hanger");
  var hangerTrack = document.getElementById("hangerTrack");
  var hangElements = Array.prototype.slice.call(hangerTrack.children);
  var ropeSvg = document.getElementById("rope");
  var ropeBase = document.getElementById("ropeBase");
  var ropeTwist = document.getElementById("ropeTwist");
  var ropeNailRight = document.getElementById("nailRight");
  var galleryCounter = document.getElementById("galleryCounter");
  var ROPE_BASELINE = 22;
  var hangerState = {
    offset: 0, velocity: 0, isDragging: false, hasMoved: false, snapTarget: null,
    width: 0, step: 1, minOffset: 0, baseSag: 20, ropeSag: 20,
    dragStartX: 0, dragStartOffset: 0, lastPointerX: 0, lastPointerTime: 0, lastFrameTime: 0, frameId: 0, shownIndex: -1
  };
  var swingers = hangElements.map(function (element, index) {
    return { element: element, baseCenter: 0, angle: 0, angularVelocity: 0, stiffness: 0.08 + (index % 3) * 0.008 };
  });
  var justDragged = false;

  function clampOffset(value) { return Math.max(hangerState.minOffset, Math.min(0, value)); }
  function nearestSnap(value) { return clampOffset(-Math.round(-value / hangerState.step) * hangerState.step); }

  function layoutHanger() {
    var containerWidth = hanger.clientWidth;
    if (!containerWidth) return;
    var first = hangElements[0], second = hangElements[1], last = hangElements[hangElements.length - 1];
    hangerState.width = containerWidth;
    hangerState.step = (second ? second.offsetLeft - first.offsetLeft : first.offsetWidth) || 1;
    hangerState.minOffset = Math.min(0, containerWidth - (last.offsetLeft + last.offsetWidth));
    hangerState.baseSag = Math.max(14, Math.min(34, containerWidth * 0.035));
    hangerState.ropeSag = hangerState.baseSag;
    swingers.forEach(function (swinger) { swinger.baseCenter = swinger.element.offsetLeft + swinger.element.offsetWidth / 2; });
    ropeSvg.setAttribute("viewBox", "0 0 " + containerWidth + " 90");
    ropeNailRight.setAttribute("cx", containerWidth - 6);
    var ropePath = "M0 " + ROPE_BASELINE + " Q" + containerWidth / 2 + " " + (ROPE_BASELINE + 2 * hangerState.baseSag) + " " + containerWidth + " " + ROPE_BASELINE;
    ropeBase.setAttribute("d", ropePath);
    ropeTwist.setAttribute("d", ropePath);
    hangerState.offset = clampOffset(hangerState.offset);
    drawHanger();
  }

  function drawHanger() {
    var width = hangerState.width, sag = hangerState.ropeSag, offset = hangerState.offset;
    if (!width) return;
    hangerTrack.style.transform = "translate3d(" + offset.toFixed(2) + "px,0,0)";
    swingers.forEach(function (swinger) {
      var position = Math.max(0, Math.min(1, (swinger.baseCenter + offset) / width));
      var drop = 4 * sag * position * (1 - position);
      var ropeSlope = Math.atan(4 * sag * (1 - 2 * position) / width) * 57.2958 * 0.3;
      var swing = prefersReducedMotion ? 0 : swinger.angle;
      swinger.element.style.transform = "translate3d(0," + drop.toFixed(2) + "px,0) rotate(" + (ropeSlope + swing).toFixed(2) + "deg)";
    });
    var shownIndex = Math.min(hangElements.length - 1, Math.max(0, Math.round(-offset / hangerState.step)));
    if (shownIndex !== hangerState.shownIndex) {
      hangerState.shownIndex = shownIndex;
      galleryCounter.textContent = twoDigits(shownIndex + 1) + " / " + twoDigits(hangElements.length);
    }
  }

  function stepHanger(timestamp) {
    var state = hangerState;
    var frames = state.lastFrameTime ? Math.min(3, (timestamp - state.lastFrameTime) / 16.667) : 1;
    state.lastFrameTime = timestamp;
    if (!state.isDragging) {
      if (state.snapTarget !== null) {
        var gap = state.snapTarget - state.offset;
        var move = gap * (1 - Math.pow(0.88, frames));
        state.offset += move;
        state.velocity = move / frames;
        if (Math.abs(gap) < 0.3) { state.offset = state.snapTarget; state.snapTarget = null; state.velocity = 0; }
      } else {
        state.offset += state.velocity * frames;
        state.velocity *= Math.pow(0.94, frames);
        var clamped = clampOffset(state.offset);
        if (clamped !== state.offset) state.snapTarget = clamped;
        else if (Math.abs(state.velocity) < 0.4) state.snapTarget = nearestSnap(state.offset);
      }
    }
    var swingTarget = Math.max(-5, Math.min(5, state.velocity * 0.25));
    var isSwinging = false;
    swingers.forEach(function (swinger) {
      var acceleration = (swingTarget - swinger.angle) * swinger.stiffness - swinger.angularVelocity * 0.4;
      swinger.angularVelocity += acceleration * frames;
      swinger.angle += swinger.angularVelocity * frames;
      if (Math.abs(swinger.angle) > 0.05 || Math.abs(swinger.angularVelocity) > 0.05) isSwinging = true;
    });
    state.ropeSag = state.baseSag;
    drawHanger();
    var isActive = state.isDragging || state.snapTarget !== null || Math.abs(state.velocity) > 0.05 || isSwinging || Math.abs(state.ropeSag - state.baseSag) > 0.1;
    state.frameId = isActive ? requestAnimationFrame(stepHanger) : 0;
    if (!isActive) state.lastFrameTime = 0;
  }
  function wakeHanger() { if (!hangerState.frameId) hangerState.frameId = requestAnimationFrame(stepHanger); }

  function scrollGallery(direction) {
    var current = Math.round(-hangerState.offset / hangerState.step);
    var next = Math.max(0, Math.min(hangElements.length - 1, current + direction));
    hangerState.snapTarget = clampOffset(-next * hangerState.step);
    hangerState.velocity = 0;
    wakeHanger();
  }

  hanger.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    var state = hangerState;
    state.isDragging = true; state.hasMoved = false; state.snapTarget = null; state.velocity = 0;
    state.dragStartX = state.lastPointerX = event.clientX;
    state.dragStartOffset = state.offset;
    state.lastPointerTime = performance.now();
    wakeHanger();
  });
  hanger.addEventListener("pointermove", function (event) {
    var state = hangerState;
    if (!state.isDragging) return;
    var distance = event.clientX - state.dragStartX;
    if (!state.hasMoved && Math.abs(distance) > 6) {
      state.hasMoved = true;
      hanger.classList.add("dragging");
      try { hanger.setPointerCapture(event.pointerId); } catch (error) {}
    }
    if (!state.hasMoved) return;
    var wanted = state.dragStartOffset + distance;
    var limited = clampOffset(wanted);
    state.offset = limited + (wanted - limited) * 0.35;
    var now = performance.now();
    var instantVelocity = (event.clientX - state.lastPointerX) / Math.max(1, now - state.lastPointerTime) * 16.667;
    state.velocity = Math.max(-40, Math.min(40, state.velocity * 0.6 + instantVelocity * 0.4));
    state.lastPointerX = event.clientX;
    state.lastPointerTime = now;
    wakeHanger();
  });
  function endHangerDrag() {
    var state = hangerState;
    if (!state.isDragging) return;
    state.isDragging = false;
    hanger.classList.remove("dragging");
    if (performance.now() - state.lastPointerTime > 80) state.velocity = 0;
    if (state.hasMoved && Math.abs(state.velocity) < 3) {
      // A short, slow drag still moves to the next card instead of springing back
      var dragged = state.offset - state.dragStartOffset;
      var startIndex = Math.round(-state.dragStartOffset / state.step);
      var targetIndex = Math.abs(dragged) > state.step * 0.18 ? startIndex + (dragged < 0 ? 1 : -1) : startIndex;
      state.snapTarget = clampOffset(-Math.max(0, Math.min(hangElements.length - 1, targetIndex)) * state.step);
      state.velocity = 0;
    }
    if (state.hasMoved) { justDragged = true; setTimeout(function () { justDragged = false; }, 0); }
    wakeHanger();
  }
  hanger.addEventListener("pointerup", endHangerDrag);
  hanger.addEventListener("pointercancel", endHangerDrag);
  hanger.addEventListener("click", function (event) { if (justDragged) { event.preventDefault(); event.stopPropagation(); } }, true);
  hanger.addEventListener("wheel", function (event) {
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    hangerState.snapTarget = null;
    hangerState.offset = clampOffset(hangerState.offset - event.deltaX);
    hangerState.velocity = -event.deltaX * 0.5;
    wakeHanger();
  }, { passive: false });
  document.getElementById("galleryPrev").addEventListener("click", function () { scrollGallery(-1); });
  document.getElementById("galleryNext").addEventListener("click", function () { scrollGallery(1); });
  addEventListener("resize", throttleToFrame(layoutHanger));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layoutHanger);
  layoutHanger();

  // ---------- Full-screen slides ----------
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var slideIds = slides.map(function (slide) { return slide.id; });
  var navLinks = document.querySelectorAll("#menu a");
  var dotsContainer = document.getElementById("dots");
  var currentIndex = Math.max(0, slideIds.indexOf(location.hash.slice(1)));
  var isTransitioning = false, lastChangeTime = 0;
  var scenePoseListener = function () {};

  var dotButtons = slides.map(function (slide, index) {
    var button = document.createElement("button");
    button.type = "button";
    button.setAttribute("aria-label", slide.getAttribute("aria-label"));
    button.addEventListener("click", function () { goTo(index); });
    dotsContainer.appendChild(button);
    return button;
  });
  function updateNavigation() {
    dotButtons.forEach(function (button, index) { button.setAttribute("aria-current", index === currentIndex); });
    navLinks.forEach(function (link) { link.classList.toggle("active", link.getAttribute("href") === "#" + slideIds[currentIndex]); });
    slides.forEach(function (slide, index) { slide.classList.toggle("is-active", index === currentIndex); });
    isDemoSlideActive = slideIds[currentIndex] === "demos";
    if (isDemoSlideActive) showDemo(demoIndex); else clearTimeout(demoTimer);
    if (slideIds[currentIndex] === "projects") layoutHanger();
  }

  function revealItems(slide, animated) {
    if (!hasGsap) return;
    gsap.fromTo(slide.querySelectorAll(".rv"),
      { autoAlpha: 0, y: 20 },
      { autoAlpha: 1, y: 0, duration: animated ? 0.9 : 0, stagger: animated ? 0.07 : 0, delay: animated ? 0.5 : 0, ease: "power2.out", clearProps: "all" });
  }

  function goTo(nextIndex) {
    if (isTransitioning || nextIndex < 0 || nextIndex >= slides.length || nextIndex === currentIndex) return;
    isTransitioning = true;
    lastChangeTime = Date.now();
    var direction = nextIndex > currentIndex ? 1 : -1;
    var outgoing = slides[currentIndex], incoming = slides[nextIndex];
    outgoing.classList.add("is-leaving");
    incoming.scrollTop = 0;
    currentIndex = nextIndex;
    updateNavigation();
    scenePoseListener(nextIndex);
    try { history.replaceState(null, "", "#" + slideIds[nextIndex]); } catch (error) {}
    if (!hasGsap) {
      outgoing.style.visibility = "hidden"; outgoing.style.opacity = 0;
      incoming.style.visibility = "visible"; incoming.style.opacity = 1;
      outgoing.classList.remove("is-leaving");
      isTransitioning = false;
      return;
    }
    var duration = prefersReducedMotion ? 0 : 1.2;
    gsap.set(incoming, { yPercent: 8 * direction, scale: 1.02 });
    gsap.timeline({ onComplete: function () { gsap.set(outgoing, { autoAlpha: 0 }); outgoing.classList.remove("is-leaving"); isTransitioning = false; } })
      .to(outgoing, { autoAlpha: 0, yPercent: -8 * direction, duration: duration, ease: "power3.inOut" }, 0)
      .to(incoming, { autoAlpha: 1, yPercent: 0, scale: 1, duration: duration, ease: "power3.inOut" }, 0);
    revealItems(incoming, duration > 0);
  }

  // A slide taller than the screen scrolls first, then hands over to the next slide at its edge
  function isAtEdge(direction) {
    var slide = slides[currentIndex];
    return direction > 0 ? slide.scrollTop + slide.clientHeight >= slide.scrollHeight - 2 : slide.scrollTop <= 0;
  }
  addEventListener("wheel", function (event) {
    if (Math.abs(event.deltaY) < 20 || Math.abs(event.deltaX) > Math.abs(event.deltaY) || Date.now() - lastChangeTime < 1500) return;
    var direction = event.deltaY > 0 ? 1 : -1;
    if (isAtEdge(direction)) goTo(currentIndex + direction);
  }, { passive: true });

  var touchStartY = 0;
  addEventListener("touchstart", function (event) { touchStartY = event.touches[0].clientY; }, { passive: true });
  addEventListener("touchend", function (event) {
    var swipeDistance = touchStartY - event.changedTouches[0].clientY;
    if (Math.abs(swipeDistance) < 60 || Date.now() - lastChangeTime < 1500) return;
    var direction = swipeDistance > 0 ? 1 : -1;
    if (isAtEdge(direction)) goTo(currentIndex + direction);
  }, { passive: true });

  var directionByKey = { ArrowDown: 1, PageDown: 1, " ": 1, ArrowUp: -1, PageUp: -1 };
  addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      var sideways = event.key === "ArrowRight" ? 1 : -1;
      if (slideIds[currentIndex] === "projects") { event.preventDefault(); scrollGallery(sideways); }
      else if (slideIds[currentIndex] === "demos") { event.preventDefault(); showDemo((demoIndex + sideways + demos.length) % demos.length); }
      return;
    }
    var direction = directionByKey[event.key];
    if (!direction) return;
    if (event.key === " " && /^(BUTTON|A)$/.test(event.target.tagName)) return;
    event.preventDefault();
    if (isAtEdge(direction)) goTo(currentIndex + direction);
    else slides[currentIndex].scrollBy({ top: direction * innerHeight * 0.6, behavior: prefersReducedMotion ? "auto" : "smooth" });
  });

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      var targetIndex = slideIds.indexOf(link.getAttribute("href").slice(1));
      if (targetIndex < 0) return;
      event.preventDefault();
      menu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      goTo(targetIndex);
    });
  });

  if (hasGsap) {
    gsap.set(slides[currentIndex], { autoAlpha: 1 });
  } else {
    slides[currentIndex].style.visibility = "visible";
    slides[currentIndex].style.opacity = 1;
  }
  updateNavigation();

  // ---------- Loading screen: waits for fonts and page load, then reveals the hero ----------
  var loader = document.getElementById("loader");
  function startIntro() {
    if (hasGsap) revealItems(slides[currentIndex], !prefersReducedMotion);
    if (!prefersReducedMotion) playHeadline();
  }
  function whenPageReady() {
    var windowLoaded = document.readyState === "complete" ? Promise.resolve() : new Promise(function (resolve) { addEventListener("load", resolve, { once: true }); });
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    var minimumShowTime = wait(prefersReducedMotion ? 300 : 1600);
    return Promise.race([Promise.all([windowLoaded, fontsReady, minimumShowTime]), wait(5000)]);
  }
  if (loader) {
    whenPageReady()
      .then(function () { loader.classList.add("ready"); return wait(prefersReducedMotion ? 0 : 350); })
      .then(function () { loader.classList.add("done"); startIntro(); setTimeout(function () { loader.remove(); }, 1200); });
  } else { startIntro(); }

  // ---------- Glass spotlight and magnetic buttons ----------
  var updateSpotlight = throttleToFrame(function (event) {
    var panel = event.target.closest && event.target.closest(".card, .inventory li, .demo");
    if (!panel) return;
    var box = panel.getBoundingClientRect();
    panel.style.setProperty("--mx", event.clientX - box.left + "px");
    panel.style.setProperty("--my", event.clientY - box.top + "px");
  });
  document.addEventListener("pointermove", function (event) { if (event.pointerType === "mouse") updateSpotlight(event); });
  if (!prefersReducedMotion) {
    document.querySelectorAll(".btn").forEach(function (button) {
      button.addEventListener("pointermove", function (event) {
        var box = button.getBoundingClientRect();
        button.style.transform = "translate(" + (event.clientX - box.left - box.width / 2) * 0.15 + "px," + (event.clientY - box.top - box.height / 2) * 0.25 + "px)";
      });
      button.addEventListener("pointerleave", function () { button.style.transform = ""; });
    });
  }

  // ---------- Hero coordinates and switching typewriter headline ----------
  var hero = document.getElementById("top");
  var coordX = document.getElementById("coordX"), coordY = document.getElementById("coordY");
  function formatCoordinate(value) { return value.toFixed(1).padStart(5, "0"); }
  hero.addEventListener("pointermove", throttleToFrame(function (event) {
    coordX.textContent = "X / " + formatCoordinate(event.clientX / innerWidth * 200);
    coordY.textContent = "Y / " + formatCoordinate(event.clientY / innerHeight * 200);
  }));

  var typedWordElement = document.getElementById("typedWord");
  var headlineWords = ["smart software", "AI tools", "web apps", "mobile apps", "reliable backends"];
  async function playHeadline() {
    var wordIndex = 0;
    while (true) {
      await wait(2200);
      if (slideIds[currentIndex] !== "top") continue;
      var currentWord = headlineWords[wordIndex % headlineWords.length];
      for (var remaining = currentWord.length; remaining >= 0; remaining--) {
        typedWordElement.textContent = currentWord.slice(0, remaining);
        await wait(45);
      }
      await wait(300);
      wordIndex++;
      var nextWord = headlineWords[wordIndex % headlineWords.length];
      for (var typed = 1; typed <= nextWord.length; typed++) {
        typedWordElement.textContent = nextWord.slice(0, typed);
        await wait(85);
      }
    }
  }

  // ---------- Space scene: stars plus a neural network, an app phone, a data cube and a globe ----------
  if (!window.THREE) return;
  var canvas = document.getElementById("scene"), renderer;
  var isNarrowScreen = innerWidth < 860;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: !isNarrowScreen, alpha: true, powerPreference: isNarrowScreen ? "default" : "high-performance" }); }
  catch (error) { canvas.style.display = "none"; return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrowScreen ? 1.25 : 1.5));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 7;

  function makePositions(values) {
    var geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(values), 3));
    return geometry;
  }
  function makeLines(geometry) { return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ transparent: true })); }
  function makeDots(geometry, size) { return new THREE.Points(geometry, new THREE.PointsMaterial({ size: size, transparent: true, depthWrite: false })); }

  // Starfield
  var starCount = isNarrowScreen ? 600 : 1100;
  var starPositions = new Float32Array(starCount * 3), starColors = new Float32Array(starCount * 3);
  var starTints = [[1, 1, 1], [0.85, 0.78, 1], [1, 0.8, 0.9]];
  for (var starIndex = 0; starIndex < starCount; starIndex++) {
    starPositions[starIndex * 3] = (Math.random() - 0.5) * 70;
    starPositions[starIndex * 3 + 1] = (Math.random() - 0.5) * 44;
    starPositions[starIndex * 3 + 2] = -30 + Math.random() * 30;
    starColors.set(starTints[Math.floor(Math.random() * starTints.length)], starIndex * 3);
  }
  var starGeometry = makePositions(starPositions);
  starGeometry.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
  var starMaterial = new THREE.PointsMaterial({ size: 0.09, vertexColors: true, transparent: true, depthWrite: false });
  var stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // Scene objects: each has one pose per slide (intro, about, demos, projects, tools, contact)
  function pose(x, y, scale, fade) { return { x: x, y: y, scale: scale, fade: fade }; }
  var poseIndex = currentIndex;
  var sceneObjects = [], themedEntries = [];
  function createObject(poses) {
    var start = poses[poseIndex];
    var object = { group: new THREE.Group(), poses: poses, fade: start.fade, entries: [] };
    object.group.position.set(start.x, start.y, 0);
    object.group.scale.setScalar(start.scale);
    scene.add(object.group);
    sceneObjects.push(object);
    return object;
  }
  function attach(object, child, darkColor, lightColor, baseOpacity) {
    object.group.add(child);
    var entry = { material: child.material, darkColor: darkColor, lightColor: lightColor, baseOpacity: baseOpacity };
    object.entries.push(entry);
    themedEntries.push(entry);
    return child;
  }

  // Globe: wireframe shell with a dust cloud
  var globe = createObject([pose(3, 0.3, 1.35, 0.45), pose(0, -1, 0.4, 0.2), pose(-3.7, 1.2, 0.4, 0.25), pose(0, 0, 1, 0), pose(0, 0, 1, 0), pose(3.2, 0.4, 1.25, 0.3)]);
  var globeOuter = attach(globe, makeLines(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.9, 2))), 0xc4a8ff, 0x6d3fd1, 0.55);
  var globeInner = attach(globe, makeLines(new THREE.WireframeGeometry(new THREE.OctahedronGeometry(1.1, 1))), 0xf2a7d0, 0xc2437f, 0.4);
  var dustValues = [];
  for (var dustIndex = 0; dustIndex < 260; dustIndex++) {
    var dustRadius = 2.6 + Math.random() * 2.2, dustAngle = Math.random() * Math.PI * 2, dustTilt = Math.acos(2 * Math.random() - 1);
    dustValues.push(dustRadius * Math.sin(dustTilt) * Math.cos(dustAngle), dustRadius * Math.sin(dustTilt) * Math.sin(dustAngle), dustRadius * Math.cos(dustTilt));
  }
  var globeDust = attach(globe, makeDots(makePositions(dustValues), 0.035), 0xe4d6ff, 0x6d3fd1, 0.8);

  // Neural network: layers of nodes, connecting edges and glowing signals travelling along them
  var network = createObject([pose(3, 0.3, 1, 1), pose(0, 0, 1, 0), pose(3.7, 1.3, 0.5, 0.5), pose(3.8, 1.3, 0.45, 0.4), pose(-3.6, -0.4, 0.5, 0.45), pose(3.2, 0.4, 0.9, 0.6)]);
  var layerSizes = [3, 5, 5, 3], nodePositions = [], nodeLayers = [];
  layerSizes.forEach(function (size, layerIndex) {
    for (var nodeIndex = 0; nodeIndex < size; nodeIndex++) {
      nodePositions.push([-1.8 + layerIndex * 1.2, (nodeIndex - (size - 1) / 2) * 0.62, Math.sin(layerIndex * 3 + nodeIndex * 5) * 0.25]);
      nodeLayers.push(layerIndex);
    }
  });
  var edgeList = [], edgeValues = [];
  nodePositions.forEach(function (from, fromIndex) {
    nodePositions.forEach(function (to, toIndex) {
      if (nodeLayers[toIndex] === nodeLayers[fromIndex] + 1) { edgeList.push([fromIndex, toIndex]); edgeValues.push(from[0], from[1], from[2], to[0], to[1], to[2]); }
    });
  });
  attach(network, makeLines(makePositions(edgeValues)), 0xc4a8ff, 0x6d3fd1, 0.35);
  attach(network, makeDots(makePositions([].concat.apply([], nodePositions)), 0.17), 0xf2a7d0, 0xc2437f, 0.95);
  var signalGeometry = makePositions(new Array(30).fill(0));
  attach(network, makeDots(signalGeometry, 0.14), 0xffffff, 0x1a1230, 1);
  var signals = [];
  for (var signalIndex = 0; signalIndex < 10; signalIndex++) signals.push({ edge: Math.floor(Math.random() * edgeList.length), progress: Math.random() });
  function updateSignals() {
    var positionAttribute = signalGeometry.attributes.position;
    signals.forEach(function (signal, index) {
      signal.progress += 0.012;
      if (signal.progress >= 1) { signal.progress = 0; signal.edge = Math.floor(Math.random() * edgeList.length); }
      var from = nodePositions[edgeList[signal.edge][0]], to = nodePositions[edgeList[signal.edge][1]];
      positionAttribute.setXYZ(index, from[0] + (to[0] - from[0]) * signal.progress, from[1] + (to[1] - from[1]) * signal.progress, from[2] + (to[2] - from[2]) * signal.progress);
    });
    positionAttribute.needsUpdate = true;
  }

  // App phone: device outline, screen, UI lines and floating interface cards
  var phone = createObject([pose(0, 0, 1, 0), pose(3.6, -0.2, 0.7, 0.55), pose(0, 0, 1, 0), pose(0, 0, 1, 0), pose(0, 0, 1, 0), pose(-3.4, -0.6, 0.6, 0.35)]);
  attach(phone, makeLines(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, 2.3, 0.14))), 0xf2a7d0, 0xc2437f, 0.8);
  attach(phone, makeLines(new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 2))), 0xc4a8ff, 0x6d3fd1, 0.6).position.z = 0.075;
  attach(phone, makeLines(makePositions([-0.35, 0.6, 0.08, 0.35, 0.6, 0.08, -0.35, 0.3, 0.08, 0.2, 0.3, 0.08, -0.35, -0.5, 0.08, 0.35, -0.5, 0.08])), 0xf2a7d0, 0xc2437f, 0.6);
  var floatingCards = [[0.95, 0.7, 0.5, 0.7, 0.36], [-1, 0.05, 0.75, 0.62, 0.4], [0.9, -0.75, 0.6, 0.7, 0.3]].map(function (spec) {
    var card = attach(phone, makeLines(new THREE.EdgesGeometry(new THREE.PlaneGeometry(spec[3], spec[4]))), 0xc4a8ff, 0x6d3fd1, 0.7);
    card.position.set(spec[0], spec[1], spec[2]);
    card.userData.baseY = spec[1];
    return card;
  });

  // Data cube: a 3D lattice like a tensor in machine learning
  var tensor = createObject([pose(0, 0, 1, 0), pose(-3.5, 0.6, 0.7, 0.6), pose(0, 0, 1, 0), pose(-3.8, 1.4, 0.45, 0.45), pose(3.6, 0.6, 0.5, 0.5), pose(0, 0, 1, 0)]);
  var latticeLines = [], latticePoints = [];
  for (var a = 0; a < 4; a++) {
    for (var b = 0; b < 4; b++) {
      var u = (a - 1.5) * 0.5, v = (b - 1.5) * 0.5;
      latticeLines.push(-0.75, u, v, 0.75, u, v, u, -0.75, v, u, 0.75, v, u, v, -0.75, u, v, 0.75);
      for (var c = 0; c < 4; c++) latticePoints.push((c - 1.5) * 0.5, u, v);
    }
  }
  attach(tensor, makeLines(makePositions(latticeLines)), 0xc4a8ff, 0x6d3fd1, 0.4);
  attach(tensor, makeDots(makePositions(latticePoints), 0.1), 0xf2a7d0, 0xc2437f, 0.9);

  // Intro slide: the featured object changes over time (network, phone, data cube, globe)
  var heroRotation = [network, phone, tensor, globe];
  var heroScales = [1, 1.1, 1.3];
  var heroIndex = 0;
  heroRotation.forEach(function (object, index) {
    object.heroPoses = object === globe
      ? { on: pose(3, 0.3, 1.35, 0.85), off: pose(3, 0.3, 1.35, 0.3) }
      : { on: pose(3, 0.3, heroScales[index], 1), off: pose(3, 0.3, heroScales[index], 0) };
  });
  function getPose(object) {
    if (poseIndex !== 0) return object.poses[poseIndex];
    return heroRotation[heroIndex] === object ? object.heroPoses.on : object.heroPoses.off;
  }
  if (!prefersReducedMotion) {
    setInterval(function () { if (poseIndex === 0 && !document.hidden) heroIndex = (heroIndex + 1) % heroRotation.length; }, 6500);
  }

  function applySceneTheme(theme) {
    var isDark = theme === "dark";
    themedEntries.forEach(function (entry) { entry.material.color.set(isDark ? entry.darkColor : entry.lightColor); });
    starMaterial.color.set(isDark ? 0xffffff : 0x6d3fd1);
    starMaterial.opacity = isDark ? 0.9 : 0.5;
  }
  themeListeners.push(applySceneTheme);
  applySceneTheme(currentTheme());

  var mouseX = 0, mouseY = 0;
  var followSpeed = prefersReducedMotion ? 1 : 0.04;
  scenePoseListener = function (index) { poseIndex = index; if (prefersReducedMotion) drawFrame(0); };
  addEventListener("pointermove", function (event) { mouseX = event.clientX / innerWidth - 0.5; mouseY = event.clientY / innerHeight - 0.5; });

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    isNarrowScreen = innerWidth < 860;
    drawFrame(0);
  }
  addEventListener("resize", throttleToFrame(resize));

  function drawFrame(timestamp) {
    var time = timestamp / 1000;
    var strongestFade = 0;
    sceneObjects.forEach(function (object) { strongestFade = Math.max(strongestFade, getPose(object).fade); });
    sceneObjects.forEach(function (object) {
      var target = getPose(object);
      // On phones only the main object of each slide is shown, centred above the content
      var isShown = !isNarrowScreen || target.fade === strongestFade;
      var targetFade = isShown ? target.fade * (isNarrowScreen ? 0.65 : 1) : 0;
      var targetX = isNarrowScreen ? 0 : target.x, targetY = isNarrowScreen ? 1.9 : target.y;
      var targetScale = target.scale * (isNarrowScreen ? 0.55 : 1);
      object.group.position.x += (targetX - object.group.position.x) * followSpeed;
      object.group.position.y += (targetY - object.group.position.y) * followSpeed;
      object.group.scale.setScalar(object.group.scale.x + (targetScale - object.group.scale.x) * followSpeed);
      object.fade += (targetFade - object.fade) * followSpeed;
      object.group.visible = object.fade > 0.01;
      object.entries.forEach(function (entry) { entry.material.opacity = entry.baseOpacity * object.fade; });
    });
    globe.group.rotation.y += (mouseX * 1.2 - globe.group.rotation.y) * 0.05;
    globe.group.rotation.x += (mouseY * 0.8 - globe.group.rotation.x) * 0.05;
    network.group.rotation.y += (Math.sin(time * 0.35) * 0.4 + mouseX * 0.9 - network.group.rotation.y) * 0.05;
    network.group.rotation.x += (mouseY * 0.5 - network.group.rotation.x) * 0.05;
    phone.group.rotation.y += (Math.sin(time * 0.45) * 0.55 + mouseX * 0.9 - phone.group.rotation.y) * 0.05;
    phone.group.rotation.x += (mouseY * 0.4 - phone.group.rotation.x) * 0.05;
    floatingCards.forEach(function (card, index) { card.position.y = card.userData.baseY + Math.sin(time * 1.2 + index * 2) * 0.08; });
    tensor.group.rotation.z += (mouseX * 0.4 - tensor.group.rotation.z) * 0.05;
    stars.position.x += (-mouseX * 1.6 - stars.position.x) * 0.03;
    stars.position.y += (mouseY * 1.0 - stars.position.y) * 0.03;
    renderer.render(scene, camera);
  }
  // Adaptive quality: if frames run slow, lower the pixel ratio first, then thin out the stars and dust
  var qualityLevel = 0, measuredFrames = 0, measuredTime = 0, previousTimestamp = 0;
  function adaptQuality(timestamp) {
    var frameTime = timestamp - previousTimestamp;
    previousTimestamp = timestamp;
    if (frameTime <= 0 || frameTime > 200) return;
    measuredTime += frameTime;
    measuredFrames++;
    if (measuredFrames < 120) return;
    var averageFrameTime = measuredTime / measuredFrames;
    measuredFrames = 0;
    measuredTime = 0;
    if (averageFrameTime < 26 || qualityLevel >= 2) return;
    qualityLevel++;
    if (qualityLevel === 1) { renderer.setPixelRatio(1); resize(); }
    else { starGeometry.setDrawRange(0, Math.floor(starCount / 2)); globeDust.visible = false; }
  }
  function animate(timestamp) {
    adaptQuality(timestamp);
    globeOuter.rotation.y += 0.002;
    globeInner.rotation.y -= 0.004;
    tensor.group.rotation.y += 0.004;
    tensor.group.rotation.x += 0.0025;
    stars.rotation.y += 0.00025;
    updateSignals();
    drawFrame(timestamp);
    requestAnimationFrame(animate);
  }
  resize();
  if (!prefersReducedMotion) requestAnimationFrame(animate);
})();
