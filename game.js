
/* =========================
   ENGINE
========================= */

const engine = Matter.Engine.create();
const world = engine.world;

const render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "#87CEEB"
    }
});

Matter.Render.run(render);
Matter.Runner.run(Matter.Runner.create(), engine);

/* =========================
   FLOOR
========================= */

const floor = Matter.Bodies.rectangle(
    window.innerWidth / 2,
    window.innerHeight - 10,
    window.innerWidth,
    50,
    { isStatic: true, render: { fillStyle: "#444" } }
);

Matter.World.add(world, floor);

/* =========================
   STORAGE
========================= */

let chips = [];
let selectedChip = null;
let gunMode = false;

/* =========================
   MOUSE DRAG
========================= */

const mouse = Matter.Mouse.create(render.canvas);

const mouseConstraint = Matter.MouseConstraint.create(engine, {
    mouse,
    constraint: {
        stiffness: 0.2,
        render: { visible: false }
    }
});

Matter.World.add(world, mouseConstraint);

/* =========================
   BASIC OBJECTS
========================= */

function spawnBox() {
    Matter.World.add(world,
        Matter.Bodies.rectangle(300, 100, 60, 60, {
            render: { fillStyle: "#777" }
        })
    );
}

function spawnCircle() {
    Matter.World.add(world,
        Matter.Bodies.circle(300, 100, 30, {
            render: { fillStyle: "#4aa3ff" }
        })
    );
}

/* =========================
   VERITY
========================= */

function spawnVerity() {

    const y = window.innerHeight - 200;

    const head = Matter.Bodies.circle(300, y, 18, { render: { fillStyle: "yellow" } });
    const torso = Matter.Bodies.rectangle(300, y + 60, 40, 60);

    const armL = Matter.Bodies.rectangle(260, y + 60, 15, 50);
    const armR = Matter.Bodies.rectangle(340, y + 60, 15, 50);

    const legL = Matter.Bodies.rectangle(280, y + 130, 15, 60);
    const legR = Matter.Bodies.rectangle(320, y + 130, 15, 60);

    const parts = [head, torso, armL, armR, legL, legR];

    Matter.World.add(world, parts);

    function link(a, b) {
        Matter.World.add(world, Matter.Constraint.create({
            bodyA: a,
            bodyB: b,
            stiffness: 0.7
        }));
    }

    link(head, torso);
    link(torso, armL);
    link(torso, armR);
    link(torso, legL);
    link(torso, legR);
}

/* =========================
   EXPLOSION
========================= */

function explosion(x, y, power = 120) {

    world.bodies.forEach(b => {

        if (b.isStatic) return;

        const dx = b.position.x - x;
        const dy = b.position.y - y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200 && dist > 0) {

            const force = power * 0.0005;

            Matter.Body.applyForce(b, b.position, {
                x: (dx / dist) * force,
                y: (dy / dist) * force
            });
        }
    });
}

function explode() {
    explosion(innerWidth / 2, innerHeight / 2);
}

/* =========================
   GUN
========================= */

function giveGun() {
    gunMode = true;
}

document.addEventListener("click", (e) => {

    if (!gunMode) return;

    const bullet = Matter.Bodies.circle(e.clientX, e.clientY, 6, {
        density: 0.01,
        frictionAir: 0.02,
        render: { fillStyle: "black" }
    });

    Matter.World.add(world, bullet);

    Matter.Body.applyForce(bullet, bullet.position, {
        x: 0.03,
        y: -0.02
    });

    setTimeout(() => {
        Matter.World.remove(world, bullet);
    }, 3000);
});

/* =========================
   CHIPS
========================= */

function spawnVelocityChip() {

    const chip = Matter.Bodies.rectangle(300, 200, 80, 40, {
        render: { fillStyle: "lime" }
    });

    chip.isChip = true;
    chip.code = "velocity 5 0";

    Matter.World.add(world, chip);
    chips.push(chip);
}

function spawnJVSChip() {

    const chip = Matter.Bodies.rectangle(350, 200, 100, 50, {
        render: { fillStyle: "orange" }
    });

    chip.isChip = true;
    chip.code = `
velocity 3 0
say hello
`;

    Matter.World.add(world, chip);
    chips.push(chip);
}

/* =========================
   CHIP MENU
========================= */

const menu = document.getElementById("chipMenu");
const editor = document.getElementById("chipEditor");

/* SELECT */
document.addEventListener("mousedown", (e) => {

    const mouse = { x: e.clientX, y: e.clientY };

    const found = Matter.Query.point(chips, mouse);

    if (found.length > 0) {
        selectedChip = found[0];
    }
});

/* RIGHT CLICK */
document.addEventListener("contextmenu", (e) => {

    e.preventDefault();

    const mouse = { x: e.clientX, y: e.clientY };

    const found = Matter.Query.point(chips, mouse);

    if (found.length > 0) {

        selectedChip = found[0];

        menu.style.left = e.clientX + "px";
        menu.style.top = e.clientY + "px";
        menu.classList.remove("hidden");

    } else {
        menu.classList.add("hidden");
    }
});

/* =========================
   MENU ACTIONS
========================= */

function debugChip() {
    if (!selectedChip) return;
    alert(selectedChip.code);
}

function editChip() {
    if (!selectedChip) return;

    editor.classList.remove("hidden");
    editor.value = selectedChip.code;
}

editor.addEventListener("keydown", (e) => {

    if (e.key === "Enter" && e.ctrlKey && selectedChip) {

        selectedChip.code = editor.value;
        editor.classList.add("hidden");
    }
});

function deleteChip() {

    if (!selectedChip) return;

    Matter.World.remove(world, selectedChip);

    chips = chips.filter(c => c !== selectedChip);

    selectedChip = null;

    menu.classList.add("hidden");
}

/* =========================
   RUN CHIP
========================= */

function runJVS(code, body) {

    const lines = code.split("\n");

    for (let line of lines) {

        line = line.trim();

        if (line.startsWith("velocity")) {

            const [, x, y] = line.split(" ");

            Matter.Body.setVelocity(body, {
                x: Number(x),
                y: Number(y)
            });
        }

        if (line.startsWith("say")) {
            console.log("[JVS]", line.replace("say", ""));
        }

        if (line.startsWith("explode")) {
            explosion(body.position.x, body.position.y);
        }
    }
}

function runChip() {

    if (!selectedChip) return;

    runJVS(selectedChip.code, selectedChip);
}

/* =========================
   GLOBAL EXPORT
========================= */

window.spawnBox = spawnBox;
window.spawnCircle = spawnCircle;
window.spawnVerity = spawnVerity;
window.spawnVelocityChip = spawnVelocityChip;
window.spawnJVSChip = spawnJVSChip;
window.giveGun = giveGun;
window.explode = explode;
window.runChip = runChip;
window.debugChip = debugChip;
window.editChip = editChip;
window.deleteChip = deleteChip;
