export type NullableString<T extends string = string> = T | null | undefined;

export interface Named<Name extends string = string, Namespace extends NullableString = NullableString> {
  name: Name;
  namespace: Namespace;
}

export function namedHash<Name extends string = string>(
  name: Name,
  namespace?: NullableString
): string {
  if (namespace && name) {
    return `${namespace}/${name}`;
  }

  return name;
}

export function hasNamespace<Name extends string = string>(
  name: Named<Name>
): boolean {
  return name.namespace !== null;
}

export function name(named: string | Named): string {
  if (typeof named === "string") {
    return named;
  }

  return named.name;
}

export function namespace(named: string | Named): string | undefined {
  if (typeof named === "string") {
    return undefined;
  }

  return named.namespace;
}
