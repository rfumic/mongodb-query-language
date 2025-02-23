import type { Token } from "./token";

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
				token = { type: "EQUALS", literal: this.currentChar };
				break;
			}
			case "<": {
				token = { type: "LT", literal: this.currentChar };
				break;
			}
			case ">": {
				token = { type: "GT", literal: this.currentChar };
				break;
			}
			case "": {
				token = { type: "EOF", literal: this.currentChar };
				break;
			}
		}
		this.readChar();
		return token;
	}
}
