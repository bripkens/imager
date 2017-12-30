// add all the required rxjs operators
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/take';

import ReactDOM from 'react-dom';
import React from 'react';

import App from './App';

ReactDOM.render(<App />, document.getElementById('root'));
