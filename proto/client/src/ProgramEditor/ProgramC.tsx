import hljs from "highlight.js";
import { FuncHdr } from "./FuncHdr.tsx";
import { useEffect } from "react";
import { getFunctions } from "./codeparser.ts";

const functions = getFunctions();

console.log(functions.map((f) => f.name));

export function ProgramC() {
    const visibleFunctionNames = [
        "main",
        "new_textbox",
        "initialize_draw",
        "initialize_window",
        "run_window",
    ];
    const visibleFunctions = visibleFunctionNames.map((name) =>
        functions.find((f) => f.name == name)
    ).filter((f) => f !== undefined);
    // const visibleFunctions = functions.filter((f) =>
    //     visibleFunctionNames.includes(f.name)
    // );
    const openFunctions = [
        "main",
        "new_textbox",
        // "initialize_draw",
        // "initialize_window",
        // "run_window",
    ];

    useEffect(() => {
        hljs.configure({ languages: ["language-c"] });
        hljs.highlightAll();
    }, []);

    return (
        <div
            className="ProgramEditor"
            style={{ width: "100%", height: "100%" }}
        >
            <div style={{ width: "fit-content", padding: "10px" }}>
                {visibleFunctions.map(({ name, keywords, args, body }, i) => {
                    return (
                        <div
                            key={i}
                            className={`Function ${
                                !openFunctions.includes(name) ? "collapsed" : ""
                            }`}
                        >
                            <FuncHdr
                                name={name}
                                args={args}
                                keywords={keywords.join(" ")}
                            />
                            <div
                                className={`FunctionBody`}
                            >
                                <pre
                                    className="c"
                                    style={{ margin: 0, padding: 0 }}
                                >
                                    <code style={{padding: 0}}>
                                        {body.map((l) => l.slice(4)).join('\n')}
                                    </code>
                                </pre>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
