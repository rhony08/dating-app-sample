type DataPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K;
}[keyof T];

type DataPropertiesOnly<T> = {
  [P in DataPropertyNames<T>]: T[P] extends object ? Attributes<T[P]> : T[P];
};

export type Attributes<T> = DataPropertiesOnly<T>;
export type ExcludeMethods<T> = DataPropertiesOnly<T>;
export type Key<T> = keyof T;
export type Params<T> = Partial<DataPropertiesOnly<T>>;
