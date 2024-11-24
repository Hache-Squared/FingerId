import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import { PermissionsChecker } from './shared/components/PermissionsChecker';
import { StackExplore } from './routes/StackExplore';
function App(): React.JSX.Element {

  return (
    <Provider store={store}>

      <NavigationContainer>
        <PermissionsChecker>
          {/* <TabNavigator/> */}
          <StackExplore/>
          
        </PermissionsChecker>
      </NavigationContainer>
    </Provider>
  );
}

export default App;
