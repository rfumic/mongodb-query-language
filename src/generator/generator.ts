import {
	type ASTNode,
	type Identifier,
	type Literal,
	isComparisonExpression,
	isIdentifier,
	isInExpression,
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
};

export function generateQuery(tree: ASTNode) {
	console.log("tree:", tree);
	if (isInExpression(tree)) {
		const values = tree.values.map((literal) => literal.value);
		const operator = mongoOperatorTable[tree.operator];

		if (!operator) {
			// TODO: handle error
			return;
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
			// TODO: use $expr here
			const leftSide = tree.left as Identifier;
			const rightSide = tree.right as Identifier;
			const operator = mongoOperatorTable[tree.operator];
			if (!operator) {
				// TODO: handle error
				return;
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
			return;
		}

		// TODO:
		// maybe extract to function that returns like:
		//     {$gte: [left, right]}
		const operator = mongoOperatorTable[tree.operator];
		if (!operator) {
			// TODO: handle error
			return;
		}
		return {
			[field.name]: {
				[operator]: literal.value,
			},
		};
	}
}
