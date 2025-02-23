import type { Token } from "./token";

describe("tokenizer", () => {
	test.each([
		["EQUALS", "=", "="],
		["LPAREN", "(", "("],
		["RPAREN", ")", ")"],
		["COMMA", ",", ","],
		["EOF", "", ""],
	])(
		"nextToken() should return type: %s with literal: %s",
		(expectedType, expectedLiteral, inputChar) => {
			const tokenizer = new Tokenizer(inputChar);
			const token: Token = tokenizer.nextToken();
			expect(token.type).toBe(expectedType);
			expect(token.literal).toBe(expectedLiteral);
		},
	);
});
