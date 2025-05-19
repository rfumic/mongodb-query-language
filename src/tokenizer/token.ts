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

	TYPE_KEYWORD: "TYPE_KEYWORD",

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

	double: "TYPE_KEYWORD",
	string: "TYPE_KEYWORD",
	object: "TYPE_KEYWORD",
	array: "TYPE_KEYWORD",
	binData: "TYPE_KEYWORD",
	objectId: "TYPE_KEYWORD",
	bool: "TYPE_KEYWORD",
	date: "TYPE_KEYWORD",
	null: "TYPE_KEYWORD",
	regex: "TYPE_KEYWORD",
	javascript: "TYPE_KEYWORD",
	int: "TYPE_KEYWORD",
	timestamp: "TYPE_KEYWORD",
	long: "TYPE_KEYWORD",
	decimal: "TYPE_KEYWORD",
	minKey: "TYPE_KEYWORD",
	maxKey: "TYPE_KEYWORD",
} as const;

export function getIdentifierType(identifier: string) {
	return keywords[identifier] ?? "FIELD";
}
