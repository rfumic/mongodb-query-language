import {
	type ASTNode,
	type AnyExpression,
	type BitExpression,
	type ComparisonExpression,
	type ContainsExpression,
	type HasExpression,
	type Identifier,
	type InExpression,
	type IsExpression,
	type Literal,
	type LogicalExpression,
	type MatchesExpression,
	type ModExpression,
	type NotExpression,
	type SizeExpression,
	isIdentifier,
} from "../ast/ast";
import type { Token, TokenType } from "../tokenizer/token";
import type { Tokenizer } from "../tokenizer/tokenizer";
import { getIntegerFromLiteral } from "../utils/utils";
import * as utils from "../utils/utils";

export class Parser {
	private tokenizer: Tokenizer;
	private currentToken: Token;

	constructor(tokenizer: Tokenizer) {
		this.tokenizer = tokenizer;
		this.currentToken = this.tokenizer.nextToken();
	}

	private eat(tokenType: TokenType) {
		utils.assert(
			this.currentToken.type === tokenType,
			`Unexpected token: ${this.currentToken.type}, expected: ${tokenType}`,
		);
		this.currentToken = this.tokenizer.nextToken();
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
		if (this.currentToken.type === "NOT") {
			this.eat("NOT");
			return {
				type: "NotExpression",
				operator: "NOT",
				argument: this.parseHasExpression(),
			} as NotExpression;
		}
		return this.parseHasExpression();
	}

	private parseHasExpression(): ASTNode {
		if (this.currentToken.type === "HAS") {
			this.eat("HAS");
			const field = this.parseFactor();
			utils.assert(
				isIdentifier(field),
				`Unexpected token of type ${field.type}`,
			);
			return {
				type: "HasExpression",
				field: field,
			} as HasExpression;
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
				"NOT",
				"MOD",
				"MATCHES",
				"CONTAINS",
				"SIZE",
				"BIT",
			].includes(this.currentToken.type)
		) {
			const { type, literal } = this.currentToken;
			this.eat(type);

			switch (type) {
				case "BIT":
					node = this.parseBitExpression(node);
					break;
				case "CONTAINS":
					node = this.parseContainsExpression(node);
					break;
				case "NOT": {
					if (this.currentToken.type !== "IN") break;

					this.eat("IN");
					// biome-ignore lint/suspicious/noFallthroughSwitchClause: NOTE: intentional fallthrough to handle NOT IN case
				}
				case "IN":
					node = this.parseInExpression(node, type);
					break;
				case "MOD":
					node = this.parseModExpression(node);
					break;
				case "SIZE":
					node = this.parseSizeExpression(node);
					break;
				case "MATCHES":
					node = this.parseMatches(node);
					break;
				default:
					node = {
						type: "ComparisonExpression",
						operator: literal,
						left: node,
						right: this.parseFactor(),
					} as ComparisonExpression;
					break;
			}
		}

		return node;
	}

	private isTokenType(type: TokenType): boolean {
		return this.currentToken.type === type;
	}

	private parseBitValues(): number | number[] {
		utils.assert(this.currentToken, "Unexpected end of input");

		if (this.isTokenType("LPAREN")) {
			this.eat("LPAREN");
			const bits: number[] = [];

			while (this.currentToken && !this.isTokenType("RPAREN")) {
				utils.assert(this.currentToken, "Unexpected end of input");

				if (this.isTokenType("INT_LITERAL")) {
					bits.push(getIntegerFromLiteral(this.currentToken.literal));
					this.eat("INT_LITERAL");
				} else if (this.isTokenType("COMMA")) {
					this.eat("COMMA");
				} else {
					utils.throwError(
						`Unexpected token in bit values: ${this.currentToken.type}`,
					);
				}
			}

			utils.assert(this.isTokenType("RPAREN"), "Expected closing parenthesis");

			this.eat("RPAREN");
			return bits;
		}

		if (this.currentToken.type === "INT_LITERAL") {
			const bit = getIntegerFromLiteral(this.currentToken.literal);
			this.eat("INT_LITERAL");
			return bit;
		}

		utils.throwError(`Expected bit values, but got: ${this.currentToken.type}`);
	}
	private parseNumber(): number {
		if (this.currentToken.type === "INT_LITERAL") {
			const value = getIntegerFromLiteral(this.currentToken.literal);
			this.eat("INT_LITERAL");
			return value;
		}

		if (this.currentToken.type === "FLOAT_LITERAL") {
			const value = Number.parseFloat(this.currentToken.literal);
			this.eat("FLOAT_LITERAL");
			return value;
		}

		utils.throwError(`Expected a number, but got: ${this.currentToken.type}`);
	}

	private parseValueList(): Literal[] {
		const values: Literal[] = [];

		while (this.currentToken && this.currentToken.type !== "RPAREN") {
			const { type, literal } = this.currentToken;

			switch (type) {
				case "INT_LITERAL":
					values.push({
						type: "Literal",
						value: getIntegerFromLiteral(literal),
					});
					this.eat("INT_LITERAL");
					break;
				case "FLOAT_LITERAL":
					values.push({ type: "Literal", value: Number.parseFloat(literal) });
					this.eat("FLOAT_LITERAL");
					break;
				case "STRING_LITERAL":
					values.push({ type: "Literal", value: literal });
					this.eat("STRING_LITERAL");
					break;
				case "COMMA":
					this.eat("COMMA");
					break;
				default:
					utils.throwError(`Unexpected token in value list: ${type}`);
			}
		}

		return values;
	}

	private parseFactor(): ASTNode {
		utils.assert(this.currentToken, "Internal error");
		const { type, literal } = this.currentToken;

		switch (type) {
			case "NOT": {
				this.eat("NOT");
				return {
					type: "NotExpression",
					operator: "NOT",
					argument: this.parseFactor(),
				} as NotExpression;
			}
			case "FIELD": {
				this.eat("FIELD");
				const fieldName = literal;

				// TODO: this is wrong ????
				if (this.currentToken.type === "ANY") {
					this.eat("ANY");
					const condition = this.parseComparison();
					return {
						type: "AnyExpression",
						field: { type: "Identifier", name: fieldName },
						condition: condition as ComparisonExpression,
					} as AnyExpression;
				}

				if (this.currentToken.type === "IS") {
					this.eat("IS");
					return {
						type: "IsExpression",
						field: { type: "Identifier", name: fieldName },
						typeKeyword: this.currentToken.literal,
					} as IsExpression;
				}

				return {
					type: "Identifier",
					name: fieldName,
				} as Identifier;
			}

			case "INT_LITERAL": {
				this.eat("INT_LITERAL");
				return {
					type: "Literal",
					value: getIntegerFromLiteral(literal),
				} as Literal;
			}

			case "FLOAT_LITERAL": {
				this.eat("FLOAT_LITERAL");
				return {
					type: "Literal",
					value: Number.parseFloat(literal),
				} as Literal;
			}

			case "STRING_LITERAL": {
				this.eat("STRING_LITERAL");
				return {
					type: "Literal",
					value: literal,
				} as Literal;
			}

			case "BOOL_LITERAL": {
				this.eat("BOOL_LITERAL");
				return {
					type: "Literal",
					value: utils.getBooleanFromLiteral(literal),
				} as Literal;
			}

			case "LPAREN": {
				this.eat("LPAREN");
				const node = this.parseExpression();
				this.eat("RPAREN");
				return node;
			}
		}

		utils.throwError(`Unexpected token: ${type}`);
	}

	private parseMatches(field: ASTNode): MatchesExpression {
		utils.assert(this.currentToken, "Internal error");

		const patternToken = this.currentToken;

		utils.assert(
			patternToken.type === "STRING_LITERAL",
			`Unexpected pattern type: ${patternToken.type}`,
		);

		this.eat("STRING_LITERAL");
		let optionsLiteral = "";
		if (this.currentToken.type === "STRING_LITERAL") {
			optionsLiteral = this.currentToken.literal;
			this.eat("STRING_LITERAL");
		}

		return {
			type: "MatchesExpression",
			field: field as Identifier,
			pattern: patternToken.literal,
			options: optionsLiteral,
		};
	}

	private parseBitExpression(node: ASTNode): BitExpression {
		utils.assert(this.currentToken, "Internal error");

		const bitOperator = this.currentToken;
		utils.assert(
			bitOperator.type === "ALL_SET" ||
				bitOperator.type === "ALL_CLEAR" ||
				bitOperator.type === "ANY_SET" ||
				bitOperator.type === "ANY_CLEAR",
			`Unexpected bit operator: ${bitOperator.type}`,
		);

		this.eat(bitOperator.type);

		const bits = this.parseBitValues();
		return {
			type: "BitExpression",
			field: node as Identifier,
			operator: bitOperator.type,
			bits: bits,
		};
	}

	private parseContainsExpression(node: ASTNode): ContainsExpression {
		this.eat("LPAREN");
		const values = this.parseValueList();
		this.eat("RPAREN");

		return {
			type: "ContainsExpression",
			field: node as Identifier,
			values: values,
		};
	}

	private parseInExpression(node: ASTNode, tokenType: TokenType): InExpression {
		this.eat("LPAREN");
		const values = this.parseValueList();
		this.eat("RPAREN");

		return {
			type: "InExpression",
			operator: tokenType === "IN" ? "IN" : "NOT IN",
			field: node as Identifier,
			values: values,
		};
	}

	private parseModExpression(node: ASTNode): ModExpression {
		const divisor = this.parseNumber();
		this.eat("EQ");
		const remainder = this.parseNumber();

		return {
			type: "ModExpression",
			field: node as Identifier,
			divisor: divisor,
			remainder: remainder,
		};
	}

	private parseSizeExpression(node: ASTNode): SizeExpression {
		const size = this.parseNumber();
		return {
			type: "SizeExpression",
			field: node as Identifier,
			size: size,
		};
	}

	public parse(): ASTNode {
		return this.parseExpression();
	}
}
