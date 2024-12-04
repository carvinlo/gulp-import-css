// 获取 parent context
const { get } = require("lodash/object");
const { parse, eval } = require("expression-eval");

function contextMaker(scope, path, context) {
  if (!path) return scope;
  const currentScope = get(context, path);
  // xx.0 或 xx[0]
  const top = context.top || scope;
  const parentPath = path.replace(/\.?[^.\[]+(\.\d+|\[\d+\])?$/, "");
  if (!parentPath) {
    // object.value : children.0.children.0 || children[0].children[0]
    const _scope = path.search(/\.?[^.\[]+(\.\d+|\[\d+\])$/) === -1 ? scope : currentScope;
    return {
      ..._scope,
      parent: context,
      top,
    };
  }
  const parentScope = get(scope, parentPath);
  // object.value : children.0.children.0 || children[0].children[0]
  console.log('>>>>>1', parentPath)
  const _scope = parentPath.search(/\.?[^.\[]+(\.\d+|\[\d+\])$/) === -1 ? scope : parentScope;
  return contextMaker(scope, parentPath, { ..._scope, parent: context, top });
}

const scope = {
  level: 1,
  object: {
    value: "12",
  },
  children: [
    {
      level: 2,
      children: [
        {
          level: 3,
        },
      ],
    },
  ],
};
const ast = parse("parent.parent.level === 1 && ROLES.includes('admin')"); // abstract syntax tree (AST)
const context = contextMaker(scope, "children.0.children.0", scope);
console.log(JSON.stringify(context, null, "    "));
// 内置 ROLES 角色
context.ROLES = ["admin"];
const value = eval(ast, context); // true
console.log("value:", value);

console.log(JSON.stringify(contextMaker(scope, "object.value", scope), null, "    "));
