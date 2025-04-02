import {
	type ASTNode,
	isAnyExpression,
	isBitExpression,
	isComparisonExpression,
	isContainsExpression,
	isInExpression,
	isLogicalExpression,
	isModExpression,
	isNotExpression,
	isSizeExpression,
} from "../ast/ast";
import { Tokenizer } from "../tokenizer/tokenizer";
import { Parser } from "./parser";

describe("Parser", () => {
	test("Test basic comparison parsing with decimal, binary, and hexadecimal numbers", () => {
		const inputs = [
			"field_a = 7",
			"field_b < 8",
			"field_c > 9",
			"field_d >= 129",
			"field_e <= 32192",
			"field_f = 0b01010",
			"field_g < 0xff0",
			"field_h > 0b1011",
			"field_i >= 0x1A3",
			"field_j <= 0b1100",
		];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();

			testComparisonExpression(query);
		}
	});

	test("Test string comparison parsing", () => {
		const inputs = ['field_a = "foo"', "field_b = 'bar'", "field_c != 'baz'"];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();

			testComparisonExpression(query);
		}
	});

	test("Test IN and NOT IN", () => {
		const inputs = [
			"field_a IN (11, 21)",
			// "field_b NOT IN (449, 982)" // TODO: fix NOT
		];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();

			testInExpression(query);
		}
	});

	test("Test basic logical parsing", () => {
		const inputs = [
			"field_a = 7 AND field_b < 8",
			"field_a = 7 OR field_b < 8",
			"field_a >= 9 NOR field_b < 18",
		];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();

			testLogicalExpression(query);
		}
	});
	test("Test NOT parsing", () => {
		const inputs = ["NOT field_a > 8", "NOT field_b != 999"];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();

			testNotExpression(query);
		}
	});

	test("Test MOD parsing", () => {
		const inputs = ["field MOD 2 = 0", "field MOD 11 = 7"];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();

			testModExpression(query);
		}
	});

	test("Test CONTAINS parsing", () => {
		const inputs = ["array_field CONTAINS (1,8,7)", "array_field CONTAINS (8)"];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();

			testContainsExpression(query);
		}
	});

	test("Test CONTAINS parsing with strings", () => {
		const inputs = [
			`array_field CONTAINS ("foo",'bar', "baz")`,
			`array_field CONTAINS ("foobar")`,
		];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();

			testContainsExpression(query);
		}
	});

	test("Test ANY parsing", () => {
		const inputs = ["field ANY foo > 8", "field_b ANY (foo > 8 AND bar < 99)"];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();

			testAnyExpression(query);
		}
	});

	test("Test Size parsing", () => {
		const inputs = ["field SIZE  8"];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();

			testSizeExpression(query);
		}
	});

	test("Test BIT parsing", () => {
		const inputs = [
			"field BIT ALL_SET 5",
			"field BIT ALL_SET (1, 3)",
			"field BIT ALL_CLEAR 5",
			"field BIT ANY_SET 5",
			"field BIT ANY_SET (1, 3)",
			"field BIT ANY_CLEAR 5",
		];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();
			testBitExpression(query);
		}
	});

	test("Test float parsing", () => {
		const inputs = [
			{ inputString: "field < 4.31", expectedValue: 4.31 },
			{ inputString: "field >= 0.0000000123", expectedValue: 0.0000000123 },
			{ inputString: "field > 123123.999099", expectedValue: 123123.999099 },
		];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input.inputString);
			const parser = new Parser(tokenizer);

			const query = parser.parse();
			testComparisonExpression(query);
			//@ts-ignore
			expect(query.right.value).toBe(input.expectedValue);
		}
	});

	test("Test CONTAINS parsing with floats", () => {
		const inputs = [
			"array_field CONTAINS (1.3, 11.0, 0)",
			"array_field CONTAINS (99999999.1, -0.00921)",
		];

		for (const input of inputs) {
			const tokenizer = new Tokenizer(input);
			const parser = new Parser(tokenizer);

			const query = parser.parse();
			testContainsExpression(query);
		}
	});
});

function testComparisonExpression(query: ASTNode) {
	expect(isComparisonExpression(query)).toBe(true);
}
function testNotExpression(query: ASTNode) {
	expect(isNotExpression(query)).toBe(true);
}

function testLogicalExpression(query: ASTNode) {
	expect(isLogicalExpression(query)).toBe(true);
}

function testInExpression(query: ASTNode) {
	expect(isInExpression(query)).toBe(true);
}
function testModExpression(query: ASTNode) {
	expect(isModExpression(query)).toBe(true);
}
function testAnyExpression(query: ASTNode) {
	expect(isAnyExpression(query)).toBe(true);
}
function testContainsExpression(query: ASTNode) {
	expect(isContainsExpression(query)).toBe(true);
}
function testSizeExpression(query: ASTNode) {
	expect(isSizeExpression(query)).toBe(true);
}
function testBitExpression(query: ASTNode) {
	expect(isBitExpression(query)).toBe(true);
}
