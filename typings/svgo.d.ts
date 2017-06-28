declare module 'svgo' {

  class SVGO {
    constructor(options?: {});
    optimize(source: string, callback: (result: { data: string }) => void): void;
  }

  namespace SVGO {

  }

  export = SVGO;

}
