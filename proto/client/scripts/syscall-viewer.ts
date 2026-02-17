const text = await Deno.readTextFile("syscall_64_clean2.tbl");

const counts: Record<string, number> = {};
const keys = {
    nr: 0,
    name: 1,
    description: 2,
    header: 3,
    additional_headers: 3,
    abi: 4,
    entryPoint: 5,
} as const;

const countsByMain: Record<string, typeof counts> = {};

text
    .split("\n")
    .map((r) => r.split("\t"))
    .filter(([_0, _1, description, _3, _4, _5, entryPoint]) =>
        !description.includes("unimplemented") && entryPoint.length > 0
    )
    .forEach((cols) => {
        const header = cols[keys.header];
        const [main, ...rest] = header.split("/");
        const sub = rest.join("/");
        if (!sub) {
            // if (header.length > 0) {
            if (!counts[header]) {
                counts[header] = 0;
            }
            counts[header]++;
            // }
            return;
        }
        if (!countsByMain[main]) {
            countsByMain[main] = {};
        }
        if (!countsByMain[main][sub]) {
            countsByMain[main][sub] = 0;
        }
        countsByMain[main][sub]++;
    });

const sorted = Object.fromEntries(
    Object.entries(countsByMain).map(([main, cnts]) => [
        main,
        Object.fromEntries(
            Object.entries(cnts).sort((a, b) => b[1] - a[1]),
        ),
    ]),
);

console.log(sorted);

const sorted2 = Object.fromEntries(
    Object.entries(counts).sort((a, b) => {
        return b[1] - a[1];
    }),
);

console.log(sorted2);

const sysLength = Object.keys(countsByMain.sys).length;
const linuxLength = Object.keys(countsByMain.linux).length;
const otherLength = Object.keys(counts).length;
const totalEntries = sysLength + linuxLength + otherLength;

console.log("\nTotal headers: " + totalEntries);
console.log("- sys: " + sysLength);
console.log("- linux: " + linuxLength);
console.log("- other: " + otherLength);

const sysCalls = Object.values(countsByMain.sys).reduce((tv, v) => tv + v, 0);
const linuxCalls = Object.values(countsByMain.linux)
    .reduce((tv, v) => tv + v, 0);
const otherCalls = Object.values(counts).reduce((tv, v) => tv + v, 0);
const totalCalls = sysCalls + linuxCalls + otherCalls;

console.log("\nTotal syscalls: " + totalCalls);
console.log("- sys: " + sysCalls);
console.log("- linux: " + linuxCalls);
console.log("- other: " + otherCalls);
