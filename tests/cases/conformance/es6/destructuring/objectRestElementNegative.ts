let o = { a: 1, b: 'no' };
var { ...mustBeLast, a } = o;
function stillMustBeLast({ ...mustBeLast, a }: {a: number, b: string}): void {
}
// TODO: generics are not allowed
