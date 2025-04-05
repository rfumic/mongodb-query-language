import { Parser } from "../parser/parser";
import { Tokenizer } from "../tokenizer/tokenizer";
import { generateQuery } from "./generator";

describe("Generator", () => {
	test("Test creating basic queries", () => {
		const inputs = [
			{ inputString: "age > 18", expected: { age: { $gt: 18 } } },
			{ inputString: "age >= 18", expected: { age: { $gte: 18 } } },
			{ inputString: "age < 18.11", expected: { age: { $lt: 18.11 } } },
			{ inputString: "age <= 18", expected: { age: { $lte: 18 } } },
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
