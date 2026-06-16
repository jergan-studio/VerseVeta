/* =========================
   Verseveta JVS Engine
   Simple sandbox scripting
========================= */

let JVS_GLOBALS = {
    clickEnabled: false,
    worldRef: null,
    engineRef: null
};

/* attach engine/world */
function initJVS(world, engine){
    JVS_GLOBALS.worldRef = world;
    JVS_GLOBALS.engineRef = engine;
}

/* =========================
   MAIN RUNNER
========================= */

function runJVS(code, body){

    const lines = code.split("\n").map(l => l.trim());

    let i = 0;

    while(i < lines.length){

        const line = lines[i];

        /* =====================
           MOVEMENT
        ===================== */

        if(line.startsWith("velocity")){

            const [,x,y] = line.split(" ");

            Matter.Body.setVelocity(body,{
                x:Number(x),
                y:Number(y)
            });
        }

        if(line.startsWith("force")){

            const [,x,y] = line.split(" ");

            Matter.Body.applyForce(body, body.position, {
                x:Number(x),
                y:Number(y)
            });
        }

        /* =====================
           EXPLOSION
        ===================== */

        if(line.startsWith("explode")){

            const [,power] = line.split(" ");

            explosion(
                body.position.x,
                body.position.y,
                Number(power || 50)
            );
        }

        /* =====================
           SAY (debug text)
        ===================== */

        if(line.startsWith("say")){

            const msg = line.replace("say","").trim();
            console.log("[JVS SAY]", msg);
        }

        /* =====================
           SPAWN OBJECTS
        ===================== */

        if(line.startsWith("spawn")){

            const type = line.split(" ")[1];

            if(type === "box"){
                const b = Matter.Bodies.rectangle(300,100,60,60);
                Matter.World.add(JVS_GLOBALS.worldRef, b);
            }

            if(type === "circle"){
                const c = Matter.Bodies.circle(300,100,30);
                Matter.World.add(JVS_GLOBALS.worldRef, c);
            }

            if(type === "verity"){
                spawnVerity();
            }
        }

        /* =====================
           WAIT (simple blocking delay)
        ===================== */

        if(line.startsWith("wait")){

            const [,sec] = line.split(" ");

            const start = Date.now();
            const ms = Number(sec) * 1000;

            while(Date.now() - start < ms){
                // simple freeze delay (prototype only)
            }
        }

        /* =====================
           CLICK EVENT FLAG
        ===================== */

        if(line === "when click"){
            JVS_GLOBALS.clickEnabled = true;
        }

        if(line === "when start"){
            // handled externally
        }

        i++;
    }
}

/* =========================
   CLICK TRIGGER SYSTEM
========================= */

document.addEventListener("click",(e)=>{

    if(!JVS_GLOBALS.clickEnabled) return;

    const bullet = Matter.Bodies.circle(
        e.clientX,
        e.clientY,
        8,
        { density:0.01, frictionAir:0.02 }
    );

    Matter.World.add(JVS_GLOBALS.worldRef, bullet);

    Matter.Body.applyForce(bullet, bullet.position, {
        x:0.02,
        y:-0.02
    });

    setTimeout(()=>{
        Matter.World.remove(JVS_GLOBALS.worldRef, bullet);
    },3000);
});

/* =========================
   EXPLOSION CORE
========================= */

function explosion(x, y, power){

    const world = JVS_GLOBALS.worldRef;

    world.bodies.forEach(b => {

        if(b.isStatic) return;

        const dx = b.position.x - x;
        const dy = b.position.y - y;

        const dist = Math.sqrt(dx*dx + dy*dy);

        if(dist < 200){

            Matter.Body.applyForce(b, b.position, {
                x:(dx / dist) * power * 0.0005,
                y:(dy / dist) * power * 0.0005
            });
        }
    });
}

/* =========================
   VERITY SPAWN (fallback hook)
========================= */

function spawnVerity(){

    const head = Matter.Bodies.circle(300,100,20);
    const torso = Matter.Bodies.rectangle(300,160,40,60);

    const armL = Matter.Bodies.rectangle(260,160,15,50);
    const armR = Matter.Bodies.rectangle(340,160,15,50);

    const legL = Matter.Bodies.rectangle(280,220,15,60);
    const legR = Matter.Bodies.rectangle(320,220,15,60);

    const parts = [head,torso,armL,armR,legL,legR];

    Matter.World.add(JVS_GLOBALS.worldRef, parts);

    function link(a,b){
        const c = Matter.Constraint.create({
            bodyA:a,
            bodyB:b,
            stiffness:0.6
        });

        Matter.World.add(JVS_GLOBALS.worldRef, c);
    }

    link(head,torso);
    link(torso,armL);
    link(torso,armR);
    link(torso,legL);
    link(torso,legR);
}
