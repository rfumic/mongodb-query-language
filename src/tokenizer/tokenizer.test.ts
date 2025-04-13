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

	test("should tokenize identifiers with numbers in them", () => {
		const input = "foo-1 > 12345 AND foo2_2 = 67";
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo-1" },
			{ expectedType: "GT", expectedLiteral: ">" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "12345" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "foo2_2" },
			{ expectedType: "EQ", expectedLiteral: "=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "67" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input, expectedTokens);
	});

	test("should tokenize strings", () => {
		const input = `name = "John" AND last_name = 'Doe'`;
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "name" },
			{ expectedType: "EQ", expectedLiteral: "=" },
			{ expectedType: "STRING_LITERAL", expectedLiteral: "John" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "last_name" },
			{ expectedType: "EQ", expectedLiteral: "=" },
			{ expectedType: "STRING_LITERAL", expectedLiteral: "Doe" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input, expectedTokens);
	});

	test("should tokenize negative numbers", () => {
		const input = "foo < -58 AND bar >= 9";
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "LT", expectedLiteral: "<" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "-58" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "GTE", expectedLiteral: ">=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "9" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input, expectedTokens);
	});

	test("should tokenize binary numbers", () => {
		const input = "foo < 0b0110 AND bar >= -0b10011";
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "LT", expectedLiteral: "<" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "0b0110" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "GTE", expectedLiteral: ">=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "-0b10011" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input, expectedTokens);
	});

	test("should tokenize hexadecimal numbers", () => {
		const input = "foo < 0xC0FF AND bar >= -0x1A3E";
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "LT", expectedLiteral: "<" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "0xC0FF" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "GTE", expectedLiteral: ">=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "-0x1A3E" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input, expectedTokens);
	});

	test("should tokenize floating point numbers", () => {
		const input = "foo < 3.1415926 AND bar >= -42.06";
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "LT", expectedLiteral: "<" },
			{ expectedType: "FLOAT_LITERAL", expectedLiteral: "3.1415926" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "GTE", expectedLiteral: ">=" },
			{ expectedType: "FLOAT_LITERAL", expectedLiteral: "-42.06" },
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
			{ expectedType: "INT_LITERAL", expectedLiteral: "12345" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "EQ", expectedLiteral: "=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "67" },
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
			{ expectedType: "INT_LITERAL", expectedLiteral: "12345" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "LTE", expectedLiteral: "<=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "67" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "baz" },
			{ expectedType: "NEQ", expectedLiteral: "!=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "9999" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input, expectedTokens);
	});

	test("should tokenize expression with IN and NOT IN operators", () => {
		const input = "foo IN (1,2) AND bar NOT IN (2,3,4)";
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "IN", expectedLiteral: "IN" },
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "1" },
			{ expectedType: "COMMA", expectedLiteral: "," },
			{ expectedType: "INT_LITERAL", expectedLiteral: "2" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "NOT", expectedLiteral: "NOT" },
			{ expectedType: "IN", expectedLiteral: "IN" },
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "2" },
			{ expectedType: "COMMA", expectedLiteral: "," },
			{ expectedType: "INT_LITERAL", expectedLiteral: "3" },
			{ expectedType: "COMMA", expectedLiteral: "," },
			{ expectedType: "INT_LITERAL", expectedLiteral: "4" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input, expectedTokens);
	});

	test("should tokenize AND, NOT, OR, and NOR correctly", () => {
		const input = "foo = 1 AND bar != 2 OR baz = 3 NOR qux NOT quux";
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "EQ", expectedLiteral: "=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "1" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "NEQ", expectedLiteral: "!=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "2" },
			{ expectedType: "OR", expectedLiteral: "OR" },
			{ expectedType: "FIELD", expectedLiteral: "baz" },
			{ expectedType: "EQ", expectedLiteral: "=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "3" },
			{ expectedType: "NOR", expectedLiteral: "NOR" },
			{ expectedType: "FIELD", expectedLiteral: "qux" },
			{ expectedType: "NOT", expectedLiteral: "NOT" },
			{ expectedType: "FIELD", expectedLiteral: "quux" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];

		testTokens(input, expectedTokens);
	});

	test("should tokenize HAS and IS correctly", () => {
		const input = "foo IS int AND HAS bar";
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "IS", expectedLiteral: "IS" },
			{ expectedType: "INT_KEYWORD", expectedLiteral: "int" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "HAS", expectedLiteral: "HAS" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];

		testTokens(input, expectedTokens);
	});
	test("should tokenize MOD and MATCHES correctly", () => {
		const input =
			"foo MOD 2 = 0 AND bar MATCHES 'patt.*ern' OR baz MATCHES 'patt.*ern2' 'i'";
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "MOD", expectedLiteral: "MOD" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "2" },
			{ expectedType: "EQ", expectedLiteral: "=" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "0" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "MATCHES", expectedLiteral: "MATCHES" },
			{ expectedType: "STRING_LITERAL", expectedLiteral: "patt.*ern" },
			{ expectedType: "OR", expectedLiteral: "OR" },
			{ expectedType: "FIELD", expectedLiteral: "baz" },
			{ expectedType: "MATCHES", expectedLiteral: "MATCHES" },
			{ expectedType: "STRING_LITERAL", expectedLiteral: "patt.*ern2" },
			{ expectedType: "STRING_LITERAL", expectedLiteral: "i" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];

		testTokens(input, expectedTokens);
	});

	test("should tokenize CONTAINS, ANY and SIZE correctly", () => {
		const input = "foo CONTAINS (1, 2) OR bar ANY > 10 AND baz SIZE 8";
		const expectedTokens = [
			{ expectedType: "FIELD", expectedLiteral: "foo" },
			{ expectedType: "CONTAINS", expectedLiteral: "CONTAINS" },
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "1" },
			{ expectedType: "COMMA", expectedLiteral: "," },
			{ expectedType: "INT_LITERAL", expectedLiteral: "2" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "OR", expectedLiteral: "OR" },
			{ expectedType: "FIELD", expectedLiteral: "bar" },
			{ expectedType: "ANY", expectedLiteral: "ANY" },
			{ expectedType: "GT", expectedLiteral: ">" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "10" },
			{ expectedType: "AND", expectedLiteral: "AND" },
			{ expectedType: "FIELD", expectedLiteral: "baz" },
			{ expectedType: "SIZE", expectedLiteral: "SIZE" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "8" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];

		testTokens(input, expectedTokens);
	});

	test("should tokenize $bitsAllSet (BIT ALL_SET) correctly", () => {
		const input1 = "field BIT ALL_SET 5";
		const expectedTokens1 = [
			{ expectedType: "FIELD", expectedLiteral: "field" },
			{ expectedType: "BIT", expectedLiteral: "BIT" },
			{ expectedType: "ALL_SET", expectedLiteral: "ALL_SET" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "5" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input1, expectedTokens1);

		const input2 = "field BIT ALL_SET (1, 3)";
		const expectedTokens2 = [
			{ expectedType: "FIELD", expectedLiteral: "field" },
			{ expectedType: "BIT", expectedLiteral: "BIT" },
			{ expectedType: "ALL_SET", expectedLiteral: "ALL_SET" },
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "1" },
			{ expectedType: "COMMA", expectedLiteral: "," },
			{ expectedType: "INT_LITERAL", expectedLiteral: "3" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input2, expectedTokens2);
	});

	test("should tokenize $bitsAllClear (BIT ALL_CLEAR) correctly", () => {
		const input1 = "field BIT ALL_CLEAR 5";
		const expectedTokens1 = [
			{ expectedType: "FIELD", expectedLiteral: "field" },
			{ expectedType: "BIT", expectedLiteral: "BIT" },
			{ expectedType: "ALL_CLEAR", expectedLiteral: "ALL_CLEAR" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "5" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input1, expectedTokens1);

		const input2 = "field BIT ALL_CLEAR (1, 3)";
		const expectedTokens2 = [
			{ expectedType: "FIELD", expectedLiteral: "field" },
			{ expectedType: "BIT", expectedLiteral: "BIT" },
			{ expectedType: "ALL_CLEAR", expectedLiteral: "ALL_CLEAR" },
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "1" },
			{ expectedType: "COMMA", expectedLiteral: "," },
			{ expectedType: "INT_LITERAL", expectedLiteral: "3" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input2, expectedTokens2);
	});

	test("should tokenize $bitsAnySet (BIT ANY_SET) correctly", () => {
		const input1 = "field BIT ANY_SET 5";
		const expectedTokens1 = [
			{ expectedType: "FIELD", expectedLiteral: "field" },
			{ expectedType: "BIT", expectedLiteral: "BIT" },
			{ expectedType: "ANY_SET", expectedLiteral: "ANY_SET" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "5" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input1, expectedTokens1);

		const input2 = "field BIT ANY_SET (1, 3)";
		const expectedTokens2 = [
			{ expectedType: "FIELD", expectedLiteral: "field" },
			{ expectedType: "BIT", expectedLiteral: "BIT" },
			{ expectedType: "ANY_SET", expectedLiteral: "ANY_SET" },
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "1" },
			{ expectedType: "COMMA", expectedLiteral: "," },
			{ expectedType: "INT_LITERAL", expectedLiteral: "3" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input2, expectedTokens2);
	});

	test("should tokenize $bitsAnyClear (BIT ANY_CLEAR) correctly", () => {
		const input1 = "field BIT ANY_CLEAR 5";
		const expectedTokens1 = [
			{ expectedType: "FIELD", expectedLiteral: "field" },
			{ expectedType: "BIT", expectedLiteral: "BIT" },
			{ expectedType: "ANY_CLEAR", expectedLiteral: "ANY_CLEAR" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "5" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input1, expectedTokens1);

		const input2 = "field BIT ANY_CLEAR (1, 3)";
		const expectedTokens2 = [
			{ expectedType: "FIELD", expectedLiteral: "field" },
			{ expectedType: "BIT", expectedLiteral: "BIT" },
			{ expectedType: "ANY_CLEAR", expectedLiteral: "ANY_CLEAR" },
			{ expectedType: "LPAREN", expectedLiteral: "(" },
			{ expectedType: "INT_LITERAL", expectedLiteral: "1" },
			{ expectedType: "COMMA", expectedLiteral: "," },
			{ expectedType: "INT_LITERAL", expectedLiteral: "3" },
			{ expectedType: "RPAREN", expectedLiteral: ")" },
			{ expectedType: "EOF", expectedLiteral: "" },
		];
		testTokens(input2, expectedTokens2);
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
