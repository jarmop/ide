import { compile } from "./compiler.ts";

Deno.serve(async (request) => {
    const json = await request.json();

    // console.log(json);

    await compile(json);

    // console.log("compiled");

    const command = new Deno.Command("./foo.elf");

    const process = command.spawn();

    return new Response(JSON.stringify({ message: "Success!" }), {
        headers: {
            "Access-Control-Allow-Origin": "*",
        },
    });
});
