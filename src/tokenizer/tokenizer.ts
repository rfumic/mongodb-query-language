import { isDigit, isLetter, isWhitespace } from "../utils/utils";
import { getIdentifierType, type Token } from "./token";

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

	nextToken() {
		let token: Token | null = null;
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
				if (isLetter(this.currentChar)) {
					const literal = this.readIdentifier();
					token = { type: getIdentifierType(literal), literal: literal };
					return token;
				}

				if (isDigit(this.currentChar)) {
					token = { type: "INT_LITERAL", literal: this.readNumber() };
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

	private readNumber() {
		const position = this.currentCharPosition;
		while (isDigit(this.currentChar)) {
			this.readChar();
		}
		return this.input.substring(position, this.currentCharPosition);
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
