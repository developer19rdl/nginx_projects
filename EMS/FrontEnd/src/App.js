import './App.css';
import { HashRouter as Router } from 'react-router-dom';
import Routers from './Component/Routers/Routers';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
// import rootReducer from './reducers';
import Reducer from './Store/Reducer';

function App() {
  const store = createStore(Reducer, {}, applyMiddleware(thunk));
  return (
    <Provider store={store}>
      <Router>
        <Routers />
      </Router>
    </Provider>
  );
}

export default App;
