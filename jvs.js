function runJVS(code, body){

    const lines = code.split("\n");

    for(let line of lines){

        line = line.trim();

        if(line.startsWith("velocity")){

            const args = line.split(" ");

            Matter.Body.setVelocity(body,{
                x:Number(args[1]),
                y:Number(args[2])
            });
        }

        if(line.startsWith("explode")){

            const args = line.split(" ");
            explosion(body.position.x,body.position.y,Number(args[1]));
        }
    }
}
