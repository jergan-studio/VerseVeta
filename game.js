const canvas = document.getElementById("world");

const engine = Matter.Engine.create();
const world = engine.world;

const render = Matter.Render.create({
    canvas,
    engine,
    options:{
        width:window.innerWidth,
        height:window.innerHeight,
        wireframes:false,
        background:"#87CEEB"
    }
});

Matter.Render.run(render);

const runner = Matter.Runner.create();
Matter.Runner.run(runner,engine);

const ground = Matter.Bodies.rectangle(
    window.innerWidth/2,
    window.innerHeight-20,
    window.innerWidth,
    40,
    {isStatic:true}
);

Matter.World.add(world,ground);

const mouse = Matter.Mouse.create(render.canvas);

const mouseConstraint =
Matter.MouseConstraint.create(engine,{
    mouse
});

Matter.World.add(world,mouseConstraint);

function spawnRectangle(){

    const box = Matter.Bodies.rectangle(
        300,
        100,
        80,
        40,
        {
            render:{
                fillStyle:"#666"
            }
        }
    );

    Matter.World.add(world,box);
}

function spawnCircle(){

    const body = Matter.Bodies.circle(
        300,
        100,
        30,
        {
            render:{
                fillStyle:"#44AAFF"
            }
        }
    );

    Matter.World.add(world,body);
}

function spawnTriangle(){

    const body = Matter.Bodies.polygon(
        300,
        100,
        3,
        40,
        {
            render:{
                fillStyle:"#AA44FF"
            }
        }
    );

    Matter.World.add(world,body);
}

function spawnVerity(){

    const face = Matter.Bodies.circle(
        300,
        100,
        30,
        {
            render:{
                fillStyle:"yellow"
            }
        }
    );

    Matter.World.add(world,face);
}

function spawnVelocityChip(){

    const chip = Matter.Bodies.rectangle(
        300,
        100,
        100,
        50,
        {
            render:{
                fillStyle:"lime"
            }
        }
    );

    Matter.Body.setVelocity(chip,{
        x:10,
        y:0
    });

    Matter.World.add(world,chip);
}

function spawnJVSChip(){

    const chip = Matter.Bodies.rectangle(
        300,
        100,
        120,
        60,
        {
            render:{
                fillStyle:"orange"
            }
        }
    );

    Matter.World.add(world,chip);

    runJVS(`
velocity 8 0
`,chip);
}

function explosion(x,y,power){

    world.bodies.forEach(body=>{

        if(body.isStatic) return;

        const dx = body.position.x-x;
        const dy = body.position.y-y;

        const dist = Math.sqrt(dx*dx+dy*dy);

        if(dist < 200){

            Matter.Body.applyForce(
                body,
                body.position,
                {
                    x:(dx/dist)*power*0.0005,
                    y:(dy/dist)*power*0.0005
                }
            );
        }
    });
}

function explode(){

    explosion(
        window.innerWidth/2,
        window.innerHeight/2,
        100
    );
}
