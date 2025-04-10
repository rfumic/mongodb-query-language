import type {
	ASTNode,
	AnyExpression,
	BitExpression,
	ComparisonExpression,
	ContainsExpression,
	Identifier,
	InExpression,
	Literal,
	LogicalExpression,
	ModExpression,
	NotExpression,
	SizeExpression,
} from "../ast/ast";
import type { Token, TokenType } from "../tokenizer/token";
import type { Tokenizer } from "../tokenizer/tokenizer";
import { getIntegerFromLiteral } from "../utils/utils";

export class Parser {
	private tokenizer: Tokenizer;
	private currentToken: Token | null;

	constructor(tokenizer: Tokenizer) {
		this.tokenizer = tokenizer;
		this.currentToken = this.tokenizer.nextToken();
	}

	private eat(tokenType: TokenType) {
		if (this.currentToken?.type === tokenType) {
			this.currentToken = this.tokenizer.nextToken();
		} else {
			throw new Error(
				`Unexpected token: ${this.currentToken?.type}, expected: ${tokenType}`,
			);
		}
	}

	private parseExpression(): ASTNode {
		let node = this.parseTerm();

		while (
			this.currentToken &&
			(this.currentToken.type === "AND" ||
				this.currentToken.type === "OR" ||
				this.currentToken.type === "NOR")
		) {
			const token = this.currentToken;
			this.eat(token.type);
			node = {
				type: "LogicalExpression",
				operator: token.literal,
				left: node,
				right: this.parseTerm(),
			} as LogicalExpression;
		}

		return node;
	}

	private parseTerm(): ASTNode {
		let node = this.parseNotExpression();

		while (
			this.currentToken &&
			(this.currentToken.type === "EQ" ||
				this.currentToken.type === "GT" ||
				this.currentToken.type === "LT" ||
				this.currentToken.type === "GTE" ||
				this.currentToken.type === "LTE" ||
				this.currentToken.type === "NEQ")
		) {
			const token = this.currentToken;
			this.eat(token.type);
			node = {
				type: "ComparisonExpression",
				operator: token.literal,
				left: node,
				right: this.parseFactor(),
			} as ComparisonExpression;
		}

		return node;
	}

	private parseNotExpression(): ASTNode {
		if (this.currentToken?.type === "NOT") {
			this.eat("NOT");
			return {
				type: "NotExpression",
				operator: "NOT",
				argument: this.parseComparison(),
			} as NotExpression;
		}
		return this.parseComparison();
	}

	private parseComparison(): ASTNode {
		let node = this.parseFactor();

		while (
			this.currentToken &&
			[
				"EQ",
				"GT",
				"LT",
				"GTE",
				"LTE",
				"NEQ",
				"IN",
				"NOT_IN",
				"MOD",
				"CONTAINS",
				"SIZE",
				"BIT",
			].includes(this.currentToken.type)
		) {
			const token = this.currentToken;
			this.eat(token.type);

			if (token.type === "BIT") {
				const bitOperator = this.currentToken;
				if (
					bitOperator.type === "ALL_SET" ||
					bitOperator.type === "ALL_CLEAR" ||
					bitOperator.type === "ANY_SET" ||
					bitOperator.type === "ANY_CLEAR"
				) {
					this.eat(bitOperator.type);
					const bits = this.parseBitValues();
					node = {
						type: "BitExpression",
						field: node as Identifier,
						operator: bitOperator.type,
						bits: bits,
					} as BitExpression;
				} else {
					throw new Error(`Unexpected bit operator: ${bitOperator.type}`);
				}
			} else if (token.type === "CONTAINS") {
				this.eat("LPAREN");
				const values = this.parseValueList();
				this.eat("RPAREN");

				node = {
					type: "ContainsExpression",
					field: node as Identifier,
					values: values,
				} as ContainsExpression;
			} else if (token.type === "IN" || token.type === "NOT_IN") {
				this.eat("LPAREN");
				const values = this.parseValueList();
				this.eat("RPAREN");

				node = {
					type: "InExpression",
					operator: token.type === "IN" ? "IN" : "NOT IN",
					field: node as Identifier,
					values: values,
				} as InExpression;
			} else if (token.type === "MOD") {
				const divisor = this.parseNumber();
				this.eat("EQ");
				const remainder = this.parseNumber();

				node = {
					type: "ModExpression",
					field: node as Identifier,
					divisor: divisor,
					remainder: remainder,
				} as ModExpression;
			} else if (token.type === "SIZE") {
				const size = this.parseNumber();
				node = {
					type: "SizeExpression",
					field: node as Identifier,
					size: size,
				} as SizeExpression;
			} else {
				node = {
					type: "ComparisonExpression",
					operator: token.literal,
					left: node,
					right: this.parseFactor(),
				} as ComparisonExpression;
			}
		}

		return node;
	}

	private isTokenType(type: TokenType): boolean {
		return this.currentToken?.type === type;
	}

	private parseBitValues(): number | number[] {
		if (!this.currentToken) {
			throw new Error("Unexpected end of input");
		}

		if (this.isTokenType("LPAREN")) {
			this.eat("LPAREN");
			const bits: number[] = [];

			while (this.currentToken && !this.isTokenType("RPAREN")) {
				if (!this.currentToken) {
					throw new Error("Unexpected end of input");
				}

				if (this.isTokenType("INT_LITERAL")) {
					bits.push(getIntegerFromLiteral(this.currentToken.literal));
					this.eat("INT_LITERAL");
				} else if (this.isTokenType("COMMA")) {
					this.eat("COMMA");
				} else {
					throw new Error(
						`Unexpected token in bit values: ${this.currentToken.type}`,
					);
				}
			}

			if (!this.isTokenType("RPAREN")) {
				throw new Error("Expected closing parenthesis");
			}

			this.eat("RPAREN");
			return bits;
		}

		if (this.currentToken?.type === "INT_LITERAL") {
			const bit = getIntegerFromLiteral(this.currentToken.literal);
			this.eat("INT_LITERAL");
			return bit;
		}

		throw new Error(`Expected bit values, but got: ${this.currentToken?.type}`);
	}
	private parseNumber(): number {
		if (this.currentToken?.type === "INT_LITERAL") {
			const value = getIntegerFromLiteral(this.currentToken.literal);
			this.eat("INT_LITERAL");
			return value;
		}

		if (this.currentToken?.type === "FLOAT_LITERAL") {
			const value = Number.parseFloat(this.currentToken.literal);
			this.eat("FLOAT_LITERAL");
			return value;
		}

		throw new Error(`Expected a number, but got: ${this.currentToken?.type}`);
	}

	private parseValueList(): Literal[] {
		const values: Literal[] = [];
		while (this.currentToken && this.currentToken.type !== "RPAREN") {
			if (this.currentToken.type === "INT_LITERAL") {
				values.push({
					type: "Literal",
					value: getIntegerFromLiteral(this.currentToken.literal),
				} as Literal);
				this.eat("INT_LITERAL");
			} else if (this.currentToken.type === "FLOAT_LITERAL") {
				values.push({
					type: "Literal",
					value: Number.parseFloat(this.currentToken.literal),
				} as Literal);
				this.eat("FLOAT_LITERAL");
			} else if (this.currentToken.type === "STRING_LITERAL") {
				values.push({
					type: "Literal",
					value: this.currentToken.literal,
				} as Literal);
				this.eat("STRING_LITERAL");
			} else if (this.currentToken.type === "COMMA") {
				this.eat("COMMA");
			} else {
				throw new Error(
					`Unexpected token in value list: ${this.currentToken.type}`,
				);
			}
		}
		return values;
	}

	private parseFactor(): ASTNode {
		const token = this.currentToken;

		if (token?.type === "NOT") {
			this.eat("NOT");
			return {
				type: "NotExpression",
				operator: "NOT",
				argument: this.parseFactor(),
			} as NotExpression;
		}
		if (token?.type === "FIELD") {
			this.eat("FIELD");
			const fieldName = token.literal;

            // TODO: this is wrong ????
			if (this.currentToken?.type === "ANY") {
				this.eat("ANY");
				const condition = this.parseComparison();
				return {
					type: "AnyExpression",
					field: { type: "Identifier", name: fieldName },
					condition: condition as ComparisonExpression,
				} as AnyExpression;
			}

			return {
				type: "Identifier",
				name: fieldName,
			} as Identifier;
		}

		if (token?.type === "INT_LITERAL") {
			this.eat("INT_LITERAL");
			return {
				type: "Literal",
				value: getIntegerFromLiteral(token.literal),
			} as Literal;
		}

		if (token?.type === "FLOAT_LITERAL") {
			this.eat("FLOAT_LITERAL");
			return {
				type: "Literal",
				value: Number.parseFloat(token.literal),
			} as Literal;
		}

		if (token?.type === "STRING_LITERAL") {
			this.eat("STRING_LITERAL");
			return {
				type: "Literal",
				value: token.literal,
			} as Literal;
		}

		if (token?.type === "LPAREN") {
			this.eat("LPAREN");
			const node = this.parseExpression();
			this.eat("RPAREN");
			return node;
		}
		throw new Error(`Unexpected token: ${token?.type}`);
	}

	public parse(): ASTNode {
		return this.parseExpression();
	}
}
