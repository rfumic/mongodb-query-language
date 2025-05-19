import { getIdentifierType } from "../tokenizer/token";

export type ASTNode = {
	type: string;
};

export type ComparisonExpression = {
	type: "ComparisonExpression";
	operator: string;
	left: ASTNode;
	right: ASTNode;
};

// TODO: move these to better place
export function isComparisonExpression(
	node: ASTNode,
): node is ComparisonExpression {
	const n = node as ComparisonExpression;
	return (
		n.left !== undefined &&
		n.right !== undefined &&
		n.operator !== undefined &&
		n.type === "ComparisonExpression"
	);
}
export type LogicalExpression = {
	type: "LogicalExpression";
	operator: "AND" | "OR" | "NOR";
	left: ASTNode;
	right: ASTNode;
};

export function isLogicalExpression(node: ASTNode): node is LogicalExpression {
	const n = node as LogicalExpression;
	return (
		n.left !== undefined &&
		n.right !== undefined &&
		n.operator !== undefined &&
		n.type === "LogicalExpression"
	);
}

export type NotExpression = {
	type: "NotExpression";
	operator: "NOT";
	argument:
		| ComparisonExpression
		| MatchesExpression
		| InExpression
		| HasExpression;
};

export function isNotExpression(node: ASTNode): node is NotExpression {
	const n = node as NotExpression;
	return (
		n.operator === "NOT" &&
		n.type === "NotExpression" &&
		n.argument !== undefined
	);
}

export type InExpression = {
	type: "InExpression";
	operator: "IN" | "NOT IN";
	field: Identifier;
	values: Literal[];
};

export function isInExpression(node: ASTNode): node is InExpression {
	const n = node as InExpression;
	return (
		n.type === "InExpression" &&
		(n.operator === "IN" || n.operator === "NOT IN") &&
		n.field !== undefined &&
		n.values !== undefined
	);
}

export type ModExpression = {
	type: "ModExpression";
	field: Identifier;
	divisor: number;
	remainder: number;
};

export function isModExpression(node: ASTNode): node is ModExpression {
	const n = node as ModExpression;
	return (
		n.type === "ModExpression" &&
		n.field !== undefined &&
		n.divisor !== undefined &&
		n.remainder !== undefined
	);
}

export type MatchesExpression = {
	type: "MatchesExpression";
	field: Identifier;
	pattern: string;
	options?: string;
};

export function isMatchesExpression(node: ASTNode): node is MatchesExpression {
	const n = node as MatchesExpression;
	return (
		n.type === "MatchesExpression" &&
		n.field !== undefined &&
		n.pattern !== undefined
	);
}

export type AnyExpression = {
	type: "AnyExpression";
	field: Identifier;
	condition: ComparisonExpression;
};

export function isAnyExpression(node: ASTNode): node is AnyExpression {
	const n = node as AnyExpression;
	return (
		n.type === "AnyExpression" &&
		n.field !== undefined &&
		n.condition !== undefined
	);
}

export type ContainsExpression = {
	type: "ContainsExpression";
	field: Identifier;
	values: Literal[];
};

export function isContainsExpression(
	node: ASTNode,
): node is ContainsExpression {
	const n = node as ContainsExpression;
	return (
		n.type === "ContainsExpression" &&
		n.field !== undefined &&
		n.values !== undefined
	);
}

export type SizeExpression = {
	type: "SizeExpression";
	field: Identifier;
	size: number;
};

export function isSizeExpression(node: ASTNode): node is SizeExpression {
	const n = node as SizeExpression;
	return (
		n.type === "SizeExpression" && n.field !== undefined && n.size !== undefined
	);
}

export type HasExpression = {
	type: "HasExpression";
	field: Identifier;
};

export function isHasExpression(node: ASTNode): node is HasExpression {
	const n = node as HasExpression;
	return n.type === "HasExpression" && n.field !== undefined;
}

export type BitExpression = {
	type: "BitExpression";
	field: Identifier;
	operator: "ALL_SET" | "ALL_CLEAR" | "ANY_SET" | "ANY_CLEAR";
	bits: number | number[];
};

export function isBitExpression(node: ASTNode): node is BitExpression {
	const n = node as BitExpression;
	return (
		n.type === "BitExpression" &&
		n.field !== undefined &&
		n.bits !== undefined &&
		n.operator !== undefined
	);
}

export type IsExpression = {
	type: "IsExpression";
	field: Identifier;
	// NOTE: The actual type keyword e.g. `double`, `string`...
	typeKeyword: string;
};
export function isIsExpression(node: ASTNode): node is IsExpression {
	const n = node as IsExpression;
	const identifierType = getIdentifierType(n.typeKeyword);
	return (
		n.type === "IsExpression" &&
		n.field !== undefined &&
		identifierType === "TYPE_KEYWORD"
	);
}

// field
export type Identifier = {
	type: "Identifier";
	name: string;
};

export function isIdentifier(node: ASTNode): node is Identifier {
	const n = node as Identifier;
	return n.type === "Identifier" && n.name !== undefined;
}

export type Literal = {
	type: "Literal";
	value: string | number | boolean;
};

export function isLiteral(node: ASTNode): node is Literal {
	const n = node as Literal;
	return n.type === "Literal" && n.value !== undefined;
}
