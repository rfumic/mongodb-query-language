import type { Document, Filter } from "mongodb";
import {
	type ASTNode,
	type Identifier,
	type Literal,
	isBitExpression,
	isComparisonExpression,
	isContainsExpression,
	isIdentifier,
	isInExpression,
	isLogicalExpression,
	isMatchesExpression,
	isModExpression,
	isSizeExpression,
} from "../ast/ast";

// TODO: move this to a separate file later
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
} as const;

// TODO:
//     - HAS
//     - IS
//     - ANY
export function generateQuery(tree: ASTNode): Filter<Document> {
	if (isMatchesExpression(tree)) {
		return {
			[tree.field.name]: {
				$regex: tree.pattern,
				$options: tree.options,
			},
		};
	}
	if (isBitExpression(tree)) {
		const operator = mongoOperatorTable[tree.operator];
		if (!operator) {
			// TODO: handle error
			return {};
		}

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

	if (isLogicalExpression(tree)) {
		const operator = mongoOperatorTable[tree.operator];

		if (!operator) {
			// TODO: handle error
			return {};
		}
		// TODO: handle NOT
		if (operator === "$not") {
			return {};
		}

		const left = generateQuery(tree.left);
		const right = generateQuery(tree.right);

		return {
			[operator]: [left, right],
		};
	}
	if (isInExpression(tree)) {
		const values = tree.values.map((literal) => literal.value);
		const operator = mongoOperatorTable[tree.operator];

		if (!operator) {
			// TODO: handle error
			return {};
		}

		return {
			[tree.field.name]: {
				[operator]: values,
			},
		};
	}
	if (isComparisonExpression(tree)) {
		const leftIsIdentifier = isIdentifier(tree.left);
		const rightIsIdentifier = isIdentifier(tree.right);

		if (leftIsIdentifier && rightIsIdentifier) {
			const leftSide = tree.left as Identifier;
			const rightSide = tree.right as Identifier;
			const operator = mongoOperatorTable[tree.operator];
			if (!operator) {
				// TODO: handle error
				return {};
			}
			return {
				$expr: {
					[operator]: [leftSide.name, rightSide.name],
				},
			};
		}

		let field: Identifier;
		let literal: Literal;
		if (leftIsIdentifier) {
			field = tree.left as Identifier;
			// TODO: check if is literal
			literal = tree.right as Literal;
		} else if (rightIsIdentifier) {
			field = tree.right as Identifier;
			// TODO: check if is literal
			literal = tree.left as Literal;
		} else {
			// TODO: handle error
			return {};
		}

		const operator = mongoOperatorTable[tree.operator];
		if (!operator) {
			// TODO: handle error
			return {};
		}
		return {
			[field.name]: {
				[operator]: literal.value,
			},
		};
	}
	return {};
}
