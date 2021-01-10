// Remember (!): Will cause the global code in the module to be executed,
// e.g.: handler registration.
import {handleSubmit} from './js/client';
// Note(!): Sequence is essential here. Frameworks come first so
// that pre-defined styles can be overridden selectively.
import 'modules/normalize.css/normalize.css';
import 'modules/milligram/dist/milligram.css';
import './styles/style.scss';

export {handleSubmit};
