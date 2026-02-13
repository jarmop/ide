import type { Program } from "../client/src/ProgramEditor/types.ts";
import { generateCode } from "./codeGenerator.ts";
import { le } from "./common.ts";

const headerFieldsList = {
    ehdr64: [
        [1, "EI_MAG0"],
        [1, "EI_MAG1"],
        [1, "EI_MAG2"],
        [1, "EI_MAG3"],
        [1, "EI_CLASS"],
        [1, "EI_DATA"],
        [1, "EI_VERSION"],
        [1, "EI_OSABI"],
        [1, "EI_ABIVERSION"],
        [7, "EI_PAD"],
        [2, "e_type"],
        [2, "e_machine"],
        [4, "e_version"],
        [8, "e_entry"],
        [8, "e_phoff"],
        [8, "e_shoff"],
        [4, "e_flags"],
        [2, "e_ehsize"],
        [2, "e_phentsize"],
        [2, "e_phnum"],
        [2, "e_shentsize"],
        [2, "e_shnum"],
        [2, "e_shstrndx"],
    ],
    phdr64: [
        [4, "p_type"],
        [4, "p_flags"],
        [8, "p_offset"],
        [8, "p_vaddr"],
        [8, "p_paddr"],
        [8, "p_filesz"],
        [8, "p_memsz"],
        [8, "p_align"],
    ],
    shdr64: [
        [4, "sh_name"],
        [4, "sh_type"],
        [8, "sh_flags"],
        [8, "sh_addr"],
        [8, "sh_offset"],
        [8, "sh_size"],
        [8, "sh_addralign"],
        [8, "sh_entsize"],
    ],
} as const;

const ELFCLASS64 = 2;
const ELFDATA2LSB = 1;
const EV_CURRENT = 1;
const SYSTEM_V = 0;
const ET_EXEC = 2;
const EM_X86_64 = 0x3E;

const baseVaddr = 0x400000;
const codeOff = 0x78;
const entryVaddr = baseVaddr + codeOff;
const phdr_off = 0x40;

const elfHeader: Record<string, Record<string, number>> = {
    ehdr64: {
        EI_MAG0: 0x7F,
        EI_MAG1: 0x45,
        EI_MAG2: 0x4C,
        EI_MAG3: 0x46,
        EI_CLASS: ELFCLASS64,
        EI_DATA: ELFDATA2LSB,
        EI_VERSION: EV_CURRENT,
        EI_OSABI: SYSTEM_V,
        EI_ABIVERSION: 0,
        EI_PAD: 0,
        e_type: ET_EXEC,
        e_machine: EM_X86_64,
        e_version: EV_CURRENT,
        e_entry: entryVaddr,
        e_phoff: phdr_off,
        e_shoff: 0,
        e_flags: 0,
        e_ehsize: 64,
        e_phentsize: 56,
        e_phnum: 1,
        e_shentsize: 0,
        e_shnum: 0,
        e_shstrndx: 0,
    },
};

const ehdrStr = headerFieldsList.ehdr64.map(([size, name]) => {
    const value = elfHeader.ehdr64[name];
    return le(value, size * 8);
}).flat();

function generatePhdr(fileSize: number) {
    elfHeader.phdr64 = {
        p_type: 1,
        p_flags: 5,
        p_offset: 0,
        p_vaddr: baseVaddr,
        p_paddr: baseVaddr,
        p_filesz: fileSize,
        p_memsz: fileSize,
        p_align: 0x1000,
    };

    return headerFieldsList.phdr64.map(([size, name]) => {
        const value = elfHeader.phdr64[name];
        return le(value, size * 8);
    }).flat();
}

function getPermissionNumber(permission: string) {
    return parseInt(
        permission.replaceAll(/[rwx]/g, "1").replaceAll("-", "0"),
        2,
    );
}

export async function compile(program: Program) {
    await Deno.writeFile("foo.elf", new Uint8Array());

    const codeStr = generateCode(program);

    const fileSize = codeOff + codeStr.length;

    const phdrStr = generatePhdr(fileSize);

    const hexstr = [...ehdrStr, ...phdrStr, ...codeStr];

    for (let i = 0; i < hexstr.length; i += 4) {
        const hexstr32 = hexstr.slice(i, i + 4);
        await Deno.writeFile("foo.elf", new Uint8Array(hexstr32), {
            append: true,
            mode: getPermissionNumber("rwxrwxr-x"),
        });
    }
}
