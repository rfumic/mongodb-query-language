const TOKEN_TYPE = {
	COMMA: ",",
	LPAREN: "(",
	RPAREN: ")",

	// comparison operators
	EQ: "=",
	NEQ: "!=",
	LT: "<",
	GT: ">",
	LTE: "<=",
	GTE: ">=",
	IN: "IN",
	NOT_IN: "NOT_IN",

	// logical operators
	AND: "AND",
	NOT: "NOT",
	OR: "OR",
	NOR: "NOR",
	IS: "IS",
	HAS: "HAS",

	// evaluation operators
	MOD: "MOD",
	MATCHES: "MATCHES",

	// array operators
	CONTAINS: "CONTAINS",
	ANY: "ANY",
	SIZE: "SIZE",

	// bit operators
	BIT: "BIT",
	ANY_CLEAR: "ANY_CLEAR",
	ANY_SET: "ANY_SET",
	ALL_CLEAR: "ALL_CLEAR",
	ALL_SET: "ALL_SET",

	// type keywords
	INT_KEYWORD: "int",

	FIELD: "FIELD",
	INT_LITERAL: "INT_LITERAL",

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
	NOT: "NOT",
	OR: "OR",
	NOR: "NOR",
	IN: "IN",
	NOT_IN: "NOT_IN",
	IS: "IS",
	HAS: "HAS",
	MOD: "MOD",
	MATCHES: "MATCHES",
	CONTAINS: "CONTAINS",
	ANY: "ANY",
	SIZE: "SIZE",
	BIT: "BIT",
	ANY_CLEAR: "ANY_CLEAR",
	ANY_SET: "ANY_SET",
	ALL_CLEAR: "ALL_CLEAR",
	ALL_SET: "ALL_SET",

	int: "INT_KEYWORD",
} as const;

export function getIdentifierType(identifier: string) {
	return keywords[identifier] ?? "FIELD";
}
