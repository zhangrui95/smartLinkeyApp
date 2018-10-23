import 'rc-drawer/assets/index.css';
import React from 'react';
import DrawerMenu from 'rc-drawer';
import SiderMenu from './SiderMenu';

const SiderMenuWrapper = props => (
  props.isMobile ?
  null : <SiderMenu {...props} />
);

export default SiderMenuWrapper;
