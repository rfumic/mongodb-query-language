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
			{ inputString: "user.age > 25", expected: { "user.age": { $gt: 25 } } },
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
			{
				inputString: "field NOT IN (11, 123.1, 'string')",
				expected: { field: { $nin: [11, 123.1, "string"] } },
			},
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
			{
				inputString: "foo = TRUE AND bar != FALSE",
				expected: { $and: [{ foo: { $eq: true } }, { bar: { $ne: false } }] },
			},
		];

		for (const input of inputs) {
			const t = new Tokenizer(input.inputString);
			const p = new Parser(t);

			const mongoQuery = generateQuery(p.parse());
			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});

	test("Test creating basic array queries", () => {
		const inputs = [
			{
				inputString: "grades ANY score > 90",
				expected: { grades: { $elemMatch: { score: { $gt: 90 } } } },
			},
			{
				inputString: "tags ANY name = 'sale'",
				expected: { tags: { $elemMatch: { name: { $eq: "sale" } } } },
			},
			{
				inputString: "arrayField CONTAINS (11,2.3,'a string')",
				expected: { arrayField: { $all: [11, 2.3, "a string"] } },
			},
			{
				inputString: "arrayField SIZE 10",
				expected: { arrayField: { $size: 10 } },
			},
			{
				inputString: "comments ANY replies SIZE 3",
				expected: { comments: { $elemMatch: { replies: { $size: 3 } } } },
			},
		];

		for (const input of inputs) {
			const t = new Tokenizer(input.inputString);
			const p = new Parser(t);

			const mongoQuery = generateQuery(p.parse());

			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});

	test("Test creating bit queries", () => {
		const inputs = [
			{
				inputString: "foo BIT ALL_SET 5",
				expected: { foo: { $bitsAllSet: 5 } },
			},
			{
				inputString: "foo BIT ALL_SET (1,5)",
				expected: { foo: { $bitsAllSet: [1, 5] } },
			},
			{
				inputString: "foo BIT ANY_SET 5",
				expected: { foo: { $bitsAnySet: 5 } },
			},
			{
				inputString: "foo BIT ANY_CLEAR 5",
				expected: { foo: { $bitsAnyClear: 5 } },
			},
		];

		for (const input of inputs) {
			const t = new Tokenizer(input.inputString);
			const p = new Parser(t);

			const mongoQuery = generateQuery(p.parse());
			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});

	test("Test creating regex queries", () => {
		const inputs = [
			{
				inputString: "name MATCHES 'john'",
				expected: { name: { $regex: "john", $options: "" } },
			},
			{
				inputString: "name MATCHES 'john' 'i'",
				expected: { name: { $regex: "john", $options: "i" } },
			},
			{
				inputString: "age > 20 OR name MATCHES '^john' 'i'",
				expected: {
					$or: [
						{ age: { $gt: 20 } },
						{ name: { $regex: "^john", $options: "i" } },
					],
				},
			},
		];

		for (const input of inputs) {
			const t = new Tokenizer(input.inputString);
			const p = new Parser(t);

			const mongoQuery = generateQuery(p.parse());
			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});

	test("Test creating NOT queries", () => {
		const inputs = [
			{
				inputString: "NOT foo = 5",
				expected: { foo: { $not: { $eq: 5 } } },
			},
			{
				inputString: "NOT foo > 51",
				expected: { foo: { $not: { $gt: 51 } } },
			},
			{
				inputString: "NOT foo >= 11",
				expected: { foo: { $not: { $gte: 11 } } },
			},
			{
				inputString: "NOT foo < 51",
				expected: { foo: { $not: { $lt: 51 } } },
			},
			{
				inputString: "NOT foo <= 11",
				expected: { foo: { $not: { $lte: 11 } } },
			},
			{
				inputString: "NOT foo != 987",
				expected: { foo: { $not: { $ne: 987 } } },
			},
			{
				inputString: "NOT foo != 987",
				expected: { foo: { $not: { $ne: 987 } } },
			},
			{
				inputString: "NOT field1 > field2",
				expected: { $expr: { $not: [{ $gt: ["field1", "field2"] }] } },
			},
			{
				inputString: "NOT field1 >= field2",
				expected: { $expr: { $not: [{ $gte: ["field1", "field2"] }] } },
			},
			{
				inputString: "NOT field IN (11, 123.1, 'string')",
				expected: { field: { $not: { $in: [11, 123.1, "string"] } } },
			},
			{
				inputString: "NOT field NOT IN (11, 123.1, 'string')",
				expected: { field: { $not: { $nin: [11, 123.1, "string"] } } },
			},
			{
				inputString: "NOT name MATCHES 'john'",
				expected: { name: { $not: { $regex: "john", $options: "" } } },
			},
			{
				inputString: "NOT name MATCHES 'john' 'i'",
				expected: { name: { $not: { $regex: "john", $options: "i" } } },
			},
		];

		for (const input of inputs) {
			const t = new Tokenizer(input.inputString);
			const p = new Parser(t);
			const a = p.parse();
			const mongoQuery = generateQuery(a);
			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});
	test("Test creating HAS queries", () => {
		const inputs = [
			{
				inputString: "HAS address",
				expected: { address: { $exists: true } },
			},
			// TODO: timestamp is keyword, this can be used for testing escaping keywords
			// {
			// 	inputString: "HAS timestamp",
			// 	expected: { timestamp: { $exists: true } },
			// },

			{
				inputString: "NOT HAS deletedAt",
				expected: { deletedAt: { $exists: false } },
			},
			{
				inputString: "NOT HAS temporaryData",
				expected: { temporaryData: { $exists: false } },
			},

			{
				inputString: "HAS price AND price > 100",
				expected: {
					$and: [{ price: { $exists: true } }, { price: { $gt: 100 } }],
				},
			},
			{
				inputString: "HAS email AND NOT HAS verificationToken",
				expected: {
					$and: [
						{ email: { $exists: true } },
						{ verificationToken: { $exists: false } },
					],
				},
			},
		];

		for (const input of inputs) {
			const t = new Tokenizer(input.inputString);
			const p = new Parser(t);
			const mongoQuery = generateQuery(p.parse());
			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});
	test("Test creating IS queries", () => {
		const inputs = [
			{
				inputString: "price IS double",
				expected: { price: { $type: "double" } },
			},
			{
				inputString: "name IS string",
				expected: { name: { $type: "string" } },
			},
			{
				inputString: "receipt IS object",
				expected: { receipt: { $type: "object" } },
			},
			{
				inputString: "list IS array",
				expected: { list: { $type: "array" } },
			},
			{
				inputString: "image IS binData",
				expected: { image: { $type: "binData" } },
			},
			{
				inputString: "foo IS objectId",
				expected: { foo: { $type: "objectId" } },
			},
			{
				inputString: "isAdmin IS bool",
				expected: { isAdmin: { $type: "bool" } },
			},
			{
				inputString: "birthday IS date",
				expected: { birthday: { $type: "date" } },
			},
			{
				inputString: "bar IS null",
				expected: { bar: { $type: "null" } },
			},
			{
				inputString: "pattern IS regex",
				expected: { pattern: { $type: "regex" } },
			},
			{
				inputString: "code IS javascript",
				expected: { code: { $type: "javascript" } },
			},
			{
				inputString: "age IS int",
				expected: { age: { $type: "int" } },
			},
			{
				inputString: "createdOn IS timestamp",
				expected: { createdOn: { $type: "timestamp" } },
			},
			{
				inputString: "counter IS long",
				expected: { counter: { $type: "long" } },
			},
			{
				inputString: "discount IS decimal",
				expected: { discount: { $type: "decimal" } },
			},
			{
				inputString: "minimum IS minKey",
				expected: { minimum: { $type: "minKey" } },
			},
			{
				inputString: "maximum IS maxKey",
				expected: { maximum: { $type: "maxKey" } },
			},
		];
		for (const input of inputs) {
			const t = new Tokenizer(input.inputString);
			const p = new Parser(t);
			const mongoQuery = generateQuery(p.parse());
			expect(mongoQuery).toStrictEqual(input.expected);
		}
	});
});
