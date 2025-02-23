import { Tokenizer } from "./tokenizer";

describe("tokenizer", () => {
	describe("tokenizer", () => {
		test("nextToken() should correctly tokenize a full input string", () => {
			const input = "=(),";
			const expectedTokens = [
				{ expectedType: "EQUALS", expectedLiteral: "=" },
				{ expectedType: "LPAREN", expectedLiteral: "(" },
				{ expectedType: "RPAREN", expectedLiteral: ")" },
				{ expectedType: "COMMA", expectedLiteral: "," },
				{ expectedType: "EOF", expectedLiteral: "" },
			];

			const tokenizer = new Tokenizer(input);
			for (const { expectedType, expectedLiteral } of expectedTokens) {
				const token = tokenizer.nextToken();
				expect(token?.type).toBe(expectedType);
				expect(token?.literal).toBe(expectedLiteral);
			}
		});
		test("nextToken() should correctly tokenize a full input string v2", () => {
			const input = "(foo > 12345) AND (bar = true)";
			const expectedTokens = [
				{ expectedType: "LPAREN", expectedLiteral: "(" },
				{ expectedType: "FIELD", expectedLiteral: "foo" },
				{ expectedType: "GT", expectedLiteral: ">" },
				{ expectedType: "INT", expectedLiteral: "12345" },
				{ expectedType: "RPAREN", expectedLiteral: ")" },
				{ expectedType: "AND", expectedLiteral: "AND" },
				{ expectedType: "LPAREN", expectedLiteral: "(" },
				{ expectedType: "FIELD", expectedLiteral: "bar" },
				{ expectedType: "EQUALS", expectedLiteral: "=" },
				{ expectedType: "BOOLEAN", expectedLiteral: "true" },
				{ expectedType: "RPAREN", expectedLiteral: ")" },
				{ expectedType: "EOF", expectedLiteral: "" },
			];

			const tokenizer = new Tokenizer(input);
			for (const { expectedType, expectedLiteral } of expectedTokens) {
				const token = tokenizer.nextToken();
				expect(token?.type).toBe(expectedType);
				expect(token?.literal).toBe(expectedLiteral);
			}
		});
	});
});
