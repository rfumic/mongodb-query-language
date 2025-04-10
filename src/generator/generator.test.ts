import { Parser } from "../parser/parser";
import { Tokenizer } from "../tokenizer/tokenizer";
import { generateQuery } from "./generator";

describe("Generator", () => {
	test("Test creating basic comparison queries", () => {
		const inputs = [
			{ inputString: "age > 18", expected: { age: { $gt: 18 } } },
			{ inputString: "age >= 18", expected: { age: { $gte: 18 } } },
			{ inputString: "age < 18.11", expected: { age: { $lt: 18.11 } } },
			{ inputString: "age <= 18", expected: { age: { $lte: 18 } } },
			{
				inputString: "field1 > field2",
				expected: { $expr: { $gt: ["field1", "field2"] } },
			},
			{
				inputString: "field1 >= field2",
				expected: { $expr: { $gte: ["field1", "field2"] } },
			},
			{
				inputString: "field1 < field2",
				expected: { $expr: { $lt: ["field1", "field2"] } },
			},
			{
				inputString: "field1 <= field2",
				expected: { $expr: { $lte: ["field1", "field2"] } },
			},
			{
				inputString: "field IN (11, 123.1, 'string')",
				expected: { field: { $in: [11, 123.1, "string"] } },
			},
			// TODO: add when NOT IN starts working
			// {
			// 	inputString: "field NOT IN (11, 123.1, 'string')",
			// 	expected: { field: { $nin: [11, 123.1, "string"] } },
			// },
		];

		for (const input of inputs) {
			const t = new Tokenizer(input.inputString);
			const p = new Parser(t);

			const mongoQuery = generateQuery(p.parse());
			// console.log("expected:", input.expected);
			// console.log("mongoQuery:", mongoQuery);

			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});
});
