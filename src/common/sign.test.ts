import Sign from './sign';

jest.mock('./utils', () => ({
  getRequestClient: () => 'test-client',
}));

describe('Sign', () => {
  it.each(['', 'invalid-version'])(
    'silently normalizes CLS API version %p for the signer request and outbound header',
    async (version) => {
      const postResource = jest.fn().mockResolvedValue({
        authorization: 'signed',
        host: 'cls.tencentcloudapi.com',
        version: 'invalid-backend-version',
      });
      const signer = new Sign({
        secretId: '',
        service: ' CLS ',
        action: 'SearchLog',
        host: 'cls.tencentcloudapi.com',
        version,
        region: 'ap-shanghai',
        ds: { postResource } as any,
      });

      const headers = await signer.getHeader();

      expect(postResource).toHaveBeenCalledWith(
        'sign_v3',
        expect.objectContaining({
          Service: 'cls',
          Version: '2020-10-16',
        }),
      );
      expect(headers).toMatchObject({
        Authorization: 'signed',
        'X-TC-Version': '2020-10-16',
      });
    },
  );

  it('preserves the supplied version for non-CLS services', async () => {
    const postResource = jest.fn().mockResolvedValue({
      authorization: 'signed',
      host: 'monitor.tencentcloudapi.com',
      version: '2018-07-24',
    });
    const signer = new Sign({
      secretId: '',
      service: ' Monitor ',
      action: 'GetMonitorData',
      host: 'monitor.tencentcloudapi.com',
      version: '2018-07-24',
      region: 'ap-shanghai',
      ds: { postResource } as any,
    });

    const headers = await signer.getHeader();

    expect(postResource).toHaveBeenCalledWith(
      'sign_v3',
      expect.objectContaining({
        Service: 'monitor',
        Version: '2018-07-24',
      }),
    );
    expect(headers['X-TC-Version']).toBe('2018-07-24');
  });
});
