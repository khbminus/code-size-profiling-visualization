export function splitByDot(x: string): string[] {
    const complement = {")": "(", "]": "[", ">": "<", "}": "{"};
    const chars = [...x]
    const stack: string[] = []
    const res: string[] = []
    let current = ""
    chars.forEach(c => {
        if (c === ".") {
            if (stack.length === 0) {
                res.push(current)
                current = "";
            } else {
                current = current.concat(".");
            }
            return;
        }
        if (c === "(" || c === "{" || c == "<" || c == "[") {
            stack.push(c);
        } else if (c === ")" || c === "}" || c === ">" || c === "]") {
            while (stack.length > 1 && stack[stack.length - 1] != complement[c]) {
                stack.pop();
            }
            stack.pop();
        }
        current = current.concat(c);
    });
    if (current.length > 0) {
        res.push(current);
    }
    return res;
}