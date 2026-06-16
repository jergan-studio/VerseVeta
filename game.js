const engine = Matter.Engine.create();
const world = engine.world;

const render = Matter.Render.create({
    element: document.body,
    engine: engine,
    options:{
        width:window.innerWidth,
        height:window.innerHeight,
        wireframes:false,
        background:"#87CEEB"
    }
});

Matter.Render.run(render);
Matter.Runner.run(Matter.Runner.create(), engine);

// ground
const ground = Matter.Bodies.rectangle(
    window.innerWidth/2,
    window.innerHeight-20,
    window.innerWidth,
    40,
    {isStatic:true}
);

Matter.World.add(world,ground);

// mouse drag
const mouse = Matter.Mouse.create(render.canvas);
const mouseConstraint = Matter.MouseConstraint.create(engine,{mouse});
Matter.World.add(world,mouseConstraint);

// storage
let objects = [];
let joints = [];
let player = null;

/* ======================
   BASIC SHAPES
====================== */

function spawnBox(){
    const b = Matter.Bodies.rectangle(300,100,60,60);
    Matter.World.add(world,b);
    objects.push(b);
}

function spawnCircle(){
    const c = Matter.Bodies.circle(300,100,30);
    Matter.World.add(world,c);
    objects.push(c);
}

/* ======================
   VERITY (RAGDOLL)
====================== */

function spawnVerity(){

    const head = Matter.Bodies.circle(300,100,20);
    const torso = Matter.Bodies.rectangle(300,160,40,60);

    const armL = Matter.Bodies.rectangle(260,160,15,50);
    const armR = Matter.Bodies.rectangle(340,160,15,50);

    const legL = Matter.Bodies.rectangle(280,220,15,60);
    const legR = Matter.Bodies.rectangle(320,220,15,60);

    const parts = [head,torso,armL,armR,legL,legR];

    Matter.World.add(world,parts);

    function link(a,b){
        const c = Matter.Constraint.create({
            bodyA:a,
            bodyB:b,
            stiffness:0.6
        });
        Matter.World.add(world,c);
        joints.push(c);
    }

    link(head,torso);
    link(torso,armL);
    link(torso,armR);
    link(torso,legL);
    link(torso,legR);

    player = {head,torso,parts};
}

/* ======================
   WEAPONS
====================== */

let gunMode = false;

function giveGun(){
    gunMode = true;
}

/* shoot physics bullet */
document.addEventListener("click",(e)=>{

    if(!gunMode) return;

    const bullet = Matter.Bodies.circle(
        e.clientX,
        e.clientY,
        8,
        {density:0.01}
    );

    Matter.World.add(world,bullet);

    Matter.Body.applyForce(bullet,bullet.position,{
        x:0.05,
        y:-0.02
    });

    setTimeout(()=>{
        Matter.World.remove(world,bullet);
    },3000);
});

/* ======================
   EXPLOSION WEAPON
====================== */

function explode(){

    const x = window.innerWidth/2;
    const y = window.innerHeight/2;

    world.bodies.forEach(b=>{

        if(b.isStatic) return;

        const dx = b.position.x - x;
        const dy = b.position.y - y;

        const dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < 200){

            Matter.Body.applyForce(b,b.position,{
                x:dx * 0.0005,
                y:dy * 0.0005
            });
        }
    });
}
