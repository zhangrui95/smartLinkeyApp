import 'rc-drawer/assets/index.css';
import React from 'react';
import DrawerMenu from 'rc-drawer';
import SiderMenu from './SiderMenu';
import SiderMenuApp from './SiderMenuApp';

const SiderMenuWrapper = props =>
  props.isMobile ? <SiderMenuApp {...props} /> : <SiderMenu {...props} />;

export default SiderMenuWrapper;
