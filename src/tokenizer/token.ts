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
	FLOAT_KEYWORD: "float",

	FIELD: "FIELD",
	INT_LITERAL: "INT_LITERAL",
	FLOAT_LITERAL: "FLOAT_LITERAL",
	STRING_LITERAL: "STRING_LITERAL",
	BOOL_LITERAL: "BOOL_LITERAL",

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

	TRUE: "BOOL_LITERAL",
	FALSE: "BOOL_LITERAL",

	int: "INT_KEYWORD",
	float: "FLOAT_KEYWORD",
} as const;

export function getIdentifierType(identifier: string) {
	return keywords[identifier] ?? "FIELD";
}
