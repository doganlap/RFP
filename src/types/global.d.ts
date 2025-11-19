declare module './RealRFPProcess.jsx' {
  import type { FC } from 'react';

  export interface RealRFPProcessProps {
    rfpId?: string;
  }

  export const RealRFPProcess: FC<RealRFPProcessProps>;
  export default RealRFPProcess;
}
