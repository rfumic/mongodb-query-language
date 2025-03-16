export function isLetter(char: string): boolean {
    if (char.length !== 1) return false;
    const code = char.charCodeAt(0);
    return (
        (code >= 65 && code <= 90) || // A-Z
        (code >= 97 && code <= 122) || // a-z
        code === 95 || // _ underscore
        code === 45 // - dash
    );
}

export function isDigit(char: string) {
    const code = char.charCodeAt(0);
    return code >= 48 && code <= 57; // 0 and 9 Unicode values
}

export function isWhitespace(char: string) {
    return char === " " || char === "\t" || char === "\n" || char === "\r";
}
