const TOKEN_TYPE = {
	COMMA: ",",
	LPAREN: "(",
	RPAREN: ")",

	EQUALS: "=",
	LT: "<",
	GT: ">",
	LTE: "<=",
	GTE: ">=",

	FIELD: "FIELD",
	INT: "INT",

	AND: "AND",

	UNKNOWN: "UNKNOWN",
	EOF: "EOF",
} as const;

export type TokenType = keyof typeof TOKEN_TYPE;

export type Token = {
	type: TokenType;
	literal: string;
};

export const keywords: Record<string, TokenType> = {
	AND: "AND",
} as const;

export function getIdentifierType(identifier: string) {
	return keywords[identifier] ?? "FIELD";
}
