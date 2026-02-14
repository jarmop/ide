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
            args: ["Hello"],
        },
        {
            type: "call",
            name: "print",
            args: [", world!\n"],
        },
        {
            type: "call",
            name: "print",
            args: ["And yet another string!\n"],
        },
    ],
};

await compile(program);

const command = new Deno.Command("./foo.elf");

const process = command.spawn();
