import {connectTo} from '@bripkens/rxstore-react';

export default creatorOrProps => Comp => connectTo(creatorOrProps, Comp);