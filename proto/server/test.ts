import { Program } from "../client/src/ProgramEditor/types.ts";
import { compile } from "./compiler.ts";

const program: Program = {
    name: "start",
    args: [],
    keywords: ["int"],
    body: [
        {
            type: "call",
            name: "print",
            args: ["hello"],
        },
        // {
        //     type: "call",
        //     name: "print",
        //     args: ["world"],
        // },
    ],
};

await compile(program);

const command = new Deno.Command("./foo.elf");

const process = command.spawn();
