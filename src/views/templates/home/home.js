import './home.scss'
import('../../../scss/conceptbox.scss')
import('../../../scss/enft.scss')

if (!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    import('./model1.js')
}

import('./enft.js');
import('./gsap.js');