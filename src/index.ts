import { generateQuery } from "./generator/generator";
import { Parser } from "./parser/parser";
import { Tokenizer } from "./tokenizer/tokenizer";

export function GetMongoQuery(input: string) {
	const tokenizer = new Tokenizer(input);
	const parser = new Parser(tokenizer);

	return generateQuery(parser.parse());
}
