export default function ({ types: t }) {
	const reAllCaps = /^[A-Z_]+[A-Z0-9_]*$/;
	function getParam(key, state) {
		let result;
		if (state && state.opts && state.opts.hasOwnProperty(key))
			result = state.opts[key];

		if (reAllCaps.test(key))
			result = process.env[key];

		if (result==='true' || result===true || result==='1' || result===1)
			return true;

		if (result==='false' || result===false || result==='0' || result===0)
			return false;
	}

	function check(node, state) {
		if (t.isStringLiteral(node.test))
			return getParam(node.test.value, state);

		if (t.isUnaryExpression(node.test) && node.test.operator=='!' && node.test.prefix) {
			let r = check(node.test.argument);
			return r === undefined ? r : !r;
		}
	}

	function isRelease(state) {
		return state.opts.isRelease || process.env.ENV=='RELEASE';
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
				let cr = check(node, state);
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
