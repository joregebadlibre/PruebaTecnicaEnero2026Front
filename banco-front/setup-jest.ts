import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv();

if (typeof URL !== 'undefined') {
  (URL as any).createObjectURL ??= () => 'blob:jest';
  (URL as any).revokeObjectURL ??= () => undefined;
}

type CompatSpy<TArgs extends any[] = any[], TReturn = any> = ((...args: TArgs) => TReturn) & {
  and: {
    returnValue: (v: TReturn) => CompatSpy<TArgs, TReturn>;
    callFake: (fn: (...args: TArgs) => TReturn) => CompatSpy<TArgs, TReturn>;
  };
};

function createCompatSpy<TArgs extends any[] = any[], TReturn = any>(): CompatSpy<TArgs, TReturn> {
  const fn = jest.fn<TReturn, TArgs>() as unknown as CompatSpy<TArgs, TReturn>;
  fn.and = {
    returnValue: (v: TReturn) => {
      (fn as unknown as jest.Mock<TReturn, TArgs>).mockReturnValue(v);
      return fn;
    },
    callFake: (impl: (...args: TArgs) => TReturn) => {
      (fn as unknown as jest.Mock<TReturn, TArgs>).mockImplementation(impl);
      return fn;
    },
  };
  return fn;
}

(globalThis as any).jasmine ??= {};
(globalThis as any).jasmine.createSpy ??= (_name: string) => {
  return createCompatSpy();
};
(globalThis as any).jasmine.createSpyObj ??= (_name: string, methodNames: string[]) => {
  const obj: Record<string, unknown> = {};
  for (const m of methodNames) {
    obj[m] = createCompatSpy();
  }
  return obj;
};

(globalThis as any).spyOn ??= (target: any, method: string) => {
  const spy = jest.spyOn(target, method as any) as any;
  spy.and ??= {
    returnValue: (v: any) => {
      spy.mockReturnValue(v);
      return spy;
    },
    callFake: (impl: any) => {
      spy.mockImplementation(impl);
      return spy;
    },
  };
  return spy;
};

(globalThis as any).fail ??= (message?: string) => {
  throw new Error(message ?? 'Failed');
};
