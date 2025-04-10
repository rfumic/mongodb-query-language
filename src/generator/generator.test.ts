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
			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});

	test("Test creating basic logical queries (and MOD)", () => {
		const inputs = [
			// TODO: handle this later
			// {
			// 	inputString: "NOT foo = 5",
			// 	expected: { foo: { $not: { $eq: 5 } } },
			// },
			{
				inputString: "foo > 18 AND bar = 8.1",
				expected: { $and: [{ foo: { $gt: 18 } }, { bar: { $eq: 8.1 } }] },
			},
			{
				inputString: "foo > 18 OR bar = 8.1",
				expected: { $or: [{ foo: { $gt: 18 } }, { bar: { $eq: 8.1 } }] },
			},
			{
				inputString: "foo > 18 NOR bar = 8.1",
				expected: { $nor: [{ foo: { $gt: 18 } }, { bar: { $eq: 8.1 } }] },
			},
			{
				inputString: "field1 > field2 AND bar = 8.1",
				expected: {
					$and: [
						{ $expr: { $gt: ["field1", "field2"] } },
						{ bar: { $eq: 8.1 } },
					],
				},
			},
			{
				inputString: "foo MOD 2 = 0",
				expected: { foo: { $mod: [2, 0] } },
			},
		];

		for (const input of inputs) {
			const t = new Tokenizer(input.inputString);
			const p = new Parser(t);

			const mongoQuery = generateQuery(p.parse());
			console.log("expected:", JSON.stringify(input.expected));
			console.log("mongoQuery:", JSON.stringify(mongoQuery));

			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});

	test("Test creating basic array queries", () => {
		const inputs = [
			// TODO: fix ANY first
			// {
			// 	inputString: "foo ANY > 5",
			// 	expected: { foo: { $elemMatch: { $gt: 5 } } },
			// },
			{
				inputString: "arrayField SIZE 10",
				expected: { arrayField: { $size: 10 } },
			},
		];

		for (const input of inputs) {
			const t = new Tokenizer(input.inputString);
			const p = new Parser(t);

			const mongoQuery = generateQuery(p.parse());
			console.log("expected:", JSON.stringify(input.expected));
			console.log("mongoQuery:", JSON.stringify(mongoQuery));

			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});
});
