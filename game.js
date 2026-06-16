const engine = Matter.Engine.create();
const world = engine.world;

/* =========================
   RENDER
========================= */

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
    {
        isStatic: true,
        render: { fillStyle: "#444" }
    }
);

Matter.World.add(world, floor);

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
   STORAGE
========================= */

let chips = [];
let gunMode = false;

/* =========================
   SHAPES
========================= */

function spawnBox() {
    const box = Matter.Bodies.rectangle(300, 100, 60, 60, {
        render: { fillStyle: "#777" }
    });

    Matter.World.add(world, box);
}

function spawnCircle() {
    const circle = Matter.Bodies.circle(300, 100, 30, {
        render: { fillStyle: "#4aa3ff" }
    });

    Matter.World.add(world, circle);
}

/* =========================
   VERITY RAGDOLL
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

function explosion(x, y, power = 100) {

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
    explosion(window.innerWidth / 2, window.innerHeight / 2, 120);
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
   CHIPS SYSTEM
========================= */

function spawnVelocityChip() {

    const chip = Matter.Bodies.rectangle(300, 100, 80, 40, {
        render: { fillStyle: "lime" }
    });

    Matter.World.add(world, chip);

    Matter.Body.setVelocity(chip, { x: 5, y: 0 });

    chips.push(chip);
}

function spawnJVSChip() {

    const chip = Matter.Bodies.rectangle(300, 100, 100, 50, {
        render: { fillStyle: "orange" }
    });

    Matter.World.add(world, chip);

    runJVS(`
velocity 4 0
say Hello Verseveta
`, chip);
}

/* =========================
   JVS ENGINE
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

        if (line.startsWith("force")) {

            const [, x, y] = line.split(" ");

            Matter.Body.applyForce(body, body.position, {
                x: Number(x),
                y: Number(y)
            });
        }

        if (line.startsWith("explode")) {
            explosion(body.position.x, body.position.y, 100);
        }

        if (line.startsWith("say")) {
            console.log("[JVS]", line.replace("say", "").trim());
        }
    }
}

/* =========================
   IMPORTANT FIX (GLOBAL ACCESS)
========================= */

window.spawnBox = spawnBox;
window.spawnCircle = spawnCircle;
window.spawnVerity = spawnVerity;
window.spawnVelocityChip = spawnVelocityChip;
window.spawnJVSChip = spawnJVSChip;
window.giveGun = giveGun;
window.explode = explode;
