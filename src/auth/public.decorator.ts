import { SetMetadata } from '@nestjs/common';
import { PUBLIC_RESOLVER } from '../common/common.constants';

export const Public = () => SetMetadata('accessibility', PUBLIC_RESOLVER);
