export function isLetter(char: string): boolean {
	if (char.length !== 1) return false;
	const code = char.charCodeAt(0);
	return (
		(code >= 65 && code <= 90) || // A-Z
		(code >= 97 && code <= 122) || // a-z
		code === 95 || // _ underscore
		code === 45 || // - dash
		code === 46 // - period
	);
}

export function isDigit(char: string) {
	const code = char.charCodeAt(0);
	return code >= 48 && code <= 57; // 0 and 9 Unicode values
}

export function isWhitespace(char: string) {
	return char === " " || char === "\t" || char === "\n" || char === "\r";
}

export function isHexDigit(char: string) {
	return /^[0-9a-fA-F]$/.test(char);
}

export function getIntegerFromLiteral(literal: string) {
	if (literal.length > 2 && literal[0] === "0") {
		// Handle binary
		if (literal[1] === "b") {
			return Number.parseInt(literal.substring(2), 2);
		}
		// Handle hexadecimal
		if (literal[1] === "x") {
			return Number.parseInt(literal.substring(2), 16);
		}
	}
	return Number.parseInt(literal);
}
export function getBooleanFromLiteral(literal: string) {
	const uppercaseLiteral = literal.toUpperCase();
	if (uppercaseLiteral === "TRUE") {
		return true;
	}
	if (uppercaseLiteral === "FALSE") {
		return false;
	}
	throwError(`Parsing error: ${literal} was parsed as BOOL_LITERAL`);
}

export function throwError(message: string): never {
	throw new Error(`\nmongo-db-query-language:\n${message}`);
}

// biome-ignore lint/suspicious/noExplicitAny: any is fine here
export function assert(condition: any, message: string): asserts condition {
	if (!condition) throwError(message);
}
