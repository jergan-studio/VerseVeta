
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
   WORLD BOUNDS (FLOOR + WALLS)
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

const leftWall = Matter.Bodies.rectangle(
    -25,
    window.innerHeight / 2,
    50,
    window.innerHeight,
    { isStatic: true }
);

const rightWall = Matter.Bodies.rectangle(
    window.innerWidth + 25,
    window.innerHeight / 2,
    50,
    window.innerHeight,
    { isStatic: true }
);

const ceiling = Matter.Bodies.rectangle(
    window.innerWidth / 2,
    -25,
    window.innerWidth,
    50,
    { isStatic: true }
);

Matter.World.add(world, [floor, leftWall, rightWall, ceiling]);

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

let objects = [];
let player = null;
let gunMode = false;

/* =========================
   BASIC SHAPES
========================= */

function spawnBox() {
    const box = Matter.Bodies.rectangle(300, 100, 60, 60, {
        render: { fillStyle: "#777" }
    });

    Matter.World.add(world, box);
    objects.push(box);
}

function spawnCircle() {
    const circle = Matter.Bodies.circle(300, 100, 30, {
        render: { fillStyle: "#4aa3ff" }
    });

    Matter.World.add(world, circle);
    objects.push(circle);
}

/* =========================
   VERITY RAGDOLL
========================= */

function spawnVerity() {

    const head = Matter.Bodies.circle(300, 100, 18, {
        render: { fillStyle: "yellow" }
    });

    const torso = Matter.Bodies.rectangle(300, 160, 40, 60, {
        render: { fillStyle: "#ffcc00" }
    });

    const armL = Matter.Bodies.rectangle(260, 160, 15, 50);
    const armR = Matter.Bodies.rectangle(340, 160, 15, 50);

    const legL = Matter.Bodies.rectangle(280, 220, 15, 60);
    const legR = Matter.Bodies.rectangle(320, 220, 15, 60);

    const parts = [head, torso, armL, armR, legL, legR];

    Matter.World.add(world, parts);

    function link(a, b) {
        const constraint = Matter.Constraint.create({
            bodyA: a,
            bodyB: b,
            stiffness: 0.7,
            length: 2
        });

        Matter.World.add(world, constraint);
    }

    link(head, torso);
    link(torso, armL);
    link(torso, armR);
    link(torso, legL);
    link(torso, legR);

    player = { head, torso, parts };
}

/* =========================
   GUN SYSTEM
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
   EXPLOSION SYSTEM
========================= */

function explosion(x, y, power) {

    world.bodies.forEach(b => {

        if (b.isStatic) return;

        const dx = b.position.x - x;
        const dy = b.position.y - y;

        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 200) {

            const force = (power || 50) * 0.0005;

            Matter.Body.applyForce(b, b.position, {
                x: (dx / dist) * force,
                y: (dy / dist) * force
            });
        }
    });
}

function explode() {
    explosion(window.innerWidth / 2, window.innerHeight / 2, 100);
}

/* =========================
   RESIZE HANDLING
========================= */

window.addEventListener("resize", () => {
    location.reload(); // simple prototype fix
});
