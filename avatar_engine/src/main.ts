import { GaussianAvatar } from './gaussianAvatar';

const div = document.getElementById('LAM_WebRender');
const assetPath = './asset/arkit/p2-1.zip';

const gaussianAvatar = new GaussianAvatar(div, assetPath);
gaussianAvatar.start();
