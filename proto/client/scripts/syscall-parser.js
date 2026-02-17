/**
 * Get file from:
 * https://github.com/torvalds/linux/blob/master/arch/x86/entry/syscalls/syscall_64.tbl
 * 
 * Run with:
 * deno --allow-read syscall-parser.js
 */

const str = await Deno.readTextFile("syscall_64.tbl");

const cleanedRows = str
    .split('\n')
    // Remove comments and empty lines
    .filter(row => row[0] !== '#' && row.trim().length > 0)
    // Split by any amount of space and tab
    .map(row => row.split(/[\s\t]+/))
    // Remove x32 syscalls
    .filter(cols => cols[1] !== 'x32')
    // Reorder columns and join back together
    .map(cols => [cols[0], cols[2], cols[1], cols[3]].join('\t'));

// console.log(cleanedRows.join('\n'));

await Deno.writeTextFile("syscall_64_clean2.tbl", cleanedRows.join('\n'));
