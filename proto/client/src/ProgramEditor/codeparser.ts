import * as codestrings from "../../data/codestrings/index.js";

type Function = {
    name: string;
    args: string[];
    keywords: string[];
    body: string[];
};

function parseCode(code: string) {
    let functionLines: string[] = [];
    const includes: string[] = [];
    const locals: string[] = [];
    const functions: string[][] = [];
    const foo = code.replaceAll("'\n'", "'\\n'")
        .replaceAll("'\0'", "'\\0'");

    const strRep = "blahblah";
    const strRepRegexp = new RegExp(strRep, "g");

    const strRegexp = /"(.|\n)*?"/g;
    const strings = [...foo.matchAll(strRegexp)].map((regarr) =>
        regarr[0].replaceAll("\n", "\\n")
    );

    let i = 0;
    foo.replaceAll(strRegexp, strRep).split("\n").forEach((origline) => {
        let line = origline;
        const mat = [...origline.matchAll(strRepRegexp)];
        if (mat.length > 0) {
            mat.forEach(() => {
                line = line.replace(strRep, strings[i]);
                i++;
            });
        }

        const functionStarted = functionLines.length > 0;
        const isFunctionStartLine = line.endsWith(") {");

        if (functionStarted) {
            functionLines.push(line);
            if (line === "}") {
                functions.push(functionLines);
                functionLines = [];
            }
        } else {
            if (isFunctionStartLine) {
                console.log(line);
                functionLines.push(line);
            } else if (line.length > 0) {
                if (line[0] === "#") {
                    includes.push(line);
                } else {
                    locals.push(line);
                }
            }
        }
    });

    return functions;
}

export function getFunctions() {
    // const functions = Object.values(codestrings).map((c) => getFunctions(c)).flat();
    const functionLines = [
        parseCode(codestrings.ide),
        parseCode(codestrings.draw),
        parseCode(codestrings.window),
    ].flat();

    const functions: Function[] = functionLines.map((f) => {
        const parts = f[0].split(/[()]/);
        const keywordName = parts[0].split(" ");

        const keywords = keywordName.slice(
            0,
            keywordName.length - 1,
        );
        const name = keywordName[keywordName.length - 1];

        if (parts.length < 2) {
            return;
        }

        const args = parts[1].split(/[,]\s+/).map((a) => a.trim())
            .filter((a) => a.length > 0);

        const body = f.slice(1, f.length - 1);

        return { name, keywords, args, body };
    }).filter((f) => f !== undefined);

    return functions;
}
