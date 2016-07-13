declare module 'svgo' {
  class SVGO {
    constructor(options?: {});
    optimize(source, callback: (result: { data: string }) => void);
  }

  namespace SVGO {

  }

  export = SVGO;
}
