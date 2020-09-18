// Note(!): Will just run the global module code but import no names at all.
import './js/client';
// Note(!): Sequence is essential here. 'resets' must come first!
// And then the css-tooltips so that they can be overridden later.
import './styles/resets.scss';
import 'modules/css-tooltip/dist/css-tooltip.css';
import './styles/style.scss';
import 'modules/spinkit/spinkit.css';
