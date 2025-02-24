import { Tokenizer } from "./tokenizer";

describe("Tokenizer", () => {
	test("should tokenize basic symbols", () => {
		const input = "=(),";
		const expectedTokens = [
			{ expectedType: "EQ", expectedLiteral: "=" },
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "COMMA", expectedLiteral: "," },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input, expectedTokens);
	});

	test("should tokenize a simple expression with comparison and logical operator", () => {
		const input = "(foo > 12345) AND (bar = 67)";
		const expectedTokens = [
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "GT", expectedLiteral: ">" },
			{ expectedType: "INT", expectedLiteral: "12345" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "EQ", expectedLiteral: "=" },
			{ expectedType: "INT", expectedLiteral: "67" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input, expectedTokens);
	});

	test("should tokenize a multi-line expression with multiple operators", () => {
		const input = `foo >= 12345 AND bar <= 67 AND
        baz != 9999
        `;
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "GTE", expectedLiteral: ">=" },
			{ expectedType: "INT", expectedLiteral: "12345" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "LTE", expectedLiteral: "<=" },
			{ expectedType: "INT", expectedLiteral: "67" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "baz" },
			{ expectedType: "NEQ", expectedLiteral: "!=" },
			{ expectedType: "INT", expectedLiteral: "9999" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input, expectedTokens);
	});
});

function testTokens(
	input: string,
	expectedTokens: { expectedType: string; expectedLiteral: string }[],
) {
	const tokenizer = new Tokenizer(input);
	for (const { expectedType, expectedLiteral } of expectedTokens) {
		const token = tokenizer.nextToken();
		expect(token?.type).toBe(expectedType);
		expect(token?.literal).toBe(expectedLiteral);
	}
}
