const TOKEN_TYPE = {
	COMMA: ",",
	LPAREN: "(",
	RPAREN: ")",

	EQUALS: "=",
	LT: "<",
	GT: ">",
	LTE: "<",
	GTE: ">",

	FIELD: "FIELD",
	INT: "INT",

	UNKNOWN: "UNKNOWN",
	EOF: "EOF",
} as const;

export type TokenType = keyof typeof TOKEN_TYPE;

export class Token {
	type?: TokenType;
	literal?: string;
}
