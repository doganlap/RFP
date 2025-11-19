declare module './RealRFPProcess.jsx' {
  import type { FC } from 'react';

  export interface RealRFPProcessProps {
    rfpId?: string;
  }

  export const RealRFPProcess: FC<RealRFPProcessProps>;
  export default RealRFPProcess;
}

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  // Add other env variables here as needed
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
