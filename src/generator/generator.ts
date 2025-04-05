import {
	type Identifier,
	isComparisonExpression,
	type ASTNode,
	isIdentifier,
    Literal,
} from "../ast/ast";

// TODO: move this to a separate file later
const mongoOperatorTable: Record<string, string> = {
	"<": "$lt",
	"<=": "$lte",
	">": "$gt",
	">=": "$gte",
	"=": "$eq", // TODO: check this
};

export function generateQuery(tree: ASTNode) {
	console.log(tree);
	if (isComparisonExpression(tree)) {
		const leftIsIdentifier = isIdentifier(tree.left);
		const rightIsIdentifier = isIdentifier(tree.right);

		if (leftIsIdentifier && rightIsIdentifier) {
			// TODO: use $expr here
			return;
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

        const operator = mongoOperatorTable[tree.operator];
        if(!operator){
            // TODO: handle error
            return;
        }
        return {
            [field.name]: {
                [operator]: literal.value
            }
        }

	}
}
