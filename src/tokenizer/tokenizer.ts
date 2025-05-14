import { isDigit, isHexDigit, isLetter, isWhitespace } from "../utils/utils";
import { type Token, getIdentifierType } from "./token";

export class Tokenizer {
	input: string;
	currentChar = "";
	currentCharPosition = 0;
	readPosition = 0;

	constructor(input: string) {
		this.input = input;
		this.readChar();
	}

	private readChar() {
		if (this.readPosition >= this.input.length) {
			this.currentChar = "";
		} else {
			this.currentChar = this.input[this.readPosition] ?? "";
		}
		this.currentCharPosition = this.readPosition++;
	}

	private nextTokenCache: Token | null = null;
	peekToken() {
		if (!this.nextTokenCache) {
			this.nextTokenCache = this.nextToken();
		}
		return this.nextTokenCache;
	}

	nextToken() {
		let token: Token | null = null;
		if (this.nextTokenCache) {
			token = this.nextTokenCache;
			this.nextTokenCache = null;
			return token;
		}

		this.eatWhitespace();

		switch (this.currentChar) {
			case ",": {
				token = { type: "COMMA", literal: this.currentChar };
				break;
			}
			case "(": {
				token = { type: "LPAREN", literal: this.currentChar };
				break;
			}
			case ")": {
				token = { type: "RPAREN", literal: this.currentChar };
				break;
			}
			case "=": {
				token = { type: "EQ", literal: this.currentChar };
				break;
			}
			case "<": {
				if (this.peek() === "=") {
					this.readChar();
					token = { type: "LTE", literal: "<=" };
				} else {
					token = { type: "LT", literal: this.currentChar };
				}
				break;
			}
			case ">": {
				if (this.peek() === "=") {
					this.readChar();
					token = { type: "GTE", literal: ">=" };
				} else {
					token = { type: "GT", literal: this.currentChar };
				}
				break;
			}
			case '"': {
				token = { type: "STRING_LITERAL", literal: this.readString() };
				break;
			}
			case "'": {
				token = { type: "STRING_LITERAL", literal: this.readString("'") };
				break;
			}
			case "": {
				token = { type: "EOF", literal: this.currentChar };
				break;
			}
			default: {
				if (this.currentChar === "!" && this.peek() === "=") {
					this.readChar();
					token = { type: "NEQ", literal: "!=" };
					break;
				}
				if (isDigit(this.currentChar) || this.currentChar === "-") {
					return this.readNumber();
				}

				if (isLetter(this.currentChar)) {
					const literal = this.readIdentifier();
					token = { type: getIdentifierType(literal), literal: literal };
					return token;
				}

				token = { type: "UNKNOWN", literal: this.currentChar };
			}
		}
		this.readChar();
		return token;
	}
	private readIdentifier() {
		const position = this.currentCharPosition;
		while (isLetter(this.currentChar) || isDigit(this.currentChar)) {
			this.readChar();
		}
		return this.input.substring(position, this.currentCharPosition);
	}

	private readString(stringDelimiter = '"') {
		const position = this.currentCharPosition + 1;
		do {
			this.readChar();
		} while (this.currentChar !== stringDelimiter && this.currentChar !== "");

		return this.input.substring(position, this.currentCharPosition);
	}

	private readNumber(): Token {
		const startPosition = this.currentCharPosition;
		const isNegative = this.currentChar === "-";

		if (isNegative) {
			this.readChar();
		}

		let isFloatingPoint = false;
		let skipFloatingPointCheck = false;

		// binary numbers
		if (this.currentChar === "0" && this.peek() === "b") {
			this.readChar();
			this.readChar();
			while (this.currentChar === "0" || this.currentChar === "1") {
				this.readChar();
			}

			return {
				type: "INT_LITERAL",
				literal: `${this.input.substring(startPosition, this.currentCharPosition)}`,
			};
		}

		if (this.currentChar === "0" && this.peek() === "x") {
			this.readChar();
			this.readChar();
			skipFloatingPointCheck = true;
		}

		while (
			isDigit(this.currentChar) ||
			isHexDigit(this.currentChar) ||
			(!skipFloatingPointCheck && !isFloatingPoint && this.currentChar === ".")
		) {
			if (this.currentChar === ".") {
				isFloatingPoint = true;
			}
			this.readChar();
		}

		return {
			type: isFloatingPoint ? "FLOAT_LITERAL" : "INT_LITERAL",
			literal: this.input.substring(startPosition, this.currentCharPosition),
		};
	}

	private eatWhitespace() {
		while (isWhitespace(this.currentChar)) {
			this.readChar();
		}
	}

	private peek() {
		if (this.readPosition >= this.input.length) {
			return "";
		}
		return this.input[this.readPosition];
	}
}
