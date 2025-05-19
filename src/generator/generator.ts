import type { Document, Filter } from "mongodb";
import {
	type ASTNode,
	type ComparisonExpression,
	HasExpression,
	type InExpression,
	type MatchesExpression,
	isAnyExpression,
	isBitExpression,
	isComparisonExpression,
	isContainsExpression,
	isHasExpression,
	isIdentifier,
	isInExpression,
	isIsExpression,
	isLiteral,
	isLogicalExpression,
	isMatchesExpression,
	isModExpression,
	isNotExpression,
	isSizeExpression,
} from "../ast/ast";
import * as Utils from "../utils/utils";

const mongoOperatorTable: Record<string, string> = {
	"<": "$lt",
	"<=": "$lte",
	">": "$gt",
	">=": "$gte",
	"=": "$eq", // TODO: check this
	"!=": "$ne",
	IN: "$in",
	"NOT IN": "$nin",
	AND: "$and",
	NOT: "$not",
	OR: "$or",
	NOR: "$nor",
	ALL_CLEAR: "$bitsAllClear",
	ALL_SET: "$bitsAllSet",
	ANY_CLEAR: "$bitsAnyClear",
	ANY_SET: "$bitsAnySet",
	ANY: "$elemMatch",
	HAS: "$exists",
} as const;

function getOperator(operator: string) {
	const result = mongoOperatorTable[operator];
	Utils.assert(result, `Unknown operator: ${operator}`);
	return result;
}

export function generateQuery(tree: ASTNode): Filter<Document> {
	if (isNotExpression(tree)) {
		switch (tree.argument.type) {
			case "ComparisonExpression":
				return generateComparisonQuery(tree.argument, true);
			case "MatchesExpression":
				return generateMatchesQuery(tree.argument, true);
			case "InExpression":
				return generateInQuery(tree.argument, true);
			case "HasExpression":
				return {
					[tree.argument.field.name]: {
						$exists: false,
					},
				};
		}
	}

	if (isIsExpression(tree)) {
		return {
			[tree.field.name]: {
				$type: tree.typeKeyword,
			},
		};
	}

	if (isHasExpression(tree)) {
		return {
			[tree.field.name]: {
				$exists: true,
			},
		};
	}

	if (isMatchesExpression(tree)) {
		return generateMatchesQuery(tree);
	}

	if (isBitExpression(tree)) {
		const operator = getOperator(tree.operator);

		return {
			[tree.field.name]: {
				[operator]: tree.bits,
			},
		};
	}

	if (isContainsExpression(tree)) {
		const values = tree.values.map((literal) => literal.value);

		return {
			[tree.field.name]: {
				$all: values,
			},
		};
	}

	if (isSizeExpression(tree)) {
		return {
			[tree.field.name]: {
				$size: tree.size,
			},
		};
	}

	if (isModExpression(tree)) {
		return {
			[tree.field.name]: {
				$mod: [tree.divisor, tree.remainder],
			},
		};
	}

	if (isAnyExpression(tree)) {
		return {
			[tree.field.name]: {
				$elemMatch: generateQuery(tree.condition),
			},
		};
	}

	if (isLogicalExpression(tree)) {
		const operator = getOperator(tree.operator);

		const left = generateQuery(tree.left);
		const right = generateQuery(tree.right);

		return {
			[operator]: [left, right],
		};
	}

	if (isComparisonExpression(tree)) {
		return generateComparisonQuery(tree);
	}

	if (isInExpression(tree)) {
		return generateInQuery(tree);
	}

	return {};
}

function generateInQuery(
	tree: InExpression,
	isNotQuery = false,
): Filter<Document> {
	const values = tree.values.map((literal) => literal.value);
	const operator = getOperator(tree.operator);
	const expression = { [operator]: values };

	return {
		[tree.field.name]: isNotQuery ? { $not: expression } : expression,
	};
}

function generateMatchesQuery(
	tree: MatchesExpression,
	isNotQuery = false,
): Filter<Document> {
	const expression = { $regex: tree.pattern, $options: tree.options };
	return {
		[tree.field.name]: isNotQuery ? { $not: expression } : expression,
	};
}

function generateComparisonQuery(
	tree: ComparisonExpression,
	isNotQuery = false,
): Filter<Document> {
	const { left, right, operator } = tree;
	const op = getOperator(operator);

	// Both sides are identifiers
	if (isIdentifier(left) && isIdentifier(right)) {
		const expression = { [op]: [`${left.name}`, `${right.name}`] };
		return { $expr: isNotQuery ? { $not: [expression] } : expression };
	}

	// One identifier and one literal
	const [field, value] = isIdentifier(left)
		? [left, right]
		: isIdentifier(right)
			? [right, left]
			: Utils.throwError("Comparison must have at least one identifier");

	Utils.assert(isLiteral(value), "Right-hand side must be a literal");

	const expression = { [op]: value.value };
	return { [field.name]: isNotQuery ? { $not: expression } : expression };
}
