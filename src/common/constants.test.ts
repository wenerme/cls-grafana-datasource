jest.mock('lodash-es', () => ({
  indexOf: (items: unknown[], value: unknown) => (Array.isArray(items) ? items.indexOf(value) : -1),
  find: (collection: Record<string, unknown> | undefined, predicate: (value: unknown, key: string) => boolean) => {
    if (!collection) {
      return undefined;
    }
    return Object.entries(collection).find(([key, value]) => predicate(value, key))?.[1];
  },
  pick: (value: Record<string, unknown>, keys: string[]) =>
    keys.reduce<Record<string, unknown>>((result, key) => {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        result[key] = value[key];
      }
      return result;
    }, {}),
}));

const { GetValidatedServiceAPIInfo, normalizeServiceType } = require('./constants');

describe('Tencent Cloud service API info validation', () => {
  it('normalizes ServiceType values from variable query input', () => {
    expect(normalizeServiceType(' CLS ')).toBe('cls');
    expect(normalizeServiceType('Monitor')).toBe('monitor');
    expect(normalizeServiceType(undefined)).toBe('');
  });

  it('returns a complete service API info for supported services', () => {
    expect(GetValidatedServiceAPIInfo(' CLS ', 'ap-shanghai')).toMatchObject({
      service: 'cls',
      host: 'cls.tencentcloudapi.com',
      path: '/cls',
      version: '2020-10-16',
    });
  });

  it('keeps finance region host/path overrides while preserving service version', () => {
    expect(GetValidatedServiceAPIInfo('cls', 'ap-shanghai-fsi')).toMatchObject({
      service: 'cls',
      host: 'cls.ap-shanghai-fsi.tencentcloudapi.com',
      path: '/fsi/cls/shanghai',
      version: '2020-10-16',
    });
  });

  it('rejects services with incomplete API metadata before sending a request', () => {
    expect(() => GetValidatedServiceAPIInfo('pcx', 'ap-shanghai')).toThrow(
      'Unsupported or incomplete Tencent Cloud API ServiceType "pcx". Missing version.',
    );
  });

  it('rejects unknown services before sending a request', () => {
    expect(() => GetValidatedServiceAPIInfo('not-exists', 'ap-shanghai')).toThrow(
      'Unsupported or incomplete Tencent Cloud API ServiceType "not-exists". Missing service, host, path, version.',
    );
  });
});
