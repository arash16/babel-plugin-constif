'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (_ref) {
	var t = _ref.types;

	var reAllCaps = /^[A-Z_]+[A-Z0-9_]*$/;
	function getParam(key, state) {
		var result = void 0;
		if (state && state.opts && state.opts.hasOwnProperty(key)) result = state.opts[key];

		if (reAllCaps.test(key)) result = process.env[key];

		if (result === 'true' || result === true || result === '1' || result === 1) return true;

		if (result === 'false' || result === false || result === '0' || result === 0) return false;
	}

	function check(node, state) {
		if (t.isStringLiteral(node.test)) return getParam(node.test.value, state);

		if (t.isUnaryExpression(node.test) && node.test.operator == '!' && node.test.prefix) {
			var r = check(node.test.argument);
			return r === undefined ? r : !r;
		}
	}

	function isRelease(state) {
		return state.opts.isRelease || process.env.ENV == 'RELEASE';
	}

	var reDevVar = /^(console|logger)$/;
	return {
		visitor: {
			DebuggerStatement: function DebuggerStatement(path, state) {
				if (isRelease(state)) path.remove();
			},
			Identifier: function Identifier(path, state) {
				if (isRelease(state) && reDevVar.test(path.node.name)) path.getStatementParent().remove();
			},
			IfStatement: function IfStatement(path, state) {
				var node = path.node;

				var cr = check(node, state);
				if (cr === undefined) return;

				var result = cr ? node.consequent : node.alternate;
				if (result) path.replaceWith(result);else path.remove();
			}
		}
	};
};

;
