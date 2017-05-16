export default function ({ types: t }) {
	function toSnakeCase(key) {
		return key.replace(/[a-z][A-Z]/g, s=> s[0]+'_'+s[1]).toUpperCase();
	}

	function getParam(key, state) {
		let keyS = toSnakeCase(key);
		let result = state.opts[keyS];
		if (state.opts.hasOwnProperty(key))
			result = state.opts[key];

		if (process.env[keyS]!==undefined)
			result = process.env[keyS];


		console.log(key, result);

		if (result==='true' || result===true || result==='1' || result===1)
			return true;

		if (result==='false' || result===false || result==='0' || result===0)
			return false;
	}

	function check(node, state) {
		if (t.isStringLiteral(node))
			return getParam(node.value, state);

		if (t.isUnaryExpression(node) && node.operator=='!') {
			let r = check(node.argument, state);
			return r === undefined ? r : !r;
		}
	}

	function isRelease(state) {
		return state.opts.isRelease || process.env.IS_RELEASE || /release|production/gi.test(process.env.ENV);
	}

	const reDevVar = /^(console|logger|log|debug)$/;
	return {
		visitor: {
			DebuggerStatement(path, state) {
				if (isRelease(state))
					path.remove();
			},
			Identifier(path, state) {
				if (isRelease(state) && reDevVar.test(path.node.name))
					path.getStatementParent().remove();
			},
			IfStatement(path, state) {
				const { node } = path;
				let cr = check(node.test, state);
				if (cr === undefined) return;

				let result = cr ? node.consequent : node.alternate;
				if (result)
					path.replaceWith(result);
				else
					path.remove();
			}
		}
	}
};
