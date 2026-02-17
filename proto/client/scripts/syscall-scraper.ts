import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

// const selectedSyscalls = [
//     "read",
//     "sendto",
// ];

const startIndex = parseInt(Deno.args[0]);
const length = 50;

const syscalls = await Promise.all(
    Deno.readTextFileSync("syscall_64_clean.tbl")
        .split("\n")
        .slice(startIndex, startIndex + length)
        .map((row) => row.split("\t"))
        // .filter(([_, name]) => selectedSyscalls.includes(name))
        .map(async ([nr, name, abi, entryPoint]) => {
            const html = await fetch(
                `https://man7.org/linux/man-pages/man2/${name}.2.html`,
            ).then((response) => response.text());

            // const html = await Deno.readTextFile("html/poll.html");

            const doc = new DOMParser().parseFromString(html, "text/html");

            let description: string = "";
            let header: string = "";

            doc.querySelectorAll("pre").forEach((el) => {
                const headerstring = el.textContent.split("<")[1]?.split(
                    ">",
                )[0];
                if (
                    description.length === 0 && el.textContent.includes(" - ")
                ) {
                    const regexsplit = /\s-[\s\n]+/;
                    const regexrepl = /\n[\s\t]+/;
                    description = el.textContent
                        // .split(" - ")[1]
                        .split(regexsplit)[1]
                        .trim()
                        .replace(
                            // "/\n[\s\t]+/i",
                            regexrepl,
                            // "\n",
                            " ",
                        );
                } else if (header.length === 0 && headerstring) {
                    header = headerstring;
                }
            });

            return [nr, name, description, header, abi, entryPoint].join("\t");
        }),
);

Deno.writeTextFile(
    "syscall_64_clean2.tbl",
    (startIndex === 0 ? "" : "\n") + syscalls.join("\n"),
    { append: true },
);

console.log("next index: " + (startIndex + length));
