function saveWorkshop(){

    const data = world.bodies.map(b=>{

        if(b.isStatic) return null;

        return {
            x:b.position.x,
            y:b.position.y,
            type:b.circleRadius ? "circle" : "box"
        };
    }).filter(Boolean);

    localStorage.setItem("verseveta_world", JSON.stringify(data));

    alert("Saved to Workshop!");
}

function loadWorkshop(){

    const data = JSON.parse(localStorage.getItem("verseveta_world") || "[]");

    data.forEach(obj=>{

        let body;

        if(obj.type === "circle"){
            body = Matter.Bodies.circle(obj.x,obj.y,30);
        } else {
            body = Matter.Bodies.rectangle(obj.x,obj.y,60,60);
        }

        Matter.World.add(world,body);
    });

    alert("Loaded Workshop!");
}
