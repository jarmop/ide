import { Program } from "../client/src/ProgramEditor/types.ts";
import { le } from "./common.ts";

const regid = {
    eax: 0x8,
    edx: 0xA,
    edi: 0xF,
} as const;

type Register = keyof typeof regid;

const linux = {
    syscall: {
        read: 0,
        write: 1,
        exit: 60,
    },
    fd: {
        stdin: 0,
        stdout: 1,
        stderr: 2,
    },
};

function strToBytes(str: string): number[] {
    return str.split("").map((c) => c.charCodeAt(0));
}

function mov(reg: Register, value: number) {
    return [0xB0 | regid[reg], ...le(value, 32)];
}

/**
 * The values that make up the ModR/M byte can be found in the Intel x86
 * manual vol. 2, chapter 2.1.3, table 2-2. The byte is made up of three
 * sections called "mod", "reg" and "rm".
 */
const rmMap = {
    disp32: 0b101,
    edi: 0b111,
} as const;
const regMap = {
    si: 0b110,
    edi: 0b111,
} as const;
type RmKey = keyof typeof rmMap;
type RegKey = keyof typeof regMap;
const modmap: Record<RmKey, number> = Object.fromEntries(
    [
        ["disp32"],
        [],
        [],
        // ["ax", "cx", "dx", "bx", "sp", "bp", "si", "di"],
        ["edi"],
    ]
        .map((arr, i) => arr.map((v) => [v, i]))
        .flat(),
);
function modrm(rmKey: RmKey, regKey: RegKey) {
    const mod = modmap[rmKey];
    const reg = regMap[regKey];
    const rm = rmMap[rmKey];
    return mod << 6 | reg << 3 | rm;
}

// lea rsi,[rip+displacement]
function lea(displacement: number) {
    /**
     * REX prefix is encoded as an 8-bit value where the most significant four
     * bits (0100) identify the byte as the REX prefix, and the least significant
     * four bits tell the value of the REX prefix. REX prefix is described in the
     * Intel x86 manual chapter 2.2.1.
     *
     * 1 in the 4th bit position indicates that the register is 64 bits
     */
    const prefix = 0b01001000;

    const opcode = 0x8D;

    return [prefix, opcode, modrm("disp32", "si"), ...le(displacement, 32)];
}

function syscall() {
    return [0x0F, 0x05];
}

function xor(reg1: RmKey, reg2: RegKey) {
    const opcode = { R32R32: 0x31 };
    return [opcode.R32R32, modrm(reg1, reg2)];
}

export function generateCode(program: Program) {
    const strings: string[] = [];
    const leas: number[][] = []; // [leaip, lealength, textp]
    let textp = 0;
    let rip = 0;
    let code: number[] = [];
    program.body.forEach((l) => {
        if (l.name === "print") {
            const str = l.args[0];
            const write1 = [
                mov("eax", linux.syscall.write),
                mov("edi", linux.fd.stdout),
            ].flat();
            const leaip = rip + write1.length;
            const templea = lea(0);
            const lealength = templea.length;
            const write = [
                ...write1,
                templea, // placeholder lea to be filled with correct distance when it's known
                mov("edx", str.length),
                syscall(),
            ].flat();

            code = [...code, ...write];
            leas.push([leaip, lealength, textp]);
            strings.push(str);
            rip += write.length;
            textp += str.length;
        }
    });

    const exit = [
        mov("eax", linux.syscall.exit),
        xor("edi", "edi"),
        syscall(),
    ].flat();

    code = [...code, ...exit];

    leas.forEach(([leaip, lealength, textp]) => {
        const c1 = code.slice(0, leaip);
        const nextip = leaip + lealength;
        const dtext = code.length - nextip + textp;
        const newlea = lea(dtext);
        const c2 = code.slice(leaip + lealength);

        code = [c1, newlea, c2].flat();
    });

    const text = strings.map((s) => strToBytes(s)).flat();

    return [...code, ...text];
}
