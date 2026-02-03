console.log("Cybertoon OS initialisé");

const icons = document.querySelectorAll(".icon");
const windows = document.querySelectorAll(".window");
let highestZ = 10;

const clickSound = document.getElementById("sound-click");
const openSound = document.getElementById("sound-open");

function play(sound, max = null) {
    sound.currentTime = 0;
    sound.play();
    if (max) setTimeout(() => sound.pause(), max);
}

/* =======================
   Typing Effect
======================= */
function typeText(container, speed = 12) {
    const originalHTML = container.innerHTML;
    container.innerHTML = "";

    let i = 0;
    let isInTag = false;
    let tagBuffer = "";
    let textBuffer = "";

    const cursor = document.createElement("span");
    cursor.className = "cursor";
    cursor.textContent = "▍";
    container.appendChild(cursor);

    const interval = setInterval(() => {
        if (i >= originalHTML.length) {
            clearInterval(interval);
            cursor.remove();
            return;
        }

        const char = originalHTML[i];
        
        if (char === '<') {
            isInTag = true;
            tagBuffer += char;
        } else if (char === '>') {
            tagBuffer += char;
            isInTag = false;
            // Ajouter la balise complète d'un coup
            textBuffer += tagBuffer;
            tagBuffer = "";
        } else if (isInTag) {
            tagBuffer += char;
        } else {
            textBuffer += char;
        }
        
        // Si on n'est pas dans une balise et qu'on a du texte à afficher
        if (!isInTag && textBuffer.length > 0) {
            // Afficher le texte caractère par caractère
            if (textBuffer.length > 1) {
                cursor.insertAdjacentHTML("beforebegin", textBuffer.charAt(0));
                textBuffer = textBuffer.substring(1);
            } else {
                cursor.insertAdjacentHTML("beforebegin", textBuffer);
                textBuffer = "";
            }
        }
        
        i++;
        
        // Quand on arrive à la fin, afficher tout ce qui reste
        if (i >= originalHTML.length) {
            clearInterval(interval);
            cursor.remove();
            // Restaurer le HTML original pour que les balises fonctionnent
            container.innerHTML = originalHTML;
        }
    }, speed);
}

/* =======================
   Horloge
======================= */
function updateClock() {
    const clock = document.getElementById("clock");
    const d = new Date();
    clock.textContent =
        String(d.getHours()).padStart(2, "0") + ":" +
        String(d.getMinutes()).padStart(2, "0");
}
setInterval(updateClock, 1000);
updateClock();

/* =======================
   Fenêtres
======================= */
icons.forEach(icon => {
    icon.addEventListener("click", () => {
        play(openSound, 300);

        const app = icon.dataset.app;
        const win = document.getElementById(`window-${app}`);
        const content = win.querySelector(".window-content");

        win.style.display = "flex";
        win.style.zIndex = ++highestZ;

        gsap.fromTo(win,
            { opacity: 0, scale: 0.7, y: 20 },
            { opacity: 1, scale: 1, y: 0, duration: 0.6 }
        );

        // Vérifier si l'animation a déjà été jouée
        if (content.getAttribute("data-typed") === "false") {
            typeText(content);
            content.setAttribute("data-typed", "true");
        }
    });
});

/* =======================
   Fermeture
======================= */
document.querySelectorAll(".close-btn").forEach(btn => {
    btn.addEventListener("click", e => {
        play(clickSound, 200);
        const win = e.target.closest(".window");
        win.style.display = "none";
        // Réinitialiser l'attribut data-typed pour pouvoir rejouer l'animation
        win.querySelector(".window-content").setAttribute("data-typed", "false");
    });
});

/* =======================
   Avatar animation
======================= */
gsap.to("#avatar", {
    y: "-=12",
    duration: 1.4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut"
});

/* =======================
/* =========================
   Starry Sky + Shooting Star
========================= */

const canvas = document.getElementById("stars-canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ===== ÉTOILES FIXES QUI SCINTILLENT ===== */

const stars = [];
const STAR_COUNT = 180;

for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.5 + 0.3,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005
    });
}

function drawStars() {
    stars.forEach(star => {
        star.opacity += star.twinkleSpeed;
        if (star.opacity <= 0 || star.opacity >= 1) {
            star.twinkleSpeed *= -1;
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
    });
}

/* ===== ÉTOILE FILANTE ===== */

/* ===== ÉTOILE FILANTE RÉALISTE ===== */

let shootingStar = null;

function createShootingStar() {
    const startX = Math.random() * canvas.width * 0.2;
    const startY = Math.random() * canvas.height * 0.3;

    shootingStar = {
        x: startX,
        y: startY,
        vx: Math.random() * 14 + 10,
        vy: Math.random() * 8 + 6,
        life: 1,
        trail: []
    };
}

function drawShootingStar() {
    if (!shootingStar) return;

    // Ajouter position à la traînée
    shootingStar.trail.push({
        x: shootingStar.x,
        y: shootingStar.y,
        life: shootingStar.life
    });

    if (shootingStar.trail.length > 25) {
        shootingStar.trail.shift();
    }

    // Dessiner la traînée (dégradé)
    for (let i = 0; i < shootingStar.trail.length; i++) {
        const t = shootingStar.trail[i];
        const alpha = i / shootingStar.trail.length;

        ctx.beginPath();
        ctx.arc(t.x, t.y, 1.5 + alpha * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180,2202,255,${alpha * 0.6})`;
        ctx.fill();
    }

    // Tête lumineuse
    ctx.beginPath();
    ctx.arc(shootingStar.x, shootingStar.y, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.shadowBlur = 25;
    ctx.shadowColor = "#9eefff";
    ctx.fill();
    ctx.shadowBlur = 0;

    // Mouvement
    shootingStar.x += shootingStar.vx;
    shootingStar.y += shootingStar.vy;
    shootingStar.life -= 0.02;

    if (
        shootingStar.life <= 0 ||
        shootingStar.x > canvas.width ||
        shootingStar.y > canvas.height
    ) {
        shootingStar = null;
    }
}

/* ===== ANIMATION PRINCIPALE ===== */

function animateSky() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawStars();
    drawShootingStar();

    requestAnimationFrame(animateSky);
}

animateSky();

/* ===== ÉTOILE FILANTE OCCASIONNELLE ===== */

setInterval(() => {
    if (!shootingStar && Math.random() > 0.85) {
        createShootingStar();
    }
}, 4000);

/* =======================
   DRAG DES FENÊTRES
======================= */

windows.forEach(win => {
    const header = win.querySelector(".window-header");
    if (!header) return;

    header.addEventListener("mousedown", (e) => {
        win.style.zIndex = ++highestZ;

        const rect = win.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;

        function move(e) {
            win.style.left = e.clientX - offsetX + "px";
            win.style.top = e.clientY - offsetY + "px";
        }

        document.addEventListener("mousemove", move);

        document.addEventListener("mouseup", () => {
            document.removeEventListener("mousemove", move);
        }, { once: true });
    });
});
